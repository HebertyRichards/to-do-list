"use client";

import { trpc } from "@/src/lib/trpc-client";

export const useNotificationList = () => trpc.notifications.list.useQuery();
export const useMarkRead = () => trpc.notifications.markRead.useMutation();
export const useMarkAllRead = () => trpc.notifications.markAllRead.useMutation();
