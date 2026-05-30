"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useUpdateSubtask, useDeleteSubtask } from "@/hooks/use-subtasks";
import type { Task, Subtask } from "@/types/api";
import type { DeleteAction, ModalProps, UpdateAction } from "@/types/task-modal";
import { ItemFields } from "./task-modal/ItemFields";
import { FULLSCREEN_MOBILE } from "./task-modal/constants";

function TaskBody({
  item,
  groupSlug,
  onClose,
}: {
  item: Task;
  groupSlug?: string;
  onClose: () => void;
}) {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const update: UpdateAction = {
    isPending: updateMutation.isPending,
    mutate: (data) => updateMutation.mutate({ slug: item.slug, data }),
  };
  const remove: DeleteAction = {
    isPending: deleteMutation.isPending,
    mutate: ({ onSuccess }) => deleteMutation.mutate({ slug: item.slug }, { onSuccess }),
  };

  return (
    <ItemFields
      item={item}
      kind="task"
      groupSlug={groupSlug}
      update={update}
      remove={remove}
      onClose={onClose}
    />
  );
}

function SubtaskBody({
  item,
  taskSlug,
  groupSlug,
  onClose,
}: {
  item: Subtask;
  taskSlug: string;
  groupSlug?: string;
  onClose: () => void;
}) {
  const updateMutation = useUpdateSubtask();
  const deleteMutation = useDeleteSubtask(taskSlug);

  const update: UpdateAction = {
    isPending: updateMutation.isPending,
    mutate: (data) => updateMutation.mutate({ slug: item.slug, data }),
  };
  const remove: DeleteAction = {
    isPending: deleteMutation.isPending,
    mutate: ({ onSuccess }) => deleteMutation.mutate({ slug: item.slug }, { onSuccess }),
  };

  return (
    <ItemFields
      item={item}
      kind="subtask"
      groupSlug={groupSlug}
      update={update}
      remove={remove}
      onClose={onClose}
    />
  );
}

export function TaskItemModal(props: ModalProps) {
  const open = !!props.item;
  const onClose = () => props.onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      <DialogContent className={`max-w-2xl ${FULLSCREEN_MOBILE}`}>
        {props.item && props.kind === "task" && (
          <TaskBody
            key={props.item.slug}
            item={props.item}
            groupSlug={props.groupSlug}
            onClose={onClose}
          />
        )}
        {props.item && props.kind === "subtask" && (
          <SubtaskBody
            key={props.item.slug}
            item={props.item}
            taskSlug={props.taskSlug}
            groupSlug={props.groupSlug}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
