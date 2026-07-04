"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { makePasswordSchema } from "@/lib/password-schema";
import { useRequestPasswordChange, useConfirmPasswordChange } from "@/hooks/use-auth";
import { SettingsSection, LabeledInput } from "./primitives";
import { CodeConfirmForm } from "./CodeConfirmForm";

type Fields = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export function PasswordSection() {
  const t = useTranslations("settings");
  const request = useRequestPasswordChange();
  const confirm = useConfirmPasswordChange();

  const schema = useMemo(
    () =>
      z
        .object({
          current_password: z.string().min(1, t("currentPasswordRequired")),
          new_password: makePasswordSchema(t),
          confirm_new_password: z.string(),
        })
        .refine((d) => d.new_password === d.confirm_new_password, {
          path: ["confirm_new_password"],
          message: t("passwordsMismatch"),
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "", confirm_new_password: "" },
  });

  if (request.isSuccess) {
    return (
      <SettingsSection title={t("passwordTitle")}>
        <CodeConfirmForm
          description={t("passwordCodeSent")}
          submitLabel={t("confirmNewPasswordSubmit")}
          isPending={confirm.isPending}
          onSubmit={(code) => confirm.mutate({ code })}
          onCancel={() => request.reset()}
        />
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title={t("passwordTitle")} description={t("passwordDescription")}>
      <form
        onSubmit={handleSubmit(
          (data) => request.mutate(data),
          (formErrors) => {
            const message =
              formErrors.new_password?.message ??
              formErrors.confirm_new_password?.message ??
              formErrors.current_password?.message;
            if (message) toast.error(message);
          },
        )}
        className="space-y-4"
      >
        <LabeledInput
          label={t("currentPassword")}
          type="password"
          autoComplete="current-password"
          error={errors.current_password?.message}
          {...register("current_password")}
        />
        <LabeledInput
          label={t("newPassword")}
          type="password"
          autoComplete="new-password"
          error={errors.new_password?.message}
          {...register("new_password")}
        />
        <LabeledInput
          label={t("confirmNewPassword")}
          type="password"
          autoComplete="new-password"
          error={errors.confirm_new_password?.message}
          {...register("confirm_new_password")}
        />
        <Button type="submit" disabled={request.isPending}>
          {request.isPending ? t("sending") : t("sendCode")}
        </Button>
      </form>
    </SettingsSection>
  );
}
