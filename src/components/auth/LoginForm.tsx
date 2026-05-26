"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
  remember_me: z.boolean(),
});

type Fields = z.infer<typeof schema>;

interface Props {
  onSwitchRegister: () => void;
  onSwitchForgot: () => void;
}

export function LoginForm({ onSwitchRegister, onSwitchForgot }: Props) {
  const login = useLogin();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { remember_me: false },
  });

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        <p className="text-sm text-foreground-muted">Acesse sua conta</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember_me"
          checked={watch("remember_me")}
          onCheckedChange={(checked) => setValue("remember_me", checked === true)}
        />
        <Label htmlFor="remember_me" className="cursor-pointer font-normal">
          Lembrar de mim
        </Label>
      </div>

      <Button type="submit" disabled={login.isPending} className="w-full">
        {login.isPending ? "Entrando..." : "Entrar"}
      </Button>

      <div className="flex justify-between text-sm">
        <button type="button" onClick={onSwitchForgot} className="text-primary hover:underline">
          Esqueci a senha
        </button>
        <button type="button" onClick={onSwitchRegister} className="text-primary hover:underline">
          Criar conta
        </button>
      </div>
    </form>
  );
}
