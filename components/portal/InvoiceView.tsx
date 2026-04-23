import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, invoiceTotal } from "@/lib/helpers";
import type { Invoice } from "@/types";

interface InvoiceViewProps {
  invoice: Invoice;
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label text-text-hint">Invoice</p>
          <h2 className="text-xl">{invoice.number}</h2>
        </div>
        <Badge tone={invoice.status === "paid" ? "success" : "warning"}>{invoice.status}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {invoice.lineItems.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 border-b pb-3 last:border-b-0">
            <span>{item.description}</span>
            <span>{formatCurrency(item.quantity * item.unitPrice, invoice.currency)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-lg font-medium">
        <span>Total</span>
        <span>{formatCurrency(invoiceTotal(invoice), invoice.currency)}</span>
      </div>
    </Card>
  );
}
