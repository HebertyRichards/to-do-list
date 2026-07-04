"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRegister } from "@/hooks/use-auth";
import { makePasswordSchema } from "@/lib/password-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { email: string; username: string; password: string };

interface Props {
  onSwitchLogin: () => void;
  onAwaitingVerification: (email: string) => void;
}

export function RegisterForm({ onSwitchLogin, onAwaitingVerification }: Props) {
  const t = useTranslations("auth");
  const tSettings = useTranslations("settings");
  const register = useRegister(onAwaitingVerification);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("emailInvalid")),
        username: z.string().min(3, t("usernameMin")).max(60),
        password: makePasswordSchema(tSettings),
      }),
    [t, tSettings],
  );

  const { register: field, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => register.mutate(data))} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t("createAccount")}</h1>
        <p className="text-sm text-foreground-muted">{t("registerSubtitle")}</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...field("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">{t("username")}</Label>
        <Input id="username" autoComplete="username" {...field("username")} />
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" autoComplete="new-password" {...field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={register.isPending} className="w-full">
        {register.isPending ? t("creating") : t("createAccount")}
      </Button>

      <p className="text-sm text-center">
        {t("alreadyHaveAccount")}{" "}
        <button type="button" onClick={onSwitchLogin} className="text-primary hover:underline">
          {t("login")}
        </button>
      </p>
    </form>
  );
}
