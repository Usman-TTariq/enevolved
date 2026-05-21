import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  payoutAndSaleForPublisherIdsFromTransactions,
  slugLinkedPayoutAndSaleForPublisherIds,
} from "@/lib/awin/aggregate-from-transactions";
import type { SupabaseClient } from "@supabase/supabase-js";

function parseNonNegativeInt(raw: string | null, fallback: number): number {
  const n = Number(raw ?? "");
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function sumCurrencyMap(m: Record<string, number>): number {
  return Object.values(m).reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0);
}

function mergeCurrencyMaps(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (!Number.isFinite(v)) continue;
    out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

type DailyRpcRow = {
  publisher_id: string;
  currency: string | null;
  commission_total: number | string | null;
  sale_total: number | string | null;
};

type AwinLineRpcRow = {
  publisher_id: string;
  kind: string | null;
  currency: string | null;
  amount: number | string | null;
};

function addLineToMap(
  map: Map<string, Record<string, number>>,
  publisherId: string,
  currency: string,
  amount: number
): void {
  const prev = map.get(publisherId) ?? {};
  prev[currency] = (prev[currency] ?? 0) + amount;
  map.set(publisherId, prev);
}

/**
 * Fast path: SQL aggregates (see migration admin_signups_* RPCs). Returns null if RPCs are missing or error.
 */
async function loadPublisherFinancialsFromRpc(
  supabase: SupabaseClient,
  publisherIds: string[]
): Promise<{
  payoutByPublisher: Map<string, Record<string, number>>;
  salesByPublisher: Map<string, Record<string, number>>;
} | null> {
  const [dailyRes, directRes, slugRes] = await Promise.all([
    supabase.rpc("admin_signups_daily_by_pub_currency", { p_publisher_ids: publisherIds }),
    supabase.rpc("admin_signups_awin_direct_lines", { p_publisher_ids: publisherIds }),
    supabase.rpc("admin_signups_awin_slug_null_pub_lines", { p_publisher_ids: publisherIds }),
  ]);
  if (dailyRes.error || directRes.error || slugRes.error) {
    return null;
  }

  const rollupPayout = new Map<string, Record<string, number>>();
  const rollupSale = new Map<string, Record<string, number>>();
  for (const r of (dailyRes.data ?? []) as DailyRpcRow[]) {
    const pid = String(r.publisher_id);
    const cur = (r.currency ?? "GBP").toUpperCase();
    addLineToMap(rollupPayout, pid, cur, Number(r.commission_total ?? 0));
    addLineToMap(rollupSale, pid, cur, Number(r.sale_total ?? 0));
  }

  const directPayout = new Map<string, Record<string, number>>();
  const directSale = new Map<string, Record<string, number>>();
  for (const r of (directRes.data ?? []) as AwinLineRpcRow[]) {
    const pid = String(r.publisher_id);
    const cur = (r.currency ?? "GBP").toUpperCase();
    const amt = Number(r.amount ?? 0);
    if ((r.kind ?? "").toLowerCase() === "commission") addLineToMap(directPayout, pid, cur, amt);
    else if ((r.kind ?? "").toLowerCase() === "sale") addLineToMap(directSale, pid, cur, amt);
  }

  const slugPayout = new Map<string, Record<string, number>>();
  const slugSale = new Map<string, Record<string, number>>();
  for (const r of (slugRes.data ?? []) as AwinLineRpcRow[]) {
    const pid = String(r.publisher_id);
    const cur = (r.currency ?? "GBP").toUpperCase();
    const amt = Number(r.amount ?? 0);
    if ((r.kind ?? "").toLowerCase() === "commission") addLineToMap(slugPayout, pid, cur, amt);
    else if ((r.kind ?? "").toLowerCase() === "sale") addLineToMap(slugSale, pid, cur, amt);
  }

  const payoutByPublisher = new Map<string, Record<string, number>>();
  const salesByPublisher = new Map<string, Record<string, number>>();

  for (const pid of publisherIds) {
    const rp = rollupPayout.get(pid) ?? {};
    const rs = rollupSale.get(pid) ?? {};
    if (sumCurrencyMap(rp) + sumCurrencyMap(rs) > 0) {
      payoutByPublisher.set(pid, { ...rp });
      salesByPublisher.set(pid, { ...rs });
      continue;
    }
    const mergedP = mergeCurrencyMaps(directPayout.get(pid) ?? {}, slugPayout.get(pid) ?? {});
    const mergedS = mergeCurrencyMaps(directSale.get(pid) ?? {}, slugSale.get(pid) ?? {});
    if (sumCurrencyMap(mergedP) + sumCurrencyMap(mergedS) > 0) {
      payoutByPublisher.set(pid, mergedP);
      salesByPublisher.set(pid, mergedS);
    }
  }

  return { payoutByPublisher, salesByPublisher };
}

async function loadPublisherFinancialsLegacy(
  supabase: SupabaseClient,
  publisherIds: string[]
): Promise<{ payoutByPublisher: Map<string, Record<string, number>>; salesByPublisher: Map<string, Record<string, number>> }> {
  const payoutByPublisher = new Map<string, Record<string, number>>();
  const salesByPublisher = new Map<string, Record<string, number>>();

  // Impact schema uses payout_total; Awin/legacy schema uses commission_total
  const { data: rollupRows } = await supabase
    .from("publisher_earnings_daily")
    .select("publisher_id, currency, payout_total, sale_total")
    .in("publisher_id", publisherIds);

  type RollupRow = {
    publisher_id: string;
    currency: string | null;
    payout_total?: number | string | null;
    sale_total: number | string | null;
  };
  for (const r of (rollupRows ?? []) as RollupRow[]) {
    const pid = r.publisher_id;
    if (!pid) continue;
    const cur = (r.currency ?? "USD").toUpperCase();
    const payout = Number(r.payout_total ?? 0);
    const payoutPrev = payoutByPublisher.get(pid) ?? {};
    payoutPrev[cur] = (payoutPrev[cur] ?? 0) + payout;
    payoutByPublisher.set(pid, payoutPrev);
    const salePrev = salesByPublisher.get(pid) ?? {};
    salePrev[cur] = (salePrev[cur] ?? 0) + Number(r.sale_total ?? 0);
    salesByPublisher.set(pid, salePrev);
  }

  // Try Awin transaction fallback — skip gracefully if table doesn't exist
  for (const pid of publisherIds) {
    const rp = payoutByPublisher.get(pid) ?? {};
    const rs = salesByPublisher.get(pid) ?? {};
    if (sumCurrencyMap(rp) + sumCurrencyMap(rs) > 0) continue;
    try {
      const [live, slug] = await Promise.all([
        payoutAndSaleForPublisherIdsFromTransactions(supabase, [pid]),
        slugLinkedPayoutAndSaleForPublisherIds(supabase, [pid]),
      ]);
      const mergedP = mergeCurrencyMaps(
        live.payoutByPublisher.get(pid) ?? {},
        slug.payoutByPublisher.get(pid) ?? {}
      );
      const mergedS = mergeCurrencyMaps(
        live.saleByPublisher.get(pid) ?? {},
        slug.saleByPublisher.get(pid) ?? {}
      );
      if (sumCurrencyMap(mergedP) + sumCurrencyMap(mergedS) > 0) {
        payoutByPublisher.set(pid, mergedP);
        salesByPublisher.set(pid, mergedS);
      }
    } catch {
      // Awin tables may not exist — skip silently
    }
  }

  return { payoutByPublisher, salesByPublisher };
}

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);
    const limit = clamp(parseNonNegativeInt(url.searchParams.get("limit"), 25), 1, 100);
    const offset = parseNonNegativeInt(url.searchParams.get("offset"), 0);

    const { data, error, count } = await supabase
      .from("profiles")
      .select(
        "id, username, email, role, company_name, website, payment_email, city, country, approval_status, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const pageProfiles = (data ?? []) as { id: string; role?: string | null }[];
    const publisherIds = pageProfiles.filter((p) => p.role === "publisher").map((p) => p.id);

    let payoutByPublisher = new Map<string, Record<string, number>>();
    let salesByPublisher = new Map<string, Record<string, number>>();

    if (publisherIds.length > 0) {
      const fromRpc = await loadPublisherFinancialsFromRpc(supabase, publisherIds);
      if (fromRpc) {
        payoutByPublisher = fromRpc.payoutByPublisher;
        salesByPublisher = fromRpc.salesByPublisher;
      } else {
        try {
          const legacy = await loadPublisherFinancialsLegacy(supabase, publisherIds);
          payoutByPublisher = legacy.payoutByPublisher;
          salesByPublisher = legacy.salesByPublisher;
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Server error";
          return NextResponse.json({ error: msg }, { status: 500 });
        }
      }
    }

    const signups = (data ?? []).map((p) => ({
      ...p,
      payout_totals: payoutByPublisher.get(p.id as string) ?? {},
      sale_totals: salesByPublisher.get(p.id as string) ?? {},
    }));

    return NextResponse.json({ signups, total: count ?? 0, limit, offset });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
