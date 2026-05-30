import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const PUBLIC_PATHS = ["/auth", "/api/trpc", "/api/auth", "/api-internal", "/socket"];

const IS_PROD = process.env.NODE_ENV === "production";

const STATIC_SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function buildCsp(nonce: string): string {
  const scriptSrc = IS_PROD
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' ws: wss:",
    "font-src 'self' data:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  for (const [key, value] of Object.entries(STATIC_SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const hasAccess = request.cookies.has("tdl_access");
  const hasRefresh = request.cookies.has("tdl_refresh");

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const renderInit = IS_PROD
    ? (() => {
        const headers = new Headers(request.headers);
        headers.set("x-nonce", nonce);
        headers.set("Content-Security-Policy", csp);
        return { request: { headers } };
      })()
    : undefined;

  let refreshed = false;
  let newCookies: string[] = [];

  if (!hasAccess && hasRefresh) {
    try {
      const cookieHeader = request.headers.get("cookie") ?? "";
      const apiUrl = process.env.API_URL ?? "";
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
      logger.warn("proxy: token refresh request failed", {
        path: pathname,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (!isPublic && !hasAccess && !refreshed) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/auth", request.url)), csp);
  }

  if ((hasAccess || refreshed) && pathname === "/auth") {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    if (refreshed) {
      for (const cookie of newCookies) {
        response.headers.append("Set-Cookie", cookie);
      }
    }
    return applySecurityHeaders(response, csp);
  }

  if (refreshed) {
    const response = NextResponse.next(renderInit);
    for (const cookie of newCookies) {
      response.headers.append("Set-Cookie", cookie);
    }
    return applySecurityHeaders(response, csp);
  }

  return applySecurityHeaders(NextResponse.next(renderInit), csp);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
