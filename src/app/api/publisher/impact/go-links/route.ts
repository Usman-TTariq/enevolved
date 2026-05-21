import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { getSiteOrigin } from "@/lib/site-origin";

const SLUG_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const SLUG_LEN = 10;

function makeSlug(): string {
  const buf = randomBytes(SLUG_LEN);
  let s = "";
  for (let i = 0; i < SLUG_LEN; i++) {
    s += SLUG_CHARS[buf[i]! % SLUG_CHARS.length];
  }
  return s;
}

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  let body: { campaignId?: unknown; landingPage?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = typeof body.campaignId === "string" ? body.campaignId.trim() : "";
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 400 });
  }

  const landingRaw = typeof body.landingPage === "string" ? body.landingPage.trim() : "";

  const supabase = createServerSupabaseClient();

  const { data: app } = await supabase
    .from("publisher_impact_applications")
    .select("status")
    .eq("publisher_id", pub.userId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (!app || app.status !== "approved") {
    return NextResponse.json(
      { error: "You need an approved application for this campaign to create links." },
      { status: 403 }
    );
  }

  const { data: campaign, error: cErr } = await supabase
    .from("impact_campaigns")
    .select("impact_id, click_through_url, raw")
    .eq("impact_id", campaignId)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const baseUrl = campaign.click_through_url as string | null;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "No tracking URL available for this campaign. Contact an admin." },
      { status: 400 }
    );
  }

  for (let i = 0; i < 8; i++) {
    const slug = makeSlug();

    let targetUrl = baseUrl;
    if (landingRaw) {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set("SubId1", slug);
        if (landingRaw.startsWith("http")) {
          url.searchParams.set("url", landingRaw);
        }
        targetUrl = url.toString();
      } catch {
        targetUrl = baseUrl;
      }
    } else {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set("SubId1", slug);
        targetUrl = url.toString();
      } catch {
        targetUrl = baseUrl;
      }
    }

    const { error } = await supabase.from("publisher_go_links").insert({
      slug,
      publisher_id: pub.userId,
      campaign_id: campaignId,
      target_url: targetUrl,
      deep_link: Boolean(landingRaw),
      network: "impact",
    });

    if (!error) {
      const origin = getSiteOrigin();
      return NextResponse.json({ ok: true, slug, shortUrl: `${origin}/go/short/${slug}`, targetUrl });
    }
    if (error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not allocate a unique short code. Try again." }, { status: 500 });
}
