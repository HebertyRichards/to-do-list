"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { NotificationService } from "@/src/services/notificationService";
import { useAuth } from "@/src/providers/auth";

type NotificationEvent = Record<string, unknown>;

type NotifCtx = {
  events: NotificationEvent[];
  unreadCount: number;
  isConnected: boolean;
  clearEvents: () => void;
};

const NotifContext = createContext<NotifCtx>({
  events: [],
  unreadCount: 0,
  isConnected: false,
  clearEvents: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const serviceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    if (!userId) {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      return;
    }

    const service = new NotificationService();
    serviceRef.current = service;

    service.connect(
      (data) => setEvents((prev) => [data, ...prev]),
      (connected) => setIsConnected(connected),
    );

    return () => {
      service.disconnect();
      serviceRef.current = null;
    };
  }, [userId]);

  const clearEvents = () => setEvents([]);

  return (
    <NotifContext.Provider value={{ events, unreadCount: events.length, isConnected, clearEvents }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotifications = () => useContext(NotifContext);
