import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("impact_campaigns")
    .select("impact_id, name, advertiser_name, logo_url, click_through_url, currency, status, fetched_at", {
      count: "exact",
    })
    .order("name", { ascending: true });

  if (q) {
    query = query.or(`name.ilike.%${q}%,advertiser_name.ilike.%${q}%,impact_id.ilike.%${q}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data ?? [], total: count ?? 0, limit, offset });
}
