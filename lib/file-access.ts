import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validatePortalCookie } from "@/lib/portal-auth";

export type FileAccessMode = "freelancer" | "portal" | "either";

export async function canAccessFile(projectId: string, freelancerId: string, mode: FileAccessMode) {
  if (mode === "portal" || mode === "either") {
    const validPortal = await validatePortalCookie(projectId);
    if (validPortal) {
      return { allowed: true, via: "portal" as const };
    }
  }

  if (mode === "freelancer" || mode === "either") {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (data.user?.id === freelancerId) {
      return { allowed: true, via: "freelancer" as const, userId: data.user.id };
    }
  }

  return { allowed: false };
}
