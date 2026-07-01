"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { showError } from "@/errors/toast";

export type CommentTarget = { kind: "task" | "subtask"; slug: string };

export const useComments = (target: CommentTarget) =>
  trpc.comments.list.useQuery(target, { enabled: !!target.slug });

// Timeline unificada (comentários + eventos). Consome comments.timeline.
export const useTimeline = (target: CommentTarget) =>
  trpc.comments.timeline.useQuery(target, { enabled: !!target.slug });

export function useCreateComment(target: CommentTarget) {
  const utils = trpc.useUtils();
  return trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate(target);
      utils.comments.timeline.invalidate(target);
    },
    onError: showError,
  });
}

export function useUpdateComment(target: CommentTarget) {
  const utils = trpc.useUtils();
  return trpc.comments.update.useMutation({
    onSuccess: () => {
      toast.success("Comentário atualizado.");
      utils.comments.list.invalidate(target);
      utils.comments.timeline.invalidate(target);
    },
    onError: showError,
  });
}

export function useDeleteComment(target: CommentTarget) {
  const utils = trpc.useUtils();
  return trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Comentário removido.");
      utils.comments.list.invalidate(target);
      utils.comments.timeline.invalidate(target);
    },
    onError: showError,
  });
}
