"use client";

import { useEffect, useState } from "react";

type LinkRow = {
  id: string; slug: string; publisher_id: string;
  impact_campaign_id: string | null; target_url: string;
  click_count: number; created_at: string;
  profiles: { username: string; email: string } | null;
};

export default function ImpactTrackingLinksContent() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/impact/tracking-links?limit=100", { credentials: "include" });
        const data = await res.json();
        setLinks(data.links ?? []); setTotal(data.total ?? 0);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">Impact</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Tracking links</h1>
          <p className="mt-1 text-sm text-gray-400">
            Impact go-links created by publishers. The slug is passed as{" "}
            <code className="rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-teal-700">SubId3</code>{" "}
            in the redirect URL for attribution.
          </p>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 shrink-0">
          {total} link{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100" style={{ background: "linear-gradient(90deg,#f0fdf9,#f5f9ff)" }}>
              {["Slug", "Publisher", "Campaign ID", "Clicks", "Created"].map((h) => (
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
            ) : links.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-gray-400">No Impact tracking links yet.</td></tr>
            ) : links.map((l) => (
              <tr key={l.id} className="border-b border-gray-50 transition-colors hover:bg-teal-50/30">
                <td className="px-4 py-3">
                  <code className="rounded-lg border border-teal-100 bg-teal-50 px-2 py-0.5 font-mono text-xs font-bold text-teal-700">{l.slug}</code>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{l.profiles?.username ?? "—"}</p>
                  <p className="text-xs text-gray-400">{l.profiles?.email ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <code className="text-[11px] text-gray-400">{l.impact_campaign_id ?? "—"}</code>
                </td>
                <td className="px-4 py-3 font-bold tabular-nums text-teal-600">{l.click_count}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
