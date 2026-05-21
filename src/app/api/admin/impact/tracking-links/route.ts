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
  const publisherId = url.searchParams.get("publisherId")?.trim() ?? "";

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("publisher_go_links")
    .select(
      "id, slug, publisher_id, impact_campaign_id, target_url, deep_link, created_at, click_count, profiles(username, email)",
      { count: "exact" }
    )
    .eq("network", "impact")
    .order("created_at", { ascending: false });

  if (publisherId) q = q.eq("publisher_id", publisherId);

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ links: data ?? [], total: count ?? 0, limit, offset });
}
