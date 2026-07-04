"use client";

import { useMemo, useState } from "react";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayBadge } from "@/utils/statuses";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { cn } from "@/utils/cn";
import { TaskItemModal } from "./TaskItemModal";
import type { Category, Subtask, Task } from "@/types/api";

interface Props {
  subtasks: Subtask[];
  categories: Category[];
  tasks: Task[];
  isLoading: boolean;
  groupSlug?: string;
}

function SubtaskCard({ subtask, taskTitle, onSelect }: {
  subtask: Subtask;
  taskTitle?: string;
  onSelect: (s: Subtask) => void;
}) {
  const tStatus = useTranslations("status");
  const tBoard = useTranslations("board");
  const badge = getDisplayBadge(subtask);
  const isDone = subtask.status === "done";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(subtask)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(subtask);
        }
      }}
      className={cn(
        "w-full rounded-md border bg-surface p-3 text-left shadow-sm transition-all hover:shadow-md cursor-pointer",
        isDone && "opacity-60",
      )}
    >
      <h3 className={cn("flex items-start gap-1.5 text-sm font-medium leading-tight", isDone && "line-through text-foreground-subtle")}>
        {subtask.is_urgent && (
          <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" aria-label="Urgente" />
        )}
        <span>{subtask.title}</span>
      </h3>

      {taskTitle && (
        <p className="mt-1 truncate text-[11px] text-foreground-subtle">
          {tBoard("inTask", { title: taskTitle })}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${badge.className}`}>
          {tStatus(badge.key)}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[11px] text-foreground-subtle">
            {formatCreatedAtLocal(subtask.due_date)}
          </span>
          {subtask.assignee_username && (
            <Avatar className="h-5 w-5" title={`@${subtask.assignee_username}`}>
              {subtask.assignee_avatar_url && (
                <AvatarImage src={subtask.assignee_avatar_url} alt={subtask.assignee_username} />
              )}
              <AvatarFallback className="text-[9px] uppercase">
                {subtask.assignee_username[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubtaskListView({ subtasks, categories, tasks, isLoading, groupSlug }: Props) {
  const tBoard = useTranslations("board");
  const [selected, setSelected] = useState<Subtask | null>(null);

  // Subtarefa não tem categoria própria: agrupa pela categoria da tarefa-mãe.
  const { byCategory, taskTitles } = useMemo(() => {
    const categoryOf = new Map(tasks.map((t) => [t.slug, t.category_slug]));
    const titles = new Map(tasks.map((t) => [t.slug, t.title]));
    const groups: Record<string, Subtask[]> = {};
    for (const s of subtasks) {
      const cat = categoryOf.get(s.task_slug);
      if (!cat) continue;
      (groups[cat] ??= []).push(s);
    }
    return { byCategory: groups, taskTitles: titles };
  }, [subtasks, tasks]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-72 shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto p-6">
      {categories.map((cat) => {
        const items = byCategory[cat.slug] ?? [];
        return (
          <div key={cat.slug} className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-surface-muted p-3">
            <header className="flex items-center gap-2 px-1">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color ?? "#9ca3af" }}
              />
              <h2 className="truncate text-sm font-semibold text-foreground-muted">{cat.name}</h2>
              <span className="ml-auto text-xs text-foreground-subtle">{items.length}</span>
            </header>

            <div className="flex flex-col gap-2 overflow-y-auto">
              {items.map((s) => (
                <SubtaskCard
                  key={s.slug}
                  subtask={s}
                  taskTitle={taskTitles.get(s.task_slug)}
                  onSelect={setSelected}
                />
              ))}
              {items.length === 0 && (
                <p className="px-1 text-sm italic text-foreground-subtle">{tBoard("noSubtasks")}</p>
              )}
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <p className="text-sm italic text-foreground-subtle">{tBoard("noCategories")}</p>
      )}

      <TaskItemModal
        kind="subtask"
        item={selected}
        taskSlug={selected?.task_slug ?? ""}
        groupSlug={groupSlug}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
