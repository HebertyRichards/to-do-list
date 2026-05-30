"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { DateTimeField } from "@/components/ui/datetime-field";
import { STATUS_OPTIONS } from "@/utils/statuses";
import type { ItemFormFields } from "@/types/task-modal";

interface FieldsBlockProps {
  register: UseFormRegister<ItemFormFields>;
  control: Control<ItemFormFields>;
  assignee: string;
  groupSlug?: string;
  members: Array<{ username: string; avatar_url?: string | null }>;
  ids: {
    titleId: string;
    descId: string;
    startId: string;
    dueId: string;
    statusId: string;
    assigneeId: string;
  };
  titleError?: string;
  dueError?: string;
  hideStatus?: boolean;
}

const fieldClass =
  "h-9 w-full rounded border border-border bg-surface-muted px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function FieldsBlock({
  register,
  control,
  assignee,
  groupSlug,
  members,
  ids,
  titleError,
  dueError,
  hideStatus,
}: FieldsBlockProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={ids.titleId}>Título</Label>
        <input
          id={ids.titleId}
          maxLength={180}
          className={fieldClass}
          {...register("title")}
        />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={ids.descId}>Descrição</Label>
        <textarea
          id={ids.descId}
          rows={3}
          placeholder="Descrição (opcional)"
          className="w-full rounded border border-border bg-surface-muted px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={ids.startId}>Início</Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateTimeField id={ids.startId} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={ids.dueId}>Prazo máximo</Label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DateTimeField id={ids.dueId} value={field.value} onChange={field.onChange} />
            )}
          />
          {dueError && <p className="text-xs text-destructive">{dueError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {!hideStatus && (
          <div className="space-y-1.5">
            <Label htmlFor={ids.statusId}>Status</Label>
            <select id={ids.statusId} className={fieldClass} {...register("status")}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {groupSlug && (
          <div className="space-y-1.5">
            <Label htmlFor={ids.assigneeId}>Responsável</Label>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold uppercase text-foreground-muted">
                {assignee ? assignee[0] : "—"}
              </div>
              <select
                id={ids.assigneeId}
                className="h-9 flex-1 rounded border border-border bg-surface-muted px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                {...register("assignee")}
              >
                <option value="">Sem responsável</option>
                {members.map((m) => (
                  <option key={m.username} value={m.username}>@{m.username}</option>
                ))}
              </select>
            </div>
            {assignee && (
              <p className="text-[11px] text-foreground-subtle">
                Responsável: <span className="font-medium text-foreground-muted">@{assignee}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
