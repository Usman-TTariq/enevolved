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
  const status = url.searchParams.get("status")?.trim() ?? "";

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("publisher_impact_applications")
    .select(
      "id, publisher_id, campaign_id, status, created_at, updated_at, profiles(username, email), impact_campaigns(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    q = q.eq("status", status);
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applications: data ?? [], total: count ?? 0, limit, offset });
}
