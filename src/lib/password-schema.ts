import { z } from "zod";

// Mensagens vêm do namespace "settings" (passwordMin, passwordUpper, ...),
// então o schema é uma factory que recebe o `t` do next-intl.
export function makePasswordSchema(t: (key: string) => string) {
  return z
    .string()
    .min(8, t("passwordMin"))
    .max(128)
    .regex(/[A-Z]/, t("passwordUpper"))
    .regex(/[a-z]/, t("passwordLower"))
    .regex(/[0-9]/, t("passwordNumber"))
    .regex(/[^A-Za-z0-9]/, t("passwordSpecial"));
}
