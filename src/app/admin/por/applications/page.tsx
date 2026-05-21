import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import PORApplicationsContent from "./PORApplicationsContent";

export const metadata: Metadata = { title: "PaidOnResults Applications | Earnytics Admin" };
export default function Page() {
  return <AdminShell><PORApplicationsContent /></AdminShell>;
}
