"use client";
import { useEffect, useState } from "react";

type Txn = {
  id: number;
  network_order_id: string;
  merchant_id: string | null;
  merchant_name: string | null;
  order_date: string | null;
  order_value: number | null;
  affiliate_commission: number | null;
  currency: string | null;
  transaction_status: string;
  paid_to_affiliate: boolean | null;
  custom_tracking_id: string | null;
  go_link_slug: string | null;
  publisher_id: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  validated: "bg-emerald-50 text-emerald-700",
  pending:   "bg-amber-50 text-amber-700",
  void:      "bg-red-50 text-red-600",
};

export default function PORTransactionsContent() {
  const [txns,    setTxns]    = useState<Txn[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [offset,  setOffset]  = useState(0);
  const LIMIT = 50;

  const load = async (s: string, q: string, off: number) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: String(LIMIT), offset: String(off) });
      if (s !== "all") p.set("status", s);
      if (q) p.set("q", q);
      const res  = await fetch(`/api/admin/por/transactions?${p}`, { credentials: "include" });
      const data = await res.json();
      setTxns(data.transactions ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(status, search, offset); }, [status, search, offset]);

  const fmt = (n: number | null, currency: string | null) =>
    n != null ? `${currency ?? "GBP"} ${n.toFixed(2)}` : "—";

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-500">PaidOnResults</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Transactions</h1>
        <p className="mt-0.5 text-sm text-gray-500">{total.toLocaleString()} total</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "validated", "void"].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setOffset(0); }}
            className={`rounded-xl px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition-all ${
              status === s
                ? "text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-600"
            }`}
            style={status === s ? { background: "linear-gradient(135deg,#f97316,#ef4444)" } : {}}>
            {s}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search merchant / order ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="ml-auto rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                {["Order ID", "Merchant", "Tracking / Slug", "Status", "Commission", "Order Value", "Date"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading…</td></tr>
              ) : txns.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No transactions found</td></tr>
              ) : txns.map((t) => (
                <tr key={t.id} className="border-t border-gray-50 hover:bg-orange-50/30">
                  <td className="px-3 py-2.5"><code className="text-[10px] text-orange-600">{t.network_order_id}</code></td>
                  <td className="px-3 py-2.5">
                    <p className="text-[12px] font-medium text-gray-800">{t.merchant_name ?? t.merchant_id ?? "—"}</p>
                    {t.merchant_id && <code className="text-[10px] text-gray-400">{t.merchant_id}</code>}
                  </td>
                  <td className="px-3 py-2.5">
                    {t.custom_tracking_id && <code className="text-[10px] text-orange-500">{t.custom_tracking_id}</code>}
                    {t.go_link_slug && <code className="mt-0.5 block text-[10px] text-teal-600">{t.go_link_slug}</code>}
                    {!t.publisher_id && <span className="mt-0.5 block text-[10px] text-amber-500">unattributed</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[t.transaction_status] ?? "bg-gray-50 text-gray-500"}`}>
                      {t.transaction_status}
                    </span>
                    {t.paid_to_affiliate && (
                      <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">paid</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-gray-800">{fmt(t.affiliate_commission, t.currency)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{fmt(t.order_value, t.currency)}</td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-400">
                    {t.order_date ? new Date(t.order_date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {offset + 1}–{Math.min(offset + LIMIT, total)} of {total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-orange-300 disabled:opacity-40">← Prev</button>
            <button onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-orange-300 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
