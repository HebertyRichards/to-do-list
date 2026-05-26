"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { useLogout } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useNotificationList, useMarkRead, useMarkAllRead } from "@/hooks/use-notifications";
import { ModeToggle } from "@/components/layout/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCreatedAtLocal } from "@/utils/datetime";
import {
  LayoutDashboard, Users, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, CheckCheck,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Notification } from "@/types/api";

const NOTIF_TYPE_LABELS: Record<string, string> = {
  join_request_created: "Solicitação de entrada",
  join_request_accepted: "Solicitação aceita",
  join_request_rejected: "Solicitação recusada",
  task_assigned: "Tarefa atribuída",
  subtask_assigned: "Subtarefa atribuída",
  member_removed: "Removido do grupo",
  group_deleted: "Grupo excluído",
};

function NotificationItem({ notif }: { notif: Notification }) {
  const markRead = useMarkRead();
  const isUnread = !notif.read_at;

  return (
    <button
      onClick={() => isUnread && markRead.mutate({ id: notif.id })}
      className={cn(
        "w-full rounded-md px-3 py-2 text-left text-xs transition-colors",
        isUnread
          ? "bg-primary/10 hover:bg-primary/15 border border-primary/20"
          : "hover:bg-sidebar-accent",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={cn("font-medium leading-tight", isUnread ? "text-sidebar-primary" : "text-sidebar-foreground/70")}>
          {notif.title}
        </span>
        {isUnread && <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
      </div>
      <span className="mt-0.5 block text-[10px] text-sidebar-foreground/50">
        {NOTIF_TYPE_LABELS[notif.type] ?? notif.type} · {formatCreatedAtLocal(notif.created_at)}
      </span>
    </button>
  );
}

function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const update = useUpdateProfile();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update.mutate(
      {
        username: (fd.get("username") as string).trim() || undefined,
        avatar_url: (fd.get("avatar_url") as string).trim() || null,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Configurações do perfil</DialogTitle>
        </DialogHeader>
        {/* key={String(open)} força remount ao abrir, reaplicando defaultValue */}
        <form key={String(open)} onSubmit={submit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="prof-username">Nome de usuário</Label>
            <Input
              id="prof-username"
              name="username"
              defaultValue={user?.username ?? ""}
              minLength={3}
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prof-avatar">URL do avatar (opcional)</Label>
            <Input
              id="prof-avatar"
              name="avatar_url"
              defaultValue={user?.avatar_url ?? ""}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: notifications = [], isLoading: loadingNotifs } = useNotificationList();
  const markAllRead = useMarkAllRead();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const navItems = [
    { label: "To-Do List", href: "/dashboard", icon: LayoutDashboard },
    { label: "Grupos",     href: "/groups",    icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out shrink-0 overflow-hidden",
          collapsed ? "w-14" : "w-60",
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed && (
            <span className="font-semibold text-sm text-sidebar-foreground truncate">To-Do List</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              collapsed && "mx-auto",
            )}
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="mx-2 border-t border-sidebar-border" />

        {/* Notificações section */}
        <div className="flex flex-col flex-1 overflow-hidden p-2">
          <button
            onClick={() => { setNotifsOpen((o) => !o); if (collapsed) setCollapsed(false); }}
            title={collapsed ? "Notificações" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                <span className="flex-1 truncate text-left">Notificações</span>
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
                  className="mb-1 flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas como lidas
                </button>
              )}
              <div className="flex flex-col gap-1 overflow-y-auto">
                {loadingNotifs ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))
                ) : notifications.length === 0 ? (
                  <p className="px-2 text-xs text-sidebar-foreground/50 italic">Sem notificações</p>
                ) : (
                  notifications.map((n) => <NotificationItem key={n.id} notif={n} />)
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          <button
            onClick={() => { setProfileOpen(true); }}
            title={collapsed ? "Configurações" : undefined}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              collapsed && "justify-center px-0",
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Configurações</span>}
          </button>

          {!collapsed && user && (
            <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5">
              <div className="h-6 w-6 shrink-0 rounded-full bg-sidebar-accent flex items-center justify-center text-[11px] font-semibold text-sidebar-accent-foreground uppercase">
                {user.username[0]}
              </div>
              <span className="flex-1 truncate text-xs text-sidebar-foreground/70">{user.username}</span>
            </div>
          )}

          <button
            onClick={() => logout.mutate()}
            title={collapsed ? "Sair" : undefined}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors",
              collapsed && "justify-center px-0",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-surface px-6">
          <span className="font-semibold text-foreground-muted truncate">
            {title ?? ""}
          </span>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <button
              className="relative"
              onClick={() => { setNotifsOpen(true); if (collapsed) setCollapsed(false); }}
              title="Notificações"
            >
              <Bell className="h-5 w-5 text-foreground-muted" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
