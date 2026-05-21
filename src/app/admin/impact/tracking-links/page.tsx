import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactTrackingLinksContent from "./ImpactTrackingLinksContent";

export const metadata: Metadata = {
  title: "Impact Tracking Links | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactTrackingLinksContent />
    </AdminShell>
  );
}
