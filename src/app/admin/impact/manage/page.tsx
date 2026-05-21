import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactManageContent from "./ImpactManageContent";

export const metadata: Metadata = {
  title: "Impact Actions | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactManageContent />
    </AdminShell>
  );
}
