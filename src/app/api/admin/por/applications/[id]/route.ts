import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { status?: string } = {};
  try { body = await request.json(); } catch { /* default */ }

  const { status } = body;
  if (!status || !["approved", "rejected", "pending"].includes(status))
    return NextResponse.json({ error: "status must be approved, rejected, or pending" }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("publisher_por_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
