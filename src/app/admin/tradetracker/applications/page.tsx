import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import TradeTrackerApplicationsContent from "./TradeTrackerApplicationsContent";

export const metadata: Metadata = { title: "TradeTracker Applications | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <TradeTrackerApplicationsContent />
    </AdminShell>
  );
}
