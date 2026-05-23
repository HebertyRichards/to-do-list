"use client";

import { trpc } from "@/src/lib/trpc-client";

export const useCreateGroup = () => trpc.groups.create.useMutation();
export const useJoinGroup = () => trpc.groups.join.useMutation();
export const useGroupMembers = (groupId: number) =>
  trpc.groups.listMembers.useQuery({ group_id: groupId });
export const useJoinRequests = (groupId: number) =>
  trpc.groups.listJoinRequests.useQuery({ group_id: groupId });
export const useAcceptJoinRequest = () => trpc.groups.acceptRequest.useMutation();
export const useRejectJoinRequest = () => trpc.groups.rejectRequest.useMutation();
export const useRemoveMember = () => trpc.groups.removeMember.useMutation();
export const useLeaveGroup = () => trpc.groups.leaveGroup.useMutation();
export const useDeleteGroup = () => trpc.groups.deleteGroup.useMutation();
