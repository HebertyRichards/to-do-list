"use client";

import { CheckCircle2, Circle, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn } from "@/src/utils/cn";
import type { Task } from "@/src/types/api";

interface Props {
  task: Task;
  doneCount: number;
  totalCount: number;
  onClick: () => void;
}

export function TaskCard({ task, doneCount, totalCount, onClick }: Props) {
  const isDone = task.status === "done";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-md border bg-surface p-3 text-left shadow-sm transition-all hover:shadow-md",
        isDone && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isDone ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-foreground-subtle" />
          )}
          <h3 className={cn("text-sm font-medium leading-tight", isDone && "line-through")}>
            {task.title}
          </h3>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
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

      <div className="mt-3 flex items-center justify-between text-xs text-foreground-muted">
        <span className="font-mono">
          {doneCount}/{totalCount}
        </span>
        {task.assignee_username && (
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              <UserIcon className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </button>
  );
}
