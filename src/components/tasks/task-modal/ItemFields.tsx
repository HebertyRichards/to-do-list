"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubtasks } from "@/hooks/use-subtasks";
import { useGroupMembers } from "@/hooks/use-groups";
import { useCategories, useGroupCategories } from "@/hooks/use-categories";
import { useAuth } from "@/providers/auth";
import { Trash2 } from "lucide-react";
import { formatCreatedAtLocal, isoToLocalInput, localInputToIso } from "@/utils/datetime";
import type { Task, Subtask } from "@/types/api";
import { TimelineTab } from "./TimelineTab";
import {
  makeItemFormSchema,
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
  const t = useTranslations("taskModal");
  const tCommon = useTranslations("common");
  const { data: members = [] } = useGroupMembers(groupSlug ?? "");
  const { user } = useAuth();
  const { data: subtasks = [], isLoading: loadingSubtasks } = useSubtasks(
    kind === "task" ? item.slug : "",
  );

  // Categorias para o seletor de "mover tarefa" (só faz sentido em tarefa).
  const userCategories = useCategories();
  const groupCategories = useGroupCategories(groupSlug ?? "");
  const categories = groupSlug ? groupCategories.data ?? [] : userCategories.data ?? [];
  const currentCategory = "category_slug" in item ? (item as Task).category_slug : undefined;

  const moveCategory = (slug: string) => {
    if (slug !== currentCategory) update.mutate({ category_slug: slug });
  };

  const canComplete =
    !!user &&
    (user.username === item.creator_username || user.username === item.assignee_username);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openSubtask, setOpenSubtask] = useState<Subtask | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ItemFormFields>({
    resolver: zodResolver(useMemo(() => makeItemFormSchema(t), [t])),
    defaultValues: {
      title: item.title,
      description: item.description ?? "",
      startDate: isoToLocalInput(item.start_date),
      dueDate: isoToLocalInput(item.due_date),
      status: item.status,
      isUrgent: item.is_urgent,
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
      start_date: localInputToIso(data.startDate),
      due_date: localInputToIso(data.dueDate),
      status: data.status,
      is_urgent: data.isUrgent,
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
      lockDone={!canComplete}
      currentStatus={item.status}
    />
  );

  const taskTags = "tags" in item ? (item as Task).tags : [];

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{kind === "task" ? t("editTask") : t("editSubtask")}</DialogTitle>
        <DialogDescription className="text-[11px]">
          <span className="font-medium text-foreground-muted">@{item.creator_username}</span>
          {" · "}
          {t("createdAt", { date: formatCreatedAtLocal(item.created_at) })}
        </DialogDescription>
      </DialogHeader>

      {kind === "task" ? (
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">{t("detailsTab")}</TabsTrigger>
            <TabsTrigger value="subtasks">{t("subtasksTab", { count: subtasks.length })}</TabsTrigger>
            <TabsTrigger value="activity">{t("activityTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-3">
            {fields}
            <div>
              <label className="mb-0.5 block text-xs text-foreground-muted">{t("category")}</label>
              <Select value={currentCategory} onValueChange={moveCategory}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug} className="text-sm">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <TabsContent value="activity">
            <TimelineTab target={{ kind: "task", slug: item.slug }} groupSlug={groupSlug} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-3">
          {fields}
          <div className="border-t border-border pt-3">
            <TimelineTab target={{ kind: "subtask", slug: item.slug }} groupSlug={groupSlug} />
          </div>
        </div>
      )}

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {confirmDelete ? (
            <>
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
                {t("confirmDelete")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} disabled={pending}>
                {tCommon("cancel")}
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
              <Trash2 className="mr-1.5 h-4 w-4" /> {t("delete")}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            {tCommon("cancel")}
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit(onSubmit)} disabled={pending}>
            {t("save")}
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
