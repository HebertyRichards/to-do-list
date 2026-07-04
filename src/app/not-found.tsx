import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errorPage");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-foreground-muted">{t("notFound")}</p>
      <Link href="/dashboard" className="text-primary hover:underline">
        {t("backHome")}
      </Link>
    </main>
  );
}
