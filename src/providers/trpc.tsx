"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { Toaster, toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { getErrorMessage } from "@/errors/codes";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
      import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools),
    )
    : () => null;

function authErrorCode(err: unknown): "UNAUTHORIZED" | "FORBIDDEN" | null {
  if (!(err instanceof TRPCClientError)) return null;
  const code = err.data?.code;
  return code === "UNAUTHORIZED" || code === "FORBIDDEN" ? code : null;
}

// Uma rajada de queries falhando gera 1 toast/redirect, não N.
let lastAuthRedirect = 0;

function handleAuthError(err: unknown, redirectToLogin: () => void) {
  const code = authErrorCode(err);
  if (!code || typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/auth")) return;
  const now = Date.now();
  if (now - lastAuthRedirect < 3000) return;
  lastAuthRedirect = now;
  toast.error(
    code === "UNAUTHORIZED" ? getErrorMessage("SESSION_EXPIRED") : getErrorMessage("FORBIDDEN"),
  );
  redirectToLogin();
}

function makeQueryClient(redirectToLogin: () => void) {
  const onError = (err: unknown) => handleAuthError(err, redirectToLogin);
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (count, err: unknown) => {
          if (authErrorCode(err)) return false;
          return count < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(redirectToLogin: () => void) {
  if (typeof window === "undefined") return makeQueryClient(redirectToLogin);
  if (!browserQueryClient) browserQueryClient = makeQueryClient(redirectToLogin);
  return browserQueryClient;
}

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  // useRouter é estável no App Router; a navegação suave mantém o Toaster
  // montado, então o toast sobrevive ao redirect para /auth.
  const router = useRouter();
  const queryClient = getQueryClient(() => router.replace("/auth"));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          fetch(url, options) {
            return globalThis.fetch(url, { ...options, credentials: "same-origin" });
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
