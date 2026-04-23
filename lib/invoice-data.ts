export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid";

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

export type DashboardInvoice = {
  id: string;
  project_id: string;
  freelancer_id: string;
  client_id: string;
  freelancer_name: string;
  freelancer_email: string;
  freelancer_city: string;
  client_name: string;
  client_email: string;
  client_company: string;
  project_name: string;
  invoice_number: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_rate: number;
  total: number;
  currency: "USD" | "EUR" | "TRY";
  status: InvoiceStatus;
  due_date: string;
  stripe_payment_link: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  sent_at: string | null;
  created_at: string;
};

export const sampleInvoice: DashboardInvoice = {
  id: "inv_demo_001",
  project_id: "brand-portal",
  freelancer_id: "demo-freelancer",
  client_id: "demo-client",
  freelancer_name: "Ali Yılmaz",
  freelancer_email: "ali@portalkit.app",
  freelancer_city: "İstanbul",
  client_name: "Nova Studio",
  client_email: "hello@novastudio.co",
  client_company: "Nova Studio",
  project_name: "Brand portal yenileme",
  invoice_number: "INV-2024-041",
  line_items: [
    { id: "li_1", description: "Portal arayüz tasarımı", quantity: 1, unit_price: 1600 },
    { id: "li_2", description: "Supabase entegrasyonu", quantity: 1, unit_price: 800 }
  ],
  subtotal: 2400,
  tax_rate: 0,
  total: 2400,
  currency: "USD",
  status: "draft",
  due_date: "2026-05-08",
  stripe_payment_link: null,
  viewed_at: null,
  paid_at: null,
  sent_at: null,
  created_at: "2026-04-23"
};

export function calculateInvoiceTotals(lineItems: InvoiceLineItem[], taxRate: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const tax = subtotal * (taxRate / 100);

  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
}

export function formatInvoiceDate(value: string | null) {
  if (!value) {
    return "Bekliyor";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
