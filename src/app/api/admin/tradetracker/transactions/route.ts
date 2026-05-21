import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const limit  = Math.min(500, parseInt(searchParams.get("limit") ?? "100", 10) || 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10) || 0;
  const status = searchParams.get("status")?.trim();
  const locale = searchParams.get("locale")?.trim();

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("tradetracker_transactions")
    .select("tt_transaction_id, tt_campaign_id, locale, affiliate_site_id, reference, transaction_type, transaction_status, commission, order_amount, currency, registration_date, go_link_slug, publisher_id, synced_at", { count: "exact" })
    .order("registration_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("transaction_status", status);
  if (locale) query = query.eq("locale", locale);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ transactions: data ?? [], total: count ?? 0 });
}
