"use client";

import { useNotificationList } from "@/hooks/use-notifications";
import { Sidebar } from "./app-shell/Sidebar";
import { Topbar } from "./app-shell/Topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { data: notifications = [], isLoading: loadingNotifs } = useNotificationList();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        notifications={notifications}
        loadingNotifs={loadingNotifs}
        unreadCount={unreadCount}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title={title}
          notifications={notifications}
          loadingNotifs={loadingNotifs}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
