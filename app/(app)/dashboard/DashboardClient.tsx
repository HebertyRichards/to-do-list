"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/providers/auth";
import { useTasks } from "@/src/hooks/use-tasks";
import { useCategories } from "@/src/hooks/use-categories";
import { useLogout } from "@/src/hooks/use-auth";
import { useNotifications } from "@/src/providers/notifications";
import OnboardingModal from "@/src/components/layout/OnboardingModal";
import { TaskBoard } from "@/src/components/tasks/TaskBoard";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Bell } from "lucide-react";
import { ModeToggle } from "@/src/components/layout/ThemeToggle";

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoading: loadingUser } = useAuth();
  const logout = useLogout();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.replace("/auth");
    }
  }, [loadingUser, user, router]);

  if (loadingUser || !user) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Sem subtarefas pre-carregadas (modal busca on demand).
  const subtaskCounts: Record<string, { done: number; total: number }> = {};

  return (
    <div className="flex min-h-screen flex-col">
      {!user.onboarded && <OnboardingModal />}

      <header className="flex items-center justify-between border-b bg-surface px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold">To-Do List</span>
          <Link href="/groups" className="text-sm text-foreground-muted hover:text-foreground">
            Grupos
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <button className="relative">
            <Bell className="h-5 w-5 text-foreground-muted" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>
          <span className="text-sm text-foreground-muted">Ola, {user.username}</span>
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
            Sair
          </Button>
        </div>
      </header>

      <TaskBoard
        categories={categories}
        tasks={tasks}
        isLoading={loadingTasks || loadingCategories}
        subtaskCounts={subtaskCounts}
      />
    </div>
  );
}
