"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteAccount } from "@/hooks/use-auth";
import { LabeledInput } from "./primitives";

const schema = z.object({ password: z.string().min(1, "Informe sua senha") });

type Fields = z.infer<typeof schema>;

export function DangerZone() {
  const del = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Fields>({ resolver: zodResolver(schema), defaultValues: { password: "" } });

  const close = () => {
    setOpen(false);
    reset();
  };

  return (
    <section className="space-y-3 rounded-lg border border-destructive/30 p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Zona de perigo
      </div>
      <p className="text-sm text-foreground-muted">
        Excluir sua conta é permanente. Grupos que você criou também serão removidos.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Excluir minha conta
      </Button>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir conta</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. Confirme sua senha para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => del.mutate(d))} className="space-y-4">
            <LabeledInput
              label="Senha atual"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={close} disabled={del.isPending}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={del.isPending}>
                {del.isPending ? "Excluindo..." : "Excluir conta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
