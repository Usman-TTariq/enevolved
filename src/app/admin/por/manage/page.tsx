import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import PORManageContent from "./PORManageContent";

export const metadata: Metadata = { title: "PaidOnResults Sync & Manage | Earnytics Admin" };
export default function Page() {
  return <AdminShell><PORManageContent /></AdminShell>;
}
