"use client";

import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.users.updateMe.useMutation({
    onMutate: async (input) => {
      await utils.auth.session.cancel();
      const prev = utils.auth.session.getData();
      if (prev) {
        utils.auth.session.setData(undefined, { ...prev, ...input });
      }
      return { prev };
    },
    onSuccess: (updated) => {
      utils.auth.session.setData(undefined, (curr) =>
        curr ? { ...curr, ...updated } : curr,
      );
    },
    onError: (err, _input, ctx) => {
      if (ctx?.prev) utils.auth.session.setData(undefined, ctx.prev);
      showError(err);
    },
  });
}
