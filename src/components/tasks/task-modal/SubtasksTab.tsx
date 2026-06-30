"use client";

import { useState } from "react";
import { Plus, Flag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayBadge } from "@/utils/statuses";
import type { Subtask } from "@/types/api";
import { NewSubtaskForm } from "./NewSubtaskForm";

interface Props {
  taskSlug: string;
  subtasks: Subtask[];
  loading: boolean;
  onOpenSubtask: (s: Subtask) => void;
}

export function SubtasksTab({ taskSlug, subtasks, loading, onOpenSubtask }: Props) {
  const [adding, setAdding] = useState(false);

  if (loading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </>
    );
  }

  return (
    <>
      {subtasks.length === 0 && !adding && (
        <p className="text-sm text-foreground-subtle italic">Nenhuma subtarefa</p>
      )}

      {subtasks.map((s) => {
        const badge = getDisplayBadge(s);
        const isDone = s.status === "done";
        return (
          <button
            key={s.slug}
            type="button"
            onClick={() => onOpenSubtask(s)}
            className="flex w-full items-center justify-between gap-2 rounded border border-border bg-surface px-3 py-2 text-left hover:border-primary/50 transition-colors"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              {s.is_urgent && (
                <Flag className="h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" aria-label="Urgente" />
              )}
              <span className={isDone ? "truncate line-through text-foreground-subtle text-sm" : "truncate text-sm"}>
                {s.title}
              </span>
            </span>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </button>
        );
      })}

      {adding ? (
        <NewSubtaskForm taskSlug={taskSlug} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 rounded border border-dashed border-border px-3 py-2 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova subtarefa
        </button>
      )}
    </>
  );
}
