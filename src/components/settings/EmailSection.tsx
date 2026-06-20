"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRequestEmailChange, useConfirmEmailChange } from "@/hooks/use-auth";
import { SettingsSection, LabeledInput } from "./primitives";
import { CodeConfirmForm } from "./CodeConfirmForm";

const schema = z.object({
  new_email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe sua senha atual"),
});

type Fields = z.infer<typeof schema>;

export function EmailSection({ email }: { email: string }) {
  const request = useRequestEmailChange();
  const confirm = useConfirmEmailChange();
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
      <SettingsSection title="Email">
        <CodeConfirmForm
          description={
            <>
              Digite o código de 6 dígitos enviado para{" "}
              <span className="font-medium text-foreground">{getValues("new_email")}</span>.
            </>
          }
          submitLabel="Confirmar novo email"
          isPending={confirm.isPending}
          onSubmit={(code) => confirm.mutate({ code })}
          onCancel={() => request.reset()}
        />
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Email"
      description={
        <>
          Email atual: <span className="font-medium text-foreground">{email}</span>
        </>
      }
    >
      <form onSubmit={handleSubmit((data) => request.mutate(data))} className="space-y-4">
        <LabeledInput
          label="Novo email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          error={errors.new_email?.message}
          {...register("new_email")}
        />
        <LabeledInput
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" disabled={request.isPending}>
          {request.isPending ? "Enviando..." : "Enviar código"}
        </Button>
      </form>
    </SettingsSection>
  );
}
