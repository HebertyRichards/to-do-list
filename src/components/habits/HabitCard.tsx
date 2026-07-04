"use client";

import { Repeat } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Habit, HabitStatus } from "@/types/api";
import { useSetHabitStatus } from "@/hooks/use-habits";
import { cn } from "@/utils/cn";
import { DAYS_OF_WEEK, HABIT_STATUS_OPTIONS } from "./constants";

interface Props {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  showStatus?: boolean;
}

export function HabitCard({ habit, onEdit, showStatus }: Props) {
  const t = useTranslations("habits");
  const setStatus = useSetHabitStatus();
  const done = habit.today_status === "done";
  const currentStatus = habit.today_status ?? "pending";
  const statusClass = HABIT_STATUS_OPTIONS.find((o) => o.value === currentStatus)?.className;

  const frequencyLabel = (): string => {
    if (habit.every_day) return t("everyDayFreq");
    const set = new Set(habit.days_of_week);
    const labels = DAYS_OF_WEEK.filter((d) => set.has(d)).map((d) => t(`dayShort.${d}`));
    return labels.length ? labels.join(", ") : t("noDays");
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors",
        done && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={() => onEdit(habit)}
        className="flex-1 text-left"
      >
        <p className={cn("text-sm font-medium text-foreground", done && "line-through")}>
          {habit.title}
        </p>
        {habit.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">{habit.description}</p>
        )}
        <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-foreground-subtle">
          <Repeat className="h-3 w-3" />
          {frequencyLabel()}
        </span>
      </button>

      {showStatus && habit.scheduled_today && (
        <select
          aria-label={t("todayStatus")}
          className={cn(
            "h-8 shrink-0 rounded border border-border px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60",
            statusClass,
          )}
          value={currentStatus}
          disabled={setStatus.isPending}
          onChange={(e) =>
            setStatus.mutate({
              slug: habit.slug,
              data: { status: e.target.value as HabitStatus },
            })
          }
        >
          {HABIT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(`status.${opt.value}`)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
