import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import PORConnectionContent from "./PORConnectionContent";

export const metadata: Metadata = { title: "PaidOnResults Connection | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <PORConnectionContent />
    </AdminShell>
  );
}
