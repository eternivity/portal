import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    projectSlug?: string;
  } | null;

  if (!body?.token || !body.projectSlug) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", body.projectSlug)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ valid: false }, { status: projectError ? 500 : 404 });
  }

  const { data, error } = await supabase.rpc("verify_portal_token", {
    token: body.token,
    project_id: project.id
  });

  if (error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({ valid: Boolean(data) });
}
