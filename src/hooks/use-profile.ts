"use client";

import { toast } from "sonner";
import { trpc } from "@/src/lib/trpc-client";
import { getErrorMessage } from "@/src/errors/codes";

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.users.updateMe.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado.");
      utils.auth.session.invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
  });
}
