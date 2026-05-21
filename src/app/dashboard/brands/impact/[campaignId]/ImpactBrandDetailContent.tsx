"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Campaign = {
  impact_id: string;
  name: string;
  advertiser_name: string | null;
  logo_url: string | null;
  click_through_url: string | null;
  status: string | null;
  currency: string | null;
  raw: Record<string, unknown> | null;
};

type GoLink = {
  id: string;
  slug: string;
  target_url: string;
  deep_link: boolean;
  created_at: string;
  click_count: number;
};

type TabId = "overview" | "commission" | "tracking" | "terms" | "creative";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "commission", label: "Commission rates" },
  { id: "tracking", label: "Tracking links" },
  { id: "terms", label: "Terms" },
  { id: "creative", label: "Creative" },
];

function StatRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-800 sm:text-right">{value ?? "—"}</div>
    </div>
  );
}

const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export default function ImpactBrandDetailContent({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [goLinks, setGoLinks] = useState<GoLink[]>([]);
  const [tab, setTab] = useState<TabId>("overview");
  const [landingPage, setLandingPage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/publisher/impact/brands/${campaignId}`, { credentials: "include" });
    if (res.status === 401) { router.replace("/login"); return; }
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setCampaign(data.campaign ?? null);
    setApplicationStatus(data.applicationStatus ?? null);
    setGoLinks(data.goLinks ?? []);
    setLoading(false);
  }, [campaignId, router]);

  useEffect(() => { load(); }, [load]);

  const copyText = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); } catch { /* ignore */ }
  };

  const createLink = async () => {
    if (!campaign) return;
    setCreating(true);
    setCreateError(null);
    setLastCreatedUrl(null);
    try {
      const res = await fetch("/api/publisher/impact/go-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ campaignId: campaign.impact_id, landingPage: landingPage.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setCreateError(data.error || "Could not create link."); return; }
      if (data.shortUrl) {
        setLastCreatedUrl(data.shortUrl);
        await load();
      }
    } finally { setCreating(false); }
  };

  const cardClass = "rounded-2xl border border-gray-200 bg-white shadow-sm";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-[50vh] px-4 pb-16 pt-4 text-center">
        <p className="text-gray-500">Campaign not found.</p>
        <Link href="/dashboard/brands" className="mt-4 inline-block text-teal-600 hover:underline">Back to brands</Link>
      </div>
    );
  }

  const raw = campaign.raw ?? {};
  const description = typeof raw.CampaignDescription === "string" ? raw.CampaignDescription : null;
  const advertiserUrl = typeof raw.AdvertiserUrl === "string" ? raw.AdvertiserUrl
    : typeof raw.CampaignUrl === "string" ? raw.CampaignUrl : null;
  const allowsDeeplinking = raw.AllowsDeeplinking === "true";
  const deeplinkDomains = Array.isArray(raw.DeeplinkDomains) ? (raw.DeeplinkDomains as string[]) : [];
  const contractStatus = typeof raw.ContractStatus === "string" ? raw.ContractStatus : campaign.status;
  const trackingLink = campaign.click_through_url ?? (typeof raw.TrackingLink === "string" ? raw.TrackingLink : null);

  const storeHref = advertiserUrl
    ? advertiserUrl.startsWith("http") ? advertiserUrl : `https://${advertiserUrl}`
    : trackingLink ?? null;

  const canCreateLinks = applicationStatus === "approved" && Boolean(trackingLink || advertiserUrl);

  const statusBadge = applicationStatus === "approved" ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
      Approved on Earnytics
    </span>
  ) : applicationStatus === "pending" ? (
    <span className="inline-flex rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">Pending review</span>
  ) : (
    <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">Not applied</span>
  );

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl pt-4">
        <Link href="/dashboard/brands" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 hover:underline">
          <span aria-hidden>←</span> Available brands
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
          {/* Sidebar */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(3.75rem+1.5rem)]">
            <div className={`${cardClass} p-5`}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {campaign.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/impact-logo?c=${encodeURIComponent(campaign.impact_id)}`}
                    alt=""
                    className="h-full w-full object-contain p-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-teal-600">{campaign.name.charAt(0)}</span>
                )}
              </div>

              <h1 className="mt-4 text-center text-lg font-bold text-gray-900">
                {campaign.name}
              </h1>
              {campaign.advertiser_name && campaign.advertiser_name !== campaign.name && (
                <p className="mt-1 text-center text-xs text-gray-500">{campaign.advertiser_name}</p>
              )}
              <p className="mt-1 text-center text-xs text-gray-400">Impact campaign ID · {campaign.impact_id}</p>

              {storeHref && (
                <a href={storeHref} target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700">
                  Visit store
                  <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M16.5 3h6m0 0v6m0-6L10.5 15" />
                  </svg>
                </a>
              )}

              <div className="mt-4 flex justify-center">{statusBadge}</div>

              <dl className="mt-5 space-y-1 border-t border-gray-100 pt-4 text-xs">
                <StatRow label="Contract status" value={contractStatus} />
                <StatRow label="Currency" value={campaign.currency} />
                <StatRow label="Deep linking" value={allowsDeeplinking ? "Allowed" : "Not allowed"} />
                {deeplinkDomains.length > 0 && (
                  <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-baseline sm:gap-4">
                    <div className="text-gray-500">Deeplink domains</div>
                    <div className="text-gray-700 sm:text-right text-[10px] leading-relaxed">{deeplinkDomains.slice(0, 3).join(", ")}{deeplinkDomains.length > 3 ? ` +${deeplinkDomains.length - 3} more` : ""}</div>
                  </div>
                )}
              </dl>
            </div>

            {description && (
              <div className={`${cardClass} flex max-h-[min(420px,50vh)] flex-col p-5`}>
                <h2 className="text-sm font-semibold text-gray-800">Store details</h2>
                <div className="mt-3 flex-1 overflow-y-auto pr-1 text-sm leading-relaxed text-gray-600">
                  <p className="whitespace-pre-wrap">{description}</p>
                </div>
                {contractStatus && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                      contractStatus === "Active"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-gray-100 text-gray-600 ring-gray-200"
                    }`}>{contractStatus}</span>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Main */}
          <div className="min-w-0">
            <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    tab === t.id ? "border-teal-500 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}>
                  {t.label}
                </button>
              ))}
            </nav>

            {tab === "overview" && (
              <div className="space-y-6">
                {description && (
                  <section className={cardClass}>
                    <div className="border-b border-gray-100 px-5 py-4">
                      <h2 className="text-base font-semibold text-gray-900">Detailed introduction</h2>
                    </div>
                    <div className="px-5 py-5">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{description}</p>
                    </div>
                  </section>
                )}

                <section className={cardClass}>
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Create a link</h2>
                    <p className="mt-1 text-sm text-gray-500">Promote this campaign with a short Earnytics URL.</p>
                  </div>
                  <div className="space-y-5 px-5 py-5">
                    {!canCreateLinks && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                        {applicationStatus !== "approved"
                          ? "Once an admin approves your application, you can generate short links here."
                          : "No destination URL available for this campaign."}
                      </p>
                    )}
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Campaign</label>
                      <div className="mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">{campaign.name}</div>
                    </div>
                    <div>
                      <label htmlFor="landing-page" className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Landing page (optional)
                      </label>
                      <input
                        id="landing-page"
                        type="url"
                        value={landingPage}
                        onChange={(e) => setLandingPage(e.target.value)}
                        disabled={!canCreateLinks || creating}
                        placeholder={advertiserUrl ? `e.g. ${advertiserUrl.replace(/\/$/, "")}/sale` : "https://…"}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
                      />
                      <p className="mt-1.5 text-xs text-gray-400">
                        Your go-link slug is automatically appended to the tracking URL for attribution.
                      </p>
                    </div>
                    {createError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 border border-red-200" role="alert">{createError}</p>}
                    {lastCreatedUrl && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">Your short link</p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <code className="flex-1 break-all text-sm text-emerald-800">{lastCreatedUrl}</code>
                          <button type="button" onClick={() => copyText(lastCreatedUrl, "new")}
                            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                            {copied === "new" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={createLink} disabled={!canCreateLinks || creating}
                        className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {creating ? "Creating…" : "Create"}
                      </button>
                      <button type="button" onClick={() => setTab("tracking")}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        View all links
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {tab === "commission" && (() => {
              const actions = Array.isArray(raw.Actions) ? raw.Actions as Record<string, unknown>[] : [];
              return (
                <div className={cardClass}>
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Commission &amp; performance</h2>
                    <p className="mt-1 text-sm text-gray-500">Campaign details from Impact.</p>
                  </div>
                  <div className="divide-y divide-gray-100 text-sm">
                    <StatRow label="Contract status" value={contractStatus} />
                    <StatRow label="Currency" value={campaign.currency} />
                    <StatRow label="Deep linking" value={allowsDeeplinking ? "Allowed" : "Not allowed"} />
                    {deeplinkDomains.length > 0 && (
                      <div className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                        <div className="text-gray-500">Deeplink domains</div>
                        <div className="text-gray-700 sm:text-right text-xs leading-relaxed">{deeplinkDomains.join(", ")}</div>
                      </div>
                    )}
                    {actions.length > 0 && (
                      <div className="px-5 py-4">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Commission actions</h3>
                        <div className="space-y-3">
                          {actions.map((a, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">
                                  {String(a.ActionName ?? a.Name ?? `Action ${i + 1}`)}
                                </span>
                                {(a.ActionType ?? a.Type) ? (
                                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-200">
                                    {String(a.ActionType ?? a.Type)}
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                                {(a.DefaultPayout ?? a.Payout) != null && (
                                  <span>Payout: <span className="font-medium text-gray-800">{String(a.DefaultPayout ?? a.Payout)} {String(a.DefaultPayoutCurrency ?? campaign.currency ?? "")}</span></span>
                                )}
                                {(a.LockingPeriod ?? a.ValidationPeriod) != null && (
                                  <span>Locking: <span className="font-medium text-gray-800">{String(a.LockingPeriod ?? a.ValidationPeriod)} days</span></span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-xs text-gray-400">
                      Detailed commission rates are available in your{" "}
                      <a href="https://app.impact.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                        Impact publisher dashboard
                      </a>.
                    </p>
                  </div>
                </div>
              );
            })()}

            {tab === "terms" && (() => {
              const terms = typeof raw.PolicyTerms === "string" ? raw.PolicyTerms
                : typeof raw.Terms === "string" ? raw.Terms
                : typeof raw.Restrictions === "string" ? raw.Restrictions : null;
              const sections = Array.isArray(raw.PolicySections) ? raw.PolicySections as Record<string, unknown>[] : [];
              return (
                <div className={cardClass}>
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Terms &amp; programme rules</h2>
                    <p className="mt-1 text-sm text-gray-500">Policy terms from Impact campaign data.</p>
                  </div>
                  {sections.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {sections.map((s, i) => (
                        <section key={i} className="px-5 py-5">
                          {String(s.Title ?? s.name ?? "").trim() ? (
                            <h3 className="text-sm font-semibold text-teal-700">{String(s.Title ?? s.name)}</h3>
                          ) : null}
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{String(s.Body ?? s.content ?? "")}</p>
                        </section>
                      ))}
                    </div>
                  ) : terms ? (
                    <div className="px-5 py-5">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{terms}</p>
                    </div>
                  ) : (
                    <div className="px-5 py-6">
                      <p className="text-sm text-gray-500">No policy terms stored for this campaign yet.</p>
                      <p className="mt-2 text-sm text-gray-400">Review the advertiser's terms on the{" "}
                        <a href={storeHref ?? "#"} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">campaign website</a>.
                      </p>
                    </div>
                  )}
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-xs text-gray-400">Always verify current terms in your Impact dashboard before running campaigns.</p>
                  </div>
                </div>
              );
            })()}

            {tab === "creative" && (() => {
              const creatives = Array.isArray(raw.Creatives) ? raw.Creatives as Record<string, unknown>[]
                : Array.isArray(raw.Banners) ? raw.Banners as Record<string, unknown>[] : [];
              const promos = Array.isArray(raw.Promotions) ? raw.Promotions as Record<string, unknown>[] : [];
              const all = [...creatives, ...promos];
              return (
                <div className={cardClass}>
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Promotions &amp; creatives</h2>
                    <p className="mt-1 text-sm text-gray-500">Creative assets and promotions from Impact.</p>
                  </div>
                  {all.length === 0 ? (
                    <div className="px-5 py-6">
                      <p className="text-sm text-gray-500">No creative assets stored for this campaign yet.</p>
                      <p className="mt-3 text-sm text-gray-400">Find banners, text links, and creatives in your{" "}
                        <a href="https://app.impact.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Impact publisher dashboard</a>.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {all.map((c, i) => (
                        <li key={i} className="flex flex-col gap-4 px-5 py-5 sm:flex-row">
                          {String(c.ImageUrl ?? c.Url ?? "").trim() ? (
                            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:w-40">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={String(c.ImageUrl ?? c.Url)} alt="" className="h-full w-full object-cover" />
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            {String(c.Name ?? c.Title ?? "").trim() ? (
                              <h3 className="text-base font-semibold text-gray-900">{String(c.Name ?? c.Title)}</h3>
                            ) : null}
                            {String(c.Type ?? c.Format ?? "").trim() ? (
                              <span className="mt-1 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-700 ring-1 ring-teal-200">
                                {String(c.Type ?? c.Format)}
                              </span>
                            ) : null}
                            {String(c.Description ?? "").trim() ? (
                              <p className="mt-2 text-sm leading-relaxed text-gray-500">{String(c.Description)}</p>
                            ) : null}
                            {String(c.TrackingLink ?? "").trim() ? (
                              <a href={String(c.TrackingLink)} target="_blank" rel="noopener noreferrer"
                                className="mt-3 inline-block rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700">
                                Open tracking URL
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

            {tab === "tracking" && (
              <div className={`${cardClass} overflow-hidden`}>
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-gray-900">Your short links</h2>
                  <p className="mt-1 text-sm text-gray-500">Short URLs that redirect via Impact tracking.</p>
                </div>
                {applicationStatus !== "approved" ? (
                  <p className="px-5 py-6 text-sm text-gray-400">Approve your application to create and list links.</p>
                ) : goLinks.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-gray-400">No links yet. Create one from the Overview tab.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {goLinks.map((row) => {
                      const shortUrl = `${appUrl}/go/short/${row.slug}`;
                      return (
                        <li key={row.slug} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="break-all font-mono text-sm text-teal-600">{shortUrl}</p>
                            <p className="mt-1 break-all text-xs text-gray-400">{row.target_url}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              Clicks: <span className="font-mono tabular-nums text-gray-700">{Number(row.click_count || 0).toLocaleString()}</span>
                            </p>
                          </div>
                          <button type="button" onClick={() => copyText(shortUrl, row.slug)}
                            className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                            {copied === row.slug ? "Copied!" : "Copy"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
