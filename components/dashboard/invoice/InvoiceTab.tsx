"use client";

import { useState } from "react";
import { InvoiceActions } from "@/components/dashboard/invoice/InvoiceActions";
import { InvoiceDocument } from "@/components/dashboard/invoice/InvoiceDocument";
import { NewInvoiceModal } from "@/components/dashboard/invoice/NewInvoiceModal";
import { Button } from "@/components/ui/Button";
import type { DashboardInvoice } from "@/lib/invoice-data";
import { sampleInvoice } from "@/lib/invoice-data";

export function InvoiceTab({
  projectId,
  projectName,
  clientName,
  clientId
}: {
  projectId: string;
  projectName: string;
  clientName: string;
  clientId: string;
}) {
  const [invoice, setInvoice] = useState<DashboardInvoice>({
    ...sampleInvoice,
    project_id: projectId,
    client_id: clientId,
    project_name: projectName,
    client_name: clientName,
    client_company: clientName
  });
  const [modalOpen, setModalOpen] = useState(false);

  async function sendInvoice() {
    setInvoice((current) => ({
      ...current,
      status: "sent",
      sent_at: new Date().toISOString(),
      stripe_payment_link: current.stripe_payment_link ?? "https://stripe.com"
    }));
    await fetch(`/api/invoices/${invoice.id}/send`, { method: "POST" });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button className="px-[14px] py-[6px] text-[12px]" onClick={() => setModalOpen(true)}>
          Yeni fatura oluştur
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        <InvoiceDocument invoice={invoice} />
        <InvoiceActions invoice={invoice} onSend={sendInvoice} onEdit={() => setModalOpen(true)} />
      </div>
      <NewInvoiceModal
        projectId={projectId}
        clientId={clientId}
        projectName={projectName}
        clientName={clientName}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(nextInvoice) => {
          setInvoice(nextInvoice);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
