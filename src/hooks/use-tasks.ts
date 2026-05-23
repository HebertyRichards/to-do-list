"use client";

import { trpc } from "@/src/lib/trpc-client";

export const useTasks = () => trpc.tasks.list.useQuery();
export const useGroupTasks = (groupId: number) =>
  trpc.tasks.listGroup.useQuery({ group_id: groupId });
export const useCreateTask = () => trpc.tasks.create.useMutation();
export const useUpdateTask = () => trpc.tasks.update.useMutation();
export const useDeleteTask = () => trpc.tasks.delete.useMutation();
