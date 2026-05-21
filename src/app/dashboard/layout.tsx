import type { ReactNode } from "react";
import PublisherDashboardNavbar from "@/components/publisher/PublisherDashboardNavbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublisherDashboardNavbar />
      {/* navbar h-16 = 4rem + 1px border */}
      <div className="pt-[calc(4rem+1px)]">{children}</div>
    </div>
  );
}
