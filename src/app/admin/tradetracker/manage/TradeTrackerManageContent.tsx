"use client";
import { useEffect, useState } from "react";

function CodePill({ children }: { children: string }) {
  return (
    <code className="inline-block rounded-lg border border-teal-100 bg-teal-50 px-1.5 py-0.5 font-mono text-[11px] text-teal-700">
      {children}
    </code>
  );
}

type Stats = {
  transactions: { total: number; accepted: number; pending: number; rejected: number; attributed: number };
  campaigns:    { total: number; accepted: number };
  revenue:      { totalCommission: number; attributedEarnings: number };
  lastSync:     { syncedAt: string; offset: number } | null;
};

export default function TradeTrackerManageContent() {
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [syncing,      setSyncing]      = useState(false);
  const [rebuilding,   setRebuilding]   = useState(false);
  const [message,      setMessage]      = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res  = await fetch("/api/admin/tradetracker/stats", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setStats(data);
    } finally { setStatsLoading(false); }
  };

  useEffect(() => { void loadStats(); }, []);

  const runSync = async () => {
    setSyncing(true); setMessage(null); setError(null);
    try {
      const body = startDate.trim() && endDate.trim()
        ? JSON.stringify({ start: `${startDate}T00:00:00.000Z`, end: `${endDate}T23:59:59.999Z` })
        : "{}";
      const res  = await fetch("/api/admin/tradetracker/sync-transactions", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Sync failed."); return; }
      setMessage(`Synced OK — fetched ${data.fetched ?? 0}, saved ${data.upserted ?? 0}, attributed ${data.attributed ?? 0} to publishers.`);
      await loadStats();
    } catch { setError("Request failed."); }
    finally { setSyncing(false); }
  };

  const runRebuild = async () => {
    setRebuilding(true); setMessage(null); setError(null);
    try {
      const res  = await fetch("/api/admin/tradetracker/rebuild-rollup", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Rebuild failed."); return; }
      setMessage("TradeTracker daily earnings rollup rebuilt successfully.");
      await loadStats();
    } catch { setError("Request failed."); }
    finally { setRebuilding(false); }
  };

  const fmt = (n: number) => n.toLocaleString("en-EU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100";

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>

      {/* ── Page header ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">TradeTracker</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
          Sync &amp; Rebuild
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Fetch transactions from TradeTracker SOAP API, attribute to publishers, and rebuild earnings rollup.
          {stats?.lastSync && (
            <span className="ml-2 text-gray-500">
              Last sync: <strong>{new Date(stats.lastSync.syncedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong> UTC
            </span>
          )}
        </p>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {message}
        </div>
      )}

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {[
          { label: "Total Transactions", value: stats?.transactions.total,      color: "#0ea5e9" },
          { label: "Accepted",           value: stats?.transactions.accepted,    color: "#10b981" },
          { label: "Pending",            value: stats?.transactions.pending,     color: "#f59e0b" },
          { label: "Attributed",         value: stats?.transactions.attributed,  color: "#8b5cf6" },
          { label: "Campaigns",          value: stats?.campaigns.total,          color: "#0d9488" },
          { label: "Accepted Campaigns", value: stats?.campaigns.accepted,       color: "#059669" },
        ].map(({ label, value, color }) => (
          <div key={label} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-[3px] w-full" style={{ background: color }} />
            <div className="p-4">
              {statsLoading || value === undefined
                ? <div className="h-7 w-16 animate-pulse rounded-lg bg-gray-100" />
                : <p className="text-2xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
              }
              <p className="mt-1 text-[11px] font-medium text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#0d9488,#059669)" }} />
          <div className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attributed Commissions (Rollup)</p>
            {statsLoading
              ? <div className="mt-2 h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
              : <p className="mt-2 text-4xl font-extrabold text-gray-900">€{fmt(stats?.revenue.totalCommission ?? 0)}</p>
            }
            <p className="mt-1 text-xs text-gray-400">Sum of accepted transaction commissions</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#8b5cf6,#6366f1)" }} />
          <div className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Publisher Earnings (Rollup)</p>
            {statsLoading
              ? <div className="mt-2 h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
              : <p className="mt-2 text-4xl font-extrabold text-gray-900">€{fmt(stats?.revenue.attributedEarnings ?? 0)}</p>
            }
            <p className="mt-1 text-xs text-gray-400">
              {stats?.transactions.attributed ?? 0} transactions attributed to publishers
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Sync Transactions ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#0d9488,#059669)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Sync Transactions</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Pulls TradeTracker conversion transactions via <CodePill>getConversionTransactions</CodePill> SOAP call
              for all affiliate sites (NL + FR + UK), upserts into <CodePill>tradetracker_transactions</CodePill>,
              matches <CodePill>reference</CodePill> field to publisher go-link slugs, then rebuilds daily rollup.
            </p>
            <p className="mt-1.5 text-xs text-gray-400">
              Leave dates empty for incremental sync (overlap with last sync, or last 31 days on first run).
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">Start (UTC)</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={{ width: 160 }} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">End (UTC)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} style={{ width: 160 }} />
              </div>
              <button onClick={runSync}
                disabled={syncing || (Boolean(startDate.trim()) !== Boolean(endDate.trim()))}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                {syncing
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Syncing…</>
                  : "Run transaction sync"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Rebuild Rollup ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#0891b2,#0d9488)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 10.903 3.75 8.625m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 13.153 3.75 10.875" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Rebuild Daily Rollup</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Recomputes <CodePill>tradetracker_publisher_earnings_daily</CodePill> from all attributed rows in{" "}
              <CodePill>tradetracker_transactions</CodePill>. Use after manual imports or if publisher dashboards show incorrect earnings.
            </p>
            <button onClick={runRebuild} disabled={rebuilding}
              className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50">
              {rebuilding
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />Rebuilding…</>
                : "Rebuild rollup"}
            </button>
          </div>
        </div>

        {/* ── Cron info ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#a855f7,#6366f1)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Scheduled Sync (Cron)</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Schedule <CodePill>POST /api/cron/tradetracker-transactions</CodePill> every few hours for automatic sync.
              Set env <CodePill>IMPACT_SYNC_CRON_SECRET</CodePill> and send header{" "}
              <CodePill>{"Authorization: Bearer <secret>"}</CodePill>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
