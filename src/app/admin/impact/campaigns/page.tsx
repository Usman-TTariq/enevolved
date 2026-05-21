import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactCampaignsContent from "./ImpactCampaignsContent";

export const metadata: Metadata = {
  title: "Impact Campaigns | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactCampaignsContent />
    </AdminShell>
  );
}
