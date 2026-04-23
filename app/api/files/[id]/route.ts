import { NextResponse } from "next/server";
import { canAccessFile } from "@/lib/file-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteFile } from "@/lib/storage";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data: file, error } = await supabase
    .from("files")
    .select("id,file_url,project_id,projects(freelancer_id)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !file) {
    return NextResponse.json({ error: "File not found" }, { status: error ? 500 : 404 });
  }

  const project = Array.isArray(file.projects) ? file.projects[0] : file.projects;
  const access = await canAccessFile(file.project_id, project.freelancer_id, "freelancer");

  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteFile(file.file_url);
  return NextResponse.json({ ok: true });
}
