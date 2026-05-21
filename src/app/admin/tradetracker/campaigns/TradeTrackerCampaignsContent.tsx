"use client";
import { useEffect, useRef, useState } from "react";

type AddForm = { tt_campaign_id: string; name: string; locale: string; tracking_url: string; commission_percentage: string; currency: string };

type Campaign = {
  tt_campaign_id: string; locale: string; name: string; url: string | null;
  logo_url: string | null; tracking_url: string | null; assignment_status: string | null;
  commission_type: string | null; commission_percentage: number | null;
  commission_fixed_fee: number | null; currency: string | null;
  category_id: string | null; category_name: string | null;
  deeplinking_supported: boolean | null; fetched_at: string;
};

const LOCALE_META: Record<string, { label: string; flag: string; bg: string; text: string; dot: string }> = {
  nl_NL: { label: "NL", flag: "🇳🇱", bg: "bg-orange-500/10", text: "text-orange-600", dot: "#f97316" },
  fr_FR: { label: "FR", flag: "🇫🇷", bg: "bg-blue-500/10",   text: "text-blue-600",   dot: "#3b82f6" },
  en_GB: { label: "UK", flag: "🇬🇧", bg: "bg-violet-500/10", text: "text-violet-600", dot: "#8b5cf6" },
};

const STATUS_META: Record<string, { label: string; bg: string; text: string; ring: string; dot: string }> = {
  accepted:    { label: "Accepted",    bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20", dot: "#10b981" },
  pending:     { label: "Pending",     bg: "bg-amber-500/10",   text: "text-amber-600",   ring: "ring-amber-500/20",   dot: "#f59e0b" },
  rejected:    { label: "Rejected",    bg: "bg-red-500/10",     text: "text-red-500",     ring: "ring-red-500/20",     dot: "#ef4444" },
  notAssigned: { label: "Unassigned",  bg: "bg-gray-100",       text: "text-gray-500",    ring: "ring-gray-200",       dot: "#9ca3af" },
};

export default function TradeTrackerCampaignsContent() {
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [stats, setStats]           = useState({ total: 0, accepted: 0, pending: 0, rejected: 0, nlFr: 0, uk: 0 });
  const [loading, setLoading]       = useState(true);
  const [syncing, setSyncing]       = useState(false);
  const [message, setMessage]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [q, setQ]                   = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "accepted" | "pending" | "rejected">("all");
  const [showAdd, setShowAdd]       = useState(false);
  const [adding, setAdding]         = useState(false);
  const [addForm, setAddForm]       = useState<AddForm>({
    tt_campaign_id: "", name: "", locale: "nl_NL",
    tracking_url: "", commission_percentage: "", currency: "EUR",
  });
  const searchRef = useRef<HTMLInputElement>(null);

  const load = async (query = "", sf = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "5000" });
      if (query) params.set("q", query);
      if (sf !== "all") params.set("status", sf);
      const res  = await fetch(`/api/admin/tradetracker/campaigns?${params}`, { credentials: "include" });
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
      if (data.stats) setStats(data.stats);
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(q, statusFilter); }, [statusFilter]);

  const sync = async () => {
    setSyncing(true); setMessage(null); setError(null);
    try {
      const res  = await fetch("/api/admin/tradetracker/sync-campaigns", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Sync failed."); return; }
      setMessage(`Synced — ${data.upserted ?? 0} upserted, ${data.removed ?? 0} removed`);
      await load(q);
    } catch { setError("Request failed."); }
    finally { setSyncing(false); }
  };

  const addCampaign = async () => {
    if (!addForm.tt_campaign_id.trim() || !addForm.name.trim()) return;
    setAdding(true); setMessage(null); setError(null);
    try {
      const res = await fetch("/api/admin/tradetracker/campaigns", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, commission_percentage: addForm.commission_percentage ? parseFloat(addForm.commission_percentage) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Add failed"); return; }
      setMessage(`"${addForm.name}" added.`);
      setShowAdd(false);
      setAddForm({ tt_campaign_id: "", name: "", locale: "nl_NL", tracking_url: "", commission_percentage: "", currency: "EUR" });
      await load(q);
    } catch { setError("Request failed."); }
    finally { setAdding(false); }
  };

  const commLabel = (c: Campaign) => {
    if (c.commission_percentage != null && c.commission_percentage > 0) {
      const pct = parseFloat(c.commission_percentage.toString());
      return `${+pct.toFixed(2)}%`;
    }
    if (c.commission_fixed_fee != null && c.commission_fixed_fee > 0) {
      const fee = parseFloat(c.commission_fixed_fee.toString());
      const prefix = c.commission_type === "lead" ? "Lead €" : c.commission_type === "click" ? "CPC €" : "€";
      return `${prefix}${+fee.toFixed(2)}`;
    }
    return null;
  };

  const filtered = q
    ? campaigns.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.tt_campaign_id.includes(q))
    : campaigns;

  const kpis = [
    { label: "Total Campaigns", value: stats.total, sub: "across all regions", accent: "#0ea5e9", glow: "rgba(14,165,233,0.15)",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg> },
    { label: "Accepted", value: stats.accepted, sub: `${stats.total ? ((stats.accepted/stats.total)*100).toFixed(1) : 0}% of total`, accent: "#10b981", glow: "rgba(16,185,129,0.15)",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { label: "NL + FR", value: stats.nlFr, sub: "European campaigns", accent: "#f59e0b", glow: "rgba(245,158,11,0.15)",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"/></svg> },
    { label: "UK", value: stats.uk, sub: "British campaigns", accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2.25a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 015.25 21H3m0-18v18m0-18h13.5A2.25 2.25 0 0119 5.25v5.25"/></svg> },
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}>

      {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl p-8"
          style={{ background: "linear-gradient(135deg,#0f172a 0%,#134e4a 50%,#0f172a 100%)", boxShadow: "0 25px 60px -12px rgba(0,0,0,0.35)" }}>
          {/* Grid texture overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* Glow orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#14b8a6,transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#0ea5e9,transparent 70%)" }} />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-300">TradeTracker Network</span>
              </div>
              <h1 className="text-4xl font-black text-white" style={{ letterSpacing: "-0.04em" }}>Campaigns</h1>
              <p className="mt-2 text-sm text-slate-400">
                <span className="font-semibold text-teal-300">{stats.total.toLocaleString()}</span> total ·{" "}
                <span className="font-semibold text-emerald-300">{stats.accepted.toLocaleString()}</span> accepted ·{" "}
                <span className="text-slate-500">{stats.pending.toLocaleString()} pending</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button onClick={() => setShowAdd(true)}
                className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-teal-400/40 hover:bg-white/10">
                <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add manually
              </button>
              <button onClick={sync} disabled={syncing}
                className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-60 hover:scale-[1.02] active:scale-95"
                style={{ background: "linear-gradient(135deg,#14b8a6,#059669)", boxShadow: "0 8px 25px rgba(20,184,166,0.4)" }}>
                <svg className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {syncing ? "Syncing…" : "Sync from TT"}
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, value, sub, accent, glow, icon }) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ boxShadow: `0 4px 20px ${glow}` }}>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: `linear-gradient(135deg,${glow},transparent 60%)` }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900" style={{ letterSpacing: "-0.04em" }}>
                    {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-gray-100" /> : value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-gray-700">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: glow, color: accent }}>
                  {icon}
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: stats.total ? `${Math.min(100, (value / stats.total) * 100)}%` : "0%", background: accent }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Alerts ── */}
        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-emerald-800">{message}</p>
            <button onClick={() => setMessage(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search campaigns, IDs, categories…"
              className="h-11 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            {(["all","accepted","pending","rejected"] as const).map((s) => {
              const active = statusFilter === s;
              const meta: Record<string, { active: string; idle: string }> = {
                all:      { active: "bg-slate-900 text-white shadow-sm",                        idle: "text-gray-500 hover:bg-gray-50 hover:text-gray-800" },
                accepted: { active: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30", idle: "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700" },
                pending:  { active: "bg-amber-400 text-white shadow-sm shadow-amber-400/30",    idle: "text-gray-500 hover:bg-amber-50 hover:text-amber-700" },
                rejected: { active: "bg-red-500 text-white shadow-sm shadow-red-500/30",        idle: "text-gray-500 hover:bg-red-50 hover:text-red-600" },
              };
              const counts: Record<string, number> = { all: stats.total, accepted: stats.accepted, pending: stats.pending, rejected: stats.rejected };
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${active ? meta[s].active : meta[s].idle}`}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                    {(counts[s] ?? 0).toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-sm"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Table header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-800">
              {loading ? "Loading…" : <>{filtered.length.toLocaleString()} <span className="font-normal text-gray-400">campaigns shown</span></>}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Campaign", "Category", "Region", "Commission", "Status", "DeepLink", "Tracking URL", "Synced"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 animate-pulse rounded-lg bg-gray-100" style={{ width: j === 0 ? "140px" : j === 1 ? "100px" : "60px" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center gap-4 py-24">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-700">{q ? `No results for "${q}"` : "No campaigns found"}</p>
                          <p className="mt-1 text-sm text-gray-400">Try adjusting your search or sync from TradeTracker</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((c) => {
                  const locale  = LOCALE_META[c.locale] ?? { label: c.locale, flag: "🌐", bg: "bg-gray-100", text: "text-gray-600", dot: "#9ca3af" };
                  const status  = STATUS_META[c.assignment_status ?? "notAssigned"] ?? STATUS_META.notAssigned;
                  const comm    = commLabel(c);
                  return (
                    <tr key={c.tt_campaign_id} className="group transition-colors hover:bg-teal-50/40">

                      {/* Campaign */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                            {c.logo_url
                              ? <img src={c.logo_url} alt={c.name} className="h-full w-full object-contain p-0.5" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }} />
                              : null}
                            <span className={`${c.logo_url ? "hidden" : "flex"} h-full w-full items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-600 text-xs font-black text-white`} style={{ display: c.logo_url ? "none" : "flex" }}>
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13px] font-semibold text-gray-900 leading-none">{c.name}</p>
                              {c.url && (
                                <a href={c.url} target="_blank" rel="noreferrer" className="opacity-0 transition-opacity group-hover:opacity-100">
                                  <svg className="h-3 w-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                                </a>
                              )}
                            </div>
                            <p className="mt-0.5 font-mono text-[10px] text-gray-400">#{c.tt_campaign_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        {c.category_name
                          ? <span className="inline-block max-w-[160px] truncate rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600" title={c.category_name}>{c.category_name}</span>
                          : <span className="text-[12px] text-gray-300">—</span>
                        }
                      </td>

                      {/* Region */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${locale.bg} ${locale.text}`}>
                          <span>{locale.flag}</span> {locale.label}
                        </span>
                      </td>

                      {/* Commission */}
                      <td className="px-5 py-3.5">
                        {comm
                          ? <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11.25 1.5a.75.75 0 011.5 0V3a.75.75 0 01-1.5 0V1.5zm0 19.5a.75.75 0 011.5 0V22.5a.75.75 0 01-1.5 0V21zm10.5-10.5a.75.75 0 010 1.5H20.25a.75.75 0 010-1.5H21.75zm-19.5 0a.75.75 0 010 1.5H.75a.75.75 0 010-1.5H2.25z"/></svg>
                              {comm}
                            </span>
                          : <span className="text-[12px] text-gray-300">—</span>
                        }
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ring-1 ${status.bg} ${status.text} ${status.ring}`}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
                          {status.label}
                        </span>
                      </td>

                      {/* DeepLink */}
                      <td className="px-5 py-3.5">
                        {c.deeplinking_supported
                          ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                              Yes
                            </span>
                          : <span className="text-[11px] text-gray-300">—</span>
                        }
                      </td>

                      {/* Tracking URL */}
                      <td className="px-5 py-3.5 max-w-[180px]">
                        {c.tracking_url
                          ? <a href={c.tracking_url} target="_blank" rel="noreferrer"
                              className="block truncate text-[11px] font-medium text-teal-500 hover:text-teal-700 hover:underline">
                              {c.tracking_url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 32)}…
                            </a>
                          : <span className="text-[12px] text-gray-300">—</span>
                        }
                      </td>

                      {/* Synced date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] text-gray-400">
                        {c.fetched_at ? new Date(c.fetched_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length.toLocaleString()}</span> of{" "}
                <span className="font-semibold text-gray-600">{stats.total.toLocaleString()}</span> total campaigns
              </p>
              <p className="text-xs text-gray-400">Last synced today</p>
            </div>
          )}
        </div>

      {/* ── Add Campaign Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Add Campaign Manually</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Add a campaign from TradeTracker&apos;s network directly</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                The API only returns campaigns you&apos;ve already applied to. Use this to manually add any campaign from TradeTracker.
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Campaign ID", "tt_campaign_id", "e.g. 39664", "col-span-1"],
                  ["Campaign name", "name", "e.g. Bol.com", "col-span-1"],
                  ["Tracking URL", "tracking_url", "https://tc.tradetracker.net/...", "col-span-2"],
                  ["Commission %", "commission_percentage", "e.g. 5.5", "col-span-1"],
                ] as [string, keyof AddForm, string, string][]).map(([label, field, placeholder, span]) => (
                  <div key={field} className={span}>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                      placeholder={placeholder} value={addForm[field]}
                      onChange={(e) => setAddForm((p) => ({ ...p, [field]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Region</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-teal-400 focus:bg-white"
                    value={addForm.locale} onChange={(e) => setAddForm((p) => ({ ...p, locale: e.target.value }))}>
                    <option value="nl_NL">🇳🇱 Netherlands (NL)</option>
                    <option value="fr_FR">🇫🇷 France (FR)</option>
                    <option value="en_GB">🇬🇧 United Kingdom (UK)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={addCampaign} disabled={adding || !addForm.tt_campaign_id || !addForm.name}
                className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#14b8a6,#059669)" }}>
                {adding ? "Adding…" : "Add Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
