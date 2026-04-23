import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page">
      <Sidebar />
      <main className="min-h-screen p-4 pt-[136px] sm:p-6 sm:pt-[146px] md:ml-[200px] md:p-6 md:pt-6">{children}</main>
    </div>
  );
}
