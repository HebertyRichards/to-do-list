"use client";

import { useForm } from "react-hook-form";
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
import { useCreateHabit } from "@/hooks/use-habits";
import { habitFormSchema, type HabitFormFields, FULLSCREEN_MOBILE } from "../constants";
import { HabitFields } from "./HabitFields";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHabitModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg ${FULLSCREEN_MOBILE}`}>
        {open && <CreateHabitForm onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CreateHabitForm({ onClose }: { onClose: () => void }) {
  const create = useCreateHabit();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitFormFields>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: { title: "", description: "", everyDay: false, days: [] },
  });

  const onSubmit = (data: HabitFormFields) => {
    create.mutate(
      {
        title: data.title,
        description: data.description || undefined,
        every_day: data.everyDay,
        days_of_week: data.everyDay ? [] : data.days,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Novo hábito</DialogTitle>
        <DialogDescription className="text-[11px]">
          Defina o título e em quais dias ele deve aparecer.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 pt-1">
        <HabitFields
          register={register}
          control={control}
          ids={{ titleId: "new-habit-title", descId: "new-habit-desc" }}
          titleError={errors.title?.message}
          daysError={errors.days?.message}
        />
      </div>

      <DialogFooter className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={create.isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={create.isPending}>
          {create.isPending ? "Criando..." : "Criar hábito"}
        </Button>
      </DialogFooter>
    </form>
  );
}
