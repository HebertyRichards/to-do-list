"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc-client";
import { getErrorMessage } from "@/errors/codes";

async function authFetch(action: string, body?: unknown) {
  const res = await fetch(`/api/auth?action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const err = data?.error ?? {};
    throw { data: { code: err.code ?? "" }, message: err.message ?? "Erro desconhecido." };
  }
  return data;
}

function clearBrowserStorage() {
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; remember_me?: boolean }) =>
      authFetch("login", input),
    onSuccess: () => {
      clearBrowserStorage();
      window.location.href = "/dashboard";
    },
    onError: (err: { data?: { code?: string }; message?: string }) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
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
    onError: (err: { data?: { code?: string }; message?: string }) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: { email: string; code: string }) =>
      authFetch("verify-email", input),
    onSuccess: () => {
      clearBrowserStorage();
      window.location.href = "/dashboard";
    },
    onError: (err: { data?: { code?: string }; message?: string }) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useResendVerification() {
  return trpc.auth.resendVerification.useMutation({
    onSuccess: () => {
      toast.success("Código reenviado.");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authFetch("logout"),
    onSuccess: () => {
      clearBrowserStorage();
      window.location.href = "/auth";
    },
    onError: (err: { data?: { code?: string }; message?: string }) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useForgotPassword() {
  return trpc.auth.forgotPassword.useMutation({
    onError: (err) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useResetPassword() {
  const router = useRouter();
  return trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida. Faça login com a nova senha.");
      setTimeout(() => router.push("/auth"), 1500);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}
