import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactAllActionsContent from "./ImpactAllActionsContent";

export const metadata: Metadata = {
  title: "Impact All Actions | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactAllActionsContent />
    </AdminShell>
  );
}
