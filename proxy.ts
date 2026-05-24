import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth", "/api/trpc", "/api/auth", "/api-internal", "/socket"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const hasAccess = request.cookies.has("tdl_access");
  const hasRefresh = request.cookies.has("tdl_refresh");

  let refreshed = false;
  let newCookies: string[] = [];

  if (!hasAccess && hasRefresh) {
    try {
      const cookieHeader = request.headers.get("cookie") ?? "";
      const apiUrl = process.env.API_URL!;
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
        },
      });

      if (res.ok) {
        newCookies = res.headers.getSetCookie();
        if (newCookies.length > 0) {
          refreshed = true;
        }
      }
    } catch (e) {
      console.error("Token refresh failed in proxy middleware:", e);
    }
  }

  if (!isPublic && !hasAccess && !refreshed) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if ((hasAccess || refreshed) && pathname === "/auth") {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    if (refreshed) {
      for (const cookie of newCookies) {
        response.headers.append("Set-Cookie", cookie);
      }
    }
    return response;
  }

  if (refreshed) {
    const response = NextResponse.next();
    for (const cookie of newCookies) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
