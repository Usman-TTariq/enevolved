import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncTTTransactionsToDatabase } from "@/lib/tradetracker/sync-transactions";

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  let body: { start?: string; end?: string } = {};
  try { body = await req.json(); } catch { /* default */ }

  const start = body.start ? new Date(body.start) : undefined;
  const end   = body.end   ? new Date(body.end)   : undefined;

  const supabase = createServerSupabaseClient();
  const result = await syncTTTransactionsToDatabase(supabase, { start, end });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result);
}
