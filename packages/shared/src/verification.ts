import { z } from "zod";
import { currencySchema, localeSchema } from "./common";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(128);

export const startVerificationSchema = z.object({
  email: emailSchema,
  locale: localeSchema.default("en"),
});
export type StartVerificationInput = z.input<typeof startVerificationSchema>;
export type StartVerificationData = z.output<typeof startVerificationSchema>;

export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/),
});
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

export const verifiedTokenSchema = z.object({ token: z.string() });
export const okSchema = z.object({ ok: z.literal(true) });

export const registerCompleteSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  name: z.string().trim().min(1).max(80).optional(),
  locale: localeSchema.default("en"),
  currency: currencySchema.default("MAD"),
});
export type RegisterCompleteInput = z.input<typeof registerCompleteSchema>;
export type RegisterCompleteData = z.output<typeof registerCompleteSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
