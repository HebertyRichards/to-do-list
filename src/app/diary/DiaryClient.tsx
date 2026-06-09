"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "@/providers/auth";
import {
  useHabits,
  useTodayHabits,
  useHabitStats,
} from "@/hooks/use-habits";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { Habit } from "@/types/api";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitStatsCards } from "@/components/habits/HabitStatsCards";
import { CreateHabitModal } from "@/components/habits/habit-modal/CreateHabitModal";
import { EditHabitModal } from "@/components/habits/habit-modal/EditHabitModal";

type View = "today" | "all";

export default function DiaryClient() {
  const router = useRouter();
  const { user, isLoading: loadingUser } = useAuth();

  const [view, setView] = useState<View>("today");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const { data: todayHabits = [], isLoading: loadingToday } = useTodayHabits();
  const { data: allHabits = [], isLoading: loadingAll } = useHabits();
  const { data: stats, isLoading: loadingStats } = useHabitStats();

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

  const habits = view === "today" ? todayHabits : allHabits;
  const loadingList = view === "today" ? loadingToday : loadingAll;

  return (
    <AppShell title="Diário">
      <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        <HabitStatsCards stats={stats} isLoading={loadingStats} />

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
            {(["today", "all"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:text-foreground",
                )}
              >
                {v === "today" ? "Hoje" : "Todos"}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Novo hábito
          </Button>
        </div>

        {loadingList ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-foreground-muted">
              {view === "today"
                ? "Nenhum hábito programado para hoje."
                : "Você ainda não tem hábitos. Crie o primeiro!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <HabitCard
                key={habit.slug}
                habit={habit}
                onEdit={setEditing}
                showStatus={view === "today"}
              />
            ))}
          </div>
        )}
      </div>

      <CreateHabitModal open={createOpen} onOpenChange={setCreateOpen} />
      <EditHabitModal habit={editing} onOpenChange={(open) => !open && setEditing(null)} />
    </AppShell>
  );
}
