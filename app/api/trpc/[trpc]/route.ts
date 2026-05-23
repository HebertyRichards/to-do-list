import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/src/server/trpc/root";
import { createContext } from "@/src/server/trpc/init";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
