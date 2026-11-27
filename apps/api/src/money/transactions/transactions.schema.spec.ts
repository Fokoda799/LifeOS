import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
} from '@lifeos/shared';

const id = (n: number) => `c${String(n).padStart(24, 'x')}`; // 25-char cuid-like
const [a, b, c] = [id(1), id(2), id(3)];

const expense = {
  type: 'expense',
  amount: '12050',
  accountId: a,
  categoryId: c,
  date: '2026-11-27',
} as const;

describe('transaction schemas', () => {
  it('accepts an expense, an income and a transfer', () => {
    expect(createTransactionSchema.safeParse(expense).success).toBe(true);
    expect(
      createTransactionSchema.safeParse({ ...expense, type: 'income' }).success,
    ).toBe(true);
    expect(
      createTransactionSchema.safeParse({
        type: 'transfer',
        amount: '500',
        accountId: a,
        toAccountId: b,
        date: '2026-11-27',
      }).success,
    ).toBe(true);
  });

  it('rejects zero, negative and non-integer amounts', () => {
    for (const amount of ['0', '-100', '12.5', 'abc', '']) {
      expect(
        createTransactionSchema.safeParse({ ...expense, amount }).success,
      ).toBe(false);
    }
  });

  it('rejects bad dates and over-long notes', () => {
    for (const date of ['2026-13-01', '27/11/2026', '2026-11-27T10:00:00Z']) {
      expect(
        createTransactionSchema.safeParse({ ...expense, date }).success,
      ).toBe(false);
    }
    expect(
      createTransactionSchema.safeParse({ ...expense, note: 'x'.repeat(201) })
        .success,
    ).toBe(false);
  });

  it('needs a category for income and expense, and forbids one on a transfer', () => {
    const { categoryId: _c, ...noCategory } = expense;
    expect(createTransactionSchema.safeParse(noCategory).success).toBe(false);
    expect(
      createTransactionSchema.safeParse({
        type: 'transfer',
        amount: '500',
        accountId: a,
        toAccountId: b,
        categoryId: c,
        date: '2026-11-27',
      }).success,
    ).toBe(false);
  });

  it('rejects a transfer to the same account', () => {
    expect(
      createTransactionSchema.safeParse({
        type: 'transfer',
        amount: '500',
        accountId: a,
        toAccountId: a,
        date: '2026-11-27',
      }).success,
    ).toBe(false);
  });

  it('does not let an update change the type', () => {
    expect(updateTransactionSchema.safeParse({ type: 'income' }).success).toBe(
      false,
    );
    expect(updateTransactionSchema.safeParse({ note: null }).success).toBe(
      true,
    );
  });

  it('applies list defaults and caps the page size', () => {
    expect(listTransactionsQuerySchema.parse({}).limit).toBe(50);
    expect(listTransactionsQuerySchema.parse({ limit: '20' }).limit).toBe(20);
    expect(
      listTransactionsQuerySchema.safeParse({ limit: '101' }).success,
    ).toBe(false);
  });
});
