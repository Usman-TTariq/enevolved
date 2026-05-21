import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  const url    = new URL(request.url);
  const page   = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "12"), 500);
  const search = (url.searchParams.get("q") ?? url.searchParams.get("search") ?? "").trim();
  const scope  = url.searchParams.get("scope") ?? "all";
  const offset = (page - 1) * limit;

  const supabase = createServerSupabaseClient();

  // Get publisher's applications
  const { data: apps } = await supabase
    .from("publisher_por_applications")
    .select("merchant_id, status")
    .eq("publisher_id", pub.userId);

  const appMap = new Map((apps ?? []).map((a) => [a.merchant_id, a.status as string]));
  const approvedIds = [...appMap.entries()].filter(([, s]) => s === "approved").map(([id]) => id);

  // For "approved" scope, only show approved merchants
  // For "all" scope, show all merchants (with application status)
  let q = supabase
    .from("por_merchants")
    .select("merchant_id, name, url, logo_url, category, commission_rate, deep_links, cookie_length, description, merchant_status", { count: "exact" })
    .order("name");

  if (scope === "approved") {
    if (!approvedIds.length) return NextResponse.json({ brands: [], pagination: null, totalCampaigns: 0 });
    q = q.in("merchant_id", approvedIds);
  } else {
    // Show only LIVE merchants
    q = q.eq("merchant_status", "LIVE");
  }

  if (search) q = q.ilike("name", `%${search}%`);
  q = q.range(offset, offset + limit - 1);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;

  const brands = (data ?? []).map((m) => ({
    campaignId:        m.merchant_id,
    name:              m.name,
    advertiserName:    m.name,
    advertiserUrl:     m.url,
    displayUrl:        m.url,
    logoUrl:           m.logo_url ? `/api/por-logo?url=${encodeURIComponent(m.logo_url)}` : null,
    description:       m.description ?? null,
    contractStatus:    m.merchant_status,
    currency:          "GBP",
    allowsDeeplinking: m.deep_links ?? false,
    applicationStatus: (appMap.get(m.merchant_id) ?? "not_applied") as "not_applied" | "pending" | "approved" | "rejected",
    commissionLabel:   m.commission_rate ?? null,
    commissionType:    null,
    locale:            "GB",
    categoryName:      m.category ?? null,
  }));

  return NextResponse.json({
    brands,
    pagination: {
      page, limit, total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      rangeFrom: offset + 1,
      rangeTo: Math.min(offset + limit, total),
    },
    totalCampaigns: total,
  });
}
