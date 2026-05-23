"use client";

import { trpc } from "@/src/lib/trpc-client";

export const useCategories = () => trpc.categories.list.useQuery();
export const useGroupCategories = (groupId: number) =>
  trpc.categories.listGroup.useQuery({ group_id: groupId });
export const useCreateCategory = () => trpc.categories.create.useMutation();
export const useUpdateCategory = () => trpc.categories.update.useMutation();
export const useDeleteCategory = () => trpc.categories.delete.useMutation();
