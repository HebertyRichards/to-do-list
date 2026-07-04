import "server-only";
import { initTRPC, TRPCError } from "@trpc/server";
import { createHttp, type Http } from "@/services/http";
import { ApiError } from "@/lib/api-error";
import type { User, SessionInfo } from "@/types/api";

export type Context = {
  user: User | null;
  fetch: Http;
};

// /auth/session validado a cada request tRPC fica caro; um TTL curto por cookie
// derruba as chamadas repetidas sem risco real: os endpoints do FastAPI seguem
// validando o cookie em toda operação de dados.
const SESSION_TTL_MS = 30_000;
const sessionCache = new Map<string, { user: User | null; expiresAt: number }>();

async function resolveUser(cookieHeader: string, fetch: Http): Promise<User | null> {
  if (!cookieHeader) return null;

  const now = Date.now();
  const hit = sessionCache.get(cookieHeader);
  if (hit && hit.expiresAt > now) return hit.user;

  if (sessionCache.size > 500) {
    for (const [key, value] of sessionCache) {
      if (value.expiresAt <= now) sessionCache.delete(key);
    }
  }

  try {
    const session = await fetch.get<SessionInfo>("/auth/session");
    sessionCache.set(cookieHeader, { user: session.user, expiresAt: now + SESSION_TTL_MS });
    return session.user;
  } catch {
    return null;
  }
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const fetch = createHttp(cookieHeader || undefined);
  return { user: await resolveUser(cookieHeader, fetch), fetch };
}

function mapApiError(e: unknown): TRPCError {
  if (e instanceof ApiError) {
    const codeMap: Record<number, TRPCError["code"]> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "TOO_MANY_REQUESTS",
      500: "INTERNAL_SERVER_ERROR",
    };
    return new TRPCError({
      code: codeMap[e.status] ?? "INTERNAL_SERVER_ERROR",
      message: e.message,
      cause: e,
    });
  }
  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro inesperado." });
}

const t = initTRPC.context<Context>().create({
  // Expõe o código da API (ex.: NOT_GROUP_ADMIN) para o client usar as
  // mensagens centralizadas de src/errors/codes.ts.
  errorFormatter({ shape, error }) {
    const appCode = error.cause instanceof ApiError ? error.cause.code : null;
    return { ...shape, data: { ...shape.data, appCode } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado." });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export { mapApiError };
