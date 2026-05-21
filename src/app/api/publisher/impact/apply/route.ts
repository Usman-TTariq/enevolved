import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  let body: { campaignId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = body.campaignId?.trim();
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Check if already applied
  const { data: existing } = await supabase
    .from("publisher_impact_applications")
    .select("id, status")
    .eq("publisher_id", pub.userId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, applicationId: existing.id, status: existing.status, alreadyApplied: true });
  }

  const { data, error } = await supabase
    .from("publisher_impact_applications")
    .insert({ publisher_id: pub.userId, campaign_id: campaignId, status: "pending", updated_at: new Date().toISOString() })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, applicationId: data.id, status: data.status });
}
