"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSubtasks, useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from "@/hooks/use-subtasks";
import { useUpdateTask } from "@/hooks/use-tasks";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { localNow, formatDatetimePtBR, formatCreatedAtLocal } from "@/utils/datetime";
import { STATUS_OPTIONS, getStatusOption } from "@/utils/statuses";
import { cn } from "@/utils/cn";
import type { Task, Subtask, TaskStatus } from "@/types/api";

interface Props {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
}

function NewSubtaskForm({ taskSlug, onDone }: { taskSlug: string; onDone: () => void }) {
  const create = useCreateSubtask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(localNow());
  const [dueDate, setDueDate] = useState(localNow());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate(
      {
        task_slug: taskSlug,
        title: title.trim(),
        description: description.trim() || undefined,
        start_date: `${startDate}:00`,
        due_date: `${dueDate}:00`,
      },
      { onSuccess: () => { setTitle(""); setDescription(""); onDone(); } },
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
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)"
        rows={2}
        className="w-full rounded border border-border bg-surface-muted px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="grid grid-cols-2 gap-1.5 text-xs text-foreground-muted">
        <div>
          <label className="mb-0.5 block">Início</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 w-full rounded border border-border bg-surface-muted px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block">Prazo</label>
          <input
            type="datetime-local"
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

function SubtaskRow({ subtask, taskSlug }: { subtask: Subtask; taskSlug: string }) {
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask(taskSlug);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(subtask.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusOpt = getStatusOption(subtask.status);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== subtask.title) {
      updateSubtask.mutate({ slug: subtask.slug, data: { title: trimmed } });
    }
    setRenaming(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSubtask.mutate({ slug: subtask.slug, data: { status: e.target.value as TaskStatus } });
  };

  const isDone = subtask.status === "done" || subtask.status === "archived";

  return (
    <div className="flex flex-col gap-1 rounded border p-2">
      <div className="flex items-center gap-2">
        {renaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setDraft(subtask.title); setRenaming(false); }
            }}
            maxLength={180}
            className="h-7 flex-1 rounded border border-ring bg-surface-muted px-2 text-sm focus:outline-none"
          />
        ) : (
          <span className={cn("flex-1 text-sm", isDone && "line-through text-foreground-subtle")}>
            {subtask.title}
          </span>
        )}
        {!renaming && (
          <button
            onClick={() => { setRenaming(true); setDraft(subtask.title); }}
            className="shrink-0 text-foreground-subtle hover:text-foreground-muted transition-colors"
            title="Renomear"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteSubtask.mutate({ slug: subtask.slug })}
          className="h-7 w-7 shrink-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {subtask.description && (
        <p className="text-xs text-foreground-subtle whitespace-pre-wrap">{subtask.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-0.5">
        <select
          value={subtask.status}
          onChange={handleStatusChange}
          className={cn(
            "rounded px-1.5 py-0.5 text-[11px] font-medium cursor-pointer border-0 outline-none",
            statusOpt.className,
          )}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <span className="text-[11px] text-foreground-subtle">
          <span className="font-medium text-foreground-muted">@{subtask.creator_username}</span>
          {" · "}
          {formatCreatedAtLocal(subtask.created_at)}
        </span>
      </div>
    </div>
  );
}

export function TaskModal({ task, onOpenChange }: Props) {
  const { data: subtasks = [], isLoading } = useSubtasks(task?.slug ?? "");
  const updateTask = useUpdateTask();
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [renamingTask, setRenamingTask] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingTask) titleInputRef.current?.focus();
  }, [renamingTask]);

  if (!task) return null;

  const toggleTaskStatus = () => {
    updateTask.mutate({
      slug: task.slug,
      data: { status: task.status === "done" ? "pending" : "done" },
    });
  };

  const commitTaskRename = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask.mutate({ slug: task.slug, data: { title: trimmed } });
    }
    setRenamingTask(false);
  };

  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Checkbox checked={task.status === "done"} onCheckedChange={toggleTaskStatus} className="mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              {renamingTask ? (
                <>
                  <DialogTitle className="sr-only">{task.title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <input
                      ref={titleInputRef}
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitTaskRename();
                        if (e.key === "Escape") { setTitleDraft(task.title); setRenamingTask(false); }
                      }}
                      maxLength={180}
                      className="flex-1 rounded border border-ring bg-surface-muted px-2 py-1 text-base font-semibold focus:outline-none"
                    />
                    <button onClick={commitTaskRename} className="text-success hover:text-success/80">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setTitleDraft(task.title); setRenamingTask(false); }} className="text-foreground-muted hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <DialogTitle className={task.status === "done" ? "line-through text-foreground-subtle" : ""}>
                    {task.title}
                  </DialogTitle>
                  <button
                    onClick={() => { setRenamingTask(true); setTitleDraft(task.title); }}
                    className="text-foreground-subtle hover:text-foreground-muted transition-colors"
                    title="Renomear tarefa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <DialogDescription className="mt-0.5">
                {formatDatetimePtBR(task.start_date)} → {formatDatetimePtBR(task.due_date)}
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
            <div className="flex items-center justify-between text-[11px] text-foreground-subtle">
              <span>
                <span className="font-medium text-foreground-muted">@{task.creator_username}</span>
                {" · "}
                {formatCreatedAtLocal(task.created_at)}
              </span>
              <select
                value={task.status}
                onChange={(e) => updateTask.mutate({ slug: task.slug, data: { status: e.target.value as TaskStatus } })}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[11px] font-medium cursor-pointer border-0 outline-none",
                  getStatusOption(task.status).className,
                )}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

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
                  <SubtaskRow key={s.slug} subtask={s} taskSlug={task.slug} />
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
