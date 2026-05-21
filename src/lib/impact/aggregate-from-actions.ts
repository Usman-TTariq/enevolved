import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE = 500;
const MAX_ROWS = 100_000;

export function rollingUtcWindowDays(days: number): { start: Date; end: Date } {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end };
}

export async function aggregateImpactActionsInRange(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<{
  countAll: number;
  countAttributed: number;
  payoutByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
}> {
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  let countAll = 0;
  let countAttributed = 0;
  const payoutByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("impact_actions")
      .select("publisher_id, payout_currency, payout, sale_currency, sale_amount")
      .gte("action_date", startIso)
      .lte("action_date", endIso)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      publisher_id?: string | null;
      payout_currency?: string | null;
      payout?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      countAll += 1;
      const pc = (r.payout_currency ?? "USD").toUpperCase();
      const sc = (r.sale_currency ?? "USD").toUpperCase();
      payoutByCurrency[pc] = (payoutByCurrency[pc] ?? 0) + Number(r.payout ?? 0);
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + Number(r.sale_amount ?? 0);
      if (r.publisher_id) countAttributed += 1;
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { countAll, countAttributed, payoutByCurrency, saleByCurrency };
}

export async function sumAttributedImpactByCurrency(supabase: SupabaseClient): Promise<{
  payoutByCurrency: Record<string, number>;
  saleByCurrency: Record<string, number>;
}> {
  const payoutByCurrency: Record<string, number> = {};
  const saleByCurrency: Record<string, number> = {};
  let offset = 0;
  let totalRead = 0;

  while (totalRead < MAX_ROWS) {
    const { data, error } = await supabase
      .from("impact_actions")
      .select("payout_currency, payout, sale_currency, sale_amount")
      .not("publisher_id", "is", null)
      .range(offset, offset + PAGE - 1);

    if (error || !data?.length) break;

    for (const r of data as {
      payout_currency?: string | null;
      payout?: number | string | null;
      sale_currency?: string | null;
      sale_amount?: number | string | null;
    }[]) {
      const pc = (r.payout_currency ?? "USD").toUpperCase();
      const sc = (r.sale_currency ?? "USD").toUpperCase();
      payoutByCurrency[pc] = (payoutByCurrency[pc] ?? 0) + Number(r.payout ?? 0);
      saleByCurrency[sc] = (saleByCurrency[sc] ?? 0) + Number(r.sale_amount ?? 0);
    }

    totalRead += data.length;
    offset += PAGE;
    if (data.length < PAGE) break;
  }

  return { payoutByCurrency, saleByCurrency };
}
