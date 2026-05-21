import type { SupabaseClient } from "@supabase/supabase-js";
import { syncImpactActionsToDatabase } from "./sync-actions";

const DEFAULT_THROTTLE_MS = 15 * 60 * 1000;

let syncInFlight = false;

function parseThrottleMs(): number {
  const raw = process.env.ADMIN_DASHBOARD_IMPACT_SYNC_MINUTES?.trim();
  if (!raw) return DEFAULT_THROTTLE_MS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_THROTTLE_MS;
  return Math.min(120, n) * 60 * 1000;
}

export async function maybeSyncImpactOnAdminDashboardLoad(
  supabase: SupabaseClient,
  options: { force: boolean }
): Promise<{ ran: boolean; skippedReason?: string; error?: string }> {
  if (syncInFlight) {
    return { ran: false, skippedReason: "Impact sync already in progress." };
  }

  if (options.force) {
    syncInFlight = true;
    try {
      const now = new Date();
      const end = new Date(now);
      end.setUTCHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - 29);
      start.setUTCHours(0, 0, 0, 0);
      const result = await syncImpactActionsToDatabase(supabase, { start, end });
      if (!result.ok) return { ran: true, error: result.error };
      return { ran: true };
    } finally {
      syncInFlight = false;
    }
  }

  const throttleMs = parseThrottleMs();
  const { data: syncRow } = await supabase
    .from("impact_action_sync_state")
    .select("last_completed_at")
    .eq("id", "default")
    .maybeSingle();

  const last = syncRow?.last_completed_at ? new Date(String(syncRow.last_completed_at)).getTime() : 0;
  const now = Date.now();
  if (last > 0 && now - last < throttleMs) {
    return {
      ran: false,
      skippedReason: `Impact synced ${Math.round((now - last) / 60000)} min ago; next auto-pull in ~${Math.max(1, Math.round((throttleMs - (now - last)) / 60000))} min.`,
    };
  }

  syncInFlight = true;
  try {
    const result = await syncImpactActionsToDatabase(supabase);
    if (!result.ok) return { ran: true, error: result.error };
    return { ran: true };
  } finally {
    syncInFlight = false;
  }
}
