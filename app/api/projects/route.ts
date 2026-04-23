import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const authClient = createSupabaseServerClient();
  const { data: authData } = await authClient.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    clientId?: string;
    slug?: string;
    color?: string;
    description?: string;
  } | null;

  if (!body?.title?.trim() || !body.clientId?.trim()) {
    return NextResponse.json({ error: "Title and client are required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", body.clientId)
    .eq("freelancer_id", authData.user.id)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      freelancer_id: authData.user.id,
      client_id: body.clientId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      slug: body.slug?.trim() || body.title.trim(),
      color: body.color?.trim() || "#534AB7",
      status: "active"
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
