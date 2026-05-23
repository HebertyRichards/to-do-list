"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/src/server/trpc/root";

export const trpc = createTRPCReact<AppRouter>();
