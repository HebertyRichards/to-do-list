"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { getErrorMessage } from "@/errors/codes";

// Structural type — compatible with TRPCClientErrorLike for any procedure
type TRPCMutationError = {
  data?: { code?: string | null } | null;
  message: string;
};

function onErr(err: TRPCMutationError): void {
  const code = err.data?.code ?? "";
  toast.error(getErrorMessage(code, err.message));
}

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
    onError: onErr,
  });
}

export function useUpdateCategory() {
  const utils = trpc.useUtils();
  return trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
    },
    onError: onErr,
  });
}

export function useDeleteCategory() {
  const utils = trpc.useUtils();
  return trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
    },
    onError: onErr,
  });
}
