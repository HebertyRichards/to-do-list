import "server-only";
import { z } from "zod";
import { http } from "@/src/services/http";
import { protectedProcedure, router, mapApiError } from "../init";

export const notificationsRouter = router({
  list: protectedProcedure.query(async () => {
    try {
      return await http.get("/notifications");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await http.patch(`/notifications/${input.id}/read`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  markAllRead: protectedProcedure.mutation(async () => {
    try {
      await http.patch("/notifications/read-all");
    } catch (e) {
      throw mapApiError(e);
    }
  }),
});
