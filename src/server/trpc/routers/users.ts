import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { User } from "@/src/types/api";

export const usersRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  updateMe: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(60).optional(),
      avatar_url: z.string().max(500).nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.patch<User>("/users/me", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
