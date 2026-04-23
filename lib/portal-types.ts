export type PortalFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  approval_status: "pending" | "approved" | "changes_requested";
};

export type PortalInvoice = {
  id: string;
  invoice_number: string;
  line_items: Array<{ description: string; quantity: number; unit_price: number }>;
  subtotal: number;
  tax_rate: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "viewed" | "paid";
  due_date: string | null;
  stripe_payment_link: string | null;
};

export type PortalMessage = {
  id: string;
  sender_role: "freelancer" | "client";
  sender_name: string | null;
  content: string;
  created_at: string;
};

export type PortalContract = {
  id: string;
  content_html: string;
  client_signed_at: string | null;
  client_signature_name: string | null;
};

export type PortalData = {
  project: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  freelancer: {
    full_name: string;
    brand_color: string;
    avatar_url: string | null;
  };
  files: PortalFile[];
  invoices: PortalInvoice[];
  messages: PortalMessage[];
  contract: PortalContract | null;
};
