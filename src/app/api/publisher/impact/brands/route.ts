import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const MIN_LIMIT = 6;

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limit));
  const qRaw = (searchParams.get("q") || "").trim();
  const q = qRaw.toLowerCase();
  const scope = searchParams.get("scope") === "approved" ? "approved" : "all";

  const supabase = createServerSupabaseClient();

  // Load all impact_campaigns from cache
  type CampRow = {
    impact_id: string;
    name: string;
    advertiser_name: string | null;
    logo_url: string | null;
    click_through_url: string | null;
    status: string | null;
    currency: string | null;
    raw: Record<string, unknown> | null;
  };

  const { data: campaigns, error: cErr } = await supabase
    .from("impact_campaigns")
    .select("impact_id, name, advertiser_name, logo_url, click_through_url, status, currency, raw")
    .order("name", { ascending: true });

  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({
      brands: [],
      pagination: { page: 1, limit, total: 0, totalPages: 1 },
      totalCampaigns: 0,
    });
  }

  // Load this publisher's applications
  const { data: apps, error: aErr } = await supabase
    .from("publisher_impact_applications")
    .select("campaign_id, status")
    .eq("publisher_id", pub.userId);

  if (aErr) {
    return NextResponse.json({ error: aErr.message }, { status: 500 });
  }

  const appByCampaign = new Map<string, string>();
  for (const a of apps ?? []) {
    appByCampaign.set(String(a.campaign_id), String(a.status));
  }

  let brands = (campaigns as CampRow[]).map((c) => {
    const appStatus = appByCampaign.get(c.impact_id);
    let uiStatus: "not_applied" | "pending" | "approved" | "rejected";
    if (!appStatus) uiStatus = "not_applied";
    else if (appStatus === "pending") uiStatus = "pending";
    else if (appStatus === "approved") uiStatus = "approved";
    else uiStatus = "rejected";

    const raw = c.raw ?? {};
    const description = typeof raw.CampaignDescription === "string" ? raw.CampaignDescription : null;
    const advertiserUrl = typeof raw.AdvertiserUrl === "string" ? raw.AdvertiserUrl
      : typeof raw.CampaignUrl === "string" ? raw.CampaignUrl : null;
    const allowsDeeplinking = raw.AllowsDeeplinking === "true";
    const contractStatus = typeof raw.ContractStatus === "string" ? raw.ContractStatus : c.status;

    return {
      campaignId: c.impact_id,
      name: c.name,
      advertiserName: c.advertiser_name,
      logoUrl: c.logo_url ? `/api/impact-logo?c=${encodeURIComponent(c.impact_id)}` : null,
      clickThroughUrl: c.click_through_url,
      advertiserUrl,
      description: description ? description.slice(0, 160) : null,
      contractStatus,
      allowsDeeplinking,
      currency: c.currency,
      applicationStatus: uiStatus,
    };
  });

  if (scope === "approved") {
    brands = brands.filter((b) => b.applicationStatus === "approved");
  }
  if (q) {
    brands = brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.advertiserName ?? "").toLowerCase().includes(q) ||
        b.campaignId.includes(qRaw)
    );
  }

  const total = brands.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * limit;
  const pageItems = brands.slice(from, from + limit);

  return NextResponse.json({
    brands: pageItems,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      rangeFrom: total === 0 ? 0 : from + 1,
      rangeTo: total === 0 ? 0 : Math.min(from + pageItems.length, total),
    },
    totalCampaigns: campaigns.length,
  });
}
