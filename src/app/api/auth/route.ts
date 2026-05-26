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

const ALLOWED: Record<string, string> = {
  login: "POST",
  register: "POST",
  logout: "POST",
  refresh: "POST",
  "verify-email": "POST",
};

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") ?? "";

  if (!ALLOWED[action]) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const bodyText = await request.text().catch(() => "");

  const backendRes = await fetch(`${API_URL}/auth/${action}`, {
    method: "POST",
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
