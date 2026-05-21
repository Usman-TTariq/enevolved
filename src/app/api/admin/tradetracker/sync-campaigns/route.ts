import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchAllTTCampaigns } from "@/lib/tradetracker/client";

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const campaigns = await fetchAllTTCampaigns();
    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();

    if (campaigns.length === 0) {
      return NextResponse.json({ ok: true, upserted: 0, removed: 0, message: "TradeTracker returned no campaigns." });
    }

    const rows = campaigns.map((c) => ({
      tt_campaign_id:        c.campaignId,
      locale:                c.locale,
      name:                  c.name,
      url:                   c.url,
      tracking_url:          c.trackingUrl,
      logo_url:              c.logoUrl,
      assignment_status:     c.assignmentStatus,
      commission_type:       c.commissionType,
      commission_percentage: c.commissionPercentage,
      commission_fixed_fee:  c.commissionFixedFee,
      currency:              c.currency,
      description:           c.description,
      deeplinking_supported: c.deepLinkingSupported,
      category_id:           c.categoryId,
      category_name:         c.categoryName,
      raw:                   c.raw,
      fetched_at:            now,
    }));

    const { error: upErr } = await supabase
      .from("tradetracker_campaigns")
      .upsert(rows, { onConflict: "tt_campaign_id" });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // Remove stale campaigns not in current fetch
    const keepIds = new Set(campaigns.map((c) => c.campaignId));
    const { data: existing } = await supabase.from("tradetracker_campaigns").select("tt_campaign_id");
    const toRemove = (existing ?? [])
      .map((r) => String(r.tt_campaign_id))
      .filter((id) => !keepIds.has(id));

    let removed = 0;
    if (toRemove.length > 0) {
      await supabase.from("tradetracker_campaigns").delete().in("tt_campaign_id", toRemove);
      removed = toRemove.length;
    }

    return NextResponse.json({ ok: true, upserted: rows.length, removed });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sync failed" }, { status: 500 });
  }
}
