import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchTransactions } from "@/lib/por/client";

export async function POST(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url  = new URL(request.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to   = url.searchParams.get("to")   ?? undefined;

  const supabase = createServerSupabaseClient();

  let txns;
  try {
    txns = await fetchTransactions({ fromDate: from, toDate: to });
  } catch (e) {
    const msg = String(e);
    await supabase.from("por_sync_state").upsert({
      id: "default", last_error: msg, updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!txns.length)
    return NextResponse.json({ ok: true, upserted: 0, total: 0 });

  // Attribute go-link slugs to publishers
  const slugSet = new Set(txns.map((t) => t.customTrackingId).filter(Boolean) as string[]);
  const publisherBySlug = new Map<string, string>();
  if (slugSet.size > 0) {
    const { data: links } = await supabase
      .from("publisher_go_links")
      .select("slug, publisher_id")
      .in("slug", [...slugSet]);
    for (const l of links ?? []) {
      if (l.slug && l.publisher_id) publisherBySlug.set(l.slug, l.publisher_id);
    }
  }

  const rows = txns.map((t) => {
    const slug = t.customTrackingId ?? null;
    const publisherId = slug ? (publisherBySlug.get(slug) ?? null) : null;
    return {
      network_order_id:     t.networkOrderId,
      merchant_id:          t.merchantId,
      merchant_name:        t.merchantName,
      order_date:           t.orderDate,
      date_added:           t.dateAdded,
      date_updated:         t.dateUpdated,
      order_value:          t.orderValue,
      affiliate_commission: t.affiliateCommission,
      currency:             "GBP",
      transaction_type:     t.transactionType,
      transaction_status:   t.transactionStatus,
      paid_to_affiliate:    t.paidToAffiliate,
      custom_tracking_id:   slug,
      go_link_slug:         slug,
      publisher_id:         publisherId,
      synced_at:            new Date().toISOString(),
      raw:                  t,
    };
  });

  const CHUNK = 100;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("por_transactions").upsert(
      rows.slice(i, i + CHUNK),
      { onConflict: "network_order_id" }
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

  return NextResponse.json({ ok: true, upserted, total: txns.length });
}
