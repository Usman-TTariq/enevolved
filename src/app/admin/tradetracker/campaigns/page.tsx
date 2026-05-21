import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import TradeTrackerCampaignsContent from "./TradeTrackerCampaignsContent";

export const metadata: Metadata = { title: "TradeTracker Campaigns | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <TradeTrackerCampaignsContent />
    </AdminShell>
  );
}
