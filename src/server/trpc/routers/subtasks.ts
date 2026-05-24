import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Subtask } from "@/src/types/api";

const SubtaskCreateInput = z.object({
  task_slug: z.string(),
  title: z.string().min(1).max(180),
  description: z.string().optional(),
  start_date: z.string(),
  due_date: z.string(),
  assignee_username: z.string().optional(),
});

const SubtaskUpdateInput = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(["pending", "in_progress", "done", "archived"]).optional(),
  assignee_username: z.string().optional(),
});

export const subtasksRouter = router({
  listByTask: protectedProcedure
    .input(z.object({ task_slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.get<Subtask[]>(`/subtasks/task/${input.task_slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  create: protectedProcedure
    .input(SubtaskCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<Subtask>("/subtasks", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  update: protectedProcedure
    .input(z.object({ slug: z.string(), data: SubtaskUpdateInput }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.patch<Subtask>(`/subtasks/${input.slug}`, input.data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/subtasks/${input.slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
