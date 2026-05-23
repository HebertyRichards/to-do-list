import "server-only";
import { z } from "zod";
import { http } from "@/src/services/http";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Task } from "@/src/types/api";

const TaskCreateInput = z.object({
  title: z.string().min(1).max(180),
  description: z.string().optional(),
  start_date: z.string(),
  due_date: z.string(),
  category_id: z.number(),
  group_id: z.number().optional(),
  assignee_user_id: z.number().optional(),
  tag_ids: z.array(z.number()).default([]),
});

const TaskUpdateInput = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(["pending", "in_progress", "done", "archived"]).optional(),
  category_id: z.number().optional(),
  assignee_user_id: z.number().optional(),
  tag_ids: z.array(z.number()).optional(),
});

export const tasksRouter = router({
  list: protectedProcedure.query(async () => {
    try {
      return await http.get<Task[]>("/tasks");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  listGroup: protectedProcedure
    .input(z.object({ group_id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await http.get<Task[]>(`/tasks/group/${input.group_id}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  create: protectedProcedure.input(TaskCreateInput).mutation(async ({ input }) => {
    try {
      return await http.post<Task>("/tasks", input);
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: TaskUpdateInput }))
    .mutation(async ({ input }) => {
      try {
        return await http.patch<Task>(`/tasks/${input.id}`, input.data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    try {
      await http.delete(`/tasks/${input.id}`);
    } catch (e) {
      throw mapApiError(e);
    }
  }),
});
