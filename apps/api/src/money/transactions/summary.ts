import type { TransactionsSummary } from '@lifeos/shared';

export type SumRow = {
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  sum: bigint;
};

/** Income, expense and net per currency. Transfers move money, they don't earn or spend it. */
export function summarize(rows: SumRow[]): TransactionsSummary['totals'] {
  const byCurrency = new Map<string, { income: bigint; expense: bigint }>();
  for (const r of rows) {
    if (r.type === 'transfer') continue;
    const t = byCurrency.get(r.currency) ?? { income: 0n, expense: 0n };
    t[r.type] += r.sum;
    byCurrency.set(r.currency, t);
  }
  return [...byCurrency.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, t]) => ({
      currency,
      income: t.income.toString(),
      expense: t.expense.toString(),
      net: (t.income - t.expense).toString(),
    }));
}
