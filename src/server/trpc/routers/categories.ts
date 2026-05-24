import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Category } from "@/src/types/api";

export const categoriesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get<Category[]>("/categories");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  listGroup: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.get<Category[]>(`/categories/group/${input.group_slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(80), color: z.string().optional(), group_slug: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<Category>("/categories", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  update: protectedProcedure
    .input(z.object({ slug: z.string(), name: z.string().optional(), color: z.string().optional() }))
    .mutation(async ({ input: { slug, ...data }, ctx }) => {
      try {
        return await ctx.fetch.patch<Category>(`/categories/${slug}`, data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/categories/${input.slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
