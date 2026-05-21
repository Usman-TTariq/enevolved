import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  const { merchantId } = await params;
  const supabase = createServerSupabaseClient();

  const [{ data: merchant, error: mErr }, { data: app }, { data: goLinks }] = await Promise.all([
    supabase.from("por_merchants").select("*").eq("merchant_id", merchantId).maybeSingle(),
    supabase.from("publisher_por_applications").select("status").eq("publisher_id", pub.userId).eq("merchant_id", merchantId).maybeSingle(),
    supabase.from("publisher_go_links").select("id, slug, target_url, deep_link, created_at, click_count").eq("publisher_id", pub.userId).eq("campaign_id", merchantId).eq("network", "paidonresults").order("created_at", { ascending: false }).limit(50),
  ]);

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
  if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

  return NextResponse.json({
    merchant,
    applicationStatus: app?.status ?? null,
    goLinks: goLinks ?? [],
  });
}
