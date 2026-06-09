import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Habit, HabitStats } from "@/types/api";

const DaysOfWeek = z.array(z.number().int().min(0).max(6));

const HabitCreateInput = z
  .object({
    title: z.string().min(1).max(180),
    description: z.string().optional(),
    every_day: z.boolean().default(false),
    days_of_week: DaysOfWeek.default([]),
  })
  .refine((d) => d.every_day || d.days_of_week.length > 0, {
    path: ["days_of_week"],
    message: "Selecione ao menos um dia ou marque todos os dias.",
  });

const HabitUpdateInput = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().optional(),
  every_day: z.boolean().optional(),
  days_of_week: DaysOfWeek.optional(),
});

const HabitStatusInput = z.object({
  status: z.enum(["pending", "in_progress", "done"]),
  date: z.string().optional(),
});

export const habitsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get<Habit[]>("/habits");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  listToday: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get<Habit[]>("/habits/today");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.fetch.get<HabitStats>("/habits/stats");
    } catch (e) {
      throw mapApiError(e);
    }
  }),

  create: protectedProcedure
    .input(HabitCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<Habit>("/habits", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  update: protectedProcedure
    .input(z.object({ slug: z.string(), data: HabitUpdateInput }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.patch<Habit>(`/habits/${input.slug}`, input.data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  setStatus: protectedProcedure
    .input(z.object({ slug: z.string(), data: HabitStatusInput }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.patch<Habit>(
          `/habits/${input.slug}/status`,
          input.data,
        );
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/habits/${input.slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
