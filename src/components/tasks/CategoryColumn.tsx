"use client";

import { memo, useState, useRef, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { CreateTaskModal } from "./task-modal/CreateTaskModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { Category, Task } from "@/types/api";

interface Props {
  category: Category;
  tasks: Task[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
  onMoveTask: (slug: string, categorySlug: string, position: number) => void;
  groupSlug?: string;
}

// Nova posição (fracionária) ao soltar antes de `targetSlug` (ou no fim se null).
// Insere "no meio" dos vizinhos sem renumerar os demais.
function dropPosition(tasks: Task[], draggedSlug: string, targetSlug: string | null): number {
  const list = tasks.filter((t) => t.slug !== draggedSlug);
  const found = targetSlug ? list.findIndex((t) => t.slug === targetSlug) : -1;
  const idx = found >= 0 ? found : list.length;
  const before = idx > 0 ? list[idx - 1]?.position : undefined;
  const after = idx < list.length ? list[idx]?.position : undefined;
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (before !== undefined) return before + 1;
  if (after !== undefined) return after - 1;
  return 1;
}

function CategoryColumnImpl({
  category,
  tasks,
  isLoading,
  onTaskClick,
  onMoveTask,
  groupSlug,
}: Props) {
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

  const onDrop = (targetSlug: string | null) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = e.dataTransfer.getData("text/task-slug");
    if (!slug) return;
    onMoveTask(slug, category.slug, dropPosition(tasks, slug, targetSlug));
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

      <div
        className="flex min-h-8 flex-col gap-2 overflow-y-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop(null)}
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : tasks.map((task) => (
              <div
                key={task.slug}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/task-slug", task.slug);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop(task.slug)}
              >
                <TaskCard task={task} onSelect={onTaskClick} />
              </div>
            ))}

        {!isLoading && tasks.length === 0 && (
          <p className="px-1 text-xs text-foreground-subtle">Sem tarefas</p>
        )}
      </div>

      <button
        onClick={() => setAddingTask(true)}
        className="flex items-center gap-1.5 rounded px-1 py-1 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Tarefa
      </button>

      <CreateTaskModal
        open={addingTask}
        categorySlug={category.slug}
        groupSlug={groupSlug}
        onOpenChange={setAddingTask}
      />
    </div>
  );
}

export const CategoryColumn = memo(CategoryColumnImpl);
