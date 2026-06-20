"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { passwordSchema } from "@/lib/password-schema";
import { useRequestPasswordChange, useConfirmPasswordChange } from "@/hooks/use-auth";
import { SettingsSection, LabeledInput } from "./primitives";
import { CodeConfirmForm } from "./CodeConfirmForm";

const schema = z
  .object({
    current_password: z.string().min(1, "Informe sua senha atual"),
    new_password: passwordSchema,
    confirm_new_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_new_password, {
    path: ["confirm_new_password"],
    message: "As senhas não coincidem",
  });

type Fields = z.infer<typeof schema>;

export function PasswordSection() {
  const request = useRequestPasswordChange();
  const confirm = useConfirmPasswordChange();
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
      <SettingsSection title="Senha">
        <CodeConfirmForm
          description="Digite o código de 6 dígitos enviado para o seu email. Você precisará entrar novamente após a troca."
          submitLabel="Confirmar nova senha"
          isPending={confirm.isPending}
          onSubmit={(code) => confirm.mutate({ code })}
          onCancel={() => request.reset()}
        />
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Senha"
      description="Ao confirmar, enviamos um código para o seu email para concluir a troca."
    >
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
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          error={errors.current_password?.message}
          {...register("current_password")}
        />
        <LabeledInput
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          error={errors.new_password?.message}
          {...register("new_password")}
        />
        <LabeledInput
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirm_new_password?.message}
          {...register("confirm_new_password")}
        />
        <Button type="submit" disabled={request.isPending}>
          {request.isPending ? "Enviando..." : "Enviar código"}
        </Button>
      </form>
    </SettingsSection>
  );
}
