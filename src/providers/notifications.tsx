"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { NotificationService } from "@/services/notificationService";
import { useAuth } from "@/providers/auth";
import { trpc } from "@/lib/trpc-client";
import { useTranslations } from "next-intl";

type NotifCtx = {
  wsConnected: boolean;
  gaveUp: boolean;
  reconnect: () => void;
};

const NotifContext = createContext<NotifCtx>({
  wsConnected: false,
  gaveUp: false,
  reconnect: () => {},
});

const EVICTION_TYPES = new Set(["member_removed", "group_deleted"]);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("notifications");
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  const [_wsConnected, setWsConnected] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const wsConnected = _wsConnected && !!user;
  const serviceRef = useRef<NotificationService | null>(null);

  const reconnect = () => {
    setGaveUp(false);
    serviceRef.current?.reconnect();
  };

  useEffect(() => {
    if (!user) {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      return;
    }

    const service = new NotificationService();
    serviceRef.current = service;

    service.connect(
      (data) => {
        const type = typeof data.type === "string" ? data.type : "";
        const groupSlug = typeof data.group_slug === "string" ? data.group_slug : null;
        const groupName = typeof data.group_name === "string" ? data.group_name : null;

        // group_changed é efêmero (não persiste notificação): não busca a lista à toa.
        if (type !== "group_changed") {
          utils.notifications.list.invalidate();
          utils.notifications.unreadCount.invalidate();
        }

        if (EVICTION_TYPES.has(type) && groupSlug) {
          utils.groups.list.invalidate();
          utils.groups.get.invalidate({ group_slug: groupSlug });
          utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
          utils.categories.listGroup.invalidate({ group_slug: groupSlug });

          const msg =
            type === "group_deleted"
              ? groupName
                ? t("toastGroupDeleted", { name: groupName })
                : t("toastGroupDeletedGeneric")
              : groupName
                ? t("toastRemoved", { name: groupName })
                : t("toastRemovedGeneric");
          toast.info(msg);

          if (pathRef.current?.startsWith(`/groups/${groupSlug}`)) {
            router.replace("/groups");
          }
        }

        if (type === "join_request_created" && groupSlug) {
          utils.groups.listJoinRequests.invalidate({ group_slug: groupSlug });
          const username = typeof data.username === "string" ? data.username : t("someone");
          toast.info(t("toastJoinRequest", { user: username }), {
            action: {
              label: t("view"),
              onClick: () => router.push(`/groups/${groupSlug}`),
            },
          });
        }

        if (type === "join_request_accepted" && groupSlug) {
          utils.groups.list.invalidate();
          toast.success(groupName ? t("toastJoined", { name: groupName }) : t("toastJoinedGeneric"), {
            action: {
              label: t("openGroup"),
              onClick: () => router.push(`/groups/${groupSlug}`),
            },
          });
        }

        if (type === "task_assigned" || type === "subtask_assigned") {
          const assignedBy = typeof data.assigned_by === "string" ? data.assigned_by : t("someone");
          const isTask = type === "task_assigned";
          if (groupSlug) {
            utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
            const msg = groupName
              ? t(isTask ? "taskAssignedIn" : "subtaskAssignedIn", { user: assignedBy, name: groupName })
              : t(isTask ? "taskAssigned" : "subtaskAssigned", { user: assignedBy });
            toast.info(msg, {
              action: {
                label: t("openGroup"),
                onClick: () => router.push(`/groups/${groupSlug}`),
              },
            });
          } else {
            toast.info(t(isTask ? "taskAssigned" : "subtaskAssigned", { user: assignedBy }));
          }
        }

        // Sincronização silenciosa: outro membro mudou conteúdo do grupo.
        // Invalida só as queries daquele grupo; ativas refazem o fetch na hora.
        if (type === "group_changed" && groupSlug) {
          const scope = typeof data.scope === "string" ? data.scope : "";
          if (scope === "tasks") {
            utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
            utils.subtasks.listGroup.invalidate({ group_slug: groupSlug });
            utils.subtasks.listByTask.invalidate();
          } else if (scope === "categories") {
            utils.categories.listGroup.invalidate({ group_slug: groupSlug });
            utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
          } else if (scope === "timeline") {
            utils.comments.timeline.invalidate();
          } else if (scope === "members") {
            utils.groups.listMembers.invalidate({ group_slug: groupSlug });
            utils.groups.get.invalidate({ group_slug: groupSlug });
          } else if (scope === "group") {
            utils.groups.get.invalidate({ group_slug: groupSlug });
            utils.groups.list.invalidate();
          }
        }

        if (type === "daily_reminder") {
          toast.warning(t("dailyReminder"), {
            action: {
              label: t("viewDiary"),
              onClick: () => router.push("/diary"),
            },
          });
        }
      },
      (connected) => {
        setWsConnected(connected);
        if (connected) setGaveUp(false);
      },
      () => setGaveUp(true),
    );

    return () => {
      service.disconnect();
      serviceRef.current = null;
    };
  }, [user?.username]);

  return (
    <NotifContext.Provider value={{ wsConnected, gaveUp, reconnect }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotificationsCtx = () => useContext(NotifContext);
