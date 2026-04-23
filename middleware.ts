import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

async function getSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const isAppAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".");

  if (!isAppAsset && hostname.endsWith(".portalkit.app")) {
    const subdomain = hostname.replace(".portalkit.app", "");

    if (subdomain && subdomain !== "www" && subdomain !== "portalkit") {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-freelancer-subdomain", subdomain);

      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/portal-subdomain${pathname === "/" ? "" : pathname}`;

      const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders
        }
      });
      rewriteResponse.headers.set("x-freelancer-subdomain", subdomain);
      return rewriteResponse;
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const session = await getSession(request, response);

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  if (pathname.startsWith("/auth")) {
    const session = await getSession(request, response);

    if (session) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }

    return response;
  }

  if (pathname.startsWith("/portal") && pathname !== "/portal/expired") {
    const projectSlug = pathname.split("/").filter(Boolean)[1];
    const token = request.cookies.get("portal_token")?.value;

    if (!projectSlug || !token) {
      const expiredUrl = request.nextUrl.clone();
      expiredUrl.pathname = "/portal/expired";
      return NextResponse.rewrite(expiredUrl);
    }

    const verifyResponse = await fetch(new URL("/api/verify-portal-token", request.url), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ token, projectSlug })
    });

    const result = (await verifyResponse.json().catch(() => ({ valid: false }))) as { valid: boolean };

    if (!result.valid) {
      const expiredUrl = request.nextUrl.clone();
      expiredUrl.pathname = "/portal/expired";
      return NextResponse.rewrite(expiredUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
