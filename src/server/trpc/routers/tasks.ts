import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Task } from "@/types/api";

const TaskCreateInput = z.object({
  title: z.string().min(1).max(180),
  description: z.string().optional(),
  start_date: z.string(),
  due_date: z.string(),
  category_slug: z.string(),
  assignee_username: z.string().optional(),
  is_urgent: z.boolean().optional(),
  tag_names: z.array(z.string()).default([]),
});

const TaskUpdateInput = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  is_urgent: z.boolean().optional(),
  category_slug: z.string().optional(),
  assignee_username: z.string().optional(),
  tag_names: z.array(z.string()).optional(),
});

export const tasksRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get<Task[]>("/tasks");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  listGroup: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.get<Task[]>(`/tasks/group/${input.group_slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  create: protectedProcedure
    .input(TaskCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<Task>("/tasks", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  update: protectedProcedure
    .input(z.object({ slug: z.string(), data: TaskUpdateInput }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.patch<Task>(`/tasks/${input.slug}`, input.data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/tasks/${input.slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
