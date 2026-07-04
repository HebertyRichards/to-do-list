"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarCheck, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, CheckCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth";
import { useLogout } from "@/hooks/use-auth";
import { useMarkAllRead } from "@/hooks/use-notifications";
import { cn } from "@/utils/cn";
import type { Notification } from "@/types/api";
import { NotificationsList, type NotificationsPagination } from "./NotificationsList";

const NAV_ITEMS = [
  { labelKey: "todo",   href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "groups", href: "/groups",    icon: Users },
  { labelKey: "diary",  href: "/diary",     icon: CalendarCheck },
] as const;

interface Props {
  notifications: Notification[];
  loadingNotifs: boolean;
  unreadCount: number;
  pagination?: NotificationsPagination;
}

export function Sidebar({ notifications, loadingNotifs, unreadCount, pagination }: Props) {
  const tNav = useTranslations("nav");
  const tNotif = useTranslations("notifications");
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const markAllRead = useMarkAllRead();

  const [collapsed, setCollapsed] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-surface text-foreground transition-[width] duration-200 ease-in-out shrink-0 overflow-hidden",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <span className="font-semibold text-sm text-foreground truncate">To-Do List</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "rounded-md p-1.5 text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-colors",
            collapsed && "mx-auto",
          )}
          title={collapsed ? tNav("expand") : tNav("collapse")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const label = tNav(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground-muted hover:bg-surface-secondary hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mx-2 border-t border-border" />

      <div className="flex flex-col flex-1 overflow-hidden p-2">
        <button
          onClick={() => { setNotifsOpen((o) => !o); if (collapsed) setCollapsed(false); }}
          title={collapsed ? tNotif("title") : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors text-foreground-muted hover:bg-surface-secondary hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="relative shrink-0">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-destructive-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">{tNotif("title")}</span>
              <ChevronRight
                className={cn("h-3.5 w-3.5 shrink-0 transition-transform", notifsOpen && "rotate-90")}
              />
            </>
          )}
        </button>

        {notifsOpen && !collapsed && (
          <div className="mt-1 flex flex-col flex-1 overflow-hidden">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="mb-1 flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-foreground-muted hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {tNotif("markAllRead")}
              </button>
            )}
            <div className="flex flex-col gap-1 overflow-y-auto">
              <NotificationsList
                notifications={notifications}
                loading={loadingNotifs}
                onNavigate={() => setNotifsOpen(false)}
                pagination={pagination}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-2 space-y-0.5">
        <Link
          href="/settings"
          title={collapsed ? tNav("settings") : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
            pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-foreground-muted hover:bg-surface-secondary hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{tNav("settings")}</span>}
        </Link>

        {!collapsed && user && (
          <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5">
            <div className="h-6 w-6 shrink-0 rounded-full bg-surface-secondary flex items-center justify-center text-[11px] font-semibold text-foreground uppercase">
              {user.username[0]}
            </div>
            <span className="flex-1 truncate text-xs text-foreground-muted">{user.username}</span>
          </div>
        )}

        <button
          onClick={() => logout.mutate()}
          title={collapsed ? tNav("logout") : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{tNav("logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
