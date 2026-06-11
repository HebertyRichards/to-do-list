"use client";

import { useNotificationList, useUnreadCount } from "@/hooks/use-notifications";
import { Sidebar } from "./app-shell/Sidebar";
import { Topbar } from "./app-shell/Topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const {
    data,
    isLoading: loadingNotifs,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotificationList();
  const { data: unread } = useUnreadCount();

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCount = unread?.count ?? 0;

  const pagination = {
    hasMore: !!hasNextPage,
    loadingMore: isFetchingNextPage,
    onLoadMore: () => fetchNextPage(),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        notifications={notifications}
        loadingNotifs={loadingNotifs}
        unreadCount={unreadCount}
        pagination={pagination}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title={title}
          notifications={notifications}
          loadingNotifs={loadingNotifs}
          unreadCount={unreadCount}
          pagination={pagination}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
