import type { NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "";

interface HeadersWithGetSetCookie extends Headers {
  getSetCookie(): string[];
}

function extractSetCookies(headers: Headers): string[] {
  const h = headers as HeadersWithGetSetCookie;
  if (typeof h.getSetCookie === "function") {
    return h.getSetCookie();
  }
  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

interface ActionMap {
  method: "POST" | "DELETE";
  path: string;
}

const ALLOWED: Record<string, ActionMap> = {
  login: { method: "POST", path: "/auth/login" },
  register: { method: "POST", path: "/auth/register" },
  logout: { method: "POST", path: "/auth/logout" },
  refresh: { method: "POST", path: "/auth/refresh" },
  "verify-email": { method: "POST", path: "/auth/verify-email" },
  "delete-account": { method: "DELETE", path: "/auth/account" },
};

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") ?? "";
  const mapping = ALLOWED[action];

  if (!mapping) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const bodyText = await request.text().catch(() => "");

  const backendRes = await fetch(`${API_URL}${mapping.path}`, {
    method: mapping.method,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: bodyText || undefined,
  });

  const status = backendRes.status;
  const headers = new Headers();

  for (const cookie of extractSetCookies(backendRes.headers)) {
    headers.append("Set-Cookie", cookie);
  }

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  headers.set("Content-Type", "application/json");
  const responseBody = await backendRes.json().catch(() => null);
  return new Response(JSON.stringify(responseBody), { status, headers });
}
