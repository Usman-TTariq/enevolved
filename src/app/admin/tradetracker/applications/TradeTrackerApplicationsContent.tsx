"use client";
import { useEffect, useState } from "react";

type App = {
  id: string; publisher_id: string; campaign_id: string; status: string;
  created_at: string; username: string | null; email: string | null; campaign_name: string | null;
};

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
type Filter = (typeof STATUS_FILTERS)[number];

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function TradeTrackerApplicationsContent() {
  const [apps, setApps]             = useState<App[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>("pending");
  const [updating, setUpdating]     = useState<string | null>(null);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg]       = useState<string | null>(null);

  const load = async (f: Filter) => {
    setLoading(true);
    setSelected(new Set());
    setBulkMsg(null);
    try {
      const qs  = f !== "all" ? `&status=${f}` : "";
      const res = await fetch(`/api/admin/tradetracker/applications?limit=200${qs}`, { credentials: "include" });
      const data = await res.json();
      setApps(data.applications ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(filter); }, [filter]);

  const update = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/tradetracker/applications/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load(filter);
    } finally { setUpdating(null); }
  };

  const bulkUpdate = async (status: "approved" | "rejected") => {
    if (selected.size === 0) return;
    setBulkLoading(true); setBulkMsg(null);
    let done = 0; let failed = 0;
    await Promise.all([...selected].map(async (id) => {
      try {
        const res = await fetch(`/api/admin/tradetracker/applications/${id}`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) done++; else failed++;
      } catch { failed++; }
    }));
    setBulkMsg(`${done} ${status}${done !== 1 ? "" : ""}${failed > 0 ? `, ${failed} failed` : ""}`);
    setBulkLoading(false);
    await load(filter);
  };

  const toggleAll = () => {
    const actionable = apps.filter((a) => a.status === "pending");
    if (selected.size === actionable.length && actionable.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(actionable.map((a) => a.id)));
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const pendingApps = apps.filter((a) => a.status === "pending");
  const allPendingSelected = pendingApps.length > 0 && selected.size === pendingApps.length;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">TradeTracker</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Applications</h1>
        <p className="mt-0.5 text-sm text-gray-500">{total} applications</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition-all ${
              filter === f
                ? "text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-500 hover:border-teal-300 hover:text-teal-600"
            }`}
            style={filter === f ? { background: "linear-gradient(135deg,#0d9488,#059669)" } : {}}>
            {f}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {pendingApps.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-teal-800">
            <input type="checkbox" checked={allPendingSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500" />
            {selected.size > 0 ? `${selected.size} selected` : `Select all pending (${pendingApps.length})`}
          </label>
          {selected.size > 0 && (
            <>
              <button type="button" onClick={() => setSelected(new Set())}
                className="text-xs text-teal-500 hover:text-teal-700">Clear</button>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={() => void bulkUpdate("approved")} disabled={bulkLoading}
                  className="rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                  {bulkLoading ? "Processing…" : `Approve ${selected.size}`}
                </button>
                <button type="button" onClick={() => void bulkUpdate("rejected")} disabled={bulkLoading}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60">
                  {bulkLoading ? "…" : `Reject ${selected.size}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bulk result message */}
      {bulkMsg && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          ✓ {bulkMsg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/90 w-8">
                {pendingApps.length > 0 && (
                  <input type="checkbox" checked={allPendingSelected} onChange={toggleAll}
                    className="h-4 w-4 rounded border-white/40 bg-white/20 text-teal-600" />
                )}
              </th>
              {["Publisher", "Campaign", "Status", "Applied", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading…</td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No {filter} applications</td></tr>
            ) : apps.map((a) => {
              const isPending = a.status === "pending";
              const isSelected = selected.has(a.id);
              return (
                <tr key={a.id} className={`border-t border-gray-50 transition-colors ${isSelected ? "bg-teal-50/60" : "hover:bg-teal-50/30"}`}>
                  <td className="px-4 py-3">
                    {isPending && (
                      <input type="checkbox" checked={isSelected} onChange={() => toggle(a.id)}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{a.username ?? "—"}</p>
                    <p className="text-[11px] text-gray-400">{a.email ?? a.publisher_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{a.campaign_name ?? "—"}</p>
                    <code className="mt-0.5 text-[10px] text-gray-400">{a.campaign_id}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[a.status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {a.status !== "approved" && (
                        <button onClick={() => void update(a.id, "approved")} disabled={updating === a.id || bulkLoading}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                          {updating === a.id ? "…" : "Approve"}
                        </button>
                      )}
                      {a.status !== "rejected" && (
                        <button onClick={() => void update(a.id, "rejected")} disabled={updating === a.id || bulkLoading}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                          {updating === a.id ? "…" : "Reject"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
