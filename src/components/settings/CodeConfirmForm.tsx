"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "./primitives";

type Fields = { code: string };

interface Props {
  description: React.ReactNode;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function CodeConfirmForm({ description, submitLabel, isPending, onSubmit, onCancel }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const schema = useMemo(
    () =>
      z.object({
        code: z.string().length(6, t("codeLength")).regex(/^\d{6}$/, t("codeDigitsOnly")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data.code))} className="space-y-4">
      <p className="text-sm text-foreground-muted">{description}</p>
      <LabeledInput
        label={t("code")}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        error={errors.code?.message}
        {...register("code")}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("confirming") : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
