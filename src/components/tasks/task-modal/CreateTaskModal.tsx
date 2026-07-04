"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateTask } from "@/hooks/use-tasks";
import { useGroupMembers } from "@/hooks/use-groups";
import { localNow, localInputToIso } from "@/utils/datetime";
import { makeItemFormSchema, type ItemFormFields } from "@/types/task-modal";
import { FieldsBlock } from "./FieldsBlock";
import { FULLSCREEN_MOBILE } from "./constants";

interface Props {
  open: boolean;
  categorySlug: string;
  groupSlug?: string;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskModal({ open, categorySlug, groupSlug, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${FULLSCREEN_MOBILE}`}>
        {open && (
          <CreateTaskForm
            categorySlug={categorySlug}
            groupSlug={groupSlug}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateTaskForm({
  categorySlug,
  groupSlug,
  onClose,
}: {
  categorySlug: string;
  groupSlug?: string;
  onClose: () => void;
}) {
  const t = useTranslations("taskModal");
  const tCommon = useTranslations("common");
  const create = useCreateTask(groupSlug);
  const { data: members = [] } = useGroupMembers(groupSlug ?? "");

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormFields>({
    resolver: zodResolver(useMemo(() => makeItemFormSchema(t), [t])),
    defaultValues: {
      title: "",
      description: "",
      startDate: localNow(),
      dueDate: localNow(),
      status: "pending",
      isUrgent: false,
      assignee: "",
    },
  });

  const assignee = watch("assignee");

  const onSubmit = (data: ItemFormFields) => {
    create.mutate(
      {
        title: data.title,
        description: data.description || undefined,
        category_slug: categorySlug,
        start_date: localInputToIso(data.startDate),
        due_date: localInputToIso(data.dueDate),
        is_urgent: data.isUrgent,
        ...(groupSlug && data.assignee ? { assignee_username: data.assignee } : {}),
      },
      { onSuccess: () => onClose() },
    );
  };

  const ids = {
    titleId: "new-task-title",
    descId: "new-task-desc",
    startId: "new-task-start",
    dueId: "new-task-due",
    statusId: "new-task-status",
    assigneeId: "new-task-assignee",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{t("newTask")}</DialogTitle>
        <DialogDescription className="text-[11px]">
          {t("newTaskSubtitle")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 pt-1">
        <FieldsBlock
          register={register}
          control={control}
          assignee={assignee}
          groupSlug={groupSlug}
          members={members}
          ids={ids}
          titleError={errors.title?.message}
          dueError={errors.dueDate?.message}
          hideStatus
        />
      </div>

      <DialogFooter className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={create.isPending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={create.isPending}>
          {create.isPending ? t("creating") : t("createTask")}
        </Button>
      </DialogFooter>
    </form>
  );
}
