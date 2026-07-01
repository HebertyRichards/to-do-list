"use client";

import { useCallback, useMemo, useState } from "react";
import type { Subtask, Task, TaskStatus } from "@/types/api";

export type TaskSort = "position" | "due_date" | "created_at" | "title" | "priority";
export type ItemKind = "task" | "subtask";

export interface TaskFilters {
  q: string;
  kind: ItemKind; // "task" agrupa por categoria; "subtask" lista plana
  statuses: TaskStatus[]; // vazio = todos
  tags: string[]; // vazio = todos; casa se a tarefa tiver QUALQUER uma (só tasks)
  category: string | null; // category_slug; null = todas (só tasks)
  assignee: string | null; // username; null = todos
  assignedToMe: boolean; // atribuídas a mim (usa o username atual)
  urgentOnly: boolean;
  overdueOnly: boolean;
  sort: TaskSort;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  q: "",
  kind: "task",
  statuses: [],
  tags: [],
  category: null,
  assignee: null,
  assignedToMe: false,
  urgentOnly: false,
  overdueOnly: false,
  sort: "position",
};

/** Estado dos filtros com updaters prontos (o componente pluga em cima). */
export function useTaskFilters(initial: Partial<TaskFilters> = {}) {
  const [filters, setFilters] = useState<TaskFilters>({
    ...DEFAULT_TASK_FILTERS,
    ...initial,
  });

  const setFilter = useCallback(
    <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) =>
      setFilters((f) => ({ ...f, [key]: value })),
    [],
  );

  const reset = useCallback(() => setFilters(DEFAULT_TASK_FILTERS), []);

  const isActive = useMemo(
    () =>
      filters.q.trim() !== "" ||
      filters.statuses.length > 0 ||
      filters.tags.length > 0 ||
      filters.category !== null ||
      filters.assignee !== null ||
      filters.assignedToMe ||
      filters.urgentOnly ||
      filters.overdueOnly,
    [filters],
  );

  return { filters, setFilter, setFilters, reset, isActive };
}

// Campos comuns a Task e Subtask que os filtros/ordenação usam.
type FilterableItem = Pick<
  Task,
  | "title"
  | "description"
  | "status"
  | "is_urgent"
  | "is_overdue"
  | "due_date"
  | "created_at"
  | "assignee_username"
>;

/** Filtros compartilhados (busca, status, responsável, urgente, atrasado). */
function matchesCommon(
  item: FilterableItem,
  filters: TaskFilters,
  currentUsername?: string | null,
): boolean {
  const q = filters.q.trim().toLowerCase();
  if (q) {
    const haystack = `${item.title} ${item.description ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) return false;
  if (filters.assignee !== null && item.assignee_username !== filters.assignee) return false;
  if (filters.assignedToMe && item.assignee_username !== currentUsername) return false;
  if (filters.urgentOnly && !item.is_urgent) return false;
  if (filters.overdueOnly && !item.is_overdue) return false;
  return true;
}

function compare(a: FilterableItem, b: FilterableItem, sort: TaskSort): number {
  switch (sort) {
    case "due_date":
      return a.due_date.localeCompare(b.due_date);
    case "created_at":
      return b.created_at.localeCompare(a.created_at);
    case "title":
      return a.title.localeCompare(b.title);
    case "priority":
      return Number(b.is_urgent) - Number(a.is_urgent) || a.due_date.localeCompare(b.due_date);
    default: // "position" ou fallback
      return a.due_date.localeCompare(b.due_date);
  }
}

/** Busca + filtros + ordenação sobre tarefas (inclui tags e categoria). */
export function useFilteredTasks(
  tasks: Task[],
  filters: TaskFilters,
  currentUsername?: string | null,
): Task[] {
  return useMemo(() => {
    const result = tasks.filter((t) => {
      if (!matchesCommon(t, filters, currentUsername)) return false;
      if (filters.tags.length > 0 && !t.tags.some((tag) => filters.tags.includes(tag.name)))
        return false;
      if (filters.category !== null && t.category_slug !== filters.category) return false;
      return true;
    });
    return result.sort((a, b) =>
      filters.sort === "position" ? a.position - b.position : compare(a, b, filters.sort),
    );
  }, [tasks, filters, currentUsername]);
}

/** Busca + filtros + ordenação sobre subtarefas (sem tags/categoria/posição). */
export function useFilteredSubtasks(
  subtasks: Subtask[],
  filters: TaskFilters,
  currentUsername?: string | null,
): Subtask[] {
  return useMemo(() => {
    const result = subtasks.filter((s) => matchesCommon(s, filters, currentUsername));
    return result.sort((a, b) => compare(a, b, filters.sort));
  }, [subtasks, filters, currentUsername]);
}
