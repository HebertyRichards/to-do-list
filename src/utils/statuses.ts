import type { TaskStatus } from "@/types/api";

// `key` é a chave no namespace "status" das mensagens (next-intl);
// componentes traduzem no render com useTranslations("status").
type StatusOption = { value: TaskStatus; key: TaskStatus; className: string };
type Badge = { key: TaskStatus | "overdue"; className: string };

const PENDING: StatusOption = {
  value: "pending",
  key: "pending",
  className: "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
};

export const STATUS_OPTIONS: StatusOption[] = [
  PENDING,
  { value: "in_progress", key: "in_progress", className: "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300"  },
  { value: "done",        key: "done",        className: "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300" },
];

export const OVERDUE_BADGE: Badge = {
  key: "overdue",
  className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function getStatusOption(status: TaskStatus): StatusOption {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? PENDING;
}

export function getDisplayBadge(item: { status: TaskStatus; is_overdue: boolean }): Badge {
  if (item.is_overdue) return OVERDUE_BADGE;
  return getStatusOption(item.status);
}
