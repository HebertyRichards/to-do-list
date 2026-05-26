import type { TaskStatus } from "@/types/api";

export const STATUS_OPTIONS: { value: TaskStatus; label: string; className: string }[] = [
  { value: "pending",     label: "Pendente",     className: "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300" },
  { value: "in_progress", label: "Em criação",   className: "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300"  },
  { value: "done",        label: "Em produção",  className: "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300" },
  { value: "archived",    label: "Finalizada",   className: "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400"  },
];

export function getStatusOption(status: TaskStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}
