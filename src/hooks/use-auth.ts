"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/src/lib/trpc-client";
import { useAuth } from "@/src/providers/auth";

export function useLogin() {
  const { refetch } = useAuth();
  const router = useRouter();
  return trpc.auth.login.useMutation({
    onSuccess: () => {
      refetch();
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const { refetch } = useAuth();
  const router = useRouter();
  return trpc.auth.register.useMutation({
    onSuccess: () => {
      refetch();
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const { refetch } = useAuth();
  const router = useRouter();
  return trpc.auth.logout.useMutation({
    onSuccess: () => {
      refetch();
      router.push("/login");
    },
  });
}
