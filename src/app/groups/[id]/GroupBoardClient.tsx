"use client";

import { useGroupTasks } from "@/hooks/use-tasks";
import { useGroupCategories } from "@/hooks/use-categories";
import { useGroup } from "@/hooks/use-groups";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { AppShell } from "@/components/layout/AppShell";

interface Props {
  groupSlug: string;
}

export default function GroupBoardClient({ groupSlug }: Props) {
  const { data: tasks = [], isLoading: loadingTasks } = useGroupTasks(groupSlug);
  const { data: categories = [], isLoading: loadingCategories } = useGroupCategories(groupSlug);
  const { data: group } = useGroup(groupSlug);

  return (
    <AppShell title={group?.name ?? "Grupo"}>
      <TaskBoard
        categories={categories}
        tasks={tasks}
        isLoading={loadingTasks || loadingCategories}
        subtaskCounts={{}}
        groupSlug={groupSlug}
      />
    </AppShell>
  );
}
