import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_LIMIT = 100;

function parseDateBoundary(s: string | null, endOfDay: boolean): Date | null {
  if (!s?.trim()) return null;
  const d = new Date(s.trim());
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setUTCHours(23, 59, 59, 999);
  else d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const url = new URL(request.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const lostOnly = url.searchParams.get("lostOnly") === "1";
  const attributedOnly = !lostOnly && url.searchParams.get("attributedOnly") === "1";
  const goLinkSlugRaw = url.searchParams.get("goLinkSlug")?.trim() ?? "";
  const goLinkSlug = /^[A-Za-z0-9]{6,32}$/.test(goLinkSlugRaw) ? goLinkSlugRaw : "";
  const fromD = parseDateBoundary(url.searchParams.get("from"), false);
  const toD = parseDateBoundary(url.searchParams.get("to"), true);

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("impact_actions")
    .select(
      "action_id, campaign_id, order_id, action_status, payout, payout_currency, sale_amount, sale_currency, action_date, sub_id3, publisher_id, go_link_slug, synced_at",
      { count: "exact" }
    )
    .order("action_date", { ascending: false });

  if (fromD) q = q.gte("action_date", fromD.toISOString());
  if (toD) q = q.lte("action_date", toD.toISOString());
  if (lostOnly) q = q.is("publisher_id", null);
  else if (attributedOnly) q = q.not("publisher_id", "is", null);
  if (goLinkSlug) {
    q = q.or(`go_link_slug.eq.${goLinkSlug},sub_id3.ilike.%${goLinkSlug}%`);
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve campaign names
  const campaignIds = [...new Set((data ?? []).map((r) => (r as { campaign_id?: string | null }).campaign_id).filter(Boolean))] as string[];
  const nameMap = new Map<string, string>();
  if (campaignIds.length > 0) {
    const { data: camps } = await supabase
      .from("impact_campaigns")
      .select("impact_id, name")
      .in("impact_id", campaignIds);
    for (const c of camps ?? []) {
      nameMap.set(String(c.impact_id), String(c.name ?? ""));
    }
  }

  return NextResponse.json({
    rows: (data ?? []).map((r) => ({
      ...r,
      campaign_name: nameMap.get(String((r as { campaign_id?: string | null }).campaign_id ?? "")) ?? null,
    })),
    total: count ?? 0,
    limit,
    offset,
  });
}
