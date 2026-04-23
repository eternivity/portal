import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const slugPattern = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim().toLowerCase() ?? "";

  if (!slugPattern.test(slug)) {
    return NextResponse.json({
      available: false,
      valid: false,
      message: "Subdomain 3-63 karakter, kucuk harf, rakam veya tire icermeli."
    });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("subdomain", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ available: false, valid: true, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    available: !data,
    valid: true
  });
}
