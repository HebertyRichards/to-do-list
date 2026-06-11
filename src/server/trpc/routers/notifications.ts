import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { NotificationPage, UnreadCount } from "@/types/api";

export const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ cursor: z.number().nullish() }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const cursor = input?.cursor;
        const qs = cursor != null ? `?cursor=${cursor}` : "";
        return await ctx.fetch.get<NotificationPage>(`/notifications${qs}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get<UnreadCount>("/notifications/unread-count");
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
