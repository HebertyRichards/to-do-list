import { z } from "zod";
import { TaskStatusSchema, type Task, type Subtask, type TaskStatus } from "./api";

export type ItemKind = "task" | "subtask";

export interface CommonItem {
  slug: string;
  title: string;
  description: string | null;
  status: TaskStatus;
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
  assignee_username?: string;
}

export interface UpdateAction {
  isPending: boolean;
  mutate: (data: UpdateData) => void;
}

export interface DeleteAction {
  isPending: boolean;
  mutate: (opts: { onSuccess: () => void }) => void;
}

export const itemFormSchema = z
  .object({
    title: z.string().trim().min(1, "Título obrigatório").max(180),
    description: z.string(),
    startDate: z.string().min(1, "Data de início obrigatória"),
    dueDate: z.string().min(1, "Prazo obrigatório"),
    status: TaskStatusSchema,
    assignee: z.string(),
  })
  .refine((d) => !d.startDate || !d.dueDate || d.dueDate >= d.startDate, {
    path: ["dueDate"],
    message: "O prazo deve ser igual ou posterior ao início",
  });
export type ItemFormFields = z.infer<typeof itemFormSchema>;
