import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { fetchMerchants } from "@/lib/por/client";

export async function GET(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey      = process.env.PAIDONRESULTS_API_KEY      ?? "";
  const affiliateId = process.env.PAIDONRESULTS_AFFILIATE_ID ?? "";

  return NextResponse.json({
    configured:  !!(apiKey && affiliateId),
    apiKey:      apiKey      ? "set" : "",
    affiliateId: affiliateId ? "set" : "",
  });
}

export async function POST(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey      = process.env.PAIDONRESULTS_API_KEY      ?? "";
  const affiliateId = process.env.PAIDONRESULTS_AFFILIATE_ID ?? "";

  if (!apiKey || !affiliateId) {
    return NextResponse.json({ error: "PAIDONRESULTS_API_KEY or PAIDONRESULTS_AFFILIATE_ID not set." }, { status: 400 });
  }

  try {
    const merchants = await fetchMerchants();
    return NextResponse.json({
      ok: true,
      merchantCount: merchants.length,
      affiliateId,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
