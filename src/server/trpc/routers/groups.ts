import "server-only";
import { z } from "zod";
import { protectedProcedure, router, mapApiError } from "../init";
import type { Group, GroupCreated, GroupMember, JoinRequest } from "@/types/api";

export const groupsRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.fetch.get<Group[]>("/groups");
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  get: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.get<Group>(`/groups/${input.group_slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  rename: protectedProcedure
    .input(z.object({ group_slug: z.string(), name: z.string().min(1).max(120), description: z.string().optional() }))
    .mutation(async ({ input: { group_slug, ...data }, ctx }) => {
      try {
        return await ctx.fetch.patch<Group>(`/groups/${group_slug}`, data);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(120), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<GroupCreated>("/groups", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  join: protectedProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post<{ message: string }>("/groups/join", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  listMembers: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.get<GroupMember[]>(`/groups/${input.group_slug}/members`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  listJoinRequests: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.get<JoinRequest[]>(`/groups/${input.group_slug}/join-requests`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  acceptRequest: protectedProcedure
    .input(z.object({ group_slug: z.string(), request_slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post(`/groups/${input.group_slug}/join-requests/${input.request_slug}/accept`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  rejectRequest: protectedProcedure
    .input(z.object({ group_slug: z.string(), request_slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.fetch.post(`/groups/${input.group_slug}/join-requests/${input.request_slug}/reject`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  removeMember: protectedProcedure
    .input(z.object({ group_slug: z.string(), username: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/groups/${input.group_slug}/members/${input.username}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  promoteMember: protectedProcedure
    .input(z.object({ group_slug: z.string(), username: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.post(`/groups/${input.group_slug}/members/${input.username}/promote`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  leaveGroup: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/groups/${input.group_slug}/leave`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  deleteGroup: protectedProcedure
    .input(z.object({ group_slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.fetch.delete(`/groups/${input.group_slug}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
