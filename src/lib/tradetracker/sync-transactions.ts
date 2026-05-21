import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticateTT, getTTLocales } from "./client";
import type { TTTransaction } from "./types";

const OVERLAP_MS         = 2 * 24 * 60 * 60 * 1000;
const DEFAULT_BACKFILL_MS = 31 * 24 * 60 * 60 * 1000;
const PAGE_LIMIT         = 500;

export type SyncTTTransactionsResult =
  | {
      ok: true;
      rangeStart: string;
      rangeEnd: string;
      fetched: number;
      upserted: number;
      attributed: number;
    }
  | { ok: false; error: string };

/** Resolve publisher_id and go_link_slug from a `reference` value (our slug) */
async function loadGoLinkSlugs(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const slugToPublisher = new Map<string, string>();
  const PAGE = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("publisher_go_links")
      .select("slug, publisher_id")
      .range(from, from + PAGE - 1);
    if (error || !data?.length) break;
    for (const r of data as { slug: string; publisher_id: string }[]) {
      if (r.slug && r.publisher_id) {
        slugToPublisher.set(r.slug.trim(), r.publisher_id.trim());
      }
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return slugToPublisher;
}

export async function syncTTTransactionsToDatabase(
  supabase: SupabaseClient,
  options?: { start?: Date; end?: Date }
): Promise<SyncTTTransactionsResult> {
  const locales = getTTLocales();
  if (!locales.length) return { ok: false, error: "No TradeTracker credentials configured" };

  const end = options?.end ?? new Date();
  end.setUTCHours(23, 59, 59, 999);

  let start: Date;
  if (options?.start) {
    start = new Date(options.start);
  } else {
    const { data: state } = await supabase
      .from("tradetracker_sync_state")
      .select("last_window_end")
      .eq("id", "default")
      .maybeSingle();
    const lastEnd = state?.last_window_end ? new Date(String(state.last_window_end)) : null;
    if (lastEnd && !Number.isNaN(lastEnd.getTime())) {
      start = new Date(lastEnd.getTime() - OVERLAP_MS);
    } else {
      start = new Date(end.getTime() - DEFAULT_BACKFILL_MS);
    }
  }
  start.setUTCHours(0, 0, 0, 0);

  if (start.getTime() > end.getTime()) return { ok: false, error: "start after end" };

  const slugToPublisher = await loadGoLinkSlugs(supabase);

  const allTransactions: TTTransaction[] = [];

  // Collect from all locales × all affiliate sites
  for (const cfg of locales) {
    try {
      const session = await authenticateTT(cfg);
      const sites = await session.getAffiliateSites();

      for (const site of sites) {
        let offset = 0;
        for (;;) {
          const batch = await session.getConversionTransactions(site.siteId, {
            dateFrom: start,
            dateTo: end,
            limit: PAGE_LIMIT,
            offset,
          });
          allTransactions.push(...batch);
          if (batch.length < PAGE_LIMIT) break;
          offset += PAGE_LIMIT;
        }
      }
    } catch {
      // continue with other locales
    }
  }

  if (allTransactions.length === 0) {
    await supabase.from("tradetracker_sync_state").upsert(
      { id: "default", last_completed_at: new Date().toISOString(), last_window_end: end.toISOString(), last_error: null, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    return { ok: true, rangeStart: start.toISOString(), rangeEnd: end.toISOString(), fetched: 0, upserted: 0, attributed: 0 };
  }

  // Upsert in batches of 100
  let upserted = 0;
  let attributed = 0;
  const now = new Date().toISOString();
  const batchSize = 100;

  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const slice = allTransactions.slice(i, i + batchSize);
    const rows = slice.map((t) => {
      const slug = t.reference?.trim() ?? null;
      const publisherId = slug ? (slugToPublisher.get(slug) ?? null) : null;
      if (publisherId) attributed++;
      return {
        tt_transaction_id: t.transactionId,
        tt_campaign_id: t.campaignId,
        locale: t.locale,
        affiliate_site_id: t.affiliateSiteId,
        reference: t.reference,
        transaction_type: t.transactionType,
        transaction_status: t.transactionStatus,
        commission: t.commission,
        order_amount: t.orderAmount,
        currency: t.currency,
        registration_date: t.registrationDate,
        go_link_slug: slug,
        publisher_id: publisherId,
        synced_at: now,
        raw: t.raw,
      };
    });

    const { error } = await supabase
      .from("tradetracker_transactions")
      .upsert(rows, { onConflict: "tt_transaction_id" });

    if (error) {
      await supabase.from("tradetracker_sync_state").upsert(
        { id: "default", last_error: error.message, updated_at: now },
        { onConflict: "id" }
      );
      return { ok: false, error: error.message };
    }
    upserted += rows.length;
  }

  // Refresh rollup
  const { error: rpcErr } = await supabase.rpc("refresh_tradetracker_publisher_earnings_daily");
  if (rpcErr) {
    await supabase.from("tradetracker_sync_state").upsert(
      { id: "default", last_error: rpcErr.message, updated_at: now },
      { onConflict: "id" }
    );
    return { ok: false, error: rpcErr.message };
  }

  await supabase.from("tradetracker_sync_state").upsert(
    { id: "default", last_completed_at: now, last_window_end: end.toISOString(), last_error: null, updated_at: now },
    { onConflict: "id" }
  );

  return {
    ok: true,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    fetched: allTransactions.length,
    upserted,
    attributed,
  };
}
