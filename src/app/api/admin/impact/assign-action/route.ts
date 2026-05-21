import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  let body: { actionId?: string; publisherId?: string; goLinkSlug?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const actionId = body.actionId?.trim();
  const publisherId = body.publisherId?.trim();
  const goLinkSlug = body.goLinkSlug?.trim() ?? null;

  if (!actionId) return NextResponse.json({ error: "actionId is required" }, { status: 400 });
  if (!publisherId) return NextResponse.json({ error: "publisherId is required" }, { status: 400 });

  const supabase = createServerSupabaseClient();

  // Verify publisher exists
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", publisherId)
    .maybeSingle();
  if (profErr || !profile) {
    return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  }

  const { error: updateErr } = await supabase
    .from("impact_actions")
    .update({
      publisher_id: publisherId,
      go_link_slug: goLinkSlug,
      sub_id3: goLinkSlug,
      manually_assigned_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    })
    .eq("action_id", actionId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Rebuild rollup
  await supabase.rpc("refresh_impact_publisher_earnings_daily");

  return NextResponse.json({ ok: true });
}
