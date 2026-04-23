import { NextResponse } from "next/server";
import { canAccessFile } from "@/lib/file-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const expires = Number(searchParams.get("expires") ?? "86400");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: file, error } = await supabase
    .from("files")
    .select("project_id,projects(freelancer_id)")
    .eq("file_url", path)
    .maybeSingle();

  if (error || !file) {
    return NextResponse.json({ error: "File not found" }, { status: error ? 500 : 404 });
  }

  const project = Array.isArray(file.projects) ? file.projects[0] : file.projects;
  const access = await canAccessFile(file.project_id, project.freelancer_id, "either");

  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expiresIn = access.via === "freelancer" ? 60 * 60 * 24 * 365 : Math.min(Math.max(expires, 60), 86400);
  const signedUrl = await getSignedUrl(path, expiresIn);

  return NextResponse.json({ signedUrl });
}
