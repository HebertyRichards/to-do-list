"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { code: string };

interface Props {
  email: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  isPending: boolean;
  isResending: boolean;
  title?: string;
  description?: string;
}

export function VerifyCodeForm({
  email,
  onSubmit,
  onResend,
  onBack,
  isPending,
  isResending,
  title,
  description,
}: Props) {
  const t = useTranslations("auth");

  const schema = useMemo(
    () =>
      z.object({
        code: z.string().length(6, t("codeLength")).regex(/^\d{6}$/, t("codeDigitsOnly")),
      }),
    [t],
  );

  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data.code))} className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{title ?? t("verifyResetTitle")}</h1>
        <p className="text-sm text-foreground-muted">
          {description ?? t("codeSentTo")}{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="code">{t("code")}</Label>
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
        {isPending ? t("verifying") : t("continue")}
      </Button>

      <div className="flex justify-between text-sm">
        <button type="button" onClick={onBack} className="text-primary hover:underline">
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="text-primary hover:underline disabled:opacity-50"
        >
          {isResending ? t("resending") : t("resendCode")}
        </button>
      </div>
    </form>
  );
}
