"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";

export const useHabits = () => trpc.habits.list.useQuery();

export const useTodayHabits = () => trpc.habits.listToday.useQuery();

export const useHabitStats = () => trpc.habits.stats.useQuery();

function invalidateAll(utils: ReturnType<typeof trpc.useUtils>) {
  utils.habits.list.invalidate();
  utils.habits.listToday.invalidate();
  utils.habits.stats.invalidate();
}

export function useCreateHabit() {
  const utils = trpc.useUtils();
  return trpc.habits.create.useMutation({
    onSuccess: () => {
      toast.success("Hábito criado.");
      invalidateAll(utils);
    },
    onError: showError,
  });
}

export function useUpdateHabit() {
  const utils = trpc.useUtils();
  return trpc.habits.update.useMutation({
    onSuccess: () => {
      toast.success("Hábito atualizado.");
      invalidateAll(utils);
    },
    onError: showError,
  });
}

export function useSetHabitStatus() {
  const utils = trpc.useUtils();
  return trpc.habits.setStatus.useMutation({
    onSuccess: () => invalidateAll(utils),
    onError: showError,
  });
}

export function useDeleteHabit() {
  const utils = trpc.useUtils();
  return trpc.habits.delete.useMutation({
    onSuccess: () => {
      toast.success("Hábito removido.");
      invalidateAll(utils);
    },
    onError: showError,
  });
}
