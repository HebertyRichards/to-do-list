export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, { flag: string; name: string }> = {
  pt: { flag: "🇧🇷", name: "Português" },
  en: { flag: "🇺🇸", name: "English" },
  es: { flag: "🇪🇸", name: "Español" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
