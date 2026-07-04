import { z } from "zod";
import { TaskStatusSchema, type Task, type Subtask, type TaskStatus } from "./api";

export type ItemKind = "task" | "subtask";

export interface CommonItem {
  slug: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  is_urgent: boolean;
  is_overdue: boolean;
  start_date: string;
  due_date: string;
  created_at: string;
  creator_username: string;
  assignee_username: string | null;
}

export type ModalProps = {
  onOpenChange: (open: boolean) => void;
  groupSlug?: string;
} & (
  | { kind: "task"; item: Task | null }
  | { kind: "subtask"; item: Subtask | null; taskSlug: string }
);

export interface UpdateData {
  title?: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  status?: TaskStatus;
  is_urgent?: boolean;
  assignee_username?: string;
  category_slug?: string;
  position?: number;
}

export interface UpdateAction {
  isPending: boolean;
  mutate: (data: UpdateData) => void;
}

export interface DeleteAction {
  isPending: boolean;
  mutate: (opts: { onSuccess: () => void }) => void;
}

// Mensagens vêm do namespace "taskModal"; o schema é factory para usar o `t`.
export function makeItemFormSchema(t: (key: string) => string) {
  return z
    .object({
      title: z.string().trim().min(1, t("titleRequired")).max(180),
      description: z.string(),
      startDate: z.string().min(1, t("startRequired")),
      dueDate: z.string().min(1, t("dueRequired")),
      status: TaskStatusSchema,
      isUrgent: z.boolean(),
      assignee: z.string(),
    })
    .refine((d) => !d.startDate || !d.dueDate || d.dueDate >= d.startDate, {
      path: ["dueDate"],
      message: t("dueAfterStart"),
    });
}
export type ItemFormFields = z.infer<ReturnType<typeof makeItemFormSchema>>;
