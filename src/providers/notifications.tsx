"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { NotificationService } from "@/services/notificationService";
import { useAuth } from "@/providers/auth";
import { trpc } from "@/lib/trpc-client";

type NotifCtx = {
  wsConnected: boolean;
};

const NotifContext = createContext<NotifCtx>({ wsConnected: false });

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [_wsConnected, setWsConnected] = useState(false);
  // Deriva: se não há usuário, nunca está conectado — sem chamar setState no efeito
  const wsConnected = _wsConnected && !!user;
  const serviceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    if (!user) {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      return;
    }

    const service = new NotificationService();
    serviceRef.current = service;

    service.connect(
      () => { utils.notifications.list.invalidate(); },
      setWsConnected,
    );

    return () => {
      service.disconnect();
      serviceRef.current = null;
    };
  }, [user?.username]);

  return (
    <NotifContext.Provider value={{ wsConnected }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotificationsCtx = () => useContext(NotifContext);
