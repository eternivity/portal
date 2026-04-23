import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validatePortalCookie } from "@/lib/portal-auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Signature name is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("id,project_id")
    .eq("id", params.id)
    .maybeSingle();

  if (contractError || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: contractError ? 500 : 404 });
  }

  const valid = await validatePortalCookie(contract.project_id);

  if (!valid) {
    return NextResponse.json({ error: "Invalid portal token" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({
      client_signed_at: new Date().toISOString(),
      client_signature_name: name
    })
    .eq("id", params.id)
    .select("id,client_signed_at,client_signature_name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contract: data });
}
