"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import AdminSignupsSection from "@/components/admin/AdminSignupsSection";

export default function AdminDashboardContent() {
  return (
    <AdminShell>
      <AdminDashboardOverview />
      <div className="mt-16 border-t border-gray-100 pt-12">
        <AdminSignupsSection />
      </div>
    </AdminShell>
  );
}
