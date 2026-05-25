"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/providers/auth";
import { useTasks } from "@/src/hooks/use-tasks";
import { useCategories } from "@/src/hooks/use-categories";
import { AppShell } from "@/src/components/layout/AppShell";
import OnboardingModal from "@/src/components/layout/OnboardingModal";
import { TaskBoard } from "@/src/components/tasks/TaskBoard";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoading: loadingUser } = useAuth();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  useEffect(() => {
    if (!loadingUser && !user) router.replace("/auth");
  }, [loadingUser, user, router]);

  if (loadingUser) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell title="Minhas tarefas">
      {!user.onboarded && <OnboardingModal />}
      <TaskBoard
        categories={categories}
        tasks={tasks}
        isLoading={loadingTasks || loadingCategories}
        subtaskCounts={{}}
      />
    </AppShell>
  );
}
