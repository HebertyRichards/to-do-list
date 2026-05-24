"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForgotPassword } from "@/src/hooks/use-auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

const schema = z.object({ email: z.string().email("Email invalido") });
type Fields = z.infer<typeof schema>;

interface Props {
  onSwitchLogin: () => void;
  onTokenIssued: (token: string) => void;
}

export function ForgotPasswordEmailForm({ onSwitchLogin, onTokenIssued }: Props) {
  const forgot = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({ resolver: zodResolver(schema) });

  const onSubmit = (data: Fields) => {
    forgot.mutate(data, {
      onSuccess: (res) => {
        if (res.reset_token) onTokenIssued(res.reset_token);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Esqueci a senha</h1>
        <p className="text-sm text-foreground-muted">Informe o email da sua conta</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={forgot.isPending} className="w-full">
        {forgot.isPending ? "Enviando..." : "Solicitar token"}
      </Button>

      <p className="text-sm text-center">
        <button type="button" onClick={onSwitchLogin} className="text-primary hover:underline">
          Voltar para login
        </button>
      </p>
    </form>
  );
}
