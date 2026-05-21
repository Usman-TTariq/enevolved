"use client";

import { useEffect, useState } from "react";

type App = {
  id: string; publisher_id: string; merchant_id: string; status: string;
  created_at: string; updated_at: string;
  publisher: { username: string; email: string } | null;
  merchant:  { name: string; logo_url: string | null } | null;
};

export default function PORApplicationsContent() {
  const [apps,     setApps]     = useState<App[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting,   setActing]   = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/por/applications?${params}`, { credentials: "include" });
    if (res.ok) setApps((await res.json()).applications ?? []);
    setLoading(false);
    setSelected(new Set());
  };

  useEffect(() => { void load(); }, [status]);

  const updateOne = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/por/applications/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await load();
  };

  const bulkUpdate = async (newStatus: string) => {
    if (!selected.size) return;
    setActing(true);
    await Promise.all([...selected].map((id) =>
      fetch(`/api/admin/por/applications/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    ));
    setActing(false);
    await load();
  };

  const toggleAll = () => {
    if (selected.size === apps.length) setSelected(new Set());
    else setSelected(new Set(apps.map((a) => a.id)));
  };

  const statusBadge = (s: string) => {
    const cls = s === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : s === "rejected" ? "bg-red-50 text-red-600 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200";
    return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}>{s}</span>;
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin · PaidOnResults</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">Applications</h1>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", ""].map((s) => (
            <button key={s || "all"} onClick={() => setStatus(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${status === s ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5">
          <span className="text-sm font-medium text-orange-800">{selected.size} selected</span>
          <button onClick={() => void bulkUpdate("approved")} disabled={acting}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            Approve all
          </button>
          <button onClick={() => void bulkUpdate("rejected")} disabled={acting}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60">
            Reject all
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selected.size === apps.length && apps.length > 0}
                  onChange={toggleAll} className="rounded" />
              </th>
              <th className="px-4 py-3">Publisher</th>
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>}
            {!loading && apps.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No applications found.</td></tr>}
            {!loading && apps.map((a) => (
              <tr key={a.id} className="hover:bg-orange-50/20">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(a.id)}
                    onChange={(e) => {
                      const s = new Set(selected);
                      e.target.checked ? s.add(a.id) : s.delete(a.id);
                      setSelected(s);
                    }} className="rounded" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{a.publisher?.username ?? a.publisher_id.slice(0, 8)}</p>
                  <p className="text-[11px] text-gray-400">{a.publisher?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{a.merchant?.name ?? a.merchant_id}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">{statusBadge(a.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {a.status !== "approved" && (
                      <button onClick={() => void updateOne(a.id, "approved")}
                        className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100">
                        Approve
                      </button>
                    )}
                    {a.status !== "rejected" && (
                      <button onClick={() => void updateOne(a.id, "rejected")}
                        className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100">
                        Reject
                      </button>
                    )}
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
