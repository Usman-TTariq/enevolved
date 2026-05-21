import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const url = new URL(request.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);

  const supabase = createServerSupabaseClient();

  const { data, error, count } = await supabase
    .from("impact_actions")
    .select(
      "action_id, campaign_id, order_id, action_status, payout, payout_currency, payout_usd, sale_amount, sale_currency, action_date, go_link_slug",
      { count: "exact" }
    )
    .eq("publisher_id", pub.userId)
    .order("action_date", { ascending: false })
    .range(offset, offset + limit - 1);

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
    for (const c of camps ?? []) nameMap.set(String(c.impact_id), String(c.name ?? ""));
  }

  return NextResponse.json({
    actions: (data ?? []).map((r) => ({
      ...r,
      campaign_name: nameMap.get(String((r as { campaign_id?: string | null }).campaign_id ?? "")) ?? null,
    })),
    total: count ?? 0,
    limit,
    offset,
  });
}
