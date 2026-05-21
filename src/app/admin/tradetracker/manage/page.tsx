import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import TradeTrackerManageContent from "./TradeTrackerManageContent";

export const metadata: Metadata = { title: "TradeTracker Sync & Rebuild | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <TradeTrackerManageContent />
    </AdminShell>
  );
}
