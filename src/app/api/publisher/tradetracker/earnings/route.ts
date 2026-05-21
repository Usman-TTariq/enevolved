import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";

function parseDays(raw: string | null): number {
  const n = Number(raw ?? "730");
  if (!Number.isFinite(n) || n < 1) return 730;
  return Math.min(800, Math.floor(n));
}

function startDateUtc(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) return NextResponse.json({ error: pub.message }, { status: pub.status });

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get("days"));
  const from = startDateUtc(days);

  const supabase = createServerSupabaseClient();

  const { data: rows, error } = await supabase
    .from("tradetracker_publisher_earnings_daily")
    .select("date, currency, commission, order_amount, transaction_count")
    .eq("publisher_id", pub.userId)
    .gte("date", from)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const commissionByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  let totalTxns = 0;

  type Row = { date: string; currency: string; commission: number | string | null; order_amount: number | string | null; transaction_count: number | string | null };

  const series = (rows ?? []).map((r: Row) => {
    const cur = (r.currency ?? "EUR").toUpperCase();
    const c   = Number(r.commission ?? 0);
    const s   = Number(r.order_amount ?? 0);
    const t   = Number(r.transaction_count ?? 0);
    commissionByCurrency[cur] = (commissionByCurrency[cur] ?? 0) + c;
    saleByCurrency[cur]       = (saleByCurrency[cur] ?? 0) + s;
    totalTxns += t;
    return { date: r.date, currency: cur, commission: c, sale: s, transactions: t };
  });

  return NextResponse.json({
    days,
    from,
    series,
    source: "tradetracker_rollup" as const,
    totals: { commissionByCurrency, saleByCurrency, transactions: totalTxns },
  });
}
