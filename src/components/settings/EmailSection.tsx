"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRequestEmailChange, useConfirmEmailChange } from "@/hooks/use-auth";
import { SettingsSection, LabeledInput } from "./primitives";
import { CodeConfirmForm } from "./CodeConfirmForm";

type Fields = { new_email: string; password: string };

const highlight = (c: React.ReactNode) => (
  <span className="font-medium text-foreground">{c}</span>
);

export function EmailSection({ email }: { email: string }) {
  const t = useTranslations("settings");
  const request = useRequestEmailChange();
  const confirm = useConfirmEmailChange();

  const schema = useMemo(
    () =>
      z.object({
        new_email: z.string().email(t("emailInvalid")),
        password: z.string().min(1, t("currentPasswordRequired")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { new_email: "", password: "" },
  });

  if (request.isSuccess) {
    return (
      <SettingsSection title={t("emailTitle")}>
        <CodeConfirmForm
          description={t.rich("emailCodeSent", { email: getValues("new_email"), highlight })}
          submitLabel={t("confirmNewEmail")}
          isPending={confirm.isPending}
          onSubmit={(code) => confirm.mutate({ code })}
          onCancel={() => request.reset()}
        />
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title={t("emailTitle")}
      description={t.rich("currentEmail", { email, highlight })}
    >
      <form onSubmit={handleSubmit((data) => request.mutate(data))} className="space-y-4">
        <LabeledInput
          label={t("newEmail")}
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          error={errors.new_email?.message}
          {...register("new_email")}
        />
        <LabeledInput
          label={t("currentPassword")}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" disabled={request.isPending}>
          {request.isPending ? t("sending") : t("sendCode")}
        </Button>
      </form>
    </SettingsSection>
  );
}
