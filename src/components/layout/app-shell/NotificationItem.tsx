"use client";

import { useMarkRead } from "@/hooks/use-notifications";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { cn } from "@/utils/cn";
import type { Notification } from "@/types/api";

export const NOTIF_TYPE_LABELS: Record<string, string> = {
  join_request_created: "Solicitação de entrada",
  join_request_accepted: "Solicitação aceita",
  join_request_rejected: "Solicitação recusada",
  task_assigned: "Tarefa atribuída",
  subtask_assigned: "Subtarefa atribuída",
  member_removed: "Removido do grupo",
  group_deleted: "Grupo excluído",
};

export function NotificationItem({ notif }: { notif: Notification }) {
  const markRead = useMarkRead();
  const isUnread = !notif.read_at;

  return (
    <button
      onClick={() => isUnread && markRead.mutate({ id: notif.id })}
      className={cn(
        "w-full rounded-md px-3 py-2 text-left text-xs transition-colors",
        isUnread
          ? "bg-primary/10 hover:bg-primary/15 border border-primary/20"
          : "hover:bg-surface-secondary",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={cn("font-medium leading-tight", isUnread ? "text-primary" : "text-foreground-muted")}>
          {notif.title}
        </span>
        {isUnread && <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
      </div>
      <span className="mt-0.5 block text-[10px] text-foreground-subtle">
        {NOTIF_TYPE_LABELS[notif.type] ?? notif.type} · {formatCreatedAtLocal(notif.created_at)}
      </span>
    </button>
  );
}
