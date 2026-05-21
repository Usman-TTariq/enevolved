"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string; publisher_id: string; campaign_id: string;
  status: string; created_at: string;
  profiles: { username: string; email: string } | null;
  impact_campaigns: { name: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending:  "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-600",
};
const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500", approved: "bg-emerald-500", rejected: "bg-red-500",
};

export default function ImpactApplicationsContent() {
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  const load = async (sf = statusFilter) => {
    setLoading(true);
    try {
      const qs = sf ? `&status=${sf}` : "";
      const res = await fetch(`/api/admin/impact/applications?limit=100${qs}`, { credentials: "include" });
      const data = await res.json();
      setApps(data.applications ?? []); setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id); setMessage(null); setError(null);
    try {
      const res = await fetch(`/api/admin/impact/applications/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Update failed."); return; }
      setMessage(`Application ${id.slice(0, 8)} set to ${status}.`);
      await load(statusFilter);
    } catch { setError("Request failed."); }
    finally { setUpdating(null); }
  };

  const filters = [
    { val: "pending", label: "Pending", color: "amber" },
    { val: "approved", label: "Approved", color: "emerald" },
    { val: "rejected", label: "Rejected", color: "red" },
    { val: "", label: "All", color: "gray" },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">Impact</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Applications</h1>
          <p className="mt-1 text-sm text-gray-400">Publisher applications to Impact campaigns. Approve or reject them here.</p>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm shrink-0">
          {total} application{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(({ val, label }) => (
          <button key={val || "all"} type="button"
            onClick={() => { setStatusFilter(val); void load(val); }}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              statusFilter === val
                ? "text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            }`}
            style={statusFilter === val ? { background: "linear-gradient(135deg,#0d9488,#059669)" } : {}}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>{error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>{message}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100" style={{ background: "linear-gradient(90deg,#f0fdf9,#f5f9ff)" }}>
              {["Publisher", "Campaign", "Status", "Applied", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                  <span className="text-sm text-gray-400">Loading…</span>
                </div>
              </td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-gray-400">No applications found.</td></tr>
            ) : apps.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 transition-colors hover:bg-teal-50/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{a.profiles?.username ?? "—"}</p>
                  <p className="text-xs text-gray-400">{a.profiles?.email ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{a.impact_campaigns?.name ?? "—"}</p>
                  <code className="text-[10px] text-gray-400">{a.campaign_id}</code>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[a.status] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[a.status] ?? "bg-gray-400"}`} />
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => void updateStatus(a.id, "approved")}
                      disabled={a.status === "approved" || updating === a.id}
                      className="rounded-lg px-3 py-1 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                      Approve
                    </button>
                    <button type="button" onClick={() => void updateStatus(a.id, "rejected")}
                      disabled={a.status === "rejected" || updating === a.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-40">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
