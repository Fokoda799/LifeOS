import { z } from "zod";
import { currencySchema } from "./common";

export const ACCOUNT_TYPES = ["cash", "bank", "savings", "credit_card", "e_wallet"] as const;
export const accountTypeSchema = z.enum(ACCOUNT_TYPES);
export type AccountType = z.infer<typeof accountTypeSchema>;

/**
 * Money on the wire: a whole number of minor units (centimes, cents…) as a string.
 * BigInt can't go through JSON and Number loses precision above 2^53.
 */
export const minorUnitsSchema = z
  .string()
  .regex(/^(0|-?[1-9]\d{0,14})$/, 'Use whole minor units as a string, for example "15000"');
export type MinorUnits = z.infer<typeof minorUnitsSchema>;

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: accountTypeSchema,
  currency: currencySchema,
  openingBalance: minorUnitsSchema,
  /** Opening balance plus transactions. Computed, never stored. */
  balance: minorUnitsSchema,
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type Account = z.infer<typeof accountSchema>;

export const accountsResponseSchema = z.object({ accounts: z.array(accountSchema) });
export type AccountsResponse = z.infer<typeof accountsResponseSchema>;

export const createAccountSchema = z.strictObject({
  name: z.string().trim().min(1).max(60),
  type: accountTypeSchema,
  currency: currencySchema.optional().describe("Defaults to the user's currency"),
  openingBalance: minorUnitsSchema.default("0"),
});
export type CreateAccountInput = z.input<typeof createAccountSchema>;

// currency is not editable: changing it would corrupt the account's transactions.
export const updateAccountSchema = z.strictObject({
  name: z.string().trim().min(1).max(60).optional(),
  type: accountTypeSchema.optional(),
  openingBalance: minorUnitsSchema.optional(),
  archived: z.boolean().optional(),
});
export type UpdateAccountInput = z.input<typeof updateAccountSchema>;

export const accountIdSchema = z.cuid();

export const listAccountsQuerySchema = z.object({
  includeArchived: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});
