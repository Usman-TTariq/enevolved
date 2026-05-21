import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  let limit   = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit       = Math.min(MAX_LIMIT, Math.max(6, limit));
  const q     = (searchParams.get("q") ?? "").trim().toLowerCase();
  const scope = searchParams.get("scope") === "approved" ? "approved" : "all";

  const supabase = createServerSupabaseClient();

  const { data: campaigns, error: cErr } = await supabase
    .from("tradetracker_campaigns")
    .select("tt_campaign_id, locale, name, url, tracking_url, logo_url, assignment_status, commission_type, commission_percentage, commission_fixed_fee, currency, description, deeplinking_supported, category_id, category_name")
    .eq("assignment_status", "accepted")
    .order("name", { ascending: true });

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!campaigns?.length) {
    return NextResponse.json({ brands: [], pagination: { page: 1, limit, total: 0, totalPages: 1 }, totalCampaigns: 0 });
  }

  const { data: apps } = await supabase
    .from("publisher_tradetracker_applications")
    .select("campaign_id, status")
    .eq("publisher_id", pub.userId);

  const appByCampaign = new Map((apps ?? []).map((a) => [String(a.campaign_id), String(a.status)]));

  type CRow = { tt_campaign_id: string; locale: string; name: string; url: string | null; tracking_url: string | null; logo_url: string | null; assignment_status: string | null; commission_type: string | null; commission_percentage: number | null; commission_fixed_fee: number | null; currency: string | null; description: string | null; deeplinking_supported: boolean | null; category_id: string | null; category_name: string | null };

  let brands = (campaigns as CRow[]).map((c) => {
    const appStatus = appByCampaign.get(c.tt_campaign_id);
    let uiStatus: "not_applied" | "pending" | "approved" | "rejected";
    if (!appStatus)             uiStatus = "not_applied";
    else if (appStatus === "pending")   uiStatus = "pending";
    else if (appStatus === "approved")  uiStatus = "approved";
    else                                uiStatus = "rejected";

    const commLabel = c.commission_percentage
      ? `${c.commission_percentage}%`
      : c.commission_fixed_fee
        ? `${c.commission_fixed_fee} ${c.currency ?? "EUR"}`
        : null;

    return {
      campaignId:        c.tt_campaign_id,
      locale:            c.locale,
      name:              c.name,
      advertiserName:    c.name,
      logoUrl:           c.logo_url ?? null,
      advertiserUrl:     c.url ?? null,
      description:       c.description ? c.description.slice(0, 160) : null,
      currency:          c.currency ?? "EUR",
      commissionLabel:   commLabel,
      commissionType:    c.commission_type,
      allowsDeeplinking: Boolean(c.deeplinking_supported),
      trackingUrl:       c.tracking_url,
      categoryId:        c.category_id ?? null,
      categoryName:      c.category_name ?? null,
      applicationStatus: uiStatus,
    };
  });

  if (scope === "approved") brands = brands.filter((b) => b.applicationStatus === "approved");
  if (q) brands = brands.filter((b) => b.name.toLowerCase().includes(q) || b.campaignId.toLowerCase().includes(q));

  const total      = brands.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage   = Math.min(page, totalPages);
  const from       = (safePage - 1) * limit;
  const pageItems  = brands.slice(from, from + limit);

  return NextResponse.json({
    brands: pageItems,
    pagination: { page: safePage, limit, total, totalPages, rangeFrom: total === 0 ? 0 : from + 1, rangeTo: total === 0 ? 0 : Math.min(from + pageItems.length, total) },
    totalCampaigns: campaigns.length,
  });
}
