"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/src/hooks/use-auth";
import { getErrorMessage } from "@/src/errors/codes";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginClient() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginFields) => {
    login.mutate(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Entrar</h1>

        {login.error && (
          <p className="text-sm text-red-600">
            {getErrorMessage(login.error.data?.code ?? "", login.error.message)}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">Senha</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={login.isPending || isSubmitting}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {login.isPending ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm">
          Não tem conta?{" "}
          <a href="/register" className="text-blue-600 underline">Criar conta</a>
        </p>
      </form>
    </main>
  );
}
