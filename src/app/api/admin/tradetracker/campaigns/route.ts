import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const q      = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit  = Math.min(5000, parseInt(searchParams.get("limit") ?? "5000", 10) || 5000);
  const locale = searchParams.get("locale")?.trim();
  const statusFilter = searchParams.get("status")?.trim();

  const supabase = createServerSupabaseClient();

  // Real counts straight from DB (not affected by limit/filters)
  const [
    { count: totalInDb },
    { count: acceptedInDb },
    { count: pendingInDb },
    { count: rejectedInDb },
    { count: nlFrInDb },
    { count: ukInDb },
  ] = await Promise.all([
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }).eq("assignment_status", "accepted"),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }).eq("assignment_status", "pending"),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }).eq("assignment_status", "rejected"),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }).in("locale", ["nl_NL", "fr_FR"]),
    supabase.from("tradetracker_campaigns").select("*", { count: "exact", head: true }).eq("locale", "en_GB"),
  ]);

  const stats = {
    total:    totalInDb    ?? 0,
    accepted: acceptedInDb ?? 0,
    pending:  pendingInDb  ?? 0,
    rejected: rejectedInDb ?? 0,
    nlFr:     nlFrInDb     ?? 0,
    uk:       ukInDb       ?? 0,
  };

  let query = supabase
    .from("tradetracker_campaigns")
    .select("tt_campaign_id, locale, name, url, tracking_url, logo_url, assignment_status, commission_type, commission_percentage, commission_fixed_fee, currency, category_id, category_name, deeplinking_supported, fetched_at")
    .order("name", { ascending: true })
    .limit(limit);

  if (q)            query = query.ilike("name", `%${q}%`);
  if (locale)       query = query.eq("locale", locale);
  if (statusFilter) query = query.eq("assignment_status", statusFilter);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ campaigns: data ?? [], total: (data ?? []).length, stats });
}

/** Admin can manually add/update a TradeTracker campaign */
export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  let body: {
    tt_campaign_id?: string; name?: string; locale?: string;
    tracking_url?: string; logo_url?: string; url?: string;
    commission_type?: string; commission_percentage?: number;
    commission_fixed_fee?: number; currency?: string; description?: string;
  } = {};
  try { body = await req.json(); } catch { /* default */ }

  const { tt_campaign_id, name, locale } = body;
  if (!tt_campaign_id?.trim() || !name?.trim() || !locale?.trim()) {
    return NextResponse.json({ error: "tt_campaign_id, name and locale are required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const row = {
    tt_campaign_id: tt_campaign_id.trim(),
    name: name.trim(),
    locale: locale.trim(),
    url: body.url ?? null,
    tracking_url: body.tracking_url ?? null,
    logo_url: body.logo_url ?? null,
    assignment_status: "accepted",
    commission_type: body.commission_type ?? null,
    commission_percentage: body.commission_percentage ?? null,
    commission_fixed_fee: body.commission_fixed_fee ?? null,
    currency: body.currency ?? "EUR",
    description: body.description ?? null,
    fetched_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("tradetracker_campaigns")
    .upsert(row, { onConflict: "tt_campaign_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
