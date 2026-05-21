import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import PORMerchantsContent from "./PORMerchantsContent";

export const metadata: Metadata = { title: "PaidOnResults Merchants | Earnytics Admin" };
export default function Page() {
  return <AdminShell><PORMerchantsContent /></AdminShell>;
}
