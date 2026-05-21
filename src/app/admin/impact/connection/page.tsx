import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ImpactConnectionContent from "./ImpactConnectionContent";

export const metadata: Metadata = {
  title: "Impact Connection | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <ImpactConnectionContent />
    </AdminShell>
  );
}
