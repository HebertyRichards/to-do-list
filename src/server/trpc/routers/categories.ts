import "server-only";
import { z } from "zod";
import { http } from "@/src/services/http";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Category } from "@/src/types/api";

export const categoriesRouter = router({
  list: protectedProcedure.query(async () => {
    try {
      return await http.get<Category[]>("/categories");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  listGroup: protectedProcedure
    .input(z.object({ group_id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await http.get<Category[]>(`/categories/group/${input.group_id}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(80), color: z.string().optional(), group_id: z.number().optional() }))
    .mutation(async ({ input }) => {
      try {
        return await http.post<Category>("/categories", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), color: z.string().optional() }))
    .mutation(async ({ input: { id, ...data } }) => {
      try {
        return await http.patch<Category>(`/categories/${id}`, data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    try {
      await http.delete(`/categories/${input.id}`);
    } catch (e) {
      throw mapApiError(e);
    }
  }),
});
