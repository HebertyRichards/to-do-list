"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/src/hooks/use-auth";
import { getErrorMessage } from "@/src/errors/codes";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Mínimo 3 caracteres").max(60, "Máximo 60 caracteres"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128, "Máximo 128 caracteres"),
  full_name: z.string().max(120, "Máximo 120 caracteres").optional(),
});

type RegisterFields = z.infer<typeof registerSchema>;

const FIELDS = [
  { name: "email" as const, label: "Email", type: "text" },
  { name: "username" as const, label: "Username", type: "text" },
  { name: "password" as const, label: "Senha", type: "password" },
  { name: "full_name" as const, label: "Nome completo (opcional)", type: "text" },
];

export default function RegisterClient() {
  const register = useRegister();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data: RegisterFields) => {
    register.mutate(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Criar conta</h1>

        {register.error && (
          <p className="text-sm text-red-600">
            {getErrorMessage(register.error.data?.code ?? "", register.error.message)}
          </p>
        )}

        {FIELDS.map(({ name, label, type }) => (
          <div key={name} className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium">{label}</label>
            <input
              id={name}
              type={type}
              {...field(name)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {errors[name] && <p className="text-xs text-red-600">{errors[name]?.message}</p>}
          </div>
        ))}

        <button
          type="submit"
          disabled={register.isPending || isSubmitting}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {register.isPending ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-blue-600 underline">Entrar</a>
        </p>
      </form>
    </main>
  );
}
