import { z } from "zod";
import type { HabitStatus } from "@/types/api";

export const FULLSCREEN_MOBILE =
  "max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none";

// Ordem de exibição (segunda a domingo); rótulos vêm do namespace "habits"
// (dayShort.{value} / dayLabel.{value}).
export const DAYS_OF_WEEK: number[] = [1, 2, 3, 4, 5, 6, 0];

type HabitStatusOption = { value: HabitStatus; className: string };

// Rótulos traduzidos no render via habits.status.{value}.
export const HABIT_STATUS_OPTIONS: HabitStatusOption[] = [
  {
    value: "pending",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    value: "in_progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    value: "done",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
];

// Mensagens vêm do namespace "habits"; schema é factory para usar o `t`.
export function makeHabitFormSchema(t: (key: string) => string) {
  return z
    .object({
      title: z.string().trim().min(1, t("titleRequired")).max(180),
      description: z.string(),
      everyDay: z.boolean(),
      days: z.array(z.number().int().min(0).max(6)),
    })
    .refine((d) => d.everyDay || d.days.length > 0, {
      path: ["days"],
      message: t("daysRequired"),
    });
}

export type HabitFormFields = z.infer<ReturnType<typeof makeHabitFormSchema>>;
