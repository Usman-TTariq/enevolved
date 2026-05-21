import type { Metadata } from "next";
import { Suspense } from "react";
import SignupContent from "./SignupContent";

export const metadata: Metadata = {
  title: "Sign up | Earnytics",
  description: "Create your Earnytics account. Join as a publisher or advertiser and start growing.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <SignupContent />
    </Suspense>
  );
}
