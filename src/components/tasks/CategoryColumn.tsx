"use client";

import { useState, useRef, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useCreateTask } from "@/src/hooks/use-tasks";
import { Plus } from "lucide-react";
import type { Category, Task } from "@/src/types/api";

const today = () => new Date().toISOString().slice(0, 10);

interface NewTaskFormProps {
  categorySlug: string;
  groupSlug?: string;
  onDone: () => void;
}

function NewTaskForm({ categorySlug, groupSlug, onDone }: NewTaskFormProps) {
  const create = useCreateTask(groupSlug);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [dueDate, setDueDate] = useState(today());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate(
      {
        title: title.trim(),
        category_slug: categorySlug,
        start_date: `${startDate}T00:00:00`,
        due_date: `${dueDate}T23:59:59`,
      },
      { onSuccess: () => { setTitle(""); onDone(); } },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded border border-border bg-surface p-2">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da tarefa"
        maxLength={180}
        className="h-8 w-full rounded border border-border bg-surface-muted px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="grid grid-cols-2 gap-1.5 text-xs text-foreground-muted">
        <div>
          <label className="mb-0.5 block">Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 w-full rounded border border-border bg-surface-muted px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block">Prazo</label>
          <input
            type="date"
            value={dueDate}
            min={startDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-7 w-full rounded border border-border bg-surface-muted px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="flex-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? "..." : "Criar"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded border px-2 py-1 text-xs text-foreground-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

interface Props {
  category: Category;
  tasks: Task[];
  isLoading: boolean;
  subtaskCounts: Record<string, { done: number; total: number }>;
  onTaskClick: (task: Task) => void;
  groupSlug?: string;
}

export function CategoryColumn({ category, tasks, isLoading, subtaskCounts, onTaskClick, groupSlug }: Props) {
  const [addingTask, setAddingTask] = useState(false);

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-surface-muted p-3">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: category.color ?? "#9ca3af" }}
          />
          <h2 className="text-sm font-semibold text-foreground-muted">{category.name}</h2>
        </div>
        <span className="text-xs text-foreground-subtle">{tasks.length}</span>
      </header>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : tasks.map((task) => {
              const counts = subtaskCounts[task.slug] ?? { done: 0, total: 0 };
              return (
                <TaskCard
                  key={task.slug}
                  task={task}
                  doneCount={counts.done}
                  totalCount={counts.total}
                  onClick={() => onTaskClick(task)}
                />
              );
            })}

        {!isLoading && tasks.length === 0 && !addingTask && (
          <p className="px-1 text-xs text-foreground-subtle">Sem tarefas</p>
        )}

        {addingTask && (
          <NewTaskForm
            categorySlug={category.slug}
            groupSlug={groupSlug}
            onDone={() => setAddingTask(false)}
          />
        )}
      </div>

      {!addingTask && (
        <button
          onClick={() => setAddingTask(true)}
          className="flex items-center gap-1.5 rounded px-1 py-1 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Tarefa
        </button>
      )}
    </div>
  );
}
