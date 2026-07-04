"use client";

import { useTranslations } from "next-intl";
import type { HabitStats } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressCardProps {
  label: string;
  done: number;
  scheduled: number;
  percent: number;
}

function ProgressCard({ label, done, scheduled, percent }: ProgressCardProps) {
  const t = useTranslations("habits");
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-foreground-muted">{label}</span>
        <span className="text-lg font-semibold text-foreground">{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-foreground-subtle">
        {t("doneOf", { done, scheduled })}
      </p>
    </div>
  );
}

interface Props {
  stats?: HabitStats;
  isLoading: boolean;
}

export function HabitStatsCards({ stats, isLoading }: Props) {
  const t = useTranslations("habits");
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ProgressCard
        label={t("today")}
        done={stats.daily_done}
        scheduled={stats.daily_scheduled}
        percent={stats.daily_percent}
      />
      <ProgressCard
        label={t("monthLabel", { month: stats.month })}
        done={stats.monthly_done}
        scheduled={stats.monthly_scheduled}
        percent={stats.monthly_percent}
      />
    </div>
  );
}
