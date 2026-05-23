import "server-only";
import { z } from "zod";
import { http } from "@/src/services/http";
import { protectedProcedure, router, mapApiError } from "../init";
import type { GroupCreated, GroupMember, JoinRequest } from "@/src/types/api";

export const groupsRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(120), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        return await http.post<GroupCreated>("/groups", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  join: protectedProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await http.post<{ message: string }>("/groups/join", input);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  listMembers: protectedProcedure
    .input(z.object({ group_id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await http.get<GroupMember[]>(`/groups/${input.group_id}/members`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  listJoinRequests: protectedProcedure
    .input(z.object({ group_id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await http.get<JoinRequest[]>(`/groups/${input.group_id}/join-requests`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  acceptRequest: protectedProcedure
    .input(z.object({ group_id: z.number(), request_id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        return await http.post(`/groups/${input.group_id}/join-requests/${input.request_id}/accept`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  rejectRequest: protectedProcedure
    .input(z.object({ group_id: z.number(), request_id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        return await http.post(`/groups/${input.group_id}/join-requests/${input.request_id}/reject`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  removeMember: protectedProcedure
    .input(z.object({ group_id: z.number(), user_id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await http.delete(`/groups/${input.group_id}/members/${input.user_id}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  leaveGroup: protectedProcedure
    .input(z.object({ group_id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await http.delete(`/groups/${input.group_id}/leave`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),

  deleteGroup: protectedProcedure
    .input(z.object({ group_id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await http.delete(`/groups/${input.group_id}`);
      } catch (e) {
        throw mapApiError(e);
      }
    }),
});
