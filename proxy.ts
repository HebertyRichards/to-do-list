import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const PUBLIC_PATHS = ["/auth", "/api/trpc", "/api/auth", "/api-internal", "/socket"];

// Headers de segurança aplicados a toda resposta que passa pelo proxy.
// CSP estática: o Next ainda exige 'unsafe-inline'/'unsafe-eval' em script.
// Endurecer com nonce por request é o próximo passo possível justamente por
// estar no proxy. HSTS sem `preload` por enquanto (preload é difícil de reverter).
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' ws: wss:",
    "font-src 'self' data:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

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
      // Refresh falhou por motivo não-HTTP (rede/timeout). O fail-closed abaixo
      // trata o redirect; aqui só registramos no server para não perder o sinal.
      logger.warn("proxy: token refresh request failed", {
        path: pathname,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (!isPublic && !hasAccess && !refreshed) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/auth", request.url)));
  }

  if ((hasAccess || refreshed) && pathname === "/auth") {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    if (refreshed) {
      for (const cookie of newCookies) {
        response.headers.append("Set-Cookie", cookie);
      }
    }
    return withSecurityHeaders(response);
  }

  if (refreshed) {
    const response = NextResponse.next();
    for (const cookie of newCookies) {
      response.headers.append("Set-Cookie", cookie);
    }
    return withSecurityHeaders(response);
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
