"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { CategoryColumn } from "./CategoryColumn";
import { TaskItemModal } from "./TaskItemModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateCategory } from "@/hooks/use-categories";
import { Plus } from "lucide-react";
import type { Category, Task } from "@/types/api";

const EMPTY_TASKS: Task[] = [];

interface Props {
  categories: Category[];
  tasks: Task[];
  isLoading: boolean;
  groupSlug?: string;
}

function NewCategoryForm({ groupSlug, onDone }: { groupSlug?: string; onDone: () => void }) {
  const create = useCreateCategory(groupSlug);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), color, ...(groupSlug ? { group_slug: groupSlug } : {}) },
      { onSuccess: () => { setName(""); onDone(); } },
    );
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-lg border-2 border-dashed border-border bg-surface p-3"
    >
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da categoria"
        maxLength={80}
        className="h-9 w-full rounded border border-border bg-surface-muted px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-border"
          title="Cor da categoria"
        />
        <span className="text-xs text-foreground-muted">Cor</span>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || create.isPending}
          className="flex-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? "Criando..." : "Criar"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded border px-3 py-1.5 text-xs text-foreground-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function TaskBoard({ categories, tasks, isLoading, groupSlug }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const tasksByCategory = useMemo(
    () =>
      tasks.reduce<Record<string, Task[]>>((acc, task) => {
        (acc[task.category_slug] ??= []).push(task);
        return acc;
      }, {}),
    [tasks],
  );

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 gap-4 overflow-x-auto p-6 items-start">
        {categories.map((cat) => (
          <CategoryColumn
            key={cat.slug}
            category={cat}
            tasks={tasksByCategory[cat.slug] ?? EMPTY_TASKS}
            isLoading={false}
            onTaskClick={setSelectedTask}
            groupSlug={groupSlug}
          />
        ))}

        {addingCategory ? (
          <NewCategoryForm groupSlug={groupSlug} onDone={() => setAddingCategory(false)} />
        ) : (
          <button
            onClick={() => setAddingCategory(true)}
            className="flex w-72 shrink-0 items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm text-foreground-muted hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova categoria
          </button>
        )}
      </div>

      <TaskItemModal
        kind="task"
        item={selectedTask}
        groupSlug={groupSlug}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </>
  );
}
