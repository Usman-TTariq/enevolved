import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchMerchants } from "@/lib/por/client";

export async function POST(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerSupabaseClient();

  let merchants;
  try {
    merchants = await fetchMerchants();
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  if (!merchants.length)
    return NextResponse.json({ ok: true, upserted: 0, total: 0 });

  const rows = merchants.map((m) => ({
    merchant_id:        m.merchantId,
    name:               m.name,
    url:                m.url,
    tracking_url:       m.trackingUrl,
    logo_url:           m.logoUrl,
    category:           m.category,
    description:        m.description,
    commission_rate:    m.commissionRate,
    average_commission: m.averageCommission,
    average_basket:     m.averageBasket,
    cookie_length:      m.cookieLength,
    deep_links:         m.deepLinks,
    merchant_status:    m.merchantStatus,
    affiliate_status:   m.affiliateStatus,
    conversion_ratio:   m.conversionRatio,
    approval_rate:      m.approvalRate,
    void_rate:          m.voidRate,
    raw:                m,
    fetched_at:         new Date().toISOString(),
  }));

  const CHUNK = 100;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("por_merchants").upsert(
      rows.slice(i, i + CHUNK),
      { onConflict: "merchant_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    upserted += Math.min(CHUNK, rows.length - i);
  }

  await supabase.from("por_sync_state").upsert({
    id: "default",
    last_completed_at: new Date().toISOString(),
    last_error: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });

  return NextResponse.json({ ok: true, upserted, total: merchants.length });
}
