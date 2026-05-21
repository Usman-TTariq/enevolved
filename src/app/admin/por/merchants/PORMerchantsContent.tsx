"use client";

import { useEffect, useState } from "react";

type Merchant = {
  merchant_id: string; name: string; url: string | null; logo_url: string | null;
  category: string | null; commission_rate: string | null; average_commission: string | null;
  deep_links: boolean; merchant_status: string; affiliate_status: string | null;
  cookie_length: number | null; conversion_ratio: string | null; fetched_at: string | null;
};

export default function PORMerchantsContent() {
  const [merchants, setMerchants]   = useState<Merchant[]>([]);
  const [total,     setTotal]       = useState(0);
  const [stats,     setStats]       = useState({ totalMerchants: 0, joinedMerchants: 0, totalTransactions: 0 });
  const [loading,   setLoading]     = useState(true);
  const [search,    setSearch]      = useState("");
  const [status,    setStatus]      = useState("");
  const [page,      setPage]        = useState(1);
  const limit = 50;

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String((page - 1) * limit) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/por/merchants?${params}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setMerchants(data.merchants ?? []);
      setTotal(data.total ?? 0);
      if (data.stats) setStats(data.stats);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [page, search, status]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const statusBadge = (s: string | null) => {
    if (!s) return null;
    const upper = s.toUpperCase();
    const cls = upper.startsWith("JOINED") ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : upper === "PENDING"         ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-gray-50 text-gray-600 border-gray-200";
    return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}>{s}</span>;
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin · PaidOnResults</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">Merchants</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 shadow-sm text-center">
            <p className="text-xl font-bold text-gray-900">{stats.totalMerchants}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 shadow-sm text-center">
            <p className="text-xl font-bold text-emerald-600">{stats.joinedMerchants}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Joined</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search merchants…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none">
          <option value="">All statuses</option>
          <option value="JOINED">Joined</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Deep links</th>
              <th className="px-4 py-3">Cookie</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && merchants.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No merchants found. Sync merchants first.</td></tr>
            )}
            {!loading && merchants.map((m) => (
              <tr key={m.merchant_id} className="hover:bg-orange-50/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {m.logo_url ? (
                      <img src={m.logo_url} alt={m.name} className="h-7 w-7 rounded-lg border border-gray-100 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black text-white"
                        style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 max-w-[200px]">{m.name}</p>
                      <p className="text-[10px] text-gray-400">ID: {m.merchant_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{m.category ?? "—"}</td>
                <td className="px-4 py-3 text-xs font-semibold text-emerald-700">{m.commission_rate ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {m.deep_links
                    ? <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">Yes</span>
                    : <span className="text-gray-400">No</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{m.cookie_length ? `${m.cookie_length}d` : "—"}</td>
                <td className="px-4 py-3">{statusBadge(m.affiliate_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{total} merchants</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">← Prev</button>
            <span className="rounded-lg border border-gray-200 bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">{page}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
