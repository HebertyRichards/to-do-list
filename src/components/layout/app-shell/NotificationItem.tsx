"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { useMarkRead } from "@/hooks/use-notifications";
import { useAcceptJoinRequest, useRejectJoinRequest } from "@/hooks/use-groups";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { cn } from "@/utils/cn";
import type { Notification } from "@/types/api";

// Tipos com rótulo traduzido em notifications.types.{type}.
const KNOWN_NOTIF_TYPES = new Set([
  "join_request_created",
  "join_request_accepted",
  "join_request_rejected",
  "task_assigned",
  "subtask_assigned",
  "member_removed",
  "group_deleted",
  "daily_reminder",
]);

interface Props {
  notif: Notification;
  onNavigate?: () => void;
}

export function NotificationItem({ notif, onNavigate }: Props) {
  const t = useTranslations("notifications");
  const router = useRouter();
  const markRead = useMarkRead();
  const acceptRequest = useAcceptJoinRequest();
  const rejectRequest = useRejectJoinRequest();
  const isUnread = !notif.read_at;

  const groupSlug =
    typeof notif.payload.group_slug === "string" ? notif.payload.group_slug : null;
  const requestSlug =
    typeof notif.payload.request_slug === "string" ? notif.payload.request_slug : null;

  const GROUP_LINK_TYPES = [
    "join_request_accepted",
    "join_request_created",
    "task_assigned",
    "subtask_assigned",
  ];
  const target =
    notif.type === "daily_reminder"
      ? "/diary"
      : groupSlug && GROUP_LINK_TYPES.includes(notif.type)
        ? `/groups/${groupSlug}`
        : null;

  const showJoinActions =
    notif.type === "join_request_created" && isUnread && !!groupSlug && !!requestSlug;
  const resolving = acceptRequest.isPending || rejectRequest.isPending;

  const handleClick = () => {
    if (isUnread) markRead.mutate({ id: notif.id });
    if (target) {
      router.push(target);
      onNavigate?.();
    }
  };

  const resolveRequest = (e: React.MouseEvent, accept: boolean) => {
    e.stopPropagation();
    if (!groupSlug || !requestSlug || resolving) return;
    const mutation = accept ? acceptRequest : rejectRequest;
    mutation.mutate(
      { group_slug: groupSlug, request_slug: requestSlug },
      { onSuccess: () => markRead.mutate({ id: notif.id }) },
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={cn(
        "w-full cursor-pointer rounded-md px-3 py-2 text-left text-xs transition-colors",
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
        {KNOWN_NOTIF_TYPES.has(notif.type) ? t(`types.${notif.type}`) : notif.type} ·{" "}
        {formatCreatedAtLocal(notif.created_at)}
      </span>
      {showJoinActions && (
        <div className="mt-1.5 flex gap-1.5">
          <button
            type="button"
            onClick={(e) => resolveRequest(e, true)}
            disabled={resolving}
            className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            Aceitar
          </button>
          <button
            type="button"
            onClick={(e) => resolveRequest(e, false)}
            disabled={resolving}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-foreground-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Recusar
          </button>
        </div>
      )}
    </div>
  );
}
