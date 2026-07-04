"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useResetPassword } from "@/hooks/use-auth";
import { makePasswordSchema } from "@/lib/password-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { new_password: string; confirm_password: string };

interface Props {
  email: string;
  code: string;
  onSwitchLogin: () => void;
}

export function ResetPasswordForm({ email, code, onSwitchLogin }: Props) {
  const t = useTranslations("auth");
  const tSettings = useTranslations("settings");
  const reset = useResetPassword();

  const schema = useMemo(
    () =>
      z
        .object({
          new_password: makePasswordSchema(tSettings),
          confirm_password: z.string().min(1),
        })
        .refine((d) => d.new_password === d.confirm_password, {
          message: t("passwordsMismatch"),
          path: ["confirm_password"],
        }),
    [t, tSettings],
  );

  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Fields) => {
    reset.mutate({ email, code, new_password: data.new_password });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t("resetTitle")}</h1>
        <p className="text-sm text-foreground-muted">{t("resetSubtitle")}</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="new_password">{t("newPassword")}</Label>
        <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password")} />
        {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
        <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
        {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
      </div>

      <Button type="submit" disabled={reset.isPending} className="w-full">
        {reset.isPending ? t("saving") : t("resetSubmit")}
      </Button>

      <p className="text-sm text-center">
        <button type="button" onClick={onSwitchLogin} className="text-primary hover:underline">
          {t("backToLogin")}
        </button>
      </p>
    </form>
  );
}
