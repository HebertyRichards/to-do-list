"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/src/lib/trpc-client";
import { getErrorMessage } from "@/src/errors/codes";

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

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; remember_me?: boolean }) =>
      authFetch("login", input),
    onSuccess: () => {
      toast.success("Bem-vindo de volta!");
      queryClient.clear();
      router.push("/dashboard");
    },
    onError: (err: { data?: { code?: string }; message?: string }) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; username: string; password: string }) =>
      authFetch("register", input),
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      queryClient.clear();
      router.push("/dashboard");
    },
    onError: (err: { data?: { code?: string }; message?: string }) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authFetch("logout"),
    onSuccess: () => {
      toast.success("Sessão encerrada.");
      queryClient.clear();
      router.push("/auth");
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
      router.push("/auth");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err.data?.code ?? "", err.message));
    },
  });
}
