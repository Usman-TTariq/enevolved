import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url    = new URL(request.url);
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const status = url.searchParams.get("status") ?? "all";
  const search = url.searchParams.get("q")?.trim() ?? "";

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("por_transactions")
    .select(
      "id, network_order_id, merchant_id, merchant_name, order_date, order_value, affiliate_commission, currency, transaction_status, paid_to_affiliate, custom_tracking_id, go_link_slug, publisher_id",
      { count: "exact" }
    )
    .order("order_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") q = q.eq("transaction_status", status);
  if (search) q = q.or(`merchant_name.ilike.%${search}%,network_order_id.ilike.%${search}%,go_link_slug.ilike.%${search}%`);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ transactions: data ?? [], total: count ?? 0 });
}
