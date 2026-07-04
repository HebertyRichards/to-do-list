"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
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

type Fields = { password: string };

export function DangerZone() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const del = useDeleteAccount();
  const [open, setOpen] = useState(false);

  const schema = useMemo(
    () => z.object({ password: z.string().min(1, t("passwordRequired")) }),
    [t],
  );

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
        {t("dangerTitle")}
      </div>
      <p className="text-sm text-foreground-muted">{t("dangerBody")}</p>
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        {t("deleteAccount")}
      </Button>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">{t("deleteAccountTitle")}</DialogTitle>
            <DialogDescription>{t("deleteAccountBody")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => del.mutate(d))} className="space-y-4">
            <LabeledInput
              label={t("currentPassword")}
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={close} disabled={del.isPending}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" variant="destructive" disabled={del.isPending}>
                {del.isPending ? t("deleting") : t("deleteAccountConfirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
