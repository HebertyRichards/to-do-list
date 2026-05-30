"use client";

import { useState } from "react";
import { useCreateSubtask } from "@/hooks/use-subtasks";
import { DateTimeField } from "@/components/ui/datetime-field";
import { localNow } from "@/utils/datetime";

interface Props {
  taskSlug: string;
  onDone: () => void;
}

export function NewSubtaskForm({ taskSlug, onDone }: Props) {
  const create = useCreateSubtask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(localNow());
  const [dueDate, setDueDate] = useState(localNow());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !dueDate) return;
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
      <div className="grid grid-cols-1 gap-2 text-xs text-foreground-muted">
        <div>
          <label className="mb-0.5 block">Início</label>
          <DateTimeField value={startDate} onChange={setStartDate} />
        </div>
        <div>
          <label className="mb-0.5 block">Prazo</label>
          <DateTimeField value={dueDate} onChange={setDueDate} />
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
