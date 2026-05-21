import type { Metadata } from "next";
import AdminLoginContent from "./AdminLoginContent";

export const metadata: Metadata = {
  title: "Admin Login | Earnytics",
  description: "Earnytics admin sign in.",
};

export default function AdminLoginPage() {
  return <AdminLoginContent />;
}
