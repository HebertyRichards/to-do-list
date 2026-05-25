"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { NotificationService } from "@/src/services/notificationService";
import { useAuth } from "@/src/providers/auth";
import { trpc } from "@/src/lib/trpc-client";

type NotifCtx = {
  wsConnected: boolean;
};

const NotifContext = createContext<NotifCtx>({ wsConnected: false });

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [wsConnected, setWsConnected] = useState(false);
  const serviceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    if (!user) {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      setWsConnected(false);
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
