"use client";

import { memo } from "react";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useAuth } from "@/providers/auth";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { STATUS_OPTIONS, OVERDUE_BADGE, getStatusOption } from "@/utils/statuses";
import { cn } from "@/utils/cn";
import type { Task, TaskStatus } from "@/types/api";

interface Props {
  task: Task;
  onSelect: (task: Task) => void;
}

function TaskCardImpl({ task, onSelect }: Props) {
  const tStatus = useTranslations("status");
  const tBoard = useTranslations("board");
  const update = useUpdateTask();
  const { user } = useAuth();
  const statusOpt = getStatusOption(task.status);
  const isDone = task.status === "done";
  const doneCount = task.subtask_done_count;
  const totalCount = task.subtask_total_count;
  const canComplete =
    !!user &&
    (user.username === task.creator_username || user.username === task.assignee_username);

  const handleStatusChange = (value: string) => {
    update.mutate({ slug: task.slug, data: { status: value as TaskStatus } });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(task);
        }
      }}
      className={cn(
        "w-full rounded-md border bg-surface p-3 text-left shadow-sm transition-all hover:shadow-md cursor-pointer",
        isDone && "opacity-60",
      )}
    >
      <h3 className={cn("flex items-start gap-1.5 text-sm font-medium leading-tight", isDone && "line-through text-foreground-subtle")}>
        {task.is_urgent && (
          <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" aria-label="Urgente" />
        )}
        <span>{task.title}</span>
      </h3>

      {task.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((t) => (
            <span
              key={t.name}
              className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 text-[11px] text-foreground-subtle">
        {formatCreatedAtLocal(task.created_at)}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {isDone ? (
          <div className="flex items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", statusOpt.className)}>
              {tStatus(statusOpt.key)}
            </span>
            {canComplete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange("pending");
                }}
                disabled={update.isPending}
                className="rounded px-1.5 py-0.5 text-[11px] font-medium text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                {tBoard("reopen")}
              </button>
            )}
          </div>
        ) : (
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger
              size="sm"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "h-auto w-fit gap-1 rounded border-0 px-1.5 py-0.5 text-[11px] font-medium shadow-none focus-visible:ring-1",
                statusOpt.className,
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={!canComplete && opt.value === "done"}
                  className="text-xs"
                >
                  {tStatus(opt.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {task.is_overdue && (
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", OVERDUE_BADGE.className)}>
              {tStatus(OVERDUE_BADGE.key)}
            </span>
          )}
          {(doneCount > 0 || totalCount > 0) && (
            <span className="font-mono text-[11px] text-foreground-subtle">
              {doneCount}/{totalCount}
            </span>
          )}
          {task.assignee_username && (
            <Avatar className="h-5 w-5" title={`@${task.assignee_username}`}>
              {task.assignee_avatar_url && (
                <AvatarImage src={task.assignee_avatar_url} alt={task.assignee_username} />
              )}
              <AvatarFallback className="text-[9px] uppercase">
                {task.assignee_username[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}

export const TaskCard = memo(
  TaskCardImpl,
  (prev, next) => prev.task === next.task && prev.onSelect === next.onSelect,
);
