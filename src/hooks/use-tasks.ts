"use client";

import { toast } from "sonner";
import { trpc } from "@/src/lib/trpc-client";
import { getErrorMessage } from "@/src/errors/codes";

export const useTasks = () => trpc.tasks.list.useQuery();

export const useGroupTasks = (groupSlug: string) =>
  trpc.tasks.listGroup.useQuery({ group_slug: groupSlug }, { enabled: !!groupSlug });

export function useCreateTask(groupSlug?: string) {
  const utils = trpc.useUtils();
  return trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada.");
      if (groupSlug) {
        utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
      } else {
        utils.tasks.list.invalidate();
      }
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}

export function useUpdateTask() {
  const utils = trpc.useUtils();
  return trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}

export function useDeleteTask() {
  const utils = trpc.useUtils();
  return trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa removida.");
      utils.tasks.list.invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}
