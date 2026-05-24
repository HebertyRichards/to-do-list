"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPassword } from "@/src/hooks/use-auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128)
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial");

const schema = z
  .object({
    token: z.string().min(10, "Token inválido"),
    new_password: passwordSchema,
    confirm_password: z.string().min(1),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Senhas não conferem",
    path: ["confirm_password"],
  });

type Fields = z.infer<typeof schema>;

interface Props {
  initialToken: string;
  onSwitchLogin: () => void;
}

export function ResetPasswordForm({ initialToken, onSwitchLogin }: Props) {
  const reset = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { token: initialToken },
  });

  const onSubmit = (data: Fields) => {
    reset.mutate({ token: data.token, new_password: data.new_password });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Nova senha</h1>
        <p className="text-sm text-foreground-muted">Cole o token recebido e escolha uma nova senha</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="token">Token</Label>
        <Input id="token" {...register("token")} />
        {errors.token && <p className="text-xs text-destructive">{errors.token.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new_password">Nova senha</Label>
        <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password")} />
        {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">Confirmar senha</Label>
        <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
        {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
      </div>

      <Button type="submit" disabled={reset.isPending} className="w-full">
        {reset.isPending ? "Salvando..." : "Redefinir senha"}
      </Button>

      <p className="text-sm text-center">
        <button type="button" onClick={onSwitchLogin} className="text-primary hover:underline">
          Voltar para login
        </button>
      </p>
    </form>
  );
}
