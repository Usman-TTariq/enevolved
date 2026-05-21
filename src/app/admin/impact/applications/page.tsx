import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactApplicationsContent from "./ImpactApplicationsContent";

export const metadata: Metadata = {
  title: "Impact Applications | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactApplicationsContent />
    </AdminShell>
  );
}
