"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@/types/api";
import { NotificationItem } from "./NotificationItem";

interface Props {
  notifications: Notification[];
  loading: boolean;
  emptyClassName?: string;
}

export function NotificationsList({ notifications, loading, emptyClassName }: Props) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </>
    );
  }

  if (notifications.length === 0) {
    return (
      <p className={emptyClassName ?? "px-2 text-xs text-foreground-subtle italic"}>
        Sem notificações
      </p>
    );
  }

  return (
    <>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notif={n} />
      ))}
    </>
  );
}
