import type { Metadata } from "next";
import AdminDashboardContent from "./AdminDashboardContent";

export const metadata: Metadata = {
  title: "Admin Dashboard | Earnytics",
  description: "Earnytics admin dashboard.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
