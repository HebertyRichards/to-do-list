"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useForgotPassword } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { email: string };

interface Props {
  onSwitchLogin: () => void;
  onCodeSent: (email: string) => void;
}

export function ForgotPasswordEmailForm({ onSwitchLogin, onCodeSent }: Props) {
  const t = useTranslations("auth");
  const forgot = useForgotPassword();

  const schema = useMemo(
    () => z.object({ email: z.string().email(t("emailInvalid")) }),
    [t],
  );

  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Fields) => {
    forgot.mutate(data, {
      onSuccess: () => onCodeSent(data.email),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t("forgotPassword")}</h1>
        <p className="text-sm text-foreground-muted">{t("forgotSubtitle")}</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={forgot.isPending} className="w-full">
        {forgot.isPending ? t("sending") : t("sendCode")}
      </Button>

      <p className="text-sm text-center">
        <button type="button" onClick={onSwitchLogin} className="text-primary hover:underline">
          {t("backToLogin")}
        </button>
      </p>
    </form>
  );
}
