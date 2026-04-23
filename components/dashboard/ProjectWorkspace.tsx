"use client";

import { useState } from "react";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { InvoiceTab } from "@/components/dashboard/invoice/InvoiceTab";
import { Button } from "@/components/ui/Button";
import type { DashboardProjectDetail } from "@/lib/dashboard-data";
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

export function ProjectWorkspace({ project }: { project: DashboardProjectDetail }) {
  const [activeTab, setActiveTab] = useState<Tab>("Fatura");
  const portalHost = project.subdomain ? `${project.subdomain}.portalkit.app` : "portalkit.app";

  return (
    <article>
      <p className="mb-2 text-[13px] leading-[1.6] text-text-secondary">Projeler / {project.title}</p>
      <h1 className="mb-1 text-[22px] font-medium leading-tight">{project.title}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="text-[13px] text-text-secondary">{project.client}</p>
        <span className={cn("rounded-full px-2 py-1 text-[10px] font-medium leading-[1.6]", statusStyles[project.status])}>
          {statusLabels[project.status]}
        </span>
      </div>

      <div className="mb-6 flex overflow-x-auto border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={cn(
              "shrink-0 px-4 py-3 text-[13px] text-text-secondary",
              activeTab === tab && "border-b-2 border-purple-600 font-medium text-purple-600"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="break-all font-mono text-[13px] text-purple-800">Portal linki: {portalHost}/{project.slug}</p>
        <Button
          variant="secondary"
          className="w-full px-3 py-[6px] text-[12px] sm:w-auto"
          onClick={() => navigator.clipboard.writeText(`https://${portalHost}/${project.slug}`)}
        >
          Kopyala
        </Button>
      </div>

      {activeTab === "Genel Bakış" ? (
        <section className="grid grid-cols-1 gap-[10px] lg:grid-cols-3">
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
      {activeTab === "Dosyalar" ? <FileUploader projectId={project.id} initialFiles={project.files} /> : null}
      {activeTab === "Fatura" ? <InvoiceTab projectId={project.id} projectName={project.title} clientName={project.client} clientId={project.clientId} /> : null}
      {activeTab === "Mesajlar" ? <div className="rounded-xl border bg-white p-6 text-[13px] text-text-secondary">Mesajlar sekmesi yakında.</div> : null}
      {activeTab === "Sözleşme" ? <div className="rounded-xl border bg-white p-6 text-[13px] text-text-secondary">Sözleşme sekmesi yakında.</div> : null}
    </article>
  );
}
