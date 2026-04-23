import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page">
      <Sidebar />
      <main className="ml-[200px] min-h-screen p-6">{children}</main>
    </div>
  );
}
