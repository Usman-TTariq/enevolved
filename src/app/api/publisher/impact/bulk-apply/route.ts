import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  let body: { campaignIds?: string[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = (body.campaignIds ?? []).map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ error: "campaignIds is required" }, { status: 400 });
  }
  if (ids.length > 200) {
    return NextResponse.json({ error: "Max 200 campaigns per request" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  // Fetch existing applications for this publisher in one query
  const { data: existing } = await supabase
    .from("publisher_impact_applications")
    .select("campaign_id")
    .eq("publisher_id", pub.userId)
    .in("campaign_id", ids);

  const alreadyApplied = new Set((existing ?? []).map((r) => String(r.campaign_id)));
  const toInsert = ids.filter((id) => !alreadyApplied.has(id));

  let inserted = 0;
  let failed = 0;

  if (toInsert.length > 0) {
    // Verify all campaign IDs exist in one query
    const { data: validCampaigns } = await supabase
      .from("impact_campaigns")
      .select("impact_id")
      .in("impact_id", toInsert);

    const validIds = new Set((validCampaigns ?? []).map((c) => String(c.impact_id)));
    const rows = toInsert
      .filter((id) => validIds.has(id))
      .map((campaign_id) => ({
        publisher_id: pub.userId,
        campaign_id,
        status: "pending",
        updated_at: now,
      }));

    failed += toInsert.length - rows.length; // invalid IDs

    if (rows.length > 0) {
      const { error } = await supabase.from("publisher_impact_applications").insert(rows);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      inserted = rows.length;
    }
  }

  return NextResponse.json({
    ok: true,
    inserted,
    alreadyApplied: alreadyApplied.size,
    failed,
    total: ids.length,
  });
}
