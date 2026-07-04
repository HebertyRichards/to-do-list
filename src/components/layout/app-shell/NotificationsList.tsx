"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@/types/api";
import { NotificationItem } from "./NotificationItem";

export interface NotificationsPagination {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

interface Props {
  notifications: Notification[];
  loading: boolean;
  emptyClassName?: string;
  onNavigate?: () => void;
  pagination?: NotificationsPagination;
}

export function NotificationsList({ notifications, loading, emptyClassName, onNavigate, pagination }: Props) {
  const t = useTranslations("notifications");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = pagination?.hasMore ?? false;
  const loadingMore = pagination?.loadingMore ?? false;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || !pagination) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !loadingMore) {
        pagination.onLoadMore();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, pagination, notifications.length]);

  if (loading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </>
    );
  }

  if (notifications.length === 0) {
    return (
      <p className={emptyClassName ?? "px-2 text-xs text-foreground-subtle italic"}>
        {t("empty")}
      </p>
    );
  }

  return (
    <>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notif={n} onNavigate={onNavigate} />
      ))}
      {loadingMore && <Skeleton className="h-12 w-full rounded-md" />}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full shrink-0" />}
    </>
  );
}
