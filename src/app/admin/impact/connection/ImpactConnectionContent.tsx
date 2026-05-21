"use client";

import { useState } from "react";

export default function ImpactConnectionContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  const test = async () => {
    setLoading(true); setResult(null); setOk(null);
    try {
      const res = await fetch("/api/admin/impact/connection", { credentials: "include" });
      const data = await res.json();
      setOk(Boolean(data.ok));
      setResult(data.message || data.error || "Connection check failed.");
    } catch { setOk(false); setResult("Request failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">Impact</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
          Connection
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Set{" "}
          <code className="rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-teal-700">IMPACT_ACCOUNT_SID</code>{" "}
          and{" "}
          <code className="rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-teal-700">IMPACT_AUTH_TOKEN</code>{" "}
          in <code className="rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-600">.env.local</code>.
          Credentials are never sent to the browser.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-[3px] -mx-6 -mt-6 mb-5 rounded-t-2xl" style={{ background: "linear-gradient(90deg,#0d9488,#059669)" }} />
        <p className="text-sm font-semibold text-gray-700">Environment variables required</p>
        <div className="mt-4 space-y-3">
          {[
            { key: "IMPACT_ACCOUNT_SID", desc: "Your Impact.com Account SID (Account Settings → API)" },
            { key: "IMPACT_AUTH_TOKEN", desc: "Your Impact.com Auth Token" },
            { key: "IMPACT_SYNC_CRON_SECRET", desc: "Any random secret to authorize the hourly cron endpoint" },
          ].map(({ key, desc }) => (
            <div key={key} className="flex flex-col gap-0.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <code className="text-xs font-bold text-teal-700">{key}</code>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={test} disabled={loading}
          className="mt-5 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-200/50 transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
          {loading ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Testing…</>
          ) : (
            <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>Test connection</>
          )}
        </button>
        {result && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            ok ? "border-teal-200 bg-teal-50 text-teal-700" : "border-red-200 bg-red-50 text-red-700"
          }`}>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {ok
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
            </svg>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
