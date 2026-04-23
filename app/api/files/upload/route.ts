import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFileExtension, isAllowedFile, uploadFile } from "@/lib/storage";

export async function POST(request: Request) {
  const authClient = createSupabaseServerClient();
  const { data: authData } = await authClient.auth.getUser();
  const user = authData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const projectId = formData.get("projectId");

  if (!(file instanceof File) || typeof projectId !== "string") {
    return NextResponse.json({ error: "File and projectId are required" }, { status: 400 });
  }

  if (!isAllowedFile(file)) {
    return NextResponse.json({ error: "Invalid file type or file is larger than 50MB" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id,freelancer_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: projectError ? 500 : 404 });
  }

  if (project.freelancer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const uploaded = await uploadFile(file, user.id, project.id);
  const { data, error } = await supabase
    .from("files")
    .insert({
      project_id: project.id,
      uploaded_by: user.id,
      file_name: file.name,
      file_url: uploaded.path,
      file_size: file.size,
      file_type: getFileExtension(file.name),
      approval_status: "pending"
    })
    .select("id,project_id,file_name,file_url,file_size,file_type,approval_status,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: data, path: uploaded.path, url: uploaded.url });
}
