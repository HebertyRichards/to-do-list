"use client";

import { createContext, useContext } from "react";
import { trpc } from "@/src/lib/trpc-client";
import type { User } from "@/src/types/api";

type AuthCtx = {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthCtx>({ user: null, isLoading: true, refetch: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = trpc.auth.session.useQuery(undefined, {
    retry: false,
  });

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
