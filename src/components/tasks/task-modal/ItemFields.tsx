"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSubtasks } from "@/hooks/use-subtasks";
import { useGroupMembers } from "@/hooks/use-groups";
import { Trash2 } from "lucide-react";
import { formatCreatedAtLocal, isoToLocalInput } from "@/utils/datetime";
import type { Task, Subtask } from "@/types/api";
import {
  itemFormSchema,
  type CommonItem,
  type DeleteAction,
  type ItemFormFields,
  type ItemKind,
  type UpdateAction,
} from "@/types/task-modal";
import { FieldsBlock } from "./FieldsBlock";
import { SubtasksTab } from "./SubtasksTab";
import { TaskItemModal } from "../TaskItemModal";

interface Props {
  item: CommonItem;
  kind: ItemKind;
  groupSlug?: string;
  update: UpdateAction;
  remove: DeleteAction;
  onClose: () => void;
}

export function ItemFields({ item, kind, groupSlug, update, remove, onClose }: Props) {
  const { data: members = [] } = useGroupMembers(groupSlug ?? "");
  const { data: subtasks = [], isLoading: loadingSubtasks } = useSubtasks(
    kind === "task" ? item.slug : "",
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openSubtask, setOpenSubtask] = useState<Subtask | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ItemFormFields>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: item.title,
      description: item.description ?? "",
      startDate: isoToLocalInput(item.start_date),
      dueDate: isoToLocalInput(item.due_date),
      status: item.status,
      assignee: item.assignee_username ?? "",
    },
  });

  const assignee = watch("assignee");

  const pending = update.isPending || remove.isPending;

  const onSubmit = (data: ItemFormFields) => {
    if (!isDirty) {
      onClose();
      return;
    }
    update.mutate({
      title: data.title,
      description: data.description,
      start_date: `${data.startDate}:00`,
      due_date: `${data.dueDate}:00`,
      status: data.status,
      assignee_username: groupSlug ? data.assignee : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    remove.mutate({ onSuccess: () => { setConfirmDelete(false); onClose(); } });
  };

  const ids = {
    titleId: `${kind}-title`,
    descId: `${kind}-desc`,
    startId: `${kind}-start`,
    dueId: `${kind}-due`,
    statusId: `${kind}-status`,
    assigneeId: `${kind}-assignee`,
  };

  const fields = (
    <FieldsBlock
      register={register}
      control={control}
      assignee={assignee}
      groupSlug={groupSlug}
      members={members}
      ids={ids}
      titleError={errors.title?.message}
      dueError={errors.dueDate?.message}
    />
  );

  const taskTags = "tags" in item ? (item as Task).tags : [];

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{kind === "task" ? "Editar tarefa" : "Editar subtarefa"}</DialogTitle>
        <DialogDescription className="text-[11px]">
          <span className="font-medium text-foreground-muted">@{item.creator_username}</span>
          {" · criada em "}
          {formatCreatedAtLocal(item.created_at)}
        </DialogDescription>
      </DialogHeader>

      {kind === "task" ? (
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subtasks">Subtarefas ({subtasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-3">
            {fields}
            {taskTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {taskTags.map((t) => (
                  <span key={t.name} className="rounded bg-surface-secondary px-2 py-0.5 text-xs">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subtasks" className="space-y-2">
            <SubtasksTab
              taskSlug={item.slug}
              subtasks={subtasks}
              loading={loadingSubtasks}
              onOpenSubtask={setOpenSubtask}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-3">{fields}</div>
      )}

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {confirmDelete ? (
            <>
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
                Confirmar exclusão
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} disabled={pending}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Excluir
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit(onSubmit)} disabled={pending}>
            Salvar
          </Button>
        </div>
      </DialogFooter>

      {kind === "task" && (
        <TaskItemModal
          kind="subtask"
          item={openSubtask}
          taskSlug={item.slug}
          groupSlug={groupSlug}
          onOpenChange={(open) => !open && setOpenSubtask(null)}
        />
      )}
    </div>
  );
}
