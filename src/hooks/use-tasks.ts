"use client";

import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";
import type { Task } from "@/types/api";

export const useTasks = () => trpc.tasks.list.useQuery();

export const useGroupTasks = (groupSlug: string) =>
  trpc.tasks.listGroup.useQuery({ group_slug: groupSlug }, { enabled: !!groupSlug });

function invalidateAllTaskLists(utils: ReturnType<typeof trpc.useUtils>) {
  utils.tasks.list.invalidate();
  utils.tasks.listGroup.invalidate();
}

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
    onError: showError,
  });
}

export function useUpdateTask() {
  const utils = trpc.useUtils();
  const qc = useQueryClient();

  const listKey = getQueryKey(trpc.tasks.list);
  const listGroupKey = getQueryKey(trpc.tasks.listGroup);

  return trpc.tasks.update.useMutation({
    onMutate: async ({ slug, data }) => {
      await qc.cancelQueries({ queryKey: listKey });
      await qc.cancelQueries({ queryKey: listGroupKey });

      const prev: [readonly unknown[], Task[] | undefined][] = [
        ...qc.getQueriesData<Task[]>({ queryKey: listKey }),
        ...qc.getQueriesData<Task[]>({ queryKey: listGroupKey }),
      ];

      const patch = (t: Task): Task =>
        t.slug === slug
          ? {
              ...t,
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
          : t;

      qc.setQueriesData<Task[]>({ queryKey: listKey }, (old) => old?.map(patch));
      qc.setQueriesData<Task[]>({ queryKey: listGroupKey }, (old) => old?.map(patch));

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
    onSettled: () => {
      invalidateAllTaskLists(utils);
    },
  });
}

export function useDeleteTask() {
  const utils = trpc.useUtils();
  return trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa removida.");
      invalidateAllTaskLists(utils);
    },
    onError: showError,
  });
}
