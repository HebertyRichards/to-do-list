"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";

export const useCategories = () => trpc.categories.list.useQuery();

export const useGroupCategories = (groupSlug: string) =>
  trpc.categories.listGroup.useQuery({ group_slug: groupSlug }, { enabled: !!groupSlug });

export function useCreateCategory(groupSlug?: string) {
  const utils = trpc.useUtils();
  return trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada.");
      if (groupSlug) {
        utils.categories.listGroup.invalidate({ group_slug: groupSlug });
      } else {
        utils.categories.list.invalidate();
      }
    },
    onError: showError,
  });
}

export function useUpdateCategory() {
  const utils = trpc.useUtils();
  return trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      utils.categories.listGroup.invalidate();
    },
    onError: showError,
  });
}

export function useDeleteCategory() {
  const utils = trpc.useUtils();
  return trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      utils.categories.listGroup.invalidate();
      utils.tasks.list.invalidate();
      utils.tasks.listGroup.invalidate();
    },
    onError: showError,
  });
}
