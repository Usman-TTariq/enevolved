import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const limit  = Math.min(200, parseInt(searchParams.get("limit") ?? "100", 10) || 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10) || 0;

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("publisher_tradetracker_applications")
    .select("id, publisher_id, campaign_id, status, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message, hint: "Check if publisher_tradetracker_applications table exists in Supabase — run tradetracker_schema.sql migration." }, { status: 500 });

  // Enrich with user email + campaign name
  const publisherIds = [...new Set((data ?? []).map((r) => String(r.publisher_id)))];
  const campaignIds  = [...new Set((data ?? []).map((r) => String(r.campaign_id)))];

  const [usersRes, campsRes] = await Promise.all([
    publisherIds.length
      ? supabase.from("profiles").select("id, username, email").in("id", publisherIds)
      : Promise.resolve({ data: [] }),
    campaignIds.length
      ? supabase.from("tradetracker_campaigns").select("tt_campaign_id, name").in("tt_campaign_id", campaignIds)
      : Promise.resolve({ data: [] }),
  ]);

  const userMap = new Map((usersRes.data ?? []).map((u) => [String(u.id), u]));
  const campMap = new Map((campsRes.data ?? []).map((c) => [String(c.tt_campaign_id), c.name]));

  const enriched = (data ?? []).map((r) => ({
    ...r,
    username: userMap.get(String(r.publisher_id))?.username ?? null,
    email:    userMap.get(String(r.publisher_id))?.email    ?? null,
    campaign_name: campMap.get(String(r.campaign_id)) ?? r.campaign_id,
  }));

  return NextResponse.json({ applications: enriched, total: count ?? 0 });
}
