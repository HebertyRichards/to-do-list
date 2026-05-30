import type { TaskStatus } from "@/types/api";

type StatusOption = { value: TaskStatus; label: string; className: string };

const PENDING: StatusOption = {
  value: "pending",
  label: "Pendente",
  className: "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
};

export const STATUS_OPTIONS: StatusOption[] = [
  PENDING,
  { value: "in_progress", label: "Em criação",   className: "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300"  },
  { value: "done",        label: "Em produção",  className: "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300" },
  { value: "archived",    label: "Finalizada",   className: "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400"  },
];

export function getStatusOption(status: TaskStatus): StatusOption {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? PENDING;
}
