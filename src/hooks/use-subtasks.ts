"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { getErrorMessage } from "@/errors/codes";

export const useSubtasks = (taskSlug: string) =>
  trpc.subtasks.listByTask.useQuery({ task_slug: taskSlug }, { enabled: !!taskSlug });

export function useCreateSubtask() {
  const utils = trpc.useUtils();
  return trpc.subtasks.create.useMutation({
    onSuccess: (_data, vars) => {
      toast.success("Subtarefa criada.");
      utils.subtasks.listByTask.invalidate({ task_slug: vars.task_slug });
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}

export function useUpdateSubtask() {
  const utils = trpc.useUtils();
  return trpc.subtasks.update.useMutation({
    onSuccess: (data) => {
      utils.subtasks.listByTask.invalidate({ task_slug: data.task_slug });
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}

export function useDeleteSubtask(taskSlug: string) {
  const utils = trpc.useUtils();
  return trpc.subtasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Subtarefa removida.");
      utils.subtasks.listByTask.invalidate({ task_slug: taskSlug });
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}
