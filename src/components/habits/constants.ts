import { z } from "zod";
import type { HabitStatus } from "@/types/api";

export const FULLSCREEN_MOBILE =
  "max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none";

export const DAYS_OF_WEEK: { value: number; short: string; label: string }[] = [
  { value: 1, short: "Seg", label: "Segunda" },
  { value: 2, short: "Ter", label: "Terça" },
  { value: 3, short: "Qua", label: "Quarta" },
  { value: 4, short: "Qui", label: "Quinta" },
  { value: 5, short: "Sex", label: "Sexta" },
  { value: 6, short: "Sáb", label: "Sábado" },
  { value: 0, short: "Dom", label: "Domingo" },
];

type HabitStatusOption = { value: HabitStatus; label: string; className: string };

export const HABIT_STATUS_OPTIONS: HabitStatusOption[] = [
  {
    value: "pending",
    label: "Pendente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    value: "in_progress",
    label: "Em andamento",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    value: "done",
    label: "Concluído",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
];

export const habitFormSchema = z
  .object({
    title: z.string().trim().min(1, "Título obrigatório").max(180),
    description: z.string(),
    everyDay: z.boolean(),
    days: z.array(z.number().int().min(0).max(6)),
  })
  .refine((d) => d.everyDay || d.days.length > 0, {
    path: ["days"],
    message: "Selecione ao menos um dia ou marque todos os dias.",
  });

export type HabitFormFields = z.infer<typeof habitFormSchema>;
