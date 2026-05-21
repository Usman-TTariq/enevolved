import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchImpactActionsRange } from "./actions";
import { applyUsdToImpactUpsertRows } from "./fx";
import { matchKnownSlug, resolvePublisherIdFromClickRef } from "@/lib/awin/slug-match";

const OVERLAP_MS = 2 * 24 * 60 * 60 * 1000;
const DEFAULT_BACKFILL_MS = 31 * 24 * 60 * 60 * 1000;

function toIsoBoundary(d: Date, endOfDay: boolean): Date {
  const x = new Date(d);
  if (endOfDay) {
    x.setUTCHours(23, 59, 59, 999);
  } else {
    x.setUTCHours(0, 0, 0, 0);
  }
  return x;
}

type GoLinkRow = {
  slug?: string;
  publisher_id?: string;
  campaign_id?: string | null;
  impact_campaign_id?: string | null;
  click_count?: number | string | null;
};

async function loadGoLinkContext(supabase: SupabaseClient): Promise<{
  slugToPublisher: Map<string, string>;
  campaignFallback: Map<string, { publisher_id: string; slug: string }>;
}> {
  const slugToPublisher = new Map<string, string>();
  const campaignLinks = new Map<string, { publisher_id: string; slug: string; click_count: number }[]>();
  const PAGE = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("publisher_go_links")
      .select("slug, publisher_id, impact_campaign_id, click_count")
      .range(from, from + PAGE - 1);
    if (error || !data?.length) break;
    for (const r of data as GoLinkRow[]) {
      const slug = String(r.slug ?? "").trim();
      const pub = String(r.publisher_id ?? "").trim();
      const campId = String(r.impact_campaign_id ?? "").trim();
      const clicks = Number(r.click_count ?? 0);
      if (slug.length >= 6 && pub) {
        slugToPublisher.set(slug, pub);
        if (campId) {
          const list = campaignLinks.get(campId) ?? [];
          list.push({ publisher_id: pub, slug, click_count: Number.isFinite(clicks) ? clicks : 0 });
          campaignLinks.set(campId, list);
        }
      }
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const campaignFallback = new Map<string, { publisher_id: string; slug: string }>();
  for (const [campId, list] of campaignLinks) {
    const best = list.reduce(
      (prev, cur) =>
        cur.click_count > prev.click_count ||
        (cur.click_count === prev.click_count && cur.publisher_id < prev.publisher_id)
          ? cur
          : prev,
      list[0]
    );
    if (best) campaignFallback.set(campId, { publisher_id: best.publisher_id, slug: best.slug });
  }

  return { slugToPublisher, campaignFallback };
}

type DbAttributionOnly = {
  sub_id3: string | null;
  publisher_id: string | null;
  go_link_slug: string | null;
  manually_assigned_at?: string | null;
  manually_assigned_by?: string | null;
};

type UpsertActionRow = {
  action_id: string;
  campaign_id: string | null;
  order_id: string | null;
  action_status: string | null;
  payout: number;
  payout_currency: string;
  payout_usd: number;
  sale_amount: number;
  sale_currency: string;
  sale_amount_usd: number;
  action_date: string;
  sub_id3: string | null;
  publisher_id: string | null;
  go_link_slug: string | null;
  synced_at: string;
  raw: unknown;
  manually_assigned_at?: string | null;
  manually_assigned_by?: string | null;
};

function mergePreserveAttribution(row: UpsertActionRow, existing: DbAttributionOnly | undefined): UpsertActionRow {
  if (!existing) return row;
  if (existing.manually_assigned_at) {
    return {
      ...row,
      sub_id3: existing.sub_id3 ?? row.sub_id3,
      publisher_id: existing.publisher_id ?? row.publisher_id,
      go_link_slug: existing.go_link_slug ?? row.go_link_slug,
      manually_assigned_at: existing.manually_assigned_at,
      manually_assigned_by: existing.manually_assigned_by ?? null,
    };
  }
  const hadDb = existing.publisher_id != null;
  if (!hadDb) return row;
  if (row.publisher_id != null) return row;
  return {
    ...row,
    sub_id3: existing.sub_id3 ?? row.sub_id3,
    publisher_id: existing.publisher_id,
    go_link_slug: existing.go_link_slug ?? row.go_link_slug,
  };
}

export type SyncImpactActionsResult =
  | {
      ok: true;
      rangeStart: string;
      rangeEnd: string;
      fetched: number;
      upserted: number;
      attributed: number;
      unmatched: number;
      fallbackAttributed: number;
      stillUnattributed: number;
    }
  | { ok: false; error: string };

/**
 * Fetch Impact actions for a date window, upsert into `impact_actions`,
 * resolve publisher_id via go-link slug matching on sub_id3, refresh rollup.
 */
export async function syncImpactActionsToDatabase(
  supabase: SupabaseClient,
  options?: { start?: Date; end?: Date }
): Promise<SyncImpactActionsResult> {
  const end = options?.end ? toIsoBoundary(options.end, true) : toIsoBoundary(new Date(), true);

  let start: Date;
  if (options?.start) {
    start = toIsoBoundary(options.start, false);
  } else {
    const { data: state } = await supabase
      .from("impact_action_sync_state")
      .select("last_window_end")
      .eq("id", "default")
      .maybeSingle();

    const lastEnd = state?.last_window_end ? new Date(String(state.last_window_end)) : null;
    if (lastEnd && !Number.isNaN(lastEnd.getTime())) {
      start = new Date(lastEnd.getTime() - OVERLAP_MS);
    } else {
      start = new Date(end.getTime() - DEFAULT_BACKFILL_MS);
    }
    start = toIsoBoundary(start, false);
  }

  if (start.getTime() > end.getTime()) {
    return { ok: false, error: "start after end" };
  }

  const { slugToPublisher, campaignFallback } = await loadGoLinkContext(supabase);
  const knownSlugs = new Set(slugToPublisher.keys());

  let fetched: Awaited<ReturnType<typeof fetchImpactActionsRange>>;
  try {
    fetched = await fetchImpactActionsRange({ startDate: start, endDate: end });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Impact fetch failed";
    await supabase.from("impact_action_sync_state").upsert(
      { id: "default", last_error: msg, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    return { ok: false, error: msg };
  }

  let attributed = 0;
  let unmatched = 0;

  const rows: UpsertActionRow[] = [];
  for (const { raw, parsed: p } of fetched) {
    const publisherId = resolvePublisherIdFromClickRef(p.subId3, slugToPublisher);
    const matchedSlug = matchKnownSlug(null, p.subId3, knownSlugs);
    if (publisherId) attributed += 1;
    else if (p.subId3) unmatched += 1;
    rows.push({
      action_id: p.actionId,
      campaign_id: p.campaignId,
      order_id: p.orderId,
      action_status: p.actionStatus,
      payout: p.payout,
      payout_currency: p.payoutCurrency,
      payout_usd: 0,
      sale_amount: p.saleAmount,
      sale_currency: p.saleCurrency,
      sale_amount_usd: 0,
      action_date: p.actionDate,
      sub_id3: p.subId3,
      publisher_id: publisherId,
      go_link_slug: matchedSlug,
      synced_at: new Date().toISOString(),
      raw,
    });
  }

  let upserted = 0;
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const slice = rows.slice(i, i + batchSize);
    const ids = slice.map((r) => r.action_id);
    const { data: existingRows } = await supabase
      .from("impact_actions")
      .select("action_id, sub_id3, publisher_id, go_link_slug, manually_assigned_at, manually_assigned_by")
      .in("action_id", ids);

    const existingById = new Map<string, DbAttributionOnly>();
    for (const ex of existingRows ?? []) {
      const row = ex as {
        action_id: string;
        sub_id3?: string | null;
        publisher_id?: string | null;
        go_link_slug?: string | null;
        manually_assigned_at?: string | null;
        manually_assigned_by?: string | null;
      };
      existingById.set(String(row.action_id), {
        sub_id3: row.sub_id3 ?? null,
        publisher_id: row.publisher_id ?? null,
        go_link_slug: row.go_link_slug ?? null,
        manually_assigned_at: row.manually_assigned_at ?? null,
        manually_assigned_by: row.manually_assigned_by ?? null,
      });
    }

    const mergedSlice = slice.map((row) => mergePreserveAttribution(row, existingById.get(row.action_id)));

    await applyUsdToImpactUpsertRows(supabase, mergedSlice);

    const { error } = await supabase.from("impact_actions").upsert(mergedSlice, { onConflict: "action_id" });
    if (error) {
      await supabase.from("impact_action_sync_state").upsert(
        { id: "default", last_error: error.message, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      return { ok: false, error: error.message };
    }
    upserted += slice.length;
  }

  // Campaign-level fallback: fill unattributed actions where sub_id3 is missing
  let fallbackAttributed = 0;
  for (const [campaignId, { publisher_id, slug }] of campaignFallback) {
    const payload = {
      sub_id3: slug,
      publisher_id,
      go_link_slug: slug,
      synced_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("impact_actions")
      .update(payload)
      .eq("campaign_id", campaignId)
      .is("publisher_id", null)
      .is("manually_assigned_at", null)
      .select("action_id");
    if (!error && data?.length) fallbackAttributed += data.length;
  }

  const { error: rpcErr } = await supabase.rpc("refresh_impact_publisher_earnings_daily");
  if (rpcErr) {
    await supabase.from("impact_action_sync_state").upsert(
      { id: "default", last_error: rpcErr.message, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    return { ok: false, error: rpcErr.message };
  }

  await supabase.from("impact_action_sync_state").upsert(
    {
      id: "default",
      last_completed_at: new Date().toISOString(),
      last_window_end: end.toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  const { count: stillUnattributed } = await supabase
    .from("impact_actions")
    .select("action_id", { count: "exact", head: true })
    .is("publisher_id", null);

  return {
    ok: true,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    fetched: fetched.length,
    upserted,
    attributed,
    unmatched,
    fallbackAttributed,
    stillUnattributed: stillUnattributed ?? 0,
  };
}
