import { z } from "zod";

export const LOCALES = ["en", "fr", "ar"] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

export const currencySchema = z.string().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code");
export type Currency = z.infer<typeof currencySchema>;

export const THEMS = ["light", "dark", "system"] as const;
export const themSchema = z.enum(THEMS);
export type Them = z.infer<typeof themSchema>;
