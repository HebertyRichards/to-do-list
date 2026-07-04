"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, LogOut, Trash2 } from "lucide-react";
import { useGroupTasks } from "@/hooks/use-tasks";
import { useGroupSubtasks } from "@/hooks/use-subtasks";
import { useGroupCategories } from "@/hooks/use-categories";
import { useGroup, useGroupMembers, useLeaveGroup, useDeleteGroup } from "@/hooks/use-groups";
import { useAuth } from "@/providers/auth";
import { BoardWorkspace } from "@/components/tasks/BoardWorkspace";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GroupMembersDialog } from "@/components/groups/GroupMembersDialog";
import { useTranslations } from "next-intl";

interface Props {
  groupSlug: string;
}

export default function GroupBoardClient({ groupSlug }: Props) {
  const t = useTranslations("pages");
  const tG = useTranslations("groupBoard");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuth();
  const { data: tasks = [], isLoading: loadingTasks } = useGroupTasks(groupSlug);
  const { data: subtasks = [] } = useGroupSubtasks(groupSlug);
  const { data: categories = [], isLoading: loadingCategories } = useGroupCategories(groupSlug);
  const { data: group } = useGroup(groupSlug);
  const { data: members = [] } = useGroupMembers(groupSlug);
  const [membersOpen, setMembersOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAdmin =
    !!user && members.some((m) => m.username === user.username && m.role === "admin");

  const leave = useLeaveGroup();
  const del = useDeleteGroup();
  const pending = leave.isPending || del.isPending;

  const handleConfirm = () => {
    const mutation = isAdmin ? del : leave;
    mutation.mutate(
      { group_slug: groupSlug },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          router.replace("/groups");
        },
      },
    );
  };

  return (
    <AppShell title={group?.name ?? t("group")}>
      <div className="flex items-center justify-end gap-2 px-6 pt-4">
        <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
          <Users className="mr-1.5 h-4 w-4" />
          {tG("members", { count: group?.member_count ?? 0 })}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isAdmin ? (
            <>
              <Trash2 className="mr-1.5 h-4 w-4" />
              {tG("deleteGroup")}
            </>
          ) : (
            <>
              <LogOut className="mr-1.5 h-4 w-4" />
              {tG("leaveGroup")}
            </>
          )}
        </Button>
      </div>
      <BoardWorkspace
        categories={categories}
        tasks={tasks}
        subtasks={subtasks}
        isLoading={loadingTasks || loadingCategories}
        groupSlug={groupSlug}
      />
      <GroupMembersDialog
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        groupSlug={groupSlug}
      />

      <Dialog open={confirmOpen} onOpenChange={(v) => !v && !pending && setConfirmOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {isAdmin ? tG("confirmDeleteTitle") : tG("confirmLeaveTitle")}
            </DialogTitle>
            <DialogDescription>
              {isAdmin ? tG("confirmDeleteBody") : tG("confirmLeaveBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={pending}
            >
              {pending
                ? isAdmin
                  ? tG("deleting")
                  : tG("leaving")
                : isAdmin
                  ? tG("deleteGroup")
                  : tG("leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
