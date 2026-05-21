import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url     = new URL(request.url);
  const limit   = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);
  const offset  = parseInt(url.searchParams.get("offset") ?? "0");
  const search  = url.searchParams.get("search")?.trim() ?? "";
  const status  = url.searchParams.get("status")?.trim() ?? "";

  const supabase = createServerSupabaseClient();

  // KPI counts
  const [{ count: total }, { count: joined }, { count: txnCount }] = await Promise.all([
    supabase.from("por_merchants").select("*", { count: "exact", head: true }),
    supabase.from("por_merchants").select("*", { count: "exact", head: true }).ilike("affiliate_status", "JOINED%"),
    supabase.from("por_transactions").select("*", { count: "exact", head: true }),
  ]);

  let q = supabase
    .from("por_merchants")
    .select("merchant_id, name, url, logo_url, category, commission_rate, average_commission, deep_links, merchant_status, affiliate_status, cookie_length, conversion_ratio, fetched_at", { count: "exact" })
    .order("name");

  if (search) q = q.ilike("name", `%${search}%`);
  if (status) q = q.ilike("affiliate_status", `%${status}%`);
  q = q.range(offset, offset + limit - 1);

  const { data, count: filteredCount, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    merchants: data ?? [],
    total: filteredCount ?? 0,
    stats: {
      totalMerchants: total ?? 0,
      joinedMerchants: joined ?? 0,
      totalTransactions: txnCount ?? 0,
    },
  });
}
