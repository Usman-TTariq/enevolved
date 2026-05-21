"use client";
import { useEffect, useState } from "react";

type StatusData = {
  configured: boolean;
  apiKey: string;
  affiliateId: string;
};

type TestResult = {
  ok: boolean;
  merchantCount?: number;
  affiliateId?: string;
  error?: string;
};

export default function PORConnectionContent() {
  const [status,    setStatus]    = useState<StatusData | null>(null);
  const [testing,   setTesting]   = useState(false);
  const [result,    setResult]    = useState<TestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/por/connection", { credentials: "include" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {/* ignore */});
  }, []);

  const test = async () => {
    setTesting(true); setResult(null); setTestError(null);
    try {
      const res  = await fetch("/api/admin/por/connection", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setTestError(data.error ?? "Test failed"); return; }
      setResult(data as TestResult);
    } catch { setTestError("Request failed."); }
    finally { setTesting(false); }
  };

  const envVars = [
    { name: "PAIDONRESULTS_API_KEY",      value: status?.apiKey },
    { name: "PAIDONRESULTS_AFFILIATE_ID", value: status?.affiliateId },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-500">PaidOnResults</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>Connection</h1>
        <p className="mt-0.5 text-sm text-gray-500">PaidOnResults API credentials and connection status.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#f97316,#ef4444)" }} />
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Environment Variables</h2>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${status?.configured ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {status == null ? "…" : status.configured ? "Configured" : "Not configured"}
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

          <button
            onClick={test}
            disabled={testing}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
            {testing ? "Testing…" : "Test connection"}
          </button>

          {testError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{testError}</div>
          )}

          {result && (
            <div className={`rounded-xl border px-4 py-3 ${result.ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              {result.ok ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">✓ Connected</span>
                    <span className="text-sm font-semibold text-gray-800">Affiliate ID: {result.affiliateId}</span>
                  </div>
                  <p className="text-sm text-emerald-700">{result.merchantCount?.toLocaleString()} merchants returned from API</p>
                </div>
              ) : (
                <p className="text-sm text-red-600">{result.error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="mb-2 font-bold text-gray-900">How it works</h2>
          <ol className="list-inside list-decimal space-y-1.5 text-sm text-gray-600">
            <li>PaidOnResults exposes a REST/XML API at <code className="rounded bg-gray-100 px-1 text-xs">affiliate.paidonresults.com/api</code></li>
            <li>Merchants are synced to <code className="rounded bg-gray-100 px-1 text-xs">por_merchants</code>; transactions to <code className="rounded bg-gray-100 px-1 text-xs">por_transactions</code>.</li>
            <li>Go-links use tracking URL: <code className="rounded bg-gray-100 px-1 text-xs">paidonresults.net/c/{"{affiliateId}"}/1/{"{merchantId}"}/{"{slug}"}</code></li>
            <li>The slug is passed as <code className="rounded bg-gray-100 px-1 text-xs">CustomTrackingID</code> — returned in transaction data for attribution.</li>
            <li>On sync, we match <code className="rounded bg-gray-100 px-1 text-xs">CustomTrackingID</code> → go-link slug → publisher and credit their earnings.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
