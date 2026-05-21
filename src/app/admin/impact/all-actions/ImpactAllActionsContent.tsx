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

export default function ImpactAllActionsContent() {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignPublisherId, setAssignPublisherId] = useState("");
  const [assignSlug, setAssignSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lostOnly, setLostOnly] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = async (off = 0, lost = lostOnly) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        limit: String(limit),
        offset: String(off),
        ...(lost ? { lostOnly: "1" } : {}),
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
    void load(0, true);
  }, []);

  const assign = async (actionId: string) => {
    if (!assignPublisherId.trim()) {
      setError("Enter a Publisher ID first.");
      return;
    }
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/impact/assign-action", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionId,
          publisherId: assignPublisherId.trim(),
          goLinkSlug: assignSlug.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Assignment failed.");
        return;
      }
      setMessage(`Action ${actionId} assigned to publisher ${assignPublisherId.trim()}.`);
      setAssigning(null);
      await load(offset, lostOnly);
    } catch {
      setError("Assignment request failed.");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <h1
        className="text-2xl font-extrabold tracking-tight text-gray-900"
        style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
      >
        Impact — All Actions (assign)
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-400">
        Manually attribute unmatched Impact actions to publishers. Enter the publisher UUID and optionally the
        go-link slug. The rollup is rebuilt after each assignment.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            const next = !lostOnly;
            setLostOnly(next);
            setOffset(0);
            void load(0, next);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            lostOnly
              ? "bg-amber-700 text-white"
              : "border border-gray-100 bg-white/5 text-gray-700 hover:bg-white/10"
          }`}
        >
          {lostOnly ? "Showing unattributed only" : "Show all"}
        </button>
        <span className="text-sm text-gray-400">{total} row(s)</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            Publisher UUID
          </label>
          <input
            type="text"
            value={assignPublisherId}
            onChange={(e) => setAssignPublisherId(e.target.value)}
            placeholder="uuid-…"
            className="mt-1 w-80 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            Go-link slug (optional)
          </label>
          <input
            type="text"
            value={assignSlug}
            onChange={(e) => setAssignSlug(e.target.value)}
            placeholder="abc123"
            className="mt-1 w-40 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          {message}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">SubId3</th>
              <th className="px-4 py-3">Publisher</th>
              <th className="px-4 py-3">Assign</th>
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
                  No actions.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.action_id} className="border-b border-gray-50 hover:bg-teal-50/30">
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.action_date)}</td>
                  <td className="px-4 py-3 text-white">{r.campaign_name ?? r.campaign_id ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.action_status ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.payout_currency} {r.payout.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.sub_id3 ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.publisher_id ? (
                      <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-xs text-teal-600">
                        {r.publisher_id.slice(0, 8)}…
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void assign(r.action_id)}
                      disabled={!assignPublisherId.trim()}
                      className="rounded bg-amber-700 px-2 py-1 text-xs font-semibold text-gray-900 hover:bg-amber-600 disabled:opacity-40"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
