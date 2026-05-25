"use client";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { useUpdateTask } from "@/src/hooks/use-tasks";
import { formatCreatedAtLocal } from "@/src/utils/datetime";
import { STATUS_OPTIONS, getStatusOption } from "@/src/utils/statuses";
import { cn } from "@/src/utils/cn";
import { User as UserIcon } from "lucide-react";
import type { Task, TaskStatus } from "@/src/types/api";

interface Props {
  task: Task;
  doneCount: number;
  totalCount: number;
  onClick: () => void;
}

export function TaskCard({ task, doneCount, totalCount, onClick }: Props) {
  const update = useUpdateTask();
  const statusOpt = getStatusOption(task.status);
  const isDone = task.status === "done" || task.status === "archived";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    update.mutate({ slug: task.slug, data: { status: e.target.value as TaskStatus } });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-md border bg-surface p-3 text-left shadow-sm transition-all hover:shadow-md",
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

      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-foreground-subtle">
        <span className="font-medium text-foreground-muted">@{task.creator_username}</span>
        <span>·</span>
        <span>{formatCreatedAtLocal(task.created_at)}</span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <select
          value={task.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "rounded px-1.5 py-0.5 text-[11px] font-medium cursor-pointer border-0 outline-none",
            statusOpt.className,
          )}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 shrink-0">
          {(doneCount > 0 || totalCount > 0) && (
            <span className="font-mono text-[11px] text-foreground-subtle">
              {doneCount}/{totalCount}
            </span>
          )}
          {task.assignee_username && (
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px]">
                <UserIcon className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </button>
  );
}
