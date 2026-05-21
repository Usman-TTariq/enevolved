import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import TradeTrackerConnectionContent from "./TradeTrackerConnectionContent";

export const metadata: Metadata = { title: "TradeTracker Connection | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <TradeTrackerConnectionContent />
    </AdminShell>
  );
}
