import { NextResponse } from "next/server";
import { adminRequestIsAuthorized } from "@/lib/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!adminRequestIsAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url    = new URL(request.url);
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "200"), 500);
  const status = url.searchParams.get("status") ?? "";

  const supabase = createServerSupabaseClient();

  let q = supabase
    .from("publisher_por_applications")
    .select("id, publisher_id, merchant_id, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) q = q.eq("status", status);
  const { data: apps, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!apps?.length) return NextResponse.json({ applications: [] });

  const publisherIds = [...new Set(apps.map((a) => a.publisher_id))];
  const merchantIds  = [...new Set(apps.map((a) => a.merchant_id))];

  const [{ data: profiles }, { data: merchants }] = await Promise.all([
    supabase.from("profiles").select("id, username, email").in("id", publisherIds),
    supabase.from("por_merchants").select("merchant_id, name, logo_url").in("merchant_id", merchantIds),
  ]);

  const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const merchMap = new Map((merchants ?? []).map((m) => [m.merchant_id, m]));

  return NextResponse.json({
    applications: apps.map((a) => ({
      ...a,
      publisher: profMap.get(a.publisher_id) ?? null,
      merchant:  merchMap.get(a.merchant_id) ?? null,
    })),
  });
}
