"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  { id: 1, label: "Account", sublabel: "Account Details" },
  { id: 2, label: "Company", sublabel: "Company Detail" },
  { id: 3, label: "Partner", sublabel: "Partner Details" },
];

const inputBase =
  "mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100";

function PasswordInput({
  id, value, onChange, placeholder, "aria-label": ariaLabel,
}: {
  id: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; "aria-label": string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} value={value}
        onChange={onChange} placeholder={placeholder} aria-label={ariaLabel}
        className={`${inputBase} pr-10`} />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-600"
        aria-label={show ? "Hide password" : "Show password"}>
        {show ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function SignupContent() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "publisher") as "publisher" | "advertiser";
  const isPublisher = role === "publisher";
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const title = isPublisher ? "Sign up as a Publisher" : "Sign up as an Advertiser";
  const subtitle = isPublisher
    ? "Turn your content into income with top brand partnerships on Impact."
    : "Grow your brand with top affiliates and performance marketing.";

  const validateStep1 = () => {
    if (!username.trim()) { setErrorMessage("Username is required."); return false; }
    if (!email.trim()) { setErrorMessage("Email is required."); return false; }
    if (password.length < 8) { setErrorMessage("Password must be at least 8 characters."); return false; }
    if (password !== confirmPassword) { setErrorMessage("Passwords do not match."); return false; }
    if (!agreeTerms) { setErrorMessage("Please agree to the privacy policy and terms."); return false; }
    setErrorMessage(""); return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading"); setErrorMessage("");
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: {
          username: username.trim(), role,
          company_name: companyName.trim() || undefined,
          website: website.trim() || undefined,
          company_description: companyDescription.trim() || undefined,
          payment_email: paymentEmail.trim() || undefined,
          tax_id: taxId.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
        }},
      });
      if (authError) { setStatus("error"); setErrorMessage(authError.message || "Sign up failed."); return; }
      if (!authData.user) { setStatus("error"); setErrorMessage("Sign up failed. Please try again."); return; }
      if (!authData.session) { setStatus("idle"); router.push("/signup/thank-you?verify=1"); return; }
      const completeRes = await fetch("/api/signup/complete", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authData.session.access_token}` },
        body: JSON.stringify({
          username: username.trim(), role, email: email.trim(),
          company_name: companyName.trim() || null, website: website.trim() || null,
          company_description: companyDescription.trim() || null,
          payment_email: paymentEmail.trim() || null, tax_id: taxId.trim() || null,
          address: address.trim() || null, city: city.trim() || null, country: country.trim() || null,
        }),
      });
      const completeJson = (await completeRes.json().catch(() => ({}))) as { error?: string };
      if (!completeRes.ok) {
        setStatus("error");
        setErrorMessage(completeJson.error ?? "Account created but profile could not be saved. Try logging in, or contact support.");
        return;
      }
      setStatus("idle"); router.push("/signup/thank-you");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    }
  };

  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10 sm:px-6 sm:py-12"
      style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}
    >
      {/* top nav bar */}
      <div className="mx-auto mb-8 flex max-w-lg items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200/60">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 10 L10 4 L16 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 14 L10 8 L16 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
            </svg>
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            earn<span className="text-teal-600">ytics</span>
          </span>
        </Link>
        <Link href="/login" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
          Sign in instead →
        </Link>
      </div>

      <div className="mx-auto max-w-lg">
        {/* heading */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1
            className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">{subtitle}</p>
        </motion.div>

        {/* ── Stepper ── */}
        <div className="mt-8 flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  step > s.id
                    ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                    : step === s.id
                    ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200"
                    : "border-2 border-gray-200 bg-white text-gray-400"
                }`}>
                  {step > s.id ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : String(s.id).padStart(2, "0")}
                </div>
                <span className={`mt-1.5 text-xs font-semibold ${step >= s.id ? "text-teal-600" : "text-gray-400"}`}>
                  {s.label}
                </span>
                <span className="hidden text-[10px] text-gray-400 sm:block">{s.sublabel}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded-full transition-all duration-500 ${step > s.id ? "bg-teal-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/80 sm:p-8"
        >
          {status === "error" && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
                <h2 className="text-lg font-bold text-gray-900">Account information</h2>
                <p className="mt-0.5 text-sm text-gray-500">Enter your account details to get started.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="mt-6 space-y-5" suppressHydrationWarning>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-username" className={labelClass}>Username <span className="text-red-400">*</span></label>
                      <input id="signup-username" type="text" required value={username}
                        onChange={(e) => setUsername(e.target.value)} className={inputBase} placeholder="Choose a username" />
                    </div>
                    <div>
                      <label htmlFor="signup-email" className={labelClass}>Email address <span className="text-red-400">*</span></label>
                      <input id="signup-email" type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)} className={inputBase} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-password" className={labelClass}>Password <span className="text-red-400">*</span></label>
                      <PasswordInput id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" aria-label="Password" />
                    </div>
                    <div>
                      <label htmlFor="signup-confirm" className={labelClass}>Confirm password <span className="text-red-400">*</span></label>
                      <PasswordInput id="signup-confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" aria-label="Confirm password" />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-500">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-400" />
                    <span>
                      I agree to the{" "}
                      <Link href="/privacy" className="font-semibold text-teal-600 hover:text-teal-700">privacy policy</Link>
                      {" "}&amp;{" "}
                      <Link href="/terms" className="font-semibold text-teal-600 hover:text-teal-700">terms of service</Link>
                    </span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button type="button" disabled className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-300 cursor-not-allowed">← Back</button>
                    <button type="submit" className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-100 transition hover:from-teal-700 hover:to-emerald-700">
                      Continue →
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: Company ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
                <h2 className="text-lg font-bold text-gray-900">Company information</h2>
                <p className="mt-0.5 text-sm text-gray-500">Tell us about your company or website.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="mt-6 space-y-5" suppressHydrationWarning>
                  <div>
                    <label htmlFor="signup-company" className={labelClass}>Company name</label>
                    <input id="signup-company" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputBase} placeholder="Your company name" />
                  </div>
                  <div>
                    <label htmlFor="signup-website" className={labelClass}>Website</label>
                    <input id="signup-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputBase} placeholder="https://yoursite.com" />
                  </div>
                  <div>
                    <label htmlFor="signup-description" className={labelClass}>Description</label>
                    <textarea id="signup-description" rows={3} value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                      placeholder="Short description of your site or business" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                    <button type="submit" className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-100 transition hover:from-teal-700 hover:to-emerald-700">
                      Continue →
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Step 3: Partner ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
                <h2 className="text-lg font-bold text-gray-900">Partner details</h2>
                <p className="mt-0.5 text-sm text-gray-500">Payment and contact info for your payouts.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-5" suppressHydrationWarning>
                  <div>
                    <label htmlFor="signup-payment-email" className={labelClass}>Payment email</label>
                    <input id="signup-payment-email" type="email" value={paymentEmail} onChange={(e) => setPaymentEmail(e.target.value)} className={inputBase} placeholder="Email for payouts" />
                  </div>
                  <div>
                    <label htmlFor="signup-taxid" className={labelClass}>Tax ID <span className="font-normal text-gray-400">(optional)</span></label>
                    <input id="signup-taxid" type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputBase} placeholder="Tax ID (optional)" />
                  </div>
                  <div>
                    <label htmlFor="signup-address" className={labelClass}>Address</label>
                    <input id="signup-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputBase} placeholder="Street address" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-city" className={labelClass}>City</label>
                      <input id="signup-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputBase} placeholder="City" />
                    </div>
                    <div>
                      <label htmlFor="signup-country" className={labelClass}>Country</label>
                      <input id="signup-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputBase} placeholder="Country" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                    <button type="submit" disabled={status === "loading"}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-100 transition hover:from-teal-700 hover:to-emerald-700 disabled:opacity-70">
                      {status === "loading" ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Creating account…
                        </>
                      ) : "Create account ✓"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
