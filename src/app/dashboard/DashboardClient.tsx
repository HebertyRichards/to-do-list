"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { useTasks } from "@/hooks/use-tasks";
import { useMySubtasks } from "@/hooks/use-subtasks";
import { useCategories } from "@/hooks/use-categories";
import { AppShell } from "@/components/layout/AppShell";
import OnboardingModal from "@/components/layout/OnboardingModal";
import { BoardWorkspace } from "@/components/tasks/BoardWorkspace";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function DashboardClient() {
  const t = useTranslations("pages");
  const router = useRouter();
  const { user, isLoading: loadingUser } = useAuth();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: subtasks = [] } = useMySubtasks();
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
    <AppShell title={t("myTasks")}>
      {!user.onboarded && <OnboardingModal />}
      <BoardWorkspace
        categories={categories}
        tasks={tasks}
        subtasks={subtasks}
        isLoading={loadingTasks || loadingCategories}
      />
    </AppShell>
  );
}
