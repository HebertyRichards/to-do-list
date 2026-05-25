"use client";

import { useState, useRef, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useCreateTask } from "@/src/hooks/use-tasks";
import { useUpdateCategory, useDeleteCategory } from "@/src/hooks/use-categories";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { localNow } from "@/src/utils/datetime";
import type { Category, Task } from "@/src/types/api";

interface NewTaskFormProps {
  categorySlug: string;
  groupSlug?: string;
  onDone: () => void;
}

function NewTaskForm({ categorySlug, groupSlug, onDone }: NewTaskFormProps) {
  const create = useCreateTask(groupSlug);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(localNow());
  const [dueDate, setDueDate] = useState(localNow());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category_slug: categorySlug,
        start_date: `${startDate}:00`,
        due_date: `${dueDate}:00`,
      },
      { onSuccess: () => { setTitle(""); setDescription(""); onDone(); } },
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
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)"
        rows={2}
        className="w-full rounded border border-border bg-surface-muted px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="grid grid-cols-2 gap-1.5 text-xs text-foreground-muted">
        <div>
          <label className="mb-0.5 block">Início</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 w-full rounded border border-border bg-surface-muted px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block">Prazo</label>
          <input
            type="datetime-local"
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
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  const commitRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== category.name) {
      updateCategory.mutate({ slug: category.slug, name: trimmed });
    }
    setRenaming(false);
  };

  const handleDelete = () => {
    deleteCategory.mutate({ slug: category.slug });
    setConfirmDelete(false);
  };

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-surface-muted p-3">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: category.color ?? "#9ca3af" }}
          />
          {renaming ? (
            <input
              ref={renameInputRef}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setNameDraft(category.name); setRenaming(false); }
              }}
              maxLength={80}
              className="h-6 flex-1 rounded border border-ring bg-surface px-1.5 text-sm font-semibold focus:outline-none"
            />
          ) : (
            <h2 className="truncate text-sm font-semibold text-foreground-muted">{category.name}</h2>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {confirmDelete ? (
            <>
              <span className="text-xs text-destructive">Excluir?</span>
              <button
                onClick={handleDelete}
                className="rounded p-0.5 text-destructive hover:bg-destructive/10"
                title="Confirmar exclusão"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded p-0.5 text-foreground-muted hover:bg-surface-secondary"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-foreground-subtle">{tasks.length}</span>
              <button
                onClick={() => { setRenaming(true); setNameDraft(category.name); }}
                className="rounded p-0.5 text-foreground-subtle hover:text-foreground-muted transition-colors"
                title="Renomear categoria"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded p-0.5 text-foreground-subtle hover:text-destructive transition-colors"
                title="Excluir categoria"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
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
