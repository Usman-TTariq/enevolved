import { NextResponse } from "next/server";
import { requireAdmin } from "../../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = requireAdmin(request);
  if (err) return err;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: { status?: string } = {};
  try { body = await request.json(); } catch { /* default */ }

  const status = body.status?.trim();
  if (!status || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "status must be approved, rejected, or pending" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("publisher_tradetracker_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id, status });
}
