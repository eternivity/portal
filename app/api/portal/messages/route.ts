import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validatePortalCookie } from "@/lib/portal-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    projectId?: string;
    content?: string;
    senderName?: string;
  } | null;

  if (!body?.projectId || !body.content?.trim()) {
    return NextResponse.json({ error: "Project and content are required" }, { status: 400 });
  }

  const valid = await validatePortalCookie(body.projectId);

  if (!valid) {
    return NextResponse.json({ error: "Invalid portal token" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      project_id: body.projectId,
      sender_role: "client",
      sender_name: body.senderName?.trim() || "Client",
      content: body.content.trim()
    })
    .select("id,sender_role,sender_name,content,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
