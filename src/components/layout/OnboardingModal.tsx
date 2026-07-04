"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/use-profile";

const SECTIONS = [
  { titleKey: "individualTitle", bodyKey: "individualBody" },
  { titleKey: "groupTitle", bodyKey: "groupBody" },
  { titleKey: "notificationsTitle", bodyKey: "notificationsBody" },
  { titleKey: "structureTitle", bodyKey: "structureBody" },
] as const;

export default function OnboardingModal() {
  const t = useTranslations("onboarding");
  const [open, setOpen] = useState(true);
  const update = useUpdateProfile();

  const finish = () => {
    if (update.isPending) return;
    update.mutate({ onboarded: true }, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-foreground-muted">
          {SECTIONS.map(({ titleKey, bodyKey }) => (
            <section key={titleKey}>
              <p className="font-semibold mb-1">{t(titleKey)}</p>
              <p>{t.rich(bodyKey, { strong: (c) => <strong>{c}</strong> })}</p>
            </section>
          ))}
        </div>

        <Button onClick={finish} disabled={update.isPending} className="w-full">
          {update.isPending ? t("saving") : t("start")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
