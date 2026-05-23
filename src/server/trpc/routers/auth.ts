import "server-only";
import { z } from "zod";
import { http } from "@/src/services/http";
import { publicProcedure, router, mapApiError } from "../init";

export const authRouter = router({
  session: publicProcedure.query(async ({ ctx }) => ctx.user),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await http.post("/auth/login", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().min(3).max(60),
        password: z.string().min(8).max(128),
        full_name: z.string().max(120).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await http.post("/auth/register", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  logout: publicProcedure.mutation(async () => {
    try {
      await http.post("/auth/logout");
    } catch {
      // ignora erros no logout
    }
  }),
});
