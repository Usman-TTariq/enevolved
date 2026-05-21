import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerSupabaseClient();

  const [
    { count: totalMerchants },
    { count: joinedMerchants },
    { count: totalTxns },
    { count: pendingApps },
    { data: commData },
    { data: syncState },
  ] = await Promise.all([
    supabase.from("por_merchants").select("*", { count: "exact", head: true }),
    supabase.from("por_merchants").select("*", { count: "exact", head: true }).ilike("affiliate_status", "JOINED%"),
    supabase.from("por_transactions").select("*", { count: "exact", head: true }),
    supabase.from("publisher_por_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("por_transactions").select("affiliate_commission, currency").eq("transaction_status", "validated"),
    supabase.from("por_sync_state").select("last_completed_at, last_error").eq("id", "default").maybeSingle(),
  ]);

  const commByCurrency: Record<string, number> = {};
  for (const r of commData ?? []) {
    const c = (r.currency ?? "GBP").toUpperCase();
    commByCurrency[c] = (commByCurrency[c] ?? 0) + Number(r.affiliate_commission ?? 0);
  }

  return NextResponse.json({
    totalMerchants:     totalMerchants  ?? 0,
    joinedMerchants:    joinedMerchants ?? 0,
    totalTransactions:  totalTxns       ?? 0,
    pendingApplications: pendingApps    ?? 0,
    commissionByCurrency: commByCurrency,
    lastSyncAt:  (syncState as { last_completed_at?: string } | null)?.last_completed_at ?? null,
    lastSyncError: (syncState as { last_error?: string } | null)?.last_error ?? null,
  });
}
