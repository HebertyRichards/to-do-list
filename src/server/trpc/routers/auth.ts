import "server-only";
import { z } from "zod";
import { publicProcedure, router, mapApiError } from "../init";
import type { ForgotPasswordResponse } from "@/src/types/api";

export const authRouter = router({
  session: publicProcedure.query(async ({ ctx }) => ctx.user),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<ForgotPasswordResponse>("/auth/forgot-password", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(10).max(128),
      new_password: z.string().min(8).max(128),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.post("/auth/reset-password", {
          token: input.token,
          new_password: input.new_password,
          confirm_new_password: input.new_password,
        });
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
