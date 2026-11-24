import type { Account, AccountType } from '@lifeos/shared';

type AccountRow = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: bigint;
  archivedAt: Date | null;
  createdAt: Date;
};

/** `delta` is the sum of the account's transactions (P2-07). BigInt in, strings out. */
export function toAccountDto(row: AccountRow, delta: bigint = 0n): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currency: row.currency,
    openingBalance: row.openingBalance.toString(),
    balance: (row.openingBalance + delta).toString(),
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}
