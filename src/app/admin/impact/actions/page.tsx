import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactActionsContent from "./ImpactActionsContent";

export const metadata: Metadata = {
  title: "Impact Actions / Sales | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactActionsContent />
    </AdminShell>
  );
}
