import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Comment, TimelineItem } from "@/types/api";

const Target = z.object({
  kind: z.enum(["task", "subtask"]),
  slug: z.string(),
});

const targetPath = (kind: "task" | "subtask", slug: string) =>
  kind === "task" ? `/comments/task/${slug}` : `/comments/subtask/${slug}`;

export const commentsRouter = router({
  list: protectedProcedure.input(Target).query(async ({ input, ctx }) => {
    try {
      return await ctx.fetch.get<Comment[]>(targetPath(input.kind, input.slug));
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  // Timeline unificada: comentários + eventos de sistema, ordenados por data.
  timeline: protectedProcedure.input(Target).query(async ({ input, ctx }) => {
    try {
      return await ctx.fetch.get<TimelineItem[]>(
        `${targetPath(input.kind, input.slug)}/timeline`,
      );
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  create: protectedProcedure
    .input(Target.extend({ body: z.string().min(1).max(2000) }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<Comment>(targetPath(input.kind, input.slug), {
          body: input.body,
        });
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  update: protectedProcedure
    .input(z.object({ slug: z.string(), body: z.string().min(1).max(2000) }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.patch<Comment>(`/comments/${input.slug}`, {
          body: input.body,
        });
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/comments/${input.slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
