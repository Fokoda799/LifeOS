import type { Transaction, TransactionType } from '@lifeos/shared';

type TransactionRow = {
  id: string;
  type: TransactionType;
  amount: bigint;
  currency: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  date: Date;
  note: string | null;
  createdAt: Date;
};

/** The `date` column is a calendar day stored at UTC midnight. BigInt in, strings out. */
export function toTransactionDto(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount.toString(),
    currency: row.currency,
    accountId: row.accountId,
    toAccountId: row.toAccountId,
    categoryId: row.categoryId,
    date: row.date.toISOString().slice(0, 10),
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export const toDbDate = (day: string) => new Date(`${day}T00:00:00.000Z`);
