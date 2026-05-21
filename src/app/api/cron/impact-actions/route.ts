import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncImpactActionsToDatabase } from "@/lib/impact/sync-actions";
import { isImpactConfigured } from "@/lib/impact/client";

/**
 * Scheduled sync for Impact actions (Vercel Cron / GitHub Actions).
 * POST with header: Authorization: Bearer <IMPACT_SYNC_CRON_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.IMPACT_SYNC_CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "IMPACT_SYNC_CRON_SECRET is not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization")?.trim() ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isImpactConfigured()) {
    return NextResponse.json({ error: "Impact is not configured" }, { status: 503 });
  }

  const supabase = createServerSupabaseClient();
  const result = await syncImpactActionsToDatabase(supabase);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json(result);
}
