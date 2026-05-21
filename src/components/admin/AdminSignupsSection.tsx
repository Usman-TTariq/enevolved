"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { formatCurrencyTotals } from "@/lib/admin/format-currency-totals";

type SignupRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  company_name: string | null;
  website: string | null;
  payment_email: string | null;
  city: string | null;
  country: string | null;
  approval_status: string;
  created_at: string;
  payout_totals?: Record<string, number>;
  sale_totals?: Record<string, number>;
};

type PublisherLinkRow = {
  id: string;
  slug: string;
  shortUrl: string;
  brandName: string | null;
  clicks: number;
  stats: {
    txnCount: number;
    saleByCurrency: Record<string, number>;
    commissionByCurrency: Record<string, number>;
    unlinkedTxnCount?: number;
    unlinkedSaleByCurrency?: Record<string, number>;
    unlinkedCommissionByCurrency?: Record<string, number>;
    otherPublisherTxnCount?: number;
    otherPublisherSaleByCurrency?: Record<string, number>;
    otherPublisherCommissionByCurrency?: Record<string, number>;
  };
};

function anyAwinTxnCount(s: PublisherLinkRow["stats"]): number {
  return (
    (s.txnCount ?? 0) +
    (s.unlinkedTxnCount ?? 0) +
    (s.otherPublisherTxnCount ?? 0)
  );
}

export default function AdminSignupsSection() {
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [expandedPublisherId, setExpandedPublisherId] = useState<string | null>(null);
  const [linkBreakdownByPublisher, setLinkBreakdownByPublisher] = useState<Record<string, PublisherLinkRow[]>>({});
  const [linkBreakdownLoading, setLinkBreakdownLoading] = useState<string | null>(null);
  const [linkBreakdownError, setLinkBreakdownError] = useState<string | null>(null);
  const linkBreakdownFetched = useRef<Set<string>>(new Set());

  const loadLinkBreakdown = useCallback(async (publisherId: string, opts?: { force?: boolean }) => {
    if (!opts?.force && linkBreakdownFetched.current.has(publisherId)) return;
    setLinkBreakdownLoading(publisherId);
    setLinkBreakdownError(null);
    try {
      const res = await fetch(`/api/admin/publisher-tracking-links?publisherId=${encodeURIComponent(publisherId)}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLinkBreakdownError(typeof data.error === "string" ? data.error : "Could not load link stats");
        return;
      }
      const links = Array.isArray(data.links) ? (data.links as PublisherLinkRow[]) : [];
      linkBreakdownFetched.current.add(publisherId);
      setLinkBreakdownByPublisher((prev) => ({ ...prev, [publisherId]: links }));
    } catch {
      setLinkBreakdownError("Request failed");
    } finally {
      setLinkBreakdownLoading(null);
    }
  }, []);

  const toggleLinkBreakdown = async (publisherId: string) => {
    if (expandedPublisherId === publisherId) {
      setExpandedPublisherId(null);
      return;
    }
    setExpandedPublisherId(publisherId);
    await loadLinkBreakdown(publisherId);
  };

  useEffect(() => {
    const load = async () => {
      const offset = (page - 1) * pageSize;
      const res = await fetch(`/api/admin/signups?limit=${pageSize}&offset=${offset}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSignups(data.signups ?? []);
        setTotal(Number(data.total ?? 0));
      }
    };
    load();
  }, [page, pageSize]);

  useEffect(() => {
    setExpandedPublisherId(null);
    setLinkBreakdownError(null);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateApproval = async (id: string, approval_status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approval_status }),
      });
      if (res.ok) {
        setSignups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, approval_status } : s))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const loginAsPublisher = async (publisherId: string) => {
    setImpersonatingId(publisherId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publisherId }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } finally {
      setImpersonatingId(null);
    }
  };

  const pending = signups.filter((s) => s.approval_status === "pending");
  const approved = signups.filter((s) => s.approval_status === "approved");
  const rejected = signups.filter((s) => s.approval_status === "rejected");

  return (
    <>
      <section id="admin-all-signups">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full" style={{ background: "linear-gradient(180deg,#0d9488,#059669)" }} />
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
            All signups
          </h2>
        </div>
        <p className="mt-1 pl-4 text-sm text-gray-400">Approve or reject accounts so publishers can use the dashboard.</p>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="text-base font-bold text-gray-900">Directory</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
              {pending.length} pending
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
              {approved.length} approved
            </span>
            <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-500">
              {rejected.length} rejected
            </span>
          </div>
        </div>
        <p className="mb-4 max-w-3xl rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-xs leading-relaxed text-gray-400">
          Sales and payout only count <span className="font-medium text-gray-600">Impact orders linked to this account</span> (the
          transaction&apos;s click reference must match one of this publisher&apos;s go-link slugs). A dash in Company means no company name was provided at signup.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          {signups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400">No signups yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ background: "linear-gradient(90deg,#f0fdf9,#f5f9ff)" }}>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Username</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Company</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Sales</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Payout</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Per-link</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((row) => (
                  <Fragment key={row.id}>
                    <tr className={`border-b border-gray-50 transition-colors hover:bg-teal-50/40 ${
                      row.approval_status === "pending" ? "bg-amber-50/30" : ""
                    }`}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{row.username}</td>
                      <td className="px-4 py-3 text-gray-500">{row.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-500">{row.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.company_name || "—"}</td>
                      <td className="px-4 py-3 font-medium text-teal-600">
                        {row.role === "publisher" ? formatCurrencyTotals(row.sale_totals) : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {row.role === "publisher" ? formatCurrencyTotals(row.payout_totals) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.role === "publisher" ? (
                          <button
                            type="button"
                            onClick={() => void toggleLinkBreakdown(row.id)}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-800 hover:underline"
                          >
                            {expandedPublisherId === row.id ? "Hide" : "Show"} breakdown
                          </button>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          row.approval_status === "approved"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : row.approval_status === "rejected"
                              ? "border border-red-200 bg-red-50 text-red-600"
                              : "border border-amber-200 bg-amber-50 text-amber-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            row.approval_status === "approved" ? "bg-emerald-500"
                              : row.approval_status === "rejected" ? "bg-red-500" : "bg-amber-500"
                          }`} />
                          {row.approval_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.approval_status === "pending" && (
                          <span className="flex justify-end gap-1.5">
                            <button type="button" onClick={() => updateApproval(row.id, "approved")}
                              disabled={updatingId === row.id}
                              className="rounded-lg px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                              style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                              Approve
                            </button>
                            <button type="button" onClick={() => updateApproval(row.id, "rejected")}
                              disabled={updatingId === row.id}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50">
                              Reject
                            </button>
                          </span>
                        )}
                        {row.approval_status === "approved" && row.role === "publisher" && (
                          <button type="button" onClick={() => loginAsPublisher(row.id)}
                            disabled={impersonatingId === row.id}
                            className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 transition hover:bg-teal-100 disabled:opacity-50">
                            {impersonatingId === row.id ? "Loading…" : "Login as publisher"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {row.role === "publisher" && expandedPublisherId === row.id && (
                      <tr key={`${row.id}-breakdown`} className="border-b border-gray-100">
                        <td colSpan={10} className="p-5" style={{ background: "linear-gradient(90deg,#f0fdf9,#f8fffe)" }}>
                          {linkBreakdownLoading === row.id && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                              Loading go-links…
                            </div>
                          )}
                          {linkBreakdownError && expandedPublisherId === row.id && (
                            <p className="text-sm text-red-500">{linkBreakdownError}</p>
                          )}
                          {!linkBreakdownLoading && expandedPublisherId === row.id &&
                            (linkBreakdownByPublisher[row.id] ?? []).length === 0 && (
                              <p className="text-sm text-gray-400">No short links created yet for this publisher.</p>
                            )}
                          {(linkBreakdownByPublisher[row.id] ?? []).length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Per go-link breakdown</p>
                                <button type="button"
                                  onClick={() => { linkBreakdownFetched.current.delete(row.id); void loadLinkBreakdown(row.id, { force: true }); }}
                                  disabled={linkBreakdownLoading === row.id}
                                  className="text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50">
                                  Refresh
                                </button>
                              </div>
                              <p className="rounded-xl border border-teal-100 bg-white px-3 py-2 text-xs leading-relaxed text-gray-400">
                                <strong className="text-gray-600">Clicks</strong> = visits to your short URL on Earnytics.{" "}
                                <strong className="text-gray-600">Linked</strong> = Awin transactions matching this slug.
                                Another user&apos;s <code className="rounded bg-gray-100 px-1">publisher_id</code> on the same slug is excluded.
                              </p>
                              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-gray-100 bg-teal-50/60">
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Slug</th>
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Short URL</th>
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Brand</th>
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Clicks</th>
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Linked txns</th>
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Linked sales</th>
                                      <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Linked comm.</th>
                                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Open</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(linkBreakdownByPublisher[row.id] ?? []).map((L) => (
                                      <tr key={L.id} className="border-b border-gray-50 hover:bg-teal-50/30">
                                        <td className="px-3 py-2 font-mono font-bold text-teal-600">{L.slug}</td>
                                        <td className="max-w-[180px] truncate px-3 py-2 text-gray-400" title={L.shortUrl}>{L.shortUrl}</td>
                                        <td className="px-3 py-2 text-gray-600">{L.brandName ?? "—"}</td>
                                        <td className="px-3 py-2 font-bold tabular-nums text-teal-700">{L.clicks}</td>
                                        <td className="px-3 py-2 tabular-nums text-gray-600">{L.stats.txnCount}</td>
                                        <td className="px-3 py-2 text-gray-600">{formatCurrencyTotals(L.stats.saleByCurrency)}</td>
                                        <td className="px-3 py-2 font-medium text-gray-700">{formatCurrencyTotals(L.stats.commissionByCurrency)}</td>
                                        <td className="px-3 py-2 text-right">
                                          <span className="flex flex-col items-end gap-0.5 sm:flex-row sm:justify-end sm:gap-2">
                                            <Link href={`/admin/awin/transactions?goLinkSlug=${encodeURIComponent(L.slug)}&attributedOnly=1`} className="font-semibold text-teal-600 hover:underline">Linked</Link>
                                            <Link href={`/admin/awin/transactions?goLinkSlug=${encodeURIComponent(L.slug)}`} className="text-gray-400 hover:underline">All</Link>
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t border-gray-100 bg-teal-50/40">
                                      <td colSpan={4} className="px-3 py-2 text-xs font-bold text-gray-500">Total (this publisher)</td>
                                      <td className="px-3 py-2 font-bold tabular-nums text-gray-800">
                                        {(linkBreakdownByPublisher[row.id] ?? []).reduce((a, L) => a + L.stats.txnCount, 0)}
                                      </td>
                                      <td className="px-3 py-2 font-bold text-gray-800">
                                        {formatCurrencyTotals((linkBreakdownByPublisher[row.id] ?? []).reduce((acc, L) => {
                                          for (const [c, v] of Object.entries(L.stats.saleByCurrency)) acc[c] = (acc[c] ?? 0) + v;
                                          return acc;
                                        }, {} as Record<string, number>))}
                                      </td>
                                      <td className="px-3 py-2 font-bold text-gray-800">
                                        {formatCurrencyTotals((linkBreakdownByPublisher[row.id] ?? []).reduce((acc, L) => {
                                          for (const [c, v] of Object.entries(L.stats.commissionByCurrency)) acc[c] = (acc[c] ?? 0) + v;
                                          return acc;
                                        }, {} as Record<string, number>))}
                                      </td>
                                      <td className="px-3 py-2" />
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              {(linkBreakdownByPublisher[row.id] ?? []).some((L) => L.clicks > 0) &&
                                (linkBreakdownByPublisher[row.id] ?? []).every((L) => anyAwinTxnCount(L.stats) === 0) && (
                                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    Clicks recorded on Earnytics, but no <code className="rounded bg-amber-100 px-1">impact_actions</code> rows found.
                                    Run <Link href="/admin/awin/actions" className="font-semibold text-teal-600 hover:underline">Sync transactions</Link> and confirm Awin sends the go-link slug as the click reference.
                                  </p>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm">
            Page {page} of {totalPages} &nbsp;·&nbsp; Total {total}
          </span>
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Prev
            </button>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40">
              Next
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </span>
        </div>
      </section>
    </>
  );
}
