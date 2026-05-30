"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { authFetch } from "@/lib/auth-client";
import { showError } from "@/errors/toast";

export function useLogin() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; remember_me?: boolean }) =>
      authFetch("login", input),
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: showError,
  });
}

export function useRegister(onAwaitingVerification?: (email: string) => void) {
  return useMutation({
    mutationFn: (input: { email: string; username: string; password: string }) =>
      authFetch("register", input).then(() => input.email),
    onSuccess: (email) => {
      toast.success("Enviamos um código de confirmação para seu email.");
      onAwaitingVerification?.(email);
    },
    onError: showError,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: { email: string; code: string }) =>
      authFetch("verify-email", input),
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: showError,
  });
}

export function useResendVerification() {
  return trpc.auth.resendVerification.useMutation({
    onSuccess: () => {
      toast.success("Código reenviado.");
    },
    onError: showError,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authFetch("logout"),
    onSuccess: () => {
      window.location.href = "/auth";
    },
    onError: showError,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (input: { password: string }) => authFetch("delete-account", input),
    onSuccess: () => {
      toast.success("Conta excluída.");
      window.location.href = "/auth";
    },
    onError: showError,
  });
}

export function useForgotPassword() {
  return trpc.auth.forgotPassword.useMutation({
    onError: showError,
  });
}

export function useResetPassword() {
  const router = useRouter();
  return trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida. Faça login com a nova senha.");
      setTimeout(() => router.push("/auth"), 1500);
    },
    onError: showError,
  });
}
