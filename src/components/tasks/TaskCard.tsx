"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTask } from "@/hooks/use-tasks";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { STATUS_OPTIONS, getStatusOption } from "@/utils/statuses";
import { cn } from "@/utils/cn";
import type { Task, TaskStatus } from "@/types/api";

interface Props {
  task: Task;
  onSelect: (task: Task) => void;
}

function TaskCardImpl({ task, onSelect }: Props) {
  const update = useUpdateTask();
  const statusOpt = getStatusOption(task.status);
  const isDone = task.status === "done" || task.status === "archived";
  const doneCount = task.subtask_done_count;
  const totalCount = task.subtask_total_count;

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
      <h3 className={cn("text-sm font-medium leading-tight", isDone && "line-through text-foreground-subtle")}>
        {task.title}
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
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 shrink-0">
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
