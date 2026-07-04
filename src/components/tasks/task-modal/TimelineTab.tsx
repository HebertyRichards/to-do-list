"use client";

import { useRef, useState } from "react";
import { Send, Pencil, Trash2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTimeline,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  type CommentTarget,
} from "@/hooks/use-comments";
import { useGroupMembers } from "@/hooks/use-groups";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { describeActivity } from "@/utils/activity";
import type { TimelineItem } from "@/types/api";

interface Props {
  target: CommentTarget;
  groupSlug?: string;
}

function ActorAvatar({ username, url }: { username: string; url: string | null }) {
  return (
    <Avatar className="h-6 w-6 shrink-0">
      {url && <AvatarImage src={url} alt={username} />}
      <AvatarFallback className="text-[9px] uppercase">{username[0]}</AvatarFallback>
    </Avatar>
  );
}

export function TimelineTab({ target, groupSlug }: Props) {
  const { data: items = [], isLoading } = useTimeline(target);
  const { data: members = [] } = useGroupMembers(groupSlug ?? "");
  const create = useCreateComment(target);
  const update = useUpdateComment(target);
  const remove = useDeleteComment(target);

  const [body, setBody] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // Menção com "@": trecho entre o "@" e o cursor vira busca entre os membros.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);

  const detectMention = (value: string, caret: number) => {
    const query = value.slice(0, caret).match(/(?:^|\s)@(\w*)$/)?.[1];
    setMention(
      query !== undefined
        ? { query: query.toLowerCase(), start: caret - query.length - 1 }
        : null,
    );
  };

  const suggestions = mention
    ? members.filter((m) => m.username.toLowerCase().startsWith(mention.query))
    : [];

  const pickMention = (username: string) => {
    if (!mention) return;
    const end = mention.start + 1 + mention.query.length;
    setBody(`${body.slice(0, mention.start)}@${username} ${body.slice(end)}`);
    setMention(null);
    textareaRef.current?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    create.mutate({ ...target, body: text }, { onSuccess: () => setBody("") });
  };

  const startEdit = (slug: string, current: string) => {
    setEditingSlug(slug);
    setDraft(current);
  };

  const saveEdit = () => {
    const text = draft.trim();
    if (!text || !editingSlug) return;
    update.mutate({ slug: editingSlug, body: text }, { onSuccess: () => setEditingSlug(null) });
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm italic text-foreground-subtle">Sem atividade ainda</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <TimelineRow
              key={`${item.kind}-${item.slug}`}
              item={item}
              isEditing={editingSlug === item.slug}
              draft={draft}
              onDraftChange={setDraft}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingSlug(null)}
              onDelete={(slug) => remove.mutate({ slug })}
              pending={update.isPending || remove.isPending}
            />
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="flex items-end gap-3 border-t border-border pt-3">
        <div className="relative flex-1">
          {suggestions.length > 0 && (
            <ul className="absolute bottom-full left-0 z-10 mb-1 max-h-40 w-56 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg">
              {suggestions.map((m) => (
                <li key={m.username}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickMention(m.username)}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-surface-secondary"
                  >
                    <ActorAvatar username={m.username} url={null} />
                    <span className="truncate">@{m.username}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              detectMention(e.target.value, e.target.selectionStart);
            }}
            onBlur={() => setMention(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMention(null);
            }}
            placeholder="Escrever um comentário..."
            rows={2}
            maxLength={2000}
            className="min-h-9 w-full resize-none rounded border border-border bg-surface-muted px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Button type="submit" size="sm" disabled={!body.trim() || create.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

interface RowProps {
  item: TimelineItem;
  isEditing: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
  onStartEdit: (slug: string, current: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (slug: string) => void;
  pending: boolean;
}

function TimelineRow({
  item,
  isEditing,
  draft,
  onDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  pending,
}: RowProps) {
  // Evento do sistema: linha discreta com a frase derivada do payload.
  if (item.kind === "activity") {
    return (
      <li className="flex items-center gap-2 px-1 text-xs text-foreground-subtle">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-subtle/50" />
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium text-foreground-muted">@{item.actor_username}</span>{" "}
          {describeActivity(item)}
        </span>
        <time className="shrink-0 tabular-nums">{formatCreatedAtLocal(item.created_at)}</time>
      </li>
    );
  }

  // Comentário humano: balão com avatar, autor, corpo e ações do autor/admin.
  return (
    <li className="flex gap-2 rounded border border-border bg-surface p-2">
      <ActorAvatar username={item.actor_username} url={item.actor_avatar_url} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-foreground-muted">@{item.actor_username}</span>
          <time className="text-foreground-subtle">{formatCreatedAtLocal(item.created_at)}</time>
          {item.updated_at !== item.created_at && (
            <span className="italic text-foreground-subtle">
              (editado {formatCreatedAtLocal(item.updated_at)})
            </span>
          )}
          <div className="ml-auto flex gap-1">
            {item.can_edit && !isEditing && (
              <button
                type="button"
                onClick={() => onStartEdit(item.slug, item.body)}
                className="text-foreground-subtle hover:text-foreground-muted"
                title="Editar"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
            {item.can_delete && !isEditing && (
              <button
                type="button"
                onClick={() => onDelete(item.slug)}
                disabled={pending}
                className="text-foreground-subtle hover:text-destructive disabled:opacity-50"
                title="Excluir"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-1 flex items-end gap-1.5">
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              rows={2}
              maxLength={2000}
              className="flex-1 resize-none rounded border border-border bg-surface-muted px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={pending || !draft.trim()}
              className="rounded p-1 text-green-600 hover:bg-surface-secondary disabled:opacity-50"
              title="Salvar"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded p-1 text-foreground-subtle hover:bg-surface-secondary"
              title="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{item.body}</p>
        )}
      </div>
    </li>
  );
}
