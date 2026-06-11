"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { NotificationService } from "@/services/notificationService";
import { useAuth } from "@/providers/auth";
import { trpc } from "@/lib/trpc-client";

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
        utils.notifications.list.invalidate();
        utils.notifications.unreadCount.invalidate();

        const type = typeof data.type === "string" ? data.type : "";
        const groupSlug = typeof data.group_slug === "string" ? data.group_slug : null;
        const groupName = typeof data.group_name === "string" ? data.group_name : null;

        if (EVICTION_TYPES.has(type) && groupSlug) {
          utils.groups.list.invalidate();
          utils.groups.get.invalidate({ group_slug: groupSlug });
          utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
          utils.categories.listGroup.invalidate({ group_slug: groupSlug });

          const msg =
            type === "group_deleted"
              ? `O grupo ${groupName ?? ""} foi excluído.`
              : `Você foi removido do grupo ${groupName ?? ""}.`;
          toast.info(msg.trim());

          if (pathRef.current?.startsWith(`/groups/${groupSlug}`)) {
            router.replace("/groups");
          }
        }

        if (type === "join_request_created" && groupSlug) {
          utils.groups.listJoinRequests.invalidate({ group_slug: groupSlug });
          const username = typeof data.username === "string" ? data.username : "Alguém";
          toast.info(`${username} quer entrar no seu grupo.`, {
            action: {
              label: "Ver",
              onClick: () => router.push(`/groups/${groupSlug}`),
            },
          });
        }

        if (type === "join_request_accepted" && groupSlug) {
          utils.groups.list.invalidate();
          toast.success(groupName ? `Você entrou no grupo ${groupName}!` : "Você entrou no grupo!", {
            action: {
              label: "Abrir grupo",
              onClick: () => router.push(`/groups/${groupSlug}`),
            },
          });
        }

        if (type === "task_assigned" || type === "subtask_assigned") {
          const assignedBy = typeof data.assigned_by === "string" ? data.assigned_by : "Alguém";
          const kind = type === "task_assigned" ? "tarefa" : "subtarefa";
          if (groupSlug) {
            utils.tasks.listGroup.invalidate({ group_slug: groupSlug });
            const msg = groupName
              ? `${assignedBy} atribuiu uma ${kind} a você no grupo ${groupName}.`
              : `${assignedBy} atribuiu uma ${kind} a você.`;
            toast.info(msg, {
              action: {
                label: "Abrir grupo",
                onClick: () => router.push(`/groups/${groupSlug}`),
              },
            });
          } else {
            toast.info(`${assignedBy} atribuiu uma ${kind} a você.`);
          }
        }

        if (type === "daily_reminder") {
          toast.warning("Você ainda não fez nenhuma tarefa do diário hoje.", {
            action: {
              label: "Ver diário",
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
