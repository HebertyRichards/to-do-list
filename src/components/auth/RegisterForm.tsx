"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128)
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial");

const schema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Mínimo 3 caracteres").max(60),
  password: passwordSchema,
});

type Fields = z.infer<typeof schema>;

interface Props {
  onSwitchLogin: () => void;
  onAwaitingVerification: (email: string) => void;
}

export function RegisterForm({ onSwitchLogin, onAwaitingVerification }: Props) {
  const register = useRegister(onAwaitingVerification);
  const { register: field, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => register.mutate(data))} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-foreground-muted">Comece a organizar suas tarefas</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...field("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" autoComplete="username" {...field("username")} />
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" autoComplete="new-password" {...field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={register.isPending} className="w-full">
        {register.isPending ? "Criando..." : "Criar conta"}
      </Button>

      <p className="text-sm text-center">
        Já tem conta?{" "}
        <button type="button" onClick={onSwitchLogin} className="text-primary hover:underline">
          Entrar
        </button>
      </p>
    </form>
  );
}
