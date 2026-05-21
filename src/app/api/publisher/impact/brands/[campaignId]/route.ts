import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

type Params = { params: Promise<{ campaignId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const { campaignId } = await params;
  if (!campaignId?.trim()) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: campaign, error: cErr } = await supabase
    .from("impact_campaigns")
    .select("*")
    .eq("impact_id", campaignId)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const { data: app } = await supabase
    .from("publisher_impact_applications")
    .select("status, created_at")
    .eq("publisher_id", pub.userId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  const { data: links } = await supabase
    .from("publisher_go_links")
    .select("id, slug, target_url, deep_link, created_at, click_count")
    .eq("publisher_id", pub.userId)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    campaign,
    applicationStatus: app?.status ?? null,
    applicationCreatedAt: app?.created_at ?? null,
    goLinks: links ?? [],
  });
}
