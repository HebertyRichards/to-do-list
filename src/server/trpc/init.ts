import "server-only";
import { initTRPC, TRPCError } from "@trpc/server";
import { http } from "@/src/services/http";
import { ApiError } from "@/src/lib/api-error";
import type { User, SessionInfo } from "@/src/types/api";

export type Context = {
  user: User | null;
};

export async function createContext({ req }: { req: Request }): Promise<Context> {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    if (!cookieHeader) return { user: null };

    const session = await http.get<SessionInfo>("/auth/session", {
      headers: { cookie: cookieHeader },
    });
    return { user: session.user };
  } catch {
    return { user: null };
  }
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
    });
  }
  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro inesperado." });
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado." });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export { mapApiError };
