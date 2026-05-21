"use client";
import { useEffect, useState } from "react";

type Txn = {
  tt_transaction_id: string; tt_campaign_id: string | null; locale: string | null;
  reference: string | null; transaction_type: string | null; transaction_status: string;
  commission: number | null; order_amount: number | null; currency: string | null;
  registration_date: string | null; go_link_slug: string | null; publisher_id: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  accepted: "bg-emerald-50 text-emerald-700",
  pending:  "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
};

const LOCALE_LABEL: Record<string, string> = { nl_NL: "NL", fr_FR: "FR", en_GB: "UK" };

export default function TradeTrackerTransactionsContent() {
  const [txns, setTxns]       = useState<Txn[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState<string>("all");
  const [offset, setOffset]   = useState(0);
  const LIMIT = 50;

  const load = async (s: string, off: number) => {
    setLoading(true);
    try {
      const sq  = s !== "all" ? `&status=${s}` : "";
      const res = await fetch(`/api/admin/tradetracker/transactions?limit=${LIMIT}&offset=${off}${sq}`, { credentials: "include" });
      const data = await res.json();
      setTxns(data.transactions ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(status, offset); }, [status, offset]);

  const fmt = (n: number | null, currency: string | null) =>
    n != null ? `${currency ?? "EUR"} ${n.toFixed(2)}` : "—";

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">TradeTracker</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Transactions</h1>
        <p className="mt-0.5 text-sm text-gray-500">{total} total</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "accepted", "rejected"].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setOffset(0); }}
            className={`rounded-xl px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition-all ${
              status === s
                ? "text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-500 hover:border-teal-300 hover:text-teal-600"
            }`}
            style={status === s ? { background: "linear-gradient(135deg,#0d9488,#059669)" } : {}}>
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
              {["ID", "Campaign", "Locale", "Reference / Slug", "Status", "Commission", "Order", "Date"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading…</td></tr>
            ) : txns.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No transactions found</td></tr>
            ) : txns.map((t) => (
              <tr key={t.tt_transaction_id} className="border-t border-gray-50 hover:bg-teal-50/30">
                <td className="px-3 py-2.5"><code className="text-[10px] text-teal-700">{t.tt_transaction_id}</code></td>
                <td className="px-3 py-2.5 text-[12px] text-gray-700">{t.tt_campaign_id ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                    {LOCALE_LABEL[t.locale ?? ""] ?? (t.locale ?? "—")}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-[11px] text-gray-500">{t.reference ?? "—"}</p>
                  {t.go_link_slug && <code className="mt-0.5 block text-[10px] text-teal-600">{t.go_link_slug}</code>}
                  {!t.publisher_id && <span className="mt-0.5 block text-[10px] text-amber-500">unattributed</span>}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[t.transaction_status] ?? "bg-gray-50 text-gray-500"}`}>
                    {t.transaction_status}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-semibold text-gray-800">{fmt(t.commission, t.currency)}</td>
                <td className="px-3 py-2.5 text-gray-600">{fmt(t.order_amount, t.currency)}</td>
                <td className="px-3 py-2.5 text-[11px] text-gray-400">{t.registration_date ? new Date(t.registration_date).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-teal-300 disabled:opacity-40">← Prev</button>
            <button onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-teal-300 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
