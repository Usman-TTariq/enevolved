"use client";
import { useEffect, useState } from "react";

type StatusData = {
  configured: boolean;
  customerId: string;
  locales: Record<string, string>;
};

type TestResult = {
  locale: string; label: string; ok: boolean;
  campaignCount?: number; siteCount?: number; error?: string;
};

export default function TradeTrackerConnectionContent() {
  const [status,   setStatus]   = useState<StatusData | null>(null);
  const [testing,  setTesting]  = useState(false);
  const [results,  setResults]  = useState<TestResult[] | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/tradetracker/connection", { credentials: "include" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {/* ignore */});
  }, []);

  const test = async () => {
    setTesting(true); setResults(null); setTestError(null);
    try {
      const res  = await fetch("/api/admin/tradetracker/connection", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setTestError(data.error ?? "Test failed"); return; }
      setResults(data.results ?? []);
    } catch { setTestError("Request failed."); }
    finally { setTesting(false); }
  };

  const envVars = [
    { name: "TRADETRACKER_CUSTOMER_ID", value: status?.customerId },
    { name: "TRADETRACKER_PASSPHRASE_NL", value: status?.locales?.nl_NL },
    { name: "TRADETRACKER_PASSPHRASE_FR", value: status?.locales?.fr_FR },
    { name: "TRADETRACKER_PASSPHRASE_UK", value: status?.locales?.en_GB },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">TradeTracker</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Connection</h1>
        <p className="mt-0.5 text-sm text-gray-500">TradeTracker SOAP API credentials and connection status.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#0d9488,#059669)" }} />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Environment Variables</h2>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${status?.configured ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {status?.configured ? "Configured" : "Not configured"}
            </span>
          </div>
          <div className="space-y-2">
            {envVars.map(({ name, value }) => (
              <div key={name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5">
                <code className="text-[12px] text-gray-700">{name}</code>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${value === "set" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"}`}>
                  {value === "set" ? "✓ set" : "✗ missing"}
                </span>
              </div>
            ))}
          </div>
          <button onClick={test} disabled={testing}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#0d9488,#059669)" }}>
            {testing ? "Testing…" : "Test connection"}
          </button>

          {testError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{testError}</div>}

          {results && (
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.locale} className={`rounded-xl border px-4 py-3 ${r.ok ? "border-teal-200 bg-teal-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{r.label} ({r.locale})</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${r.ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {r.ok ? "✓ Connected" : "✗ Failed"}
                    </span>
                  </div>
                  {r.ok && (
                    <p className="mt-1 text-sm text-teal-700">
                      {r.siteCount} site(s), {r.campaignCount} campaign(s)
                    </p>
                  )}
                  {r.error && <p className="mt-1 text-sm text-red-600">{r.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="mb-2 font-bold text-gray-900">How it works</h2>
          <ol className="space-y-1.5 text-sm text-gray-600 list-decimal list-inside">
            <li>TradeTracker uses a SOAP API at <code className="rounded bg-gray-100 px-1 text-xs">ws.tradetracker.com/soap/affiliate</code></li>
            <li>Each locale (NL, FR, UK) has its own passphrase — all share the same Customer ID.</li>
            <li>Publisher go-links embed a <code className="rounded bg-gray-100 px-1 text-xs">?r=slug</code> parameter in the tracking URL.</li>
            <li>When TradeTracker fires a conversion, the <code className="rounded bg-gray-100 px-1 text-xs">reference</code> field contains the slug.</li>
            <li>On sync, we match the reference to a publisher and credit their earnings.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
