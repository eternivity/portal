"use client";

import { useState } from "react";
import { ContractTab } from "@/components/portal/tabs/ContractTab";
import { FilesTab } from "@/components/portal/tabs/FilesTab";
import { InvoiceTab } from "@/components/portal/tabs/InvoiceTab";
import { MessagesTab } from "@/components/portal/tabs/MessagesTab";
import type { PortalData } from "@/lib/portal-types";
import { cn } from "@/lib/helpers";

const tabs = ["Dosyalar", "Fatura", "Mesajlar", "Sözleşme"] as const;
type Tab = (typeof tabs)[number];

const statusLabels: Record<string, string> = {
  active: "Aktif",
  review: "İncelemede",
  completed: "Tamamlandı",
  archived: "Arşiv"
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortalShell({ data }: { data: PortalData }) {
  const [activeTab, setActiveTab] = useState<Tab>("Dosyalar");
  const brandColor = data.freelancer.brand_color || "#534AB7";

  return (
    <main className="min-h-screen bg-bg-page">
      <header className="flex h-[72px] items-center justify-between px-6" style={{ backgroundColor: brandColor }}>
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-full bg-white/20 text-[11px] font-medium text-white">
            {initials(data.freelancer.full_name)}
          </div>
          <div>
            <h1 className="text-[15px] font-medium leading-[1.6] text-white">{data.project.title}</h1>
            <p className="text-[12px] leading-[1.6] text-white/70">{data.freelancer.full_name} tarafından paylaşıldı</p>
          </div>
        </div>
        <span className="rounded-full bg-white/15 px-[10px] py-[3px] text-[11px] font-medium leading-[1.6] text-white">
          {statusLabels[data.project.status] ?? data.project.status}
        </span>
      </header>

      <nav className="flex border-b bg-white px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={cn("border-b-2 border-transparent px-4 py-3 text-[13px] text-text-secondary", activeTab === tab && "font-medium")}
            style={{
              borderBottomColor: activeTab === tab ? brandColor : "transparent",
              color: activeTab === tab ? brandColor : undefined
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="p-6">
        {activeTab === "Dosyalar" ? <FilesTab initialFiles={data.files} /> : null}
        {activeTab === "Fatura" ? <InvoiceTab invoice={data.invoices[0] ?? null} /> : null}
        {activeTab === "Mesajlar" ? (
          <MessagesTab projectId={data.project.id} brandColor={brandColor} initialMessages={data.messages} />
        ) : null}
        {activeTab === "Sözleşme" ? <ContractTab contract={data.contract} brandColor={brandColor} /> : null}
      </section>
    </main>
  );
}
