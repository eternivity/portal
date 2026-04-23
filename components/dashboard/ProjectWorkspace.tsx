"use client";

import { useState } from "react";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { InvoiceTab } from "@/components/dashboard/invoice/InvoiceTab";
import { Button } from "@/components/ui/Button";
import type { DashboardProject } from "@/lib/dashboard-data";
import { cn } from "@/lib/helpers";

const tabs = ["Genel Bakış", "Dosyalar", "Fatura", "Mesajlar", "Sözleşme"] as const;
type Tab = (typeof tabs)[number];

const statusStyles = {
  active: "bg-teal-50 text-teal-600",
  review: "bg-amber-50 text-amber-600",
  completed: "bg-gray-50 text-gray-600"
};

const statusLabels = {
  active: "Aktif",
  review: "İnceleme",
  completed: "Tamamlandı"
};

const sampleFiles = [
  { id: "sample-file-1", file_name: "brand-guidelines.pdf", file_url: "demo/sample-file-1.pdf", file_size: 2480000, file_type: "pdf", approval_status: "pending" as const },
  { id: "sample-file-2", file_name: "homepage-preview.png", file_url: "demo/sample-file-2.png", file_size: 940000, file_type: "png", approval_status: "approved" as const },
  { id: "sample-file-3", file_name: "launch-assets.zip", file_url: "demo/sample-file-3.zip", file_size: 12800000, file_type: "zip", approval_status: "changes_requested" as const }
];

export function ProjectWorkspace({ project }: { project: DashboardProject }) {
  const [activeTab, setActiveTab] = useState<Tab>("Fatura");

  return (
    <article>
      <p className="mb-2 text-[13px] leading-[1.6] text-text-secondary">Projeler / {project.title}</p>
      <h1 className="mb-1 text-[22px] font-medium leading-tight">{project.title}</h1>
      <div className="mb-6 flex items-center gap-3">
        <p className="text-[13px] text-text-secondary">{project.client}</p>
        <span className={cn("rounded-full px-2 py-1 text-[10px] font-medium leading-[1.6]", statusStyles[project.status])}>
          {statusLabels[project.status]}
        </span>
      </div>

      <div className="mb-6 flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={cn(
              "px-4 py-3 text-[13px] text-text-secondary",
              activeTab === tab && "border-b-2 border-purple-600 font-medium text-purple-600"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
        <p className="font-mono text-[13px] text-purple-800">Portal linki: ali.portalkit.app/{project.slug}</p>
        <Button variant="secondary" className="px-3 py-[6px] text-[12px]">Kopyala</Button>
      </div>

      {activeTab === "Genel Bakış" ? (
        <section className="grid grid-cols-3 gap-[10px]">
          <div className="rounded-xl border bg-white p-[14px]">
            <p className="text-[11px] text-text-secondary">Durum</p>
            <p className="mt-[6px] text-[18px] font-medium">{statusLabels[project.status]}</p>
          </div>
          <div className="rounded-xl border bg-white p-[14px]">
            <p className="text-[11px] text-text-secondary">Müşteri</p>
            <p className="mt-[6px] text-[18px] font-medium">{project.client}</p>
          </div>
          <div className="rounded-xl border bg-white p-[14px]">
            <p className="text-[11px] text-text-secondary">Teslim</p>
            <p className="mt-[6px] text-[18px] font-medium">{project.date}</p>
          </div>
        </section>
      ) : null}
      {activeTab === "Dosyalar" ? <FileUploader projectId={project.id} initialFiles={sampleFiles} /> : null}
      {activeTab === "Fatura" ? <InvoiceTab projectName={project.title} clientName={project.client} /> : null}
      {activeTab === "Mesajlar" ? <div className="rounded-xl border bg-white p-6 text-[13px] text-text-secondary">Mesajlar sekmesi yakında.</div> : null}
      {activeTab === "Sözleşme" ? <div className="rounded-xl border bg-white p-6 text-[13px] text-text-secondary">Sözleşme sekmesi yakında.</div> : null}
    </article>
  );
}
