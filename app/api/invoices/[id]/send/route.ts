import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { formatCurrency } from "@/lib/helpers";
import { sampleInvoice } from "@/lib/invoice-data";
import { InvoiceEmail } from "@/emails/InvoiceEmail";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const authClient = createSupabaseServerClient();
  const { data: authData } = await authClient.auth.getUser();

  if (!authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: dbInvoice } = await supabase
    .from("invoices")
    .select("*, projects(title), clients(name,email), profiles(full_name,email)")
    .eq("id", params.id)
    .maybeSingle();

  const invoice = dbInvoice ?? sampleInvoice;
  const amount = Number(invoice.total ?? sampleInvoice.total);
  const currency = String(invoice.currency ?? "USD").toLowerCase();
  const freelancerName = invoice.profiles?.full_name ?? sampleInvoice.freelancer_name;
  const clientEmail = invoice.clients?.email ?? sampleInvoice.client_email;
  const projectName = invoice.projects?.title ?? sampleInvoice.project_name;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://portalkit.app";

  const product = await stripe.products.create({
    name: `Invoice ${invoice.invoice_number ?? sampleInvoice.invoice_number}`,
    metadata: { invoice_id: params.id }
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100),
    currency,
    metadata: { invoice_id: params.id }
  });
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { invoice_id: params.id },
    after_completion: { type: "redirect", redirect: { url: `${appUrl}/portal/demo-project` } }
  });

  await supabase
    .from("invoices")
    .update({ stripe_payment_link: paymentLink.url, status: "sent" })
    .eq("id", params.id);

  await resend.emails.send({
    from: "PortalKit <invoices@portalkit.app>",
    to: clientEmail,
    subject: `${freelancerName} size ${formatCurrency(amount, String(invoice.currency ?? "USD"))} tutarında fatura gönderdi`,
    react: InvoiceEmail({
      freelancerName,
      amount: formatCurrency(amount, String(invoice.currency ?? "USD")),
      dueDate: invoice.due_date ?? sampleInvoice.due_date,
      projectName,
      paymentLink: paymentLink.url
    })
  });

  return NextResponse.json({ paymentLink: paymentLink.url, status: "sent" });
}
