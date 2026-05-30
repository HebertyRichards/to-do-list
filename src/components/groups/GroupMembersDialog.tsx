"use client";

import { useState } from "react";
import { Shield, UserMinus, ArrowUp, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth";
import {
  useGroupMembers,
  useJoinRequests,
  usePromoteMember,
  useRemoveMember,
  useAcceptJoinRequest,
  useRejectJoinRequest,
} from "@/hooks/use-groups";
import { formatCreatedAtLocal } from "@/utils/datetime";
import { cn } from "@/utils/cn";
import type { GroupMember, JoinRequest } from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  groupSlug: string;
}

export function GroupMembersDialog({ open, onClose, groupSlug }: Props) {
  const { user } = useAuth();
  const { data: members = [], isLoading: loadingMembers } = useGroupMembers(groupSlug);

  const isAdmin =
    !!user &&
    members.some((m) => m.username === user.username && m.role === "admin");

  const pendingTab = isAdmin ? "requests" : null;
  const [tab, setTab] = useState<"members" | "requests">("members");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Membros do grupo</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Você é admin. Gerencie membros e pedidos de entrada."
              : "Veja quem participa do grupo."}
          </DialogDescription>
        </DialogHeader>

        {isAdmin && pendingTab ? (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "members" | "requests")}
            className="space-y-3"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="requests">Pedidos pendentes</TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <MembersList
                members={members}
                loading={loadingMembers}
                currentUsername={user?.username ?? null}
                isAdmin={isAdmin}
                groupSlug={groupSlug}
              />
            </TabsContent>

            <TabsContent value="requests">
              <RequestsList groupSlug={groupSlug} />
            </TabsContent>
          </Tabs>
        ) : (
          <MembersList
            members={members}
            loading={loadingMembers}
            currentUsername={user?.username ?? null}
            isAdmin={false}
            groupSlug={groupSlug}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface MembersListProps {
  members: GroupMember[];
  loading: boolean;
  currentUsername: string | null;
  isAdmin: boolean;
  groupSlug: string;
}

function MembersList({
  members,
  loading,
  currentUsername,
  isAdmin,
  groupSlug,
}: MembersListProps) {
  const promote = usePromoteMember();
  const remove = useRemoveMember();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm italic text-foreground-subtle">
        Sem membros.
      </p>
    );
  }

  return (
    <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
      {members.map((m) => {
        const isMe = m.username === currentUsername;
        const isMemberRole = m.role === "member";
        return (
          <li
            key={m.username}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold uppercase">
              {m.username[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">
                  {m.username}
                </span>
                {isMe && (
                  <span className="text-[10px] text-foreground-subtle">
                    (você)
                  </span>
                )}
                {m.role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    <Shield className="h-2.5 w-2.5" /> admin
                  </span>
                )}
              </div>
              <span className="text-[10px] text-foreground-subtle">
                Entrou {formatCreatedAtLocal(m.joined_at)}
              </span>
            </div>

            {isAdmin && !isMe && (
              <div className="flex shrink-0 gap-1">
                {isMemberRole && (
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Promover a admin"
                    disabled={promote.isPending}
                    onClick={() =>
                      promote.mutate({
                        group_slug: groupSlug,
                        username: m.username,
                      })
                    }
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  title="Remover do grupo"
                  className="text-destructive hover:text-destructive"
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate({
                      group_slug: groupSlug,
                      username: m.username,
                    })
                  }
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function RequestsList({ groupSlug }: { groupSlug: string }) {
  const { data: requests = [], isLoading } = useJoinRequests(groupSlug);
  const accept = useAcceptJoinRequest();
  const reject = useRejectJoinRequest();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="py-8 text-center text-sm italic text-foreground-subtle">
        Nenhum pedido pendente.
      </p>
    );
  }

  return (
    <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
      {requests.map((r: JoinRequest) => {
        const acting =
          (accept.isPending && accept.variables?.request_slug === r.slug) ||
          (reject.isPending && reject.variables?.request_slug === r.slug);
        return (
          <li
            key={r.slug}
            className={cn(
              "flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2",
              acting && "opacity-50",
            )}
          >
            <div className="min-w-0 flex-1">
              <span className="truncate text-sm font-medium">{r.username}</span>
              <span className="block text-[10px] text-foreground-subtle">
                Pediu em {formatCreatedAtLocal(r.created_at)}
              </span>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="sm"
                variant="ghost"
                title="Aceitar"
                className="text-success hover:text-success"
                disabled={acting}
                onClick={() =>
                  accept.mutate({
                    group_slug: groupSlug,
                    request_slug: r.slug,
                  })
                }
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Recusar"
                className="text-destructive hover:text-destructive"
                disabled={acting}
                onClick={() =>
                  reject.mutate({
                    group_slug: groupSlug,
                    request_slug: r.slug,
                  })
                }
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
