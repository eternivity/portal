import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resend } from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { PaymentReceivedClientEmail } from "@/emails/PaymentReceivedClientEmail";
import { PaymentReceivedFreelancerEmail } from "@/emails/PaymentReceivedFreelancerEmail";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    event = webhookSecret && signature
      ? stripe.webhooks.constructEvent(body, signature, webhookSecret)
      : JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let invoiceId = session.metadata?.invoice_id;

    if (!invoiceId && session.payment_link) {
      const paymentLink = await stripe.paymentLinks.retrieve(String(session.payment_link));
      invoiceId = paymentLink.metadata?.invoice_id;
    }

    if (invoiceId) {
      const supabase = createSupabaseAdminClient();
      const { data: invoice } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", invoiceId)
        .select("invoice_number,total,currency,clients(email),profiles(email)")
        .maybeSingle();

      const typedInvoice = invoice as
        | {
            invoice_number?: string;
            total?: number;
            currency?: string;
            clients?: { email?: string } | Array<{ email?: string }>;
            profiles?: { email?: string } | Array<{ email?: string }>;
          }
        | null;
      const clientSource = typedInvoice?.clients;
      const profileSource = typedInvoice?.profiles;
      const clientEmail = Array.isArray(clientSource) ? clientSource[0]?.email : clientSource?.email;
      const freelancerEmail = Array.isArray(profileSource) ? profileSource[0]?.email : profileSource?.email;
      const to = [clientEmail, freelancerEmail].filter(Boolean) as string[];

      const amount = `${typedInvoice?.currency ?? "USD"} ${typedInvoice?.total ?? ""}`.trim();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://portalkit.app";

      if (freelancerEmail) {
        await resend.emails.send({
          from: "PortalKit <billing@portalkit.app>",
          to: freelancerEmail,
          subject: `Fatura ödendi: ${typedInvoice?.invoice_number ?? invoiceId}`,
          react: PaymentReceivedFreelancerEmail({
            clientName: "Müşteri",
            amount,
            projectName: "PortalKit projesi",
            date: new Date().toLocaleDateString("tr-TR")
          })
        });
      }

      if (clientEmail) {
        await resend.emails.send({
          from: "PortalKit <billing@portalkit.app>",
          to: clientEmail,
          subject: "Ödemeniz alındı — Teşekkürler",
          react: PaymentReceivedClientEmail({
            amount,
            invoiceNumber: typedInvoice?.invoice_number ?? invoiceId,
            pdfLink: `${appUrl}/api/invoices/${invoiceId}/pdf`
          })
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
