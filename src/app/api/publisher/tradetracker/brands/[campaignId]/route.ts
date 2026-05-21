import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  const { campaignId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: campaign, error: cErr } = await supabase
    .from("tradetracker_campaigns")
    .select("*")
    .eq("tt_campaign_id", campaignId)
    .maybeSingle();

  if (cErr)      return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const { data: app } = await supabase
    .from("publisher_tradetracker_applications")
    .select("status")
    .eq("publisher_id", pub.userId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  const { data: goLinks } = await supabase
    .from("publisher_go_links")
    .select("id, slug, target_url, deep_link, created_at, click_count")
    .eq("publisher_id", pub.userId)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    campaign,
    applicationStatus: app?.status ?? null,
    goLinks: goLinks ?? [],
  });
}
