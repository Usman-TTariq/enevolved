import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import { getSiteOrigin } from "@/lib/site-origin";
import { buildTrackingUrl } from "@/lib/por/client";

const SLUG_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const SLUG_LEN = 10;

function makeSlug(): string {
  const buf = randomBytes(SLUG_LEN);
  let s = "";
  for (let i = 0; i < SLUG_LEN; i++) s += SLUG_CHARS[buf[i]! % SLUG_CHARS.length];
  return s;
}

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  let body: { merchantId?: unknown; landingPage?: unknown } = {};
  try { body = await request.json(); } catch { /* default */ }

  const merchantId = typeof body.merchantId === "string" ? body.merchantId.trim() : "";
  if (!merchantId) return NextResponse.json({ error: "merchantId required" }, { status: 400 });

  const landingRaw = typeof body.landingPage === "string" ? body.landingPage.trim() : "";

  const supabase = createServerSupabaseClient();

  // Verify approved application
  const { data: app } = await supabase
    .from("publisher_por_applications")
    .select("status")
    .eq("publisher_id", pub.userId)
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (!app || app.status !== "approved")
    return NextResponse.json({ error: "You need an approved application for this merchant to create links." }, { status: 403 });

  const origin = getSiteOrigin();

  for (let i = 0; i < 8; i++) {
    const slug = makeSlug();
    // Build target URL: POR tracking URL with slug as CustomTrackingID
    const targetUrl = buildTrackingUrl(merchantId, slug, landingRaw || undefined);

    const { error } = await supabase.from("publisher_go_links").insert({
      slug,
      publisher_id: pub.userId,
      campaign_id:  merchantId,
      target_url:   targetUrl,
      deep_link:    Boolean(landingRaw),
      network:      "paidonresults",
    });

    if (!error)
      return NextResponse.json({ ok: true, slug, shortUrl: `${origin}/go/short/${slug}`, targetUrl });
    if (error.code !== "23505")
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Could not allocate a unique short code. Try again." }, { status: 500 });
}
