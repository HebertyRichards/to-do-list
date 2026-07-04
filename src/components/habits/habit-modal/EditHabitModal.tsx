"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { formatCreatedAtLocal } from "@/utils/datetime";
import type { Habit } from "@/types/api";
import { makeHabitFormSchema, type HabitFormFields, FULLSCREEN_MOBILE } from "../constants";
import { HabitFields } from "./HabitFields";

interface Props {
  habit: Habit | null;
  onOpenChange: (open: boolean) => void;
}

export function EditHabitModal({ habit, onOpenChange }: Props) {
  return (
    <Dialog open={!!habit} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg ${FULLSCREEN_MOBILE}`}>
        {habit && <EditHabitForm habit={habit} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function EditHabitForm({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const t = useTranslations("habits");
  const tCommon = useTranslations("common");
  const update = useUpdateHabit();
  const remove = useDeleteHabit();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<HabitFormFields>({
    resolver: zodResolver(useMemo(() => makeHabitFormSchema(t), [t])),
    defaultValues: {
      title: habit.title,
      description: habit.description ?? "",
      everyDay: habit.every_day,
      days: habit.days_of_week,
    },
  });

  const pending = update.isPending || remove.isPending;

  const onSubmit = (data: HabitFormFields) => {
    if (!isDirty) {
      onClose();
      return;
    }
    update.mutate(
      {
        slug: habit.slug,
        data: {
          title: data.title,
          description: data.description,
          every_day: data.everyDay,
          days_of_week: data.everyDay ? [] : data.days,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  const handleDelete = () => {
    remove.mutate(
      { slug: habit.slug },
      { onSuccess: () => { setConfirmDelete(false); onClose(); } },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{t("editTitle")}</DialogTitle>
        <DialogDescription className="text-[11px]">
          {t("createdAt", { date: formatCreatedAtLocal(habit.created_at) })}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 pt-1">
        <HabitFields
          register={register}
          control={control}
          ids={{ titleId: "edit-habit-title", descId: "edit-habit-desc" }}
          titleError={errors.title?.message}
          daysError={errors.days?.message}
        />
      </div>

      <DialogFooter className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-between">
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
          <Button type="submit" size="sm" disabled={pending}>
            {update.isPending ? t("saving") : t("save")}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
