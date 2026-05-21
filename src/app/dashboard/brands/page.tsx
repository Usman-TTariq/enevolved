import type { Metadata } from "next";
import { Suspense } from "react";
import BrandsGridContent from "./BrandsGridContent";

export const metadata: Metadata = {
  title: "Available brands | Earnytics",
  description: "Browse and apply to Impact campaigns.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center text-gray-400">Loading…</div>
      }
    >
      <BrandsGridContent />
    </Suspense>
  );
}
