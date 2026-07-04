"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLocale } from "@/i18n/actions";
import { LOCALES, LOCALE_LABELS } from "@/i18n/config";

export function LanguageSelect() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: string) => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <Select value={locale} onValueChange={change} disabled={pending}>
      <SelectTrigger size="sm" className="w-fit gap-1.5 border-0 shadow-none text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l} className="text-sm">
            <span className="mr-1">{LOCALE_LABELS[l].flag}</span>
            {LOCALE_LABELS[l].name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
