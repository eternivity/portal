"use client";

import type { DashboardInvoice } from "@/lib/invoice-data";
import { formatInvoiceDate } from "@/lib/invoice-data";
import { Button } from "@/components/ui/Button";

type InvoiceActionsProps = {
  invoice: DashboardInvoice;
  onSend: () => void;
  onEdit: () => void;
};

export function InvoiceActions({ invoice, onSend, onEdit }: InvoiceActionsProps) {
  async function downloadPdf() {
    window.open(`/api/invoices/${invoice.id}/pdf`, "_blank", "noopener,noreferrer");
  }

  async function copyPaymentLink() {
    if (invoice.stripe_payment_link) {
      await navigator.clipboard.writeText(invoice.stripe_payment_link);
    }
  }

  return (
    <div>
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.06em] text-text-secondary">İşlemler</h2>
        {invoice.status === "draft" ? (
          <Button className="mb-[6px] w-full" onClick={onSend}>Müşteriye gönder</Button>
        ) : null}
        {invoice.status === "sent" || invoice.status === "viewed" ? (
          <p className="mb-[6px] rounded-xl bg-bg-secondary py-2 text-center text-[12px] italic text-text-secondary">Ödeme bekleniyor...</p>
        ) : null}
        {invoice.status === "paid" ? (
          <p className="mb-[6px] rounded-xl bg-teal-50 py-2 text-center text-[12px] font-medium text-teal-600">Ödendi</p>
        ) : null}
        <div className="space-y-[6px]">
          <Button variant="secondary" className="w-full" onClick={downloadPdf}>PDF indir</Button>
          <Button variant="secondary" className="w-full" onClick={copyPaymentLink}>Ödeme linki kopyala</Button>
          {invoice.status === "draft" ? <Button variant="secondary" className="w-full" onClick={onEdit}>Faturayı düzenle</Button> : null}
          <Button variant="ghost" className="w-full text-[12px] text-text-secondary">Faturayı sil</Button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.06em] text-text-secondary">Durum</h2>
        {[
          ["Oluşturuldu", invoice.created_at],
          ["Gönderildi", invoice.sent_at],
          ["Görüntülendi", invoice.viewed_at],
          ["Ödendi", invoice.paid_at]
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between border-b py-[5px] text-[12px] last:border-b-0">
            <span className="text-text-secondary">{label}</span>
            <span className={value ? "font-medium" : "text-text-secondary"}>{formatInvoiceDate(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
