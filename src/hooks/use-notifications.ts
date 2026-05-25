"use client";

import { toast } from "sonner";
import { trpc } from "@/src/lib/trpc-client";

export const useNotificationList = () =>
  trpc.notifications.list.useQuery(undefined, { staleTime: 30_000 });

export function useMarkRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
}

export function useMarkAllRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações foram marcadas como lidas.");
      utils.notifications.list.invalidate();
    },
  });
}
