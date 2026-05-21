import { NextResponse } from "next/server";

const IMPACT_BASE = "https://api.impact.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("c")?.trim();
  if (!campaignId) {
    return new NextResponse(null, { status: 400 });
  }

  const accountSid = process.env.IMPACT_ACCOUNT_SID?.trim();
  const authToken = process.env.IMPACT_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) {
    return new NextResponse(null, { status: 503 });
  }

  const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const logoUrl = `${IMPACT_BASE}/Mediapartners/${encodeURIComponent(accountSid)}/Campaigns/${encodeURIComponent(campaignId)}/Logo`;

  try {
    const res = await fetch(logoUrl, {
      headers: { Authorization: auth },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = res.headers.get("content-type") ?? "image/png";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
