import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function parseDays(raw: string | null): number {
  const n = Number(raw ?? "30");
  if (!Number.isFinite(n) || n < 1) return 30;
  return Math.min(366, Math.floor(n));
}

function startDateIso(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get("days"));
  const from = startDateIso(days);

  const supabase = createServerSupabaseClient();

  // Query Impact earnings rollup
  const { data: rows, error } = await supabase
    .from("impact_publisher_earnings_daily")
    .select("publisher_id, payout_currency, sale_currency, payout, sale_amount")
    .gte("date", from);

  if (error) {
    // Table may not exist yet — return empty instead of 500
    return NextResponse.json({ from, days, publishers: [] });
  }

  type R = {
    publisher_id: string;
    payout_currency: string;
    sale_currency: string;
    payout: number | string | null;
    sale_amount: number | string | null;
  };

  const byPubPayout = new Map<string, Record<string, number>>();
  const byPubSale   = new Map<string, Record<string, number>>();

  for (const r of (rows ?? []) as R[]) {
    const pid = r.publisher_id;
    const pc  = (r.payout_currency ?? "USD").toUpperCase();
    const sc  = (r.sale_currency   ?? "USD").toUpperCase();

    const pm = byPubPayout.get(pid) ?? {};
    pm[pc] = (pm[pc] ?? 0) + Number(r.payout ?? 0);
    byPubPayout.set(pid, pm);

    const sm = byPubSale.get(pid) ?? {};
    sm[sc] = (sm[sc] ?? 0) + Number(r.sale_amount ?? 0);
    byPubSale.set(pid, sm);
  }

  const ids = [...new Set([...byPubPayout.keys(), ...byPubSale.keys()])];
  if (ids.length === 0) {
    return NextResponse.json({ from, days, publishers: [] });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, email")
    .in("id", ids);

  const profMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  const publishers = ids
    .map((id) => {
      const p = profMap.get(id);
      return {
        publisherId: id,
        username: (p?.username as string) ?? "—",
        email: (p?.email as string) ?? "",
        commissionByCurrency: byPubPayout.get(id) ?? {},
        saleByCurrency: byPubSale.get(id) ?? {},
      };
    })
    .sort((a, b) => {
      const sa = Object.values(a.commissionByCurrency).reduce((x, y) => x + y, 0);
      const sb = Object.values(b.commissionByCurrency).reduce((x, y) => x + y, 0);
      return sb - sa;
    })
    .slice(0, 100);

  return NextResponse.json({ from, days, publishers });
}
