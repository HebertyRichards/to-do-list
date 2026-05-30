"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";

export const useMyGroups = () => trpc.groups.list.useQuery();

export const useGroup = (groupSlug: string) =>
  trpc.groups.get.useQuery({ group_slug: groupSlug }, { enabled: !!groupSlug });

export function useRenameGroup() {
  const utils = trpc.useUtils();
  return trpc.groups.rename.useMutation({
    onSuccess: (_d, vars) => {
      toast.success("Grupo renomeado.");
      utils.groups.list.invalidate();
      utils.groups.get.invalidate({ group_slug: vars.group_slug });
    },
    onError: showError,
  });
}

export const useCreateGroup = () => trpc.groups.create.useMutation({ onError: showError });
export const useJoinGroup = () =>
  trpc.groups.join.useMutation({
    onSuccess: () => toast.success("Solicitacao enviada ao admin do grupo."),
    onError: showError,
  });
export const useGroupMembers = (groupSlug: string) =>
  trpc.groups.listMembers.useQuery({ group_slug: groupSlug }, { enabled: !!groupSlug });
export const useJoinRequests = (groupSlug: string) =>
  trpc.groups.listJoinRequests.useQuery({ group_slug: groupSlug }, { enabled: !!groupSlug });

export function useAcceptJoinRequest() {
  const utils = trpc.useUtils();
  return trpc.groups.acceptRequest.useMutation({
    onSuccess: (_d, vars) => {
      toast.success("Pedido aceito.");
      utils.groups.listJoinRequests.invalidate({ group_slug: vars.group_slug });
      utils.groups.listMembers.invalidate({ group_slug: vars.group_slug });
    },
    onError: showError,
  });
}

export function useRejectJoinRequest() {
  const utils = trpc.useUtils();
  return trpc.groups.rejectRequest.useMutation({
    onSuccess: (_d, vars) => {
      toast.success("Pedido recusado.");
      utils.groups.listJoinRequests.invalidate({ group_slug: vars.group_slug });
    },
    onError: showError,
  });
}

export function useRemoveMember() {
  const utils = trpc.useUtils();
  return trpc.groups.removeMember.useMutation({
    onSuccess: (_d, vars) => {
      toast.success("Membro removido.");
      utils.groups.listMembers.invalidate({ group_slug: vars.group_slug });
    },
    onError: showError,
  });
}

export function usePromoteMember() {
  const utils = trpc.useUtils();
  return trpc.groups.promoteMember.useMutation({
    onSuccess: (_d, vars) => {
      toast.success("Membro promovido a admin.");
      utils.groups.listMembers.invalidate({ group_slug: vars.group_slug });
    },
    onError: showError,
  });
}

export function useLeaveGroup() {
  const utils = trpc.useUtils();
  return trpc.groups.leaveGroup.useMutation({
    onSuccess: () => {
      toast.success("Voce saiu do grupo.");
      utils.groups.list.invalidate();
    },
    onError: showError,
  });
}

export function useDeleteGroup() {
  const utils = trpc.useUtils();
  return trpc.groups.deleteGroup.useMutation({
    onSuccess: () => {
      toast.success("Grupo deletado.");
      utils.groups.list.invalidate();
    },
    onError: showError,
  });
}
