"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/auth";
import {
  useTaskFilters,
  useFilteredTasks,
  useFilteredSubtasks,
} from "@/hooks/use-task-filters";
import { TaskFilterBar } from "./TaskFilterBar";
import { TaskBoard } from "./TaskBoard";
import { SubtaskListView } from "./SubtaskListView";
import type { Category, Subtask, Task } from "@/types/api";

interface Props {
  categories: Category[];
  tasks: Task[];
  subtasks: Subtask[];
  isLoading: boolean;
  groupSlug?: string;
}

export function BoardWorkspace({ categories, tasks, subtasks, isLoading, groupSlug }: Props) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const { filters, setFilter, reset, isActive } = useTaskFilters();

  const filteredTasks = useFilteredTasks(tasks, filters, username);
  const filteredSubtasks = useFilteredSubtasks(subtasks, filters, username);

  // O filtro de categorias também limita as colunas exibidas no board.
  const visibleCategories = useMemo(
    () =>
      filters.categories.length > 0
        ? categories.filter((c) => filters.categories.includes(c.slug))
        : categories,
    [categories, filters.categories],
  );

  // Responsáveis presentes nos dados carregados (para o select de responsável).
  // Só faz sentido em grupo; no board individual tudo pertence ao próprio usuário.
  const assignees = useMemo(() => {
    if (!groupSlug) return [];
    const set = new Set<string>();
    for (const t of tasks) if (t.assignee_username) set.add(t.assignee_username);
    for (const s of subtasks) if (s.assignee_username) set.add(s.assignee_username);
    return [...set].sort();
  }, [tasks, subtasks, groupSlug]);

  return (
    <>
      <TaskFilterBar
        filters={filters}
        setFilter={setFilter}
        reset={reset}
        isActive={isActive}
        categories={categories}
        assignees={assignees}
        groupSlug={groupSlug}
      />

      {filters.kind === "subtask" ? (
        <SubtaskListView
          subtasks={filteredSubtasks}
          categories={visibleCategories}
          tasks={tasks}
          isLoading={isLoading}
          groupSlug={groupSlug}
        />
      ) : (
        <TaskBoard
          categories={visibleCategories}
          tasks={filteredTasks}
          isLoading={isLoading}
          groupSlug={groupSlug}
        />
      )}
    </>
  );
}
