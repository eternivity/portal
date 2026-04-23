"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InvoiceDocument } from "@/components/dashboard/invoice/InvoiceDocument";
import type { DashboardInvoice, InvoiceLineItem } from "@/lib/invoice-data";
import { calculateInvoiceTotals } from "@/lib/invoice-data";

type NewInvoiceModalProps = {
  projectName: string;
  clientName: string;
  open: boolean;
  onClose: () => void;
  onSave: (invoice: DashboardInvoice) => void;
};

export function NewInvoiceModal({ projectName, clientName, open, onClose, onSave }: NewInvoiceModalProps) {
  const [currency, setCurrency] = useState<DashboardInvoice["currency"]>("USD");
  const [dueDate, setDueDate] = useState("2026-05-08");
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { id: "new-1", description: "Yeni hizmet", quantity: 1, unit_price: 0 }
  ]);

  if (!open) {
    return null;
  }

  const totals = calculateInvoiceTotals(items, 0);
  const invoice: DashboardInvoice = {
    id: `inv_${Date.now()}`,
    project_id: "demo-project",
    freelancer_id: "demo-freelancer",
    client_id: "demo-client",
    freelancer_name: "Ali Yılmaz",
    freelancer_email: "ali@portalkit.app",
    freelancer_city: "İstanbul",
    client_name: clientName,
    client_email: "hello@client.com",
    client_company: clientName,
    project_name: projectName,
    invoice_number: "INV-2024-042",
    line_items: items,
    subtotal: totals.subtotal,
    tax_rate: 0,
    total: totals.total,
    currency,
    status: "draft",
    due_date: dueDate,
    stripe_payment_link: null,
    viewed_at: null,
    paid_at: null,
    sent_at: null,
    created_at: new Date().toISOString()
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg-page p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[18px] font-medium">Yeni fatura oluştur</h1>
          <button className="grid size-8 place-items-center text-text-secondary" onClick={onClose} aria-label="Kapat">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border bg-white p-4">
          <Input value={clientName} readOnly />
          <select value={currency} onChange={(event) => setCurrency(event.target.value as DashboardInvoice["currency"])} className="h-10 rounded-lg border bg-white px-3 text-[13px]">
            <option>USD</option>
            <option>EUR</option>
            <option>TRY</option>
          </select>
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>

        <InvoiceDocument invoice={invoice} editable onItemsChange={setItems} />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={async () => {
              await fetch("/api/invoices", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  projectId: invoice.project_id,
                  clientId: invoice.client_id,
                  currency: invoice.currency,
                  dueDate: invoice.due_date,
                  taxRate: invoice.tax_rate,
                  lineItems: invoice.line_items
                })
              });
              onSave(invoice);
            }}
          >
            Taslak kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
