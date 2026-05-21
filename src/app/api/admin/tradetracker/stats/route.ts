import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const supabase = createServerSupabaseClient();

  const [
    { count: totalTx },
    { count: acceptedTx },
    { count: pendingTx },
    { count: rejectedTx },
    { count: attributedTx },
    { count: totalCampaigns },
    { count: acceptedCampaigns },
    commissionResult,
    lastSyncResult,
    earningsResult,
  ] = await Promise.all([
    supabase.from("tradetracker_transactions").select("*", { count: "exact", head: true }),
    supabase.from("tradetracker_transactions").select("*", { count: "exact", head: true }).eq("transaction_status", "accepted"),
    supabase.from("tradetracker_transactions").select("*", { count: "exact", head: true }).eq("transaction_status", "pending"),
    supabase.from("tradetracker_transactions").select("*", { count: "exact", head: true }).eq("transaction_status", "rejected"),
    supabase.from("tradetracker_transactions").select("*", { count: "exact", head: true }).not("publisher_id", "is", null),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }).eq("assignment_status", "accepted"),
    supabase.from("tradetracker_transactions").select("commission.sum()").eq("transaction_status", "accepted"),
    supabase.from("tradetracker_sync_state").select("last_synced_at, last_offset").order("last_synced_at", { ascending: false }).limit(1),
    supabase.from("tradetracker_publisher_earnings_daily").select("commission_eur.sum()"),
  ]);

  const totalCommission = (commissionResult.data as unknown as Array<{ sum: number | null }> | null)?.[0]?.sum ?? 0;
  const totalEarnings   = (earningsResult.data   as unknown as Array<{ sum: number | null }> | null)?.[0]?.sum ?? 0;
  const lastSync        = (lastSyncResult.data ?? [])[0] ?? null;

  return NextResponse.json({
    transactions: {
      total:      totalTx      ?? 0,
      accepted:   acceptedTx   ?? 0,
      pending:    pendingTx    ?? 0,
      rejected:   rejectedTx   ?? 0,
      attributed: attributedTx ?? 0,
    },
    campaigns: {
      total:    totalCampaigns    ?? 0,
      accepted: acceptedCampaigns ?? 0,
    },
    revenue: {
      totalCommission:    Number(totalCommission ?? 0),
      attributedEarnings: Number(totalEarnings   ?? 0),
    },
    lastSync: lastSync ? { syncedAt: lastSync.last_synced_at, offset: lastSync.last_offset } : null,
  });
}
