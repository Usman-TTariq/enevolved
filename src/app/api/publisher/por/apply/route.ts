import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function POST(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  let body: { merchantId?: unknown; campaignId?: unknown; campaignIds?: unknown[] } = {};
  try { body = await request.json(); } catch { /* default */ }

  // ── Bulk apply ──────────────────────────────────────────────────────────────
  if (Array.isArray(body.campaignIds) && body.campaignIds.length > 0) {
    const supabase = createServerSupabaseClient();
    const ids = body.campaignIds.map((id) => String(id ?? "").trim()).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ error: "No valid IDs provided" }, { status: 400 });

    const rows = ids.map((mid) => ({
      publisher_id: pub.userId,
      merchant_id:  mid,
      status:       "pending",
      updated_at:   new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("publisher_por_applications")
      .upsert(rows, { onConflict: "publisher_id,merchant_id", ignoreDuplicates: true })
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, inserted: data?.length ?? 0 });
  }

  // ── Single apply ─────────────────────────────────────────────────────────────
  const raw = body.merchantId ?? body.campaignId;
  const merchantId = String(raw ?? "").trim();
  if (!merchantId) return NextResponse.json({ error: "merchantId is required" }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("publisher_por_applications")
    .select("id, status")
    .eq("publisher_id", pub.userId)
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (existing) return NextResponse.json({ ok: true, status: existing.status, alreadyApplied: true });

  const { data, error } = await supabase
    .from("publisher_por_applications")
    .insert({ publisher_id: pub.userId, merchant_id: merchantId, status: "pending", updated_at: new Date().toISOString() })
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, applicationId: data.id, status: data.status });
}
