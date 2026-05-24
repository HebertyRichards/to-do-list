import type { NextRequest } from "next/server";

const API_URL = process.env.API_URL!;

// Node 20+ exposes getSetCookie() on the built-in Headers; older runtimes don't.
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

// Endpoints que envolvem cookies de sessão — roteados diretamente aqui
// para que os Set-Cookie do FastAPI sejam repassados ao browser.
const ALLOWED: Record<string, string> = {
  login: "POST",
  register: "POST",
  logout: "POST",
  refresh: "POST",
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

  // Repassa todos os Set-Cookie do FastAPI para o browser
  for (const cookie of extractSetCookies(backendRes.headers)) {
    headers.append("Set-Cookie", cookie);
  }

  // 204 é "null body status" — Response com body lança TypeError
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  headers.set("Content-Type", "application/json");
  const responseBody = await backendRes.json().catch(() => null);
  return new Response(JSON.stringify(responseBody), { status, headers });
}
