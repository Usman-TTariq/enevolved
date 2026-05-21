"use client";

import { useEffect, useState } from "react";

type Campaign = {
  impact_id: string;
  name: string;
  advertiser_name: string | null;
  logo_url: string | null;
  currency: string | null;
  status: string | null;
  fetched_at: string;
};

export default function ImpactCampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async (query = "") => {
    setLoading(true);
    try {
      const qs = query ? `&q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/admin/impact/campaigns?limit=100${qs}`, { credentials: "include" });
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const syncCampaigns = async () => {
    setSyncing(true); setMessage(null); setError(null);
    try {
      const res = await fetch("/api/admin/impact/sync-campaigns", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Sync failed."); return; }
      setMessage(`Synced OK. Upserted ${data.upserted ?? 0}, removed ${data.removed ?? 0} stale campaigns.`);
      await load(q);
    } catch { setError("Sync request failed."); }
    finally { setSyncing(false); }
  };

  const active = campaigns.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}>

      {/* ── Page header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">Impact</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Campaigns cached from the Impact Mediapartner API. Run <span className="font-semibold text-gray-600">Sync campaigns</span> to pull the latest list.
          </p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {total} total
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {active} active
          </span>
        </div>
      </div>

      {/* ── Actions bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={syncCampaigns} disabled={syncing}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-200/50 transition hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
          {syncing ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Syncing…</>
          ) : (
            <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>Sync campaigns</>
          )}
        </button>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="search" value={q}
            onChange={(e) => { setQ(e.target.value); void load(e.target.value); }}
            placeholder="Search campaigns…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 shadow-sm placeholder-gray-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
        </div>
      </div>

      {/* ── Messages ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          <svg className="h-4 w-4 shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {message}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100" style={{ background: "linear-gradient(90deg,#f0fdf9,#f5f9ff)" }}>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Campaign ID</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Name</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Advertiser</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Currency</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                    <span className="text-sm text-gray-400">Loading campaigns…</span>
                  </div>
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No campaigns cached yet.</p>
                    <p className="text-xs text-gray-400">Click <strong className="text-gray-600">Sync campaigns</strong> to pull data from Impact.</p>
                  </div>
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.impact_id} className="border-b border-gray-50 transition-colors hover:bg-teal-50/30">
                  <td className="px-4 py-3">
                    <code className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-0.5 font-mono text-xs text-teal-600">
                      {c.impact_id}
                    </code>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.advertiser_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c.currency ? (
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                        {c.currency}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      c.status === "ACTIVE"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-gray-200 bg-gray-50 text-gray-500"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === "ACTIVE" ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {c.status ?? "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
