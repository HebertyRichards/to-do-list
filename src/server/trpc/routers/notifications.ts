import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";

export const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get("/notifications");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.patch(`/notifications/${input.id}/read`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.fetch.patch("/notifications/read-all");
    } catch (e) {
      throw mapApiError(e);
    }
  }),
});
