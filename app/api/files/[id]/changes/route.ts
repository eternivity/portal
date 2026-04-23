import { NextResponse } from "next/server";
import { canAccessFile } from "@/lib/file-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const supabase = createSupabaseAdminClient();
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("id,project_id,projects(freelancer_id)")
    .eq("id", params.id)
    .maybeSingle();

  if (fileError || !file) {
    return NextResponse.json({ error: "File not found" }, { status: fileError ? 500 : 404 });
  }

  const project = Array.isArray(file.projects) ? file.projects[0] : file.projects;
  const access = await canAccessFile(file.project_id, project.freelancer_id, "either");

  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("files")
    .update({ approval_status: "changes_requested" })
    .eq("id", params.id)
    .select("id,approval_status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body?.message?.trim()) {
    await supabase.from("messages").insert({
      project_id: file.project_id,
      sender_role: "client",
      sender_name: "Client",
      content: body.message.trim()
    });
  }

  return NextResponse.json({ file: data });
}
