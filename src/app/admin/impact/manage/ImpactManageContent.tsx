"use client";

import { useState } from "react";

function CodePill({ children }: { children: string }) {
  return <code className="rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-teal-700">{children}</code>;
}

export default function ImpactManageContent() {
  const [syncing, setSyncing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const runSync = async () => {
    setSyncing(true); setMessage(null); setError(null);
    try {
      const body = startDate.trim() && endDate.trim()
        ? JSON.stringify({ start: `${startDate.trim()}T00:00:00.000Z`, end: `${endDate.trim()}T23:59:59.999Z` })
        : "{}";
      const res = await fetch("/api/admin/impact/sync-actions", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body,
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Sync failed."); return; }
      const fb = Number(data.fallbackAttributed ?? 0);
      const still = Number(data.stillUnattributed ?? 0);
      setMessage(
        `Synced OK. Fetched ${data.fetched ?? 0}, saved ${data.upserted ?? 0}. ` +
        `Attributed ${data.attributed ?? 0}, unmatched SubId3 ${data.unmatched ?? 0}.` +
        (fb > 0 ? ` Filled ${fb} row(s) via campaign fallback.` : "") +
        ` Actions still unattributed: ${still}.`
      );
    } catch { setError("Sync request failed."); }
    finally { setSyncing(false); }
  };

  const runRebuild = async () => {
    setRebuilding(true); setMessage(null); setError(null);
    try {
      const res = await fetch("/api/admin/impact/rebuild-rollup", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Rebuild failed."); return; }
      setMessage("Impact daily earnings rollup rebuilt from impact_actions.");
    } catch { setError("Rebuild request failed."); }
    finally { setRebuilding(false); }
  };

  const inputCls = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100";

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">Impact</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Sync & rebuild</h1>
        <p className="mt-1 text-sm text-gray-400">Server-side jobs for Impact API sync and earnings rollup. Credentials stay on the server.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>{error}
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>{message}
        </div>
      )}

      <div className="space-y-4">
        {/* Sync actions */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#0d9488,#059669)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
                <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Sync actions</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Pulls Impact actions (conversions) from the Mediapartner Actions API, upserts into{" "}
              <CodePill>impact_actions</CodePill>, matches <CodePill>SubId3</CodePill> to go-link slugs for publisher attribution, then refreshes the daily rollup.
            </p>
            <p className="mt-1.5 text-xs text-gray-400">
              Leave dates empty to use the default window (overlap with last sync, or last 31 days on first run).
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="impact-sync-start" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Start (UTC)</label>
                <input id="impact-sync-start" type="date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="impact-sync-end" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">End (UTC)</label>
                <input id="impact-sync-end" type="date" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
              </div>
              <button type="button" onClick={runSync}
                disabled={syncing || (Boolean(startDate.trim()) !== Boolean(endDate.trim()))}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-200/50 transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                {syncing ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Syncing…</>
                ) : "Run action sync"}
              </button>
            </div>
          </div>
        </div>

        {/* Rebuild rollup */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#0891b2,#0d9488)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 shadow-sm">
                <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 10.903 3.75 8.625m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 13.153 3.75 10.875" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Rebuild daily rollup</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Recomputes <CodePill>impact_publisher_earnings_daily</CodePill> from attributed rows in{" "}
              <CodePill>impact_actions</CodePill>. Use after manual imports or if dashboards look out of date.
            </p>
            <button type="button" onClick={runRebuild} disabled={rebuilding}
              className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50">
              {rebuilding ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />Rebuilding…</>
              ) : "Rebuild rollup"}
            </button>
          </div>
        </div>

        {/* Cron info */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#a855f7,#6366f1)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-sm">
                <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Scheduled sync (cron)</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Hourly cron is configured in <CodePill>vercel.json</CodePill> for{" "}
              <CodePill>POST /api/cron/impact-actions</CodePill>. Set env{" "}
              <CodePill>IMPACT_SYNC_CRON_SECRET</CodePill> and send header{" "}
              <CodePill>Authorization: Bearer {"<secret>"}</CodePill>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
