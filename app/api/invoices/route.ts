import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateInvoiceTotals } from "@/lib/invoice-data";

export async function POST(request: Request) {
  const authClient = createSupabaseServerClient();
  const { data: authData } = await authClient.auth.getUser();

  if (!authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    projectId?: string;
    clientId?: string;
    currency?: string;
    dueDate?: string;
    taxRate?: number;
    lineItems?: Array<{ description: string; quantity: number; unit_price: number }>;
  } | null;

  if (!body?.projectId || !body.clientId || !body.lineItems?.length) {
    return NextResponse.json({ error: "Project, client, and line items are required" }, { status: 400 });
  }

  const totals = calculateInvoiceTotals(
    body.lineItems.map((item, index) => ({
      id: `line_${index + 1}`,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price)
    })),
    body.taxRate ?? 0
  );

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      project_id: body.projectId,
      freelancer_id: authData.user.id,
      client_id: body.clientId,
      invoice_number: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      line_items: body.lineItems,
      subtotal: totals.subtotal,
      tax_rate: body.taxRate ?? 0,
      total: totals.total,
      currency: body.currency ?? "USD",
      status: "draft",
      due_date: body.dueDate ?? null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}
