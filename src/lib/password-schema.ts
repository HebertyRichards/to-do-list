import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128)
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial");
