import { NextResponse, after } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  aggregateAwinTransactionsInRange,
  rollingUtcWindowDays,
  sumAttributedAwinByCurrency,
} from "@/lib/awin/aggregate-from-transactions";
import { maybeSyncAwinOnAdminDashboardLoad } from "@/lib/awin/dashboard-sync";
import { isAwinConfigured } from "@/lib/awin/client";
import type { SupabaseClient } from "@supabase/supabase-js";

function maxCurrencyTotals(map: Record<string, number>): { currency: string | null; amount: number } {
  let best: string | null = null;
  let v = 0;
  for (const [k, val] of Object.entries(map)) {
    if (val > v) {
      v = val;
      best = k;
    }
  }
  return { currency: best, amount: v };
}

function jsonbToCurrencyMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    out[k] = Number(v ?? 0);
  }
  return out;
}

async function loadFinancialsFromRpc(
  supabase: SupabaseClient
): Promise<{ commissionByCurrency: Record<string, number>; saleByCurrency: Record<string, number> } | null> {
  const { data, error } = await supabase.rpc("admin_publisher_earnings_currency_totals");
  if (error || data == null || typeof data !== "object") return null;
  const o = data as { commissionByCurrency?: unknown; saleByCurrency?: unknown };
  return {
    commissionByCurrency: jsonbToCurrencyMap(o.commissionByCurrency),
    saleByCurrency: jsonbToCurrencyMap(o.saleByCurrency),
  };
}

async function loadWindowTotalsFromRpc(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<{
  countAll: number;
  countAttributed: number;
  saleByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
} | null> {
  const { data, error } = await supabase.rpc("admin_awin_transactions_window_totals", {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });
  if (error || data == null || typeof data !== "object") return null;
  const o = data as {
    countAll?: unknown;
    countAttributed?: unknown;
    saleByCurrency?: unknown;
    commissionByCurrency?: unknown;
  };
  return {
    countAll: Number(o.countAll ?? 0),
    countAttributed: Number(o.countAttributed ?? 0),
    saleByCurrency: jsonbToCurrencyMap(o.saleByCurrency),
    commissionByCurrency: jsonbToCurrencyMap(o.commissionByCurrency),
  };
}

async function loadAttributedSumsFromRpc(
  supabase: SupabaseClient
): Promise<{ commissionByCurrency: Record<string, number>; saleByCurrency: Record<string, number> } | null> {
  const { data, error } = await supabase.rpc("admin_sum_attributed_awin_by_currency");
  if (error || data == null || typeof data !== "object") return null;
  const o = data as { commissionByCurrency?: unknown; saleByCurrency?: unknown };
  return {
    commissionByCurrency: jsonbToCurrencyMap(o.commissionByCurrency),
    saleByCurrency: jsonbToCurrencyMap(o.saleByCurrency),
  };
}

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const supabase = createServerSupabaseClient();
  const url = new URL(request.url);
  const forceAwinRefresh = url.searchParams.get("refreshAwin") === "1";

  /** Do not block the dashboard on Awin HTTP + upsert; run after response (Next.js `after`). */
  let awinSyncOnDashboardLoad: { ran: boolean; skippedReason?: string; error?: string };
  if (isAwinConfigured()) {
    after(async () => {
      try {
        const sb = createServerSupabaseClient();
        await maybeSyncAwinOnAdminDashboardLoad(sb, { force: forceAwinRefresh });
      } catch (e) {
        console.error("[dashboard-stats] background Awin sync failed", e);
      }
    });
    awinSyncOnDashboardLoad = {
      ran: false,
      skippedReason: forceAwinRefresh
        ? "Awin refresh queued; sync runs in the background. Reload in a minute for updated transactions."
        : "Awin sync runs in the background when you open the dashboard (throttled). Reload shortly for fresh data.",
    };
  } else {
    awinSyncOnDashboardLoad = { ran: false, skippedReason: "Awin API not configured on server" };
  }

  const countWhere = async (table: string, filters: Record<string, string>): Promise<number> => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  };

  try {
    const [
      totalUsers,
      publishers,
      advertisers,
      profilesPending,
      profilesApproved,
      profilesRejected,
      trackingLinksCount,
      brandAppsPending,
      brandAppsApproved,
      brandAppsRejected,
      brandAppsTotal,
      programmesCached,
    ] = await Promise.all([
      countWhere("profiles", {}),
      countWhere("profiles", { role: "publisher" }),
      countWhere("profiles", { role: "advertiser" }),
      countWhere("profiles", { approval_status: "pending" }),
      countWhere("profiles", { approval_status: "approved" }),
      countWhere("profiles", { approval_status: "rejected" }),
      countWhere("publisher_go_links", {}),
      countWhere("publisher_awin_applications", { status: "pending" }),
      countWhere("publisher_awin_applications", { status: "approved" }),
      countWhere("publisher_awin_applications", { status: "rejected" }),
      countWhere("publisher_awin_applications", {}),
      countWhere("awin_programmes", {}),
    ]);

    let totalClicks = 0;
    const { data: clickRpc, error: clickRpcErr } = await supabase.rpc("admin_sum_go_link_clicks");
    if (!clickRpcErr && clickRpc != null && clickRpc !== "") {
      totalClicks = Number(clickRpc);
    } else {
      const { data: clickRows, error: clickErr } = await supabase.from("publisher_go_links").select("click_count");
      if (!clickErr && clickRows) {
        totalClicks = clickRows.reduce((s, r) => s + Number((r as { click_count?: number | null }).click_count ?? 0), 0);
      }
    }

    const { data: pendingSignups, error: pendingErr } = await supabase
      .from("profiles")
      .select("id, username, email, role, created_at")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (pendingErr) {
      return NextResponse.json({ error: pendingErr.message }, { status: 500 });
    }

    let commissionByCurrency: Record<string, number> = {};
    let saleByCurrency: Record<string, number> = {};
    const rpcFinancials = await loadFinancialsFromRpc(supabase);
    if (rpcFinancials) {
      commissionByCurrency = rpcFinancials.commissionByCurrency;
      saleByCurrency = rpcFinancials.saleByCurrency;
    } else {
      const { data: earnRows, error: earnErr } = await supabase
        .from("publisher_earnings_daily")
        .select("currency, commission_total, sale_total");
      if (!earnErr && earnRows && Array.isArray(earnRows)) {
        for (const r of earnRows as {
          currency?: string;
          commission_total?: number | string | null;
          sale_total?: number | string | null;
        }[]) {
          const cur = (r.currency ?? "GBP").toUpperCase();
          commissionByCurrency[cur] = (commissionByCurrency[cur] ?? 0) + Number(r.commission_total ?? 0);
          saleByCurrency[cur] = (saleByCurrency[cur] ?? 0) + Number(r.sale_total ?? 0);
        }
      }
    }

    let awinTxnTotal = 0;
    let awinTxnAttributed = 0;
    const txnHead = await supabase.from("awin_transactions").select("*", { count: "exact", head: true });
    if (!txnHead.error) awinTxnTotal = txnHead.count ?? 0;
    const txnAttr = await supabase
      .from("awin_transactions")
      .select("*", { count: "exact", head: true })
      .not("publisher_id", "is", null);
    if (!txnAttr.error) awinTxnAttributed = txnAttr.count ?? 0;

    const rollupCommissionSum = Object.values(commissionByCurrency).reduce((a, b) => a + b, 0);
    let financialsSource: "rollup" | "awin_transactions" = "rollup";
    if (rollupCommissionSum === 0 && awinTxnAttributed > 0) {
      const liveRpc = await loadAttributedSumsFromRpc(supabase);
      if (liveRpc) {
        commissionByCurrency = liveRpc.commissionByCurrency;
        saleByCurrency = liveRpc.saleByCurrency;
        financialsSource = "awin_transactions";
      } else {
        const live = await sumAttributedAwinByCurrency(supabase);
        commissionByCurrency = live.commissionByCurrency;
        saleByCurrency = live.saleByCurrency;
        financialsSource = "awin_transactions";
      }
    }

    const { data: syncRow } = await supabase
      .from("awin_transaction_sync_state")
      .select("last_completed_at, last_error")
      .eq("id", "default")
      .maybeSingle();

    const win30 = rollingUtcWindowDays(30);
    let agg30 = await loadWindowTotalsFromRpc(supabase, win30.start, win30.end);
    if (!agg30) {
      agg30 = await aggregateAwinTransactionsInRange(supabase, win30.start, win30.end);
    }
    const saleTop = maxCurrencyTotals(agg30.saleByCurrency);
    const commTop = maxCurrencyTotals(agg30.commissionByCurrency);

    const totalUsdCommission = commissionByCurrency.USD ?? 0;
    const totalUsdSale = saleByCurrency.USD ?? 0;
    const currencies = Object.keys(commissionByCurrency);
    const primaryCurrency =
      totalUsdCommission > 0 || totalUsdSale > 0
        ? "USD"
        : currencies.find((c) => (commissionByCurrency[c] ?? 0) > 0 || (saleByCurrency[c] ?? 0) > 0) ?? null;

    return NextResponse.json({
      profiles: {
        total: totalUsers,
        publishers,
        advertisers,
        pending: profilesPending,
        approved: profilesApproved,
        rejected: profilesRejected,
      },
      publisherGoLinks: {
        count: trackingLinksCount,
        totalClicks,
      },
      brandApplications: {
        total: brandAppsTotal,
        pending: brandAppsPending,
        approved: brandAppsApproved,
        rejected: brandAppsRejected,
      },
      awinProgrammesCached: programmesCached,
      pendingSignups: pendingSignups ?? [],
      financials: {
        commissionByCurrency,
        saleByCurrency,
        totalPublisherPayoutUsd: totalUsdCommission,
        totalGrossOnLinksUsd: totalUsdSale > 0 ? totalUsdSale : null,
        primaryCurrency,
        primaryCommission: primaryCurrency != null ? (commissionByCurrency[primaryCurrency] ?? 0) : 0,
        primarySale: primaryCurrency != null ? (saleByCurrency[primaryCurrency] ?? 0) : 0,
        /** `rollup` = publisher_earnings_daily; `awin_transactions` = live sum when rollup was empty but attributed rows exist */
        source: financialsSource,
      },
      awinReporting: {
        transactionsStored: awinTxnTotal,
        transactionsAttributed: awinTxnAttributed,
        lastSyncAt: syncRow?.last_completed_at ?? null,
        lastSyncError: syncRow?.last_error ?? null,
      },
      /** Rolling 30 calendar days UTC; rows come from Awin via sync (including auto-pull on this endpoint). */
      awinActivityLast30Days: {
        fromYmd: win30.start.toISOString().slice(0, 10),
        toYmd: win30.end.toISOString().slice(0, 10),
        transactionCount: agg30.countAll,
        transactionCountAttributed: agg30.countAttributed,
        saleByCurrency: agg30.saleByCurrency,
        commissionByCurrency: agg30.commissionByCurrency,
        primarySaleCurrency: saleTop.currency,
        primarySale: saleTop.amount,
        primaryCommissionCurrency: commTop.currency,
        primaryCommission: commTop.amount,
      },
      awinSyncOnDashboardLoad,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
