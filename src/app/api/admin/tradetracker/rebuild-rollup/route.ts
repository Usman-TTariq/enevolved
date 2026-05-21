import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.rpc("refresh_tradetracker_publisher_earnings_daily");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
