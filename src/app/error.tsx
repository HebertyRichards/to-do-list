"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">{t("somethingWrong")}</h1>
      <p className="text-sm text-foreground-muted">
        {isDev ? error.message : t("tryLater")}
      </p>
      {error.digest && (
        <p className="text-xs text-foreground-subtle">Ref: {error.digest}</p>
      )}
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </main>
  );
}
