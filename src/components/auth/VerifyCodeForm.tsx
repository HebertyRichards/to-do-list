"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

const schema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos").regex(/^\d{6}$/, "Apenas números"),
});

type Fields = z.infer<typeof schema>;

interface Props {
  email: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  isPending: boolean;
  isResending: boolean;
}

export function VerifyCodeForm({ email, onSubmit, onResend, onBack, isPending, isResending }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data.code))} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Código de redefinição</h1>
        <p className="text-sm text-foreground-muted">
          Digite o código de 6 dígitos enviado para{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-[0.5em] font-mono"
          {...register("code")}
        />
        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Verificando..." : "Continuar"}
      </Button>

      <div className="flex justify-between text-sm">
        <button type="button" onClick={onBack} className="text-primary hover:underline">
          Voltar
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="text-primary hover:underline disabled:opacity-50"
        >
          {isResending ? "Reenviando..." : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
