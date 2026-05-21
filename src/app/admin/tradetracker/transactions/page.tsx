import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import TradeTrackerTransactionsContent from "./TradeTrackerTransactionsContent";

export const metadata: Metadata = { title: "TradeTracker Transactions | Earnytics Admin" };

export default function Page() {
  return (
    <AdminShell>
      <TradeTrackerTransactionsContent />
    </AdminShell>
  );
}
