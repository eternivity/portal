import type { PortalInvoice } from "@/lib/portal-types";
import { formatCurrency } from "@/lib/helpers";

export function InvoiceTab({ invoice }: { invoice: PortalInvoice | null }) {
  if (!invoice) {
    return <div className="rounded-xl border bg-white p-[14px] text-[13px] text-text-secondary">Fatura bulunamadı.</div>;
  }

  const paid = invoice.status === "paid";

  return (
    <div className="max-w-xl rounded-xl border bg-white p-[14px]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-secondary">Fatura</p>
          <h2 className="mt-1 text-[18px] font-medium">{invoice.invoice_number}</h2>
        </div>
        {paid ? <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-medium text-teal-600">Ödendi</span> : null}
      </div>
      <div className="space-y-3">
        {invoice.line_items.map((item, index) => (
          <div key={`${item.description}-${index}`} className="flex justify-between border-b pb-3 text-[12px] last:border-b-0">
            <span>{item.description}</span>
            <span>{formatCurrency(item.quantity * item.unit_price, invoice.currency)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-[15px] font-medium">
        <span>Toplam</span>
        <span>{formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
      {!paid && invoice.stripe_payment_link ? (
        <a href={invoice.stripe_payment_link} className="mt-5 inline-flex rounded-lg bg-purple-600 px-4 py-2 text-[12px] font-medium text-purple-50">
          Şimdi öde
        </a>
      ) : null}
    </div>
  );
}
