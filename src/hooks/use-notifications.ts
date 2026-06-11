"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";

export const useNotificationList = () =>
  trpc.notifications.list.useInfiniteQuery(
    {},
    {
      staleTime: 30_000,
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    },
  );

export const useUnreadCount = () =>
  trpc.notifications.unreadCount.useQuery(undefined, { staleTime: 30_000 });

export function useMarkRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
}

export function useMarkAllRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações foram marcadas como lidas.");
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
}
