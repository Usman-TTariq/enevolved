"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const benefits = [
  "No hidden fees. No contracts.",
  "No training and setup fees.",
  "Data imports and integration setup assistance.",
  "Live chat, video call and email support.",
];

function EarnyticsLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 shadow-lg backdrop-blur-sm">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10 L10 4 L16 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 14 L10 8 L16 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
        </svg>
      </div>
      <span
        className={`text-[20px] font-extrabold tracking-tight leading-none ${inverted ? "text-white" : "text-gray-900"}`}
        style={{ fontFamily: "var(--font-jakarta), sans-serif", letterSpacing: "-0.02em" }}
      >
        earn<span className={inverted ? "text-teal-200" : "text-teal-600"}>ytics</span>
      </span>
    </div>
  );
}

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setStatus("error"); setErrorMessage(error.message || "Invalid email or password."); return; }
      if (!authData.session?.user) { setStatus("error"); setErrorMessage("Login failed. Please try again."); return; }
      const user = authData.session.user;
      const accessToken = authData.session.access_token;
      let { data: profile } = await supabase.from("profiles").select("approval_status").eq("id", user.id).maybeSingle();
      if (!profile) {
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const bootstrap = await fetch("/api/signup/complete", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            username: typeof meta.username === "string" ? meta.username : "",
            role: meta.role === "advertiser" || meta.role === "publisher" ? meta.role : "publisher",
            email: user.email ?? "",
            company_name: typeof meta.company_name === "string" ? meta.company_name : null,
            website: typeof meta.website === "string" ? meta.website : null,
            company_description: typeof meta.company_description === "string" ? meta.company_description : null,
            payment_email: typeof meta.payment_email === "string" ? meta.payment_email : null,
            tax_id: typeof meta.tax_id === "string" ? meta.tax_id : null,
            address: typeof meta.address === "string" ? meta.address : null,
            city: typeof meta.city === "string" ? meta.city : null,
            country: typeof meta.country === "string" ? meta.country : null,
          }),
        });
        if (!bootstrap.ok) {
          setStatus("error");
          setErrorMessage("Your account has no profile record yet. Please contact support or try signing up again.");
          await supabase.auth.signOut();
          return;
        }
        const refetch = await supabase.from("profiles").select("approval_status").eq("id", user.id).maybeSingle();
        profile = refetch.data ?? null;
      }
      if (!profile) {
        await supabase.auth.signOut();
        setStatus("error");
        setErrorMessage("We could not load your profile after sign-in. Try again in a moment, or contact support.");
        return;
      }
      const statusFromDb = profile.approval_status;
      if (statusFromDb === "approved") { router.push("/dashboard"); return; }
      await supabase.auth.signOut();
      setStatus("error");
      if (statusFromDb === "rejected") setErrorMessage("Your account was not approved. Please contact support.");
      else if (statusFromDb === "pending") setErrorMessage("Your account is pending approval. You can log in once an admin approves it.");
      else setErrorMessage("Your account profile has an unexpected status. Please contact support.");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  const inputBase = "mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100";

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row"
      style={{ fontFamily: "var(--font-jakarta), var(--font-geist-sans), sans-serif" }}
    >
      {/* ── Left panel: gradient hero ── */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 px-8 py-10 lg:w-[45%] lg:px-14 lg:py-16">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute right-10 bottom-32 h-40 w-40 rounded-full bg-teal-300/10 blur-2xl" />

        <div className="relative">
          <Link href="/"><EarnyticsLogo inverted /></Link>

          <h2
            className="mt-14 text-3xl font-extrabold leading-tight text-white lg:text-4xl"
            style={{ fontFamily: "var(--font-jakarta), sans-serif", letterSpacing: "-0.02em" }}
          >
            Grow your affiliate<br />revenue with ease.
          </h2>
          <p className="mt-3 text-teal-100/80 text-sm leading-relaxed max-w-sm">
            Join Earnytics and connect with top Impact campaigns. Track, grow, and earn — all in one place.
          </p>

          <ul className="mt-8 space-y-3.5">
            {benefits.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* testimonial card */}
        <div className="relative mt-12 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm lg:mt-0">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-lg">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Partner success</p>
              <p className="mt-1 text-xs leading-relaxed text-teal-100/80">
                &ldquo;Earnytics made it simple to grow my affiliate revenue. The dashboard is clean and support is incredibly responsive.&rdquo;
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3.5 w-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          {/* top bar */}
          <div className="flex items-center justify-between">
            <Link href="/" className="lg:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-200">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10 L10 4 L16 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 14 L10 8 L16 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
                  </svg>
                </div>
                <span className="text-[16px] font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                  earn<span className="text-teal-600">ytics</span>
                </span>
              </div>
            </Link>
            <p className="ml-auto text-sm text-gray-500">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-teal-600 hover:text-teal-700">
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <h1
              className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">Sign in to your Earnytics dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" suppressHydrationWarning>
              {status === "error" && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <input id="login-email" name="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputBase}
                  placeholder="you@example.com" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/contact" className="text-xs font-medium text-teal-600 hover:text-teal-700">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input id="login-password" name="password" type={showPassword ? "text" : "password"}
                    required value={password} onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} pr-10`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? (
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
              </div>

              <button type="submit" disabled={status === "loading"}
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-200 transition hover:from-teal-700 hover:to-emerald-700 hover:shadow-teal-300 disabled:opacity-70">
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign in →"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-gray-400">
              By signing in you agree to our{" "}
              <Link href="/terms" className="text-teal-600 hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
