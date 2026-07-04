"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSelect } from "@/components/layout/LanguageSelect";
import { useMarkAllRead } from "@/hooks/use-notifications";
import { useNotificationsCtx } from "@/providers/notifications";
import type { Notification } from "@/types/api";
import { NotificationsList, type NotificationsPagination } from "./NotificationsList";

interface Props {
  title?: string;
  notifications: Notification[];
  loadingNotifs: boolean;
  unreadCount: number;
  pagination?: NotificationsPagination;
}

export function Topbar({ title, notifications, loadingNotifs, unreadCount, pagination }: Props) {
  const t = useTranslations("notifications");
  const markAllRead = useMarkAllRead();
  const { gaveUp, reconnect } = useNotificationsCtx();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-surface px-6">
      <span className="font-semibold text-foreground-muted truncate">{title ?? ""}</span>
      <div className="flex items-center gap-3">
        <LanguageSelect />
        <ModeToggle />
        <div ref={containerRef} className="relative">
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-colors"
            onClick={() => setOpen((v) => !v)}
            title={t("title")}
            aria-expanded={open}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-destructive-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-surface shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-sm font-semibold text-foreground">{t("title")}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                    className="flex items-center gap-1 text-[11px] text-foreground-muted hover:text-foreground transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {t("markAll")}
                  </button>
                )}
              </div>
              {gaveUp && (
                <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-secondary px-3 py-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
                    <WifiOff className="h-3.5 w-3.5" />
                    {t("connectionLost")}
                  </span>
                  <button
                    onClick={reconnect}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    {t("reconnect")}
                  </button>
                </div>
              )}
              <div className="flex max-h-96 flex-col gap-1 overflow-y-auto p-2">
                <NotificationsList
                  notifications={notifications}
                  loading={loadingNotifs}
                  emptyClassName="px-2 py-4 text-center text-xs italic text-foreground-subtle"
                  onNavigate={() => setOpen(false)}
                  pagination={pagination}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
