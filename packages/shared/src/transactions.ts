import { z } from "zod";
import { currencySchema } from "./common";
import { minorUnitsSchema } from "./money";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;
export const transactionTypeSchema = z.enum(TRANSACTION_TYPES);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

/** A transaction amount: whole minor units, greater than zero. The type gives the direction. */
export const positiveMinorUnitsSchema = minorUnitsSchema.refine(
  (v) => v !== "0" && !v.startsWith("-"),
  "Amount must be greater than zero",
);

/** A calendar day, "YYYY-MM-DD". Transactions have no time of day. */
export const transactionDateSchema = z.iso.date();

const noteSchema = z.string().trim().max(200);
const idSchema = z.cuid();

export const transactionSchema = z.object({
  id: z.string(),
  type: transactionTypeSchema,
  amount: minorUnitsSchema,
  /** The account's currency. A transfer's two accounts always share it. */
  currency: currencySchema,
  accountId: z.string(),
  /** Destination of a transfer, otherwise null. */
  toAccountId: z.string().nullable(),
  /** Income and expense only. */
  categoryId: z.string().nullable(),
  date: transactionDateSchema,
  note: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type Transaction = z.infer<typeof transactionSchema>;

export const transactionsResponseSchema = z.object({
  transactions: z.array(transactionSchema),
  /** Pass as `cursor` to get the next page. Null on the last page. */
  nextCursor: z.string().nullable(),
});
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>;

const createCashFlowSchema = z.strictObject({
  type: z.enum(["income", "expense"]),
  amount: positiveMinorUnitsSchema,
  accountId: idSchema,
  categoryId: idSchema,
  date: transactionDateSchema,
  note: noteSchema.optional(),
});

const createTransferSchema = z
  .strictObject({
    type: z.literal("transfer"),
    amount: positiveMinorUnitsSchema,
    accountId: idSchema.describe("Source account"),
    toAccountId: idSchema.describe("Destination account, in the same currency"),
    date: transactionDateSchema,
    note: noteSchema.optional(),
  })
  .refine((v) => v.accountId !== v.toAccountId, {
    message: "Choose two different accounts",
    path: ["toAccountId"],
  });

export const createTransactionSchema = z.discriminatedUnion("type", [
  createCashFlowSchema,
  createTransferSchema,
]);
export type CreateTransactionInput = z.input<typeof createTransactionSchema>;

// type is not editable: delete the transaction and create a new one instead.
export const updateTransactionSchema = z.strictObject({
  amount: positiveMinorUnitsSchema.optional(),
  accountId: idSchema.optional(),
  toAccountId: idSchema.optional(),
  categoryId: idSchema.optional(),
  date: transactionDateSchema.optional(),
  /** null clears the note. */
  note: noteSchema.nullable().optional(),
});
export type UpdateTransactionInput = z.input<typeof updateTransactionSchema>;

export const transactionIdSchema = idSchema;

export const TRANSACTIONS_PAGE_SIZE = 50;
export const MAX_TRANSACTIONS_PAGE_SIZE = 100;

const filterFields = {
  /** Matches transactions where this account is the source or the transfer destination. */
  accountId: idSchema.optional(),
  categoryId: idSchema.optional(),
  type: transactionTypeSchema.optional(),
  /** Inclusive. */
  from: transactionDateSchema.optional(),
  to: transactionDateSchema.optional(),
  /** Searches the note, ignoring case. */
  q: z.string().trim().min(1).max(100).optional(),
};

const validRange = (v: { from?: string; to?: string }) => !v.from || !v.to || v.from <= v.to;
const rangeError = { message: "`from` must not be after `to`", path: ["to"] };

/** The filters a list and its summary share. */
export const transactionFiltersSchema = z.object(filterFields).refine(validRange, rangeError);
export type TransactionFilters = z.output<typeof transactionFiltersSchema>;

export const listTransactionsQuerySchema = z
  .object({
    ...filterFields,
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_TRANSACTIONS_PAGE_SIZE)
      .default(TRANSACTIONS_PAGE_SIZE),
    cursor: idSchema.optional(),
  })
  .refine(validRange, rangeError);
export type ListTransactionsQuery = z.output<typeof listTransactionsQuerySchema>;

export const transactionsSummarySchema = z.object({
  /** One entry per currency that has income or expenses. Transfers are not counted. */
  totals: z.array(
    z.object({
      currency: currencySchema,
      income: minorUnitsSchema,
      expense: minorUnitsSchema,
      /** income minus expense. May be negative. */
      net: minorUnitsSchema,
    }),
  ),
});
export type TransactionsSummary = z.infer<typeof transactionsSummarySchema>;
