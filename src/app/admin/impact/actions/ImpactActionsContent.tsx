"use client";

import { useEffect, useState } from "react";

type ActionRow = {
  action_id: string;
  campaign_id: string | null;
  campaign_name: string | null;
  action_status: string | null;
  payout: number;
  payout_currency: string;
  sale_amount: number;
  sale_currency: string;
  action_date: string;
  sub_id3: string | null;
  publisher_id: string | null;
  go_link_slug: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-teal-500/15 text-teal-600",
  PENDING: "bg-amber-50 text-amber-700",
  REVERSED: "bg-red-500/15 text-red-300",
  PENDING_REVIEW: "bg-blue-500/15 text-blue-300",
};

export default function ImpactActionsContent() {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attributedOnly, setAttributedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = async (off = 0, attrOnly = attributedOnly) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        limit: String(limit),
        offset: String(off),
        ...(attrOnly ? { attributedOnly: "1" } : {}),
      });
      const res = await fetch(`/api/admin/impact/actions?${qs}`, { credentials: "include" });
      const data = await res.json();
      setRows(data.rows ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0, false);
  }, []);

  const toggleAttributed = () => {
    const next = !attributedOnly;
    setAttributedOnly(next);
    setOffset(0);
    void load(0, next);
  };

  const formatMoney = (amount: number, currency: string) =>
    `${currency} ${amount.toFixed(2)}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <h1
        className="text-2xl font-extrabold tracking-tight text-gray-900"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Impact — Sales / Actions
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-400">
        Synced actions from Impact API. Attributed rows have a matching publisher via{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-gray-800">SubId3</code> → go-link slug
        matching.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={toggleAttributed}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            attributedOnly
              ? "bg-teal-600 text-white"
              : "border border-gray-100 bg-white/5 text-gray-700 hover:bg-white/10"
          }`}
        >
          {attributedOnly ? "Showing attributed only" : "Show attributed only"}
        </button>
        <span className="text-sm text-gray-400">{total} action(s) total</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Sale</th>
              <th className="px-4 py-3">SubId3 / Slug</th>
              <th className="px-4 py-3">Publisher</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No actions found. Run a sync from the Actions page first.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.action_id} className="border-b border-gray-50 hover:bg-teal-50/30">
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.action_date)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{r.campaign_name ?? r.campaign_id ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[r.action_status ?? ""] ?? "bg-zinc-700/50 text-gray-400"
                      }`}
                    >
                      {r.action_status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {formatMoney(r.payout, r.payout_currency)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {formatMoney(r.sale_amount, r.sale_currency)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {r.go_link_slug ?? r.sub_id3 ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.publisher_id ? (
                      <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-xs text-teal-600">
                        attributed
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              const prev = Math.max(0, offset - limit);
              setOffset(prev);
              void load(prev);
            }}
            disabled={offset === 0 || loading}
            className="rounded-lg border border-gray-100 bg-white/5 px-4 py-2 text-sm text-gray-700 disabled:opacity-40 hover:bg-white/10"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = offset + limit;
              setOffset(next);
              void load(next);
            }}
            disabled={offset + limit >= total || loading}
            className="rounded-lg border border-gray-100 bg-white/5 px-4 py-2 text-sm text-gray-700 disabled:opacity-40 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
