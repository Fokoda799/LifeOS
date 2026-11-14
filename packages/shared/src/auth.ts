import { z } from "zod";
import { currencySchema, localeSchema } from "./common";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "At least 8 characters").max(128),
  name: z.string().trim().min(1).max(80).optional(),
  locale: localeSchema.default("en"),
  currency: currencySchema.default("MAD"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  locale: localeSchema,
  currency: currencySchema,
});
export type User = z.infer<typeof userSchema>;

export const authResultSchema = z.object({
  user: userSchema,
  accessToken: z
    .string()
    .optional()
    .describe("Only returned when the x-client: mobile header is sent"),
  refreshToken: z
    .string()
    .optional()
    .describe("Only returned when the x-client: mobile header is sent"),
});
export type AuthResult = z.infer<typeof authResultSchema>;

export const refreshBodySchema = z.object({
  refreshToken: z
    .string()
    .optional()
    .describe("Mobile clients send it here. Web clients use the refresh_token cookie."),
});
