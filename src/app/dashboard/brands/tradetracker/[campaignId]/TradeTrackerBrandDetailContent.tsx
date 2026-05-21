"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Campaign = {
  tt_campaign_id: string; name: string; url: string | null; tracking_url: string | null;
  logo_url: string | null; assignment_status: string | null; commission_type: string | null;
  commission_percentage: number | null; commission_fixed_fee: number | null;
  currency: string | null; description: string | null; deeplinking_supported: boolean;
  locale: string; category_name: string | null;
};

type GoLink = { id: string; slug: string; target_url: string; deep_link: boolean; created_at: string; click_count: number };

type Tab = "overview" | "commission" | "tracking";

const appUrl = typeof window !== "undefined" ? window.location.origin : "";

export default function TradeTrackerBrandDetailContent({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading,           setLoading]           = useState(true);
  const [campaign,          setCampaign]          = useState<Campaign | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [goLinks,           setGoLinks]           = useState<GoLink[]>([]);
  const [tab,               setTab]               = useState<Tab>("overview");
  const [landingPage,       setLandingPage]       = useState("");
  const [creating,          setCreating]          = useState(false);
  const [createError,       setCreateError]       = useState<string | null>(null);
  const [lastCreated,       setLastCreated]       = useState<string | null>(null);
  const [applying,          setApplying]          = useState(false);
  const [copied,            setCopied]            = useState<string | null>(null);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const res = await fetch(`/api/publisher/tradetracker/brands/${campaignId}`, { credentials: "include" });
    if (res.status === 401) { router.replace("/login"); return; }
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setCampaign(data.campaign ?? null);
    setApplicationStatus(data.applicationStatus ?? null);
    setGoLinks(data.goLinks ?? []);
    setLoading(false);
  }, [campaignId, router]);

  useEffect(() => { load(); }, [load]);

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); } catch { /* ignore */ }
  };

  const applyNow = async () => {
    if (!campaign) return;
    setApplying(true);
    try {
      const res = await fetch("/api/publisher/tradetracker/apply", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.tt_campaign_id }),
      });
      if (res.ok) setApplicationStatus("pending");
    } finally { setApplying(false); }
  };

  const createLink = async () => {
    if (!campaign) return;
    setCreating(true); setCreateError(null); setLastCreated(null);
    try {
      const res = await fetch("/api/publisher/tradetracker/go-links", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.tt_campaign_id, landingPage: landingPage.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? "Failed to create link."); return; }
      setLastCreated(data.shortUrl ?? null);
      setLandingPage("");
      await load(false);
    } catch { setCreateError("Request failed."); }
    finally { setCreating(false); }
  };

  const commLabel = (c: Campaign) => {
    if (c.commission_percentage) return `${c.commission_percentage}% commission`;
    if (c.commission_fixed_fee)  return `${c.commission_fixed_fee} ${c.currency ?? "EUR"} per conversion`;
    return "Commission info not available";
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
    </div>
  );

  if (!campaign) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-gray-500">Campaign not found.</p>
      <Link href="/dashboard/brands" className="text-teal-600 hover:underline">← Back to brands</Link>
    </div>
  );

  const LOCALE_FLAG: Record<string, string> = { NL: "🇳🇱", FR: "🇫🇷", GB: "🇬🇧", UK: "🇬🇧", DE: "🇩🇪", BE: "🇧🇪" };
  const flag = LOCALE_FLAG[campaign.locale?.toUpperCase()] ?? "";

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",   label: "Overview" },
    { id: "commission", label: "Commission rates" },
    { id: "tracking",   label: "Tracking links" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <Link href="/dashboard/brands" className="mb-5 inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        All brands
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Left sidebar ── */}
        <aside className="w-full lg:w-56 lg:shrink-0 space-y-4">
          {/* Logo + name card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-1" style={{ background: "linear-gradient(90deg,#0d9488,#059669)" }} />
            <div className="flex flex-col items-center p-5 text-center">
              {campaign.logo_url ? (
                <img src={campaign.logo_url} alt={campaign.name}
                  className="h-16 w-16 rounded-2xl border border-gray-100 object-contain p-1"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white"
                  style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                  {campaign.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h1 className="mt-3 text-base font-extrabold text-gray-900 leading-snug" style={{ letterSpacing: "-0.02em" }}>
                {campaign.name}
              </h1>
              <p className="mt-0.5 text-[11px] text-gray-400">
                TradeTracker {flag} {campaign.locale?.toUpperCase()}
              </p>
              {campaign.url && (
                <a href={campaign.url} target="_blank" rel="noreferrer"
                  className="mt-2 flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                  Visit store
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}

              {/* Application status */}
              <div className="mt-3 w-full">
                {applicationStatus === "approved" ? (
                  <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Approved on Earnytics
                  </span>
                ) : applicationStatus === "pending" ? (
                  <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700">
                    ⏳ Pending approval
                  </span>
                ) : applicationStatus === "rejected" ? (
                  <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-600">
                    ✗ Rejected
                  </span>
                ) : (
                  <button onClick={applyNow} disabled={applying}
                    className="w-full rounded-xl py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                    {applying ? "Applying…" : "Apply to join"}
                  </button>
                )}
              </div>
            </div>

            {/* Meta rows */}
            <div className="border-t border-gray-50 divide-y divide-gray-50">
              {[
                ["Commission",  commLabel(campaign)],
                ["Currency",    campaign.currency ?? "EUR"],
                ["Deep linking", campaign.deeplinking_supported ? "Allowed" : "Not supported"],
                ["Category",    campaign.category_name ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 px-4 py-2">
                  <span className="text-[11px] text-gray-400 shrink-0">{label}</span>
                  <span className="text-[11px] font-medium text-gray-700 text-right truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Store description */}
          {campaign.description && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Store details</p>
              <p className="text-xs leading-relaxed text-gray-600 line-clamp-6"
                dangerouslySetInnerHTML={{ __html: campaign.description.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "") }} />
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-100">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`pb-2.5 px-1 mr-4 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "border-b-2 border-teal-500 text-teal-700"
                    : "text-gray-400 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === "overview" && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-50 px-5 py-4">
                <h2 className="font-extrabold text-gray-900">Campaign overview</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  ["Campaign ID",     campaign.tt_campaign_id],
                  ["Campaign name",   campaign.name],
                  ["Locale / Region", `${flag} ${campaign.locale?.toUpperCase()}`],
                  ["Currency",        campaign.currency ?? "EUR"],
                  ["Status",          campaign.assignment_status ?? "accepted"],
                  ["Category",        campaign.category_name ?? "—"],
                  ["Deep linking",    campaign.deeplinking_supported ? "Supported" : "Not supported"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-4 px-5 py-3">
                    <span className="min-w-[160px] text-sm text-gray-500 shrink-0">{label}</span>
                    <span className="text-sm text-gray-800">{value}</span>
                  </div>
                ))}
                {campaign.description && (
                  <div className="px-5 py-4">
                    <p className="mb-2 text-sm font-semibold text-gray-500">Description</p>
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: campaign.description.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "") }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commission rates tab */}
          {tab === "commission" && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-50 px-5 py-4">
                <h2 className="font-extrabold text-gray-900">Commission rates</h2>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="flex items-baseline gap-4 px-5 py-3">
                  <span className="min-w-[160px] text-sm text-gray-500 shrink-0">Type</span>
                  <span className="text-sm text-gray-800 capitalize">{campaign.commission_type ?? "sale"}</span>
                </div>
                {campaign.commission_percentage != null && (
                  <div className="flex items-baseline gap-4 px-5 py-3">
                    <span className="min-w-[160px] text-sm text-gray-500 shrink-0">Sale commission</span>
                    <span className="text-sm font-bold text-emerald-700">{campaign.commission_percentage}%</span>
                  </div>
                )}
                {campaign.commission_fixed_fee != null && (
                  <div className="flex items-baseline gap-4 px-5 py-3">
                    <span className="min-w-[160px] text-sm text-gray-500 shrink-0">Fixed fee</span>
                    <span className="text-sm font-bold text-emerald-700">{campaign.commission_fixed_fee} {campaign.currency ?? "EUR"}</span>
                  </div>
                )}
                <div className="flex items-baseline gap-4 px-5 py-3">
                  <span className="min-w-[160px] text-sm text-gray-500 shrink-0">Currency</span>
                  <span className="text-sm text-gray-800">{campaign.currency ?? "EUR"}</span>
                </div>
              </div>
              <div className="bg-teal-50 border-t border-teal-100 px-5 py-3">
                <p className="text-xs text-teal-700">
                  Commission is paid on confirmed orders. TradeTracker validates and approves transactions before payout.
                </p>
              </div>
            </div>
          )}

          {/* Tracking links tab */}
          {tab === "tracking" && (
            <div className="space-y-4">
              {applicationStatus === "approved" ? (
                <>
                  {/* Create link */}
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-50 px-5 py-4">
                      <h2 className="font-extrabold text-gray-900">Create a link</h2>
                      <p className="mt-0.5 text-xs text-gray-400">Promote this campaign with a short Earnytics URL.</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign</label>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">{campaign.name}</div>
                      </div>
                      {campaign.deeplinking_supported && (
                        <div>
                          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Landing page (optional)
                          </label>
                          <input value={landingPage} onChange={(e) => setLandingPage(e.target.value)}
                            placeholder={`e.g. https://${(campaign.url ?? "").replace(/^https?:\/\//, "").split("/")[0]}/sale`}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                          <p className="mt-1 text-[11px] text-gray-400">Your go-link slug is automatically appended to the tracking URL for attribution.</p>
                        </div>
                      )}
                      {createError && (
                        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{createError}</p>
                      )}
                      {lastCreated && (
                        <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
                          <code className="flex-1 truncate text-sm font-medium text-teal-800">{lastCreated}</code>
                          <button onClick={() => void copy(lastCreated, "last")}
                            className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">
                            {copied === "last" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button onClick={createLink} disabled={creating}
                          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                          {creating ? "Creating…" : "Create"}
                        </button>
                        {goLinks.length > 0 && (
                          <button onClick={() => {}} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            View all links
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Existing links */}
                  {goLinks.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <div className="border-b border-gray-50 px-5 py-3 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Your tracking links</h2>
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-100">
                          {goLinks.length}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {goLinks.map((l) => {
                          const shortUrl = `${appUrl}/go/short/${l.slug}`;
                          return (
                            <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-teal-50/30 transition-colors">
                              <div className="flex-1 min-w-0">
                                <code className="block truncate text-sm font-medium text-teal-700">{shortUrl}</code>
                                <p className="mt-0.5 text-[11px] text-gray-400">
                                  {l.click_count ?? 0} clicks
                                  {l.deep_link && <span className="ml-2 text-purple-500">deep link</span>}
                                  {" · "}Created {new Date(l.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <button onClick={() => void copy(shortUrl, l.id)}
                                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-teal-300 hover:text-teal-700 transition-colors">
                                {copied === l.id ? "✓ Copied" : "Copy"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                    style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">
                      {applicationStatus === "pending" ? "Your application is under review." : "You need approval to create tracking links."}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {applicationStatus === "pending"
                        ? "Admin will approve your application shortly."
                        : "Apply to join this campaign first."}
                    </p>
                  </div>
                  {!applicationStatus && (
                    <button onClick={applyNow} disabled={applying}
                      className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md"
                      style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
                      {applying ? "Applying…" : "Apply now"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
