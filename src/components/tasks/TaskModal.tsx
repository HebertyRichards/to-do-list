"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { useSubtasks, useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from "@/src/hooks/use-subtasks";
import { useUpdateTask } from "@/src/hooks/use-tasks";
import { Plus, Trash2 } from "lucide-react";
import type { Task, Subtask } from "@/src/types/api";

const today = () => new Date().toISOString().slice(0, 10);

interface Props {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
}

function NewSubtaskForm({ taskSlug, onDone }: { taskSlug: string; onDone: () => void }) {
  const create = useCreateSubtask();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [dueDate, setDueDate] = useState(today());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate(
      {
        task_slug: taskSlug,
        title: title.trim(),
        start_date: `${startDate}T00:00:00`,
        due_date: `${dueDate}T23:59:59`,
      },
      { onSuccess: () => { setTitle(""); onDone(); } },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded border border-border p-2 mt-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da subtarefa"
        maxLength={180}
        className="h-8 w-full rounded border border-border bg-surface-muted px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="grid grid-cols-2 gap-1.5 text-xs text-foreground-muted">
        <div>
          <label className="mb-0.5 block">Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 w-full rounded border border-border bg-surface-muted px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block">Prazo</label>
          <input
            type="date"
            value={dueDate}
            min={startDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-7 w-full rounded border border-border bg-surface-muted px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="flex-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? "..." : "Criar"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded border px-2 py-1 text-xs text-foreground-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function TaskModal({ task, onOpenChange }: Props) {
  const { data: subtasks = [], isLoading } = useSubtasks(task?.slug ?? "");
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask(task?.slug ?? "");
  const updateTask = useUpdateTask();
  const [addingSubtask, setAddingSubtask] = useState(false);

  if (!task) return null;

  const toggleTaskStatus = () => {
    updateTask.mutate({
      slug: task.slug,
      data: { status: task.status === "done" ? "pending" : "done" },
    });
  };

  const toggleSubtask = (sub: Subtask) => {
    updateSubtask.mutate({
      slug: sub.slug,
      data: { status: sub.status === "done" ? "pending" : "done" },
    });
  };

  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Checkbox checked={task.status === "done"} onCheckedChange={toggleTaskStatus} className="mt-1" />
            <div className="flex-1">
              <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription>
                {new Date(task.start_date).toLocaleDateString("pt-BR")} →{" "}
                {new Date(task.due_date).toLocaleDateString("pt-BR")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subtasks">Subtarefas ({subtasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-3">
            {task.description ? (
              <p className="text-sm text-foreground-muted whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-sm text-foreground-subtle italic">Sem descricao</p>
            )}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((t) => (
                  <span key={t.name} className="rounded bg-surface-secondary px-2 py-0.5 text-xs">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subtasks" className="space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              <>
                {subtasks.length === 0 && !addingSubtask && (
                  <p className="text-sm text-foreground-subtle italic">Nenhuma subtarefa</p>
                )}

                {subtasks.map((s) => (
                  <div key={s.slug} className="flex items-center gap-3 rounded border p-2">
                    <Checkbox
                      checked={s.status === "done"}
                      onCheckedChange={() => toggleSubtask(s)}
                    />
                    <span className={`flex-1 text-sm ${s.status === "done" ? "line-through text-foreground-subtle" : ""}`}>
                      {s.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSubtask.mutate({ slug: s.slug })}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                {addingSubtask ? (
                  <NewSubtaskForm taskSlug={task.slug} onDone={() => setAddingSubtask(false)} />
                ) : (
                  <button
                    onClick={() => setAddingSubtask(true)}
                    className="flex w-full items-center gap-1.5 rounded border border-dashed border-border px-3 py-2 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nova subtarefa
                  </button>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
