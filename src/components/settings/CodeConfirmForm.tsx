"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "./primitives";

const schema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos").regex(/^\d{6}$/, "Apenas números"),
});

type Fields = z.infer<typeof schema>;

interface Props {
  description: React.ReactNode;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function CodeConfirmForm({ description, submitLabel, isPending, onSubmit, onCancel }: Props) {
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
        label="Código"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        error={errors.code?.message}
        {...register("code")}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Confirmando..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
