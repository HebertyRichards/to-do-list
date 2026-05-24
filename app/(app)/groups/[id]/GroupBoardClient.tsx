"use client";

import Link from "next/link";
import { useGroupTasks } from "@/src/hooks/use-tasks";
import { useGroupCategories } from "@/src/hooks/use-categories";
import { TaskBoard } from "@/src/components/tasks/TaskBoard";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ModeToggle } from "@/src/components/layout/ThemeToggle";

interface Props {
  groupSlug: string;
}

export default function GroupBoardClient({ groupSlug }: Props) {
  const { data: tasks = [], isLoading: loadingTasks } = useGroupTasks(groupSlug);
  const { data: categories = [], isLoading: loadingCategories } = useGroupCategories(groupSlug);

  const subtaskCounts: Record<string, { done: number; total: number }> = {};

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-surface px-6 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/groups">
              <ChevronLeft className="h-4 w-4" />
              Grupos
            </Link>
          </Button>
          <span className="font-semibold">Grupo</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </header>

      <TaskBoard
        categories={categories}
        tasks={tasks}
        isLoading={loadingTasks || loadingCategories}
        subtaskCounts={subtaskCounts}
        groupSlug={groupSlug}
      />
    </div>
  );
}
