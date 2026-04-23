import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function validatePortalCookie(projectId: string) {
  const token = cookies().get("portal_token")?.value;

  if (!token) {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("verify_portal_token", {
    token,
    project_id: projectId
  });

  return !error && Boolean(data);
}
