"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatCurrency } from "@/lib/helpers";
import type { DashboardInvoice, InvoiceLineItem, InvoiceStatus } from "@/lib/invoice-data";
import { calculateInvoiceTotals, formatInvoiceDate } from "@/lib/invoice-data";

const statusStyles: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: "Taslak", className: "bg-gray-50 text-gray-600" },
  sent: { label: "Gönderildi", className: "bg-amber-50 text-amber-600" },
  viewed: { label: "Görüntülendi", className: "bg-[#EAF3FF] text-[#2F74C0]" },
  paid: { label: "Ödendi", className: "bg-teal-50 text-teal-600" }
};

type InvoiceDocumentProps = {
  invoice: DashboardInvoice;
  editable?: boolean;
  onItemsChange?: (items: InvoiceLineItem[]) => void;
};

export function InvoiceDocument({ invoice, editable = false, onItemsChange }: InvoiceDocumentProps) {
  const totals = calculateInvoiceTotals(invoice.line_items, invoice.tax_rate);
  const status = statusStyles[invoice.status];

  function updateItem(id: string, patch: Partial<InvoiceLineItem>) {
    onItemsChange?.(invoice.line_items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onItemsChange?.(invoice.line_items.filter((item) => item.id !== id));
  }

  function addItem() {
    onItemsChange?.([...invoice.line_items, { id: crypto.randomUUID(), description: "Yeni hizmet", quantity: 1, unit_price: 0 }]);
  }

  return (
    <div className="rounded-xl border bg-white p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[16px] font-medium leading-[1.6]">{invoice.freelancer_name}</p>
          <p className="mt-[2px] break-words text-[12px] leading-[1.6] text-text-secondary">
            {invoice.freelancer_email} · {invoice.freelancer_city}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] uppercase leading-[1.6] tracking-wide text-text-secondary">FATURA NO</p>
          <p className="text-[15px] font-medium leading-[1.6]">#{invoice.invoice_number}</p>
          <span className={cn("mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-medium leading-[1.6]", status.className)}>{status.label}</span>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-[5px] text-[11px] uppercase leading-[1.6] tracking-wide text-text-secondary">Gönderen</p>
          <p className="text-[13px] font-medium leading-[1.6]">{invoice.freelancer_name}</p>
          <p className="text-[12px] leading-[1.6] text-text-secondary">
            {invoice.freelancer_email}
            <br />
            {invoice.freelancer_city}
          </p>
        </div>
        <div>
          <p className="mb-[5px] text-[11px] uppercase leading-[1.6] tracking-wide text-text-secondary">Alıcı</p>
          <p className="text-[13px] font-medium leading-[1.6]">{invoice.client_name}</p>
          <p className="text-[12px] leading-[1.6] text-text-secondary">
            {invoice.client_email}
            <br />
            {invoice.client_company}
          </p>
        </div>
      </div>

      <div className="mb-3 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr>
              {["Hizmet", "Adet", "Birim fiyat", "Toplam"].map((heading, index) => (
                <th key={heading} className={cn("border-b px-2 py-[6px] text-[11px] font-medium uppercase leading-[1.6] tracking-wide text-text-secondary", index > 0 && "text-right")}>
                  {heading}
                </th>
              ))}
              {editable ? <th className="border-b px-2 py-[6px]" /> : null}
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((item) => (
              <tr key={item.id} className="group">
                <td className="border-b px-2 py-[9px] text-[12px] text-text-primary">
                  {editable ? <input className="w-full bg-transparent outline-none" value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} /> : item.description}
                </td>
                <td className="border-b px-2 py-[9px] text-right text-[12px]">
                  {editable ? <input className="w-12 bg-transparent text-right outline-none" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })} /> : item.quantity}
                </td>
                <td className="border-b px-2 py-[9px] text-right text-[12px]">
                  {editable ? <input className="w-24 bg-transparent text-right outline-none" type="number" min="0" value={item.unit_price} onChange={(event) => updateItem(item.id, { unit_price: Number(event.target.value) })} /> : formatCurrency(item.unit_price, invoice.currency)}
                </td>
                <td className="border-b px-2 py-[9px] text-right text-[12px]">{formatCurrency(item.quantity * item.unit_price, invoice.currency)}</td>
                {editable ? (
                  <td className="border-b px-2 py-[9px] text-right">
                    <button className="opacity-0 transition-opacity group-hover:opacity-100" onClick={() => removeItem(item.id)} aria-label="Kalemi sil">
                      <X size={14} />
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editable ? (
        <Button variant="ghost" className="mb-4 px-0 text-[12px] text-purple-600 hover:bg-transparent" onClick={addItem}>
          + Kalem ekle
        </Button>
      ) : null}

      <div className="mb-5 flex flex-col items-end gap-[5px]">
        <div className="flex gap-[40px] text-[12px] text-text-secondary">
          <span>Ara toplam</span>
          <span>{formatCurrency(totals.subtotal, invoice.currency)}</span>
        </div>
        <div className="flex gap-[40px] text-[12px] text-text-secondary">
          <span>KDV (%{invoice.tax_rate})</span>
          <span>{formatCurrency(totals.tax, invoice.currency)}</span>
        </div>
        <div className="mt-1 flex gap-[40px] border-t pt-2 text-[15px] font-medium text-text-primary">
          <span>Toplam</span>
          <span>{formatCurrency(totals.total, invoice.currency)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-amber-50 px-[14px] py-[10px] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-amber-600">Son ödeme tarihi</p>
        <p className="text-[13px] font-medium text-amber-600">{formatInvoiceDate(invoice.due_date)}</p>
      </div>
    </div>
  );
}
