"use client";

import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";
import type { Subtask } from "@/types/api";

export const useSubtasks = (taskSlug: string) =>
  trpc.subtasks.listByTask.useQuery({ task_slug: taskSlug }, { enabled: !!taskSlug });

export function useCreateSubtask() {
  const utils = trpc.useUtils();
  return trpc.subtasks.create.useMutation({
    onSuccess: (_data, vars) => {
      toast.success("Subtarefa criada.");
      utils.subtasks.listByTask.invalidate({ task_slug: vars.task_slug });
    },
    onError: showError,
  });
}

export function useUpdateSubtask() {
  const utils = trpc.useUtils();
  const qc = useQueryClient();
  const listKey = getQueryKey(trpc.subtasks.listByTask);

  return trpc.subtasks.update.useMutation({
    onMutate: async ({ slug, data }) => {
      await qc.cancelQueries({ queryKey: listKey });

      const prev = qc.getQueriesData<Subtask[]>({ queryKey: listKey });

      const patch = (s: Subtask): Subtask =>
        s.slug === slug
          ? {
              ...s,
              ...(data.title !== undefined ? { title: data.title } : {}),
              ...(data.description !== undefined ? { description: data.description } : {}),
              ...(data.status !== undefined ? { status: data.status } : {}),
              ...(data.is_urgent !== undefined ? { is_urgent: data.is_urgent } : {}),
              ...(data.start_date !== undefined ? { start_date: data.start_date } : {}),
              ...(data.due_date !== undefined ? { due_date: data.due_date } : {}),
              ...(data.assignee_username !== undefined
                ? { assignee_username: data.assignee_username || null }
                : {}),
            }
          : s;

      qc.setQueriesData<Subtask[]>({ queryKey: listKey }, (old) => old?.map(patch));

      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) {
          qc.setQueryData(key, data);
        }
      }
      showError(err);
    },
    onSettled: (data) => {
      if (data) {
        utils.subtasks.listByTask.invalidate({ task_slug: data.task_slug });
      } else {
        utils.subtasks.listByTask.invalidate();
      }
    },
  });
}

export function useDeleteSubtask(taskSlug: string) {
  const utils = trpc.useUtils();
  return trpc.subtasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Subtarefa removida.");
      utils.subtasks.listByTask.invalidate({ task_slug: taskSlug });
    },
    onError: showError,
  });
}
