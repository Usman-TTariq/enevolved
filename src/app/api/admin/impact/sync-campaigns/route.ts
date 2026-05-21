import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchImpactCampaigns } from "@/lib/impact/client";

const SELECT_PAGE = 1000;
const DELETE_IN_CHUNK = 200;

async function removeCampaignsNotInSet(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  keepIds: Set<string>
): Promise<number> {
  const allIds: string[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("impact_campaigns")
      .select("impact_id")
      .range(from, from + SELECT_PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    for (const r of data) allIds.push(String(r.impact_id));
    if (data.length < SELECT_PAGE) break;
    from += SELECT_PAGE;
  }

  const toRemove = allIds.filter((id) => !keepIds.has(id));
  let removed = 0;
  for (let i = 0; i < toRemove.length; i += DELETE_IN_CHUNK) {
    const chunk = toRemove.slice(i, i + DELETE_IN_CHUNK);
    const { error } = await supabase.from("impact_campaigns").delete().in("impact_id", chunk);
    if (error) throw new Error(error.message);
    removed += chunk.length;
  }
  return removed;
}

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const campaigns = await fetchImpactCampaigns();
    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();

    if (campaigns.length === 0) {
      return NextResponse.json({ ok: true, upserted: 0, removed: 0, message: "Impact returned no campaigns." });
    }

    const rows = campaigns.map((c) => ({
      impact_id: String(c.CampaignId),
      name: c.CampaignName ?? "Unnamed campaign",
      advertiser_name: c.AdvertiserName ?? null,
      logo_url: c.CampaignLogoUri ?? null,
      click_through_url: c.TrackingLink ?? null,
      currency: c.Currency ?? null,
      status: c.ContractStatus ?? null,
      raw: c as unknown,
      fetched_at: now,
    }));

    const { error: upErr } = await supabase.from("impact_campaigns").upsert(rows, { onConflict: "impact_id" });
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const keepIds = new Set(campaigns.map((c) => String(c.CampaignId)));
    const removed = await removeCampaignsNotInSet(supabase, keepIds);

    return NextResponse.json({ ok: true, upserted: rows.length, removed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
