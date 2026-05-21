import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import PORTransactionsContent from "./PORTransactionsContent";

export const metadata: Metadata = { title: "PaidOnResults Transactions | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <PORTransactionsContent />
    </AdminShell>
  );
}
