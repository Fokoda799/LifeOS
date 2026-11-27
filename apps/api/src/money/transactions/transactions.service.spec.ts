import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';

const account = (over = {}) => ({
  id: 'a1',
  userId: 'u1',
  currency: 'MAD',
  archivedAt: null as Date | null,
  ...over,
});
const category = (over = {}) => ({
  id: 'k1',
  userId: 'u1',
  kind: 'expense' as const,
  archivedAt: null as Date | null,
  ...over,
});
const row = (over = {}) => ({
  id: 't1',
  userId: 'u1',
  type: 'expense' as const,
  amount: 12_050n,
  currency: 'MAD',
  accountId: 'a1',
  toAccountId: null as string | null,
  categoryId: 'k1' as string | null,
  date: new Date('2026-11-27T00:00:00.000Z'),
  note: null as string | null,
  createdAt: new Date('2026-11-27T10:00:00.000Z'),
  ...over,
});

function setup() {
  const prisma = {
    transaction: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn().mockImplementation(({ data }) => row(data)),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    account: { findFirst: vi.fn().mockResolvedValue(account()) },
    category: { findFirst: vi.fn().mockResolvedValue(category()) },
  };
  return { prisma, service: new TransactionsService(prisma as never) };
}

const expense = {
  type: 'expense' as const,
  amount: '12050',
  accountId: 'a1',
  categoryId: 'k1',
  date: '2026-11-27',
};
const transfer = {
  type: 'transfer' as const,
  amount: '5000',
  accountId: 'a1',
  toAccountId: 'a2',
  date: '2026-11-27',
};

describe('TransactionsService', () => {
  describe('list', () => {
    it('is scoped to the user and sorted newest first', async () => {
      const { prisma, service } = setup();
      await service.list('u1', { limit: 50 });
      const call = prisma.transaction.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ userId: 'u1' });
      expect(call.orderBy[0]).toEqual({ date: 'desc' });
      expect(call.take).toBe(51);
    });

    it('matches an account as source or transfer destination, within a date range', async () => {
      const { prisma, service } = setup();
      await service.list('u1', {
        limit: 50,
        accountId: 'a1',
        from: '2026-11-01',
        to: '2026-11-30',
      });
      const where = prisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.userId).toBe('u1');
      expect(where.OR).toEqual([{ accountId: 'a1' }, { toAccountId: 'a1' }]);
      expect(where.date.gte).toEqual(new Date('2026-11-01T00:00:00.000Z'));
      expect(where.date.lte).toEqual(new Date('2026-11-30T00:00:00.000Z'));
    });

    it('returns a cursor only when there is another page', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findMany.mockResolvedValueOnce([
        row({ id: 't1' }),
        row({ id: 't2' }),
        row({ id: 't3' }),
      ]);
      const page = await service.list('u1', { limit: 2 });
      expect(page.transactions.map((t) => t.id)).toEqual(['t1', 't2']);
      expect(page.nextCursor).toBe('t2');

      prisma.transaction.findMany.mockResolvedValueOnce([row({ id: 't9' })]);
      expect((await service.list('u1', { limit: 2 })).nextCursor).toBeNull();
    });

    it('continues after the cursor', async () => {
      const { prisma, service } = setup();
      await service.list('u1', { limit: 10, cursor: 't2' });
      const call = prisma.transaction.findMany.mock.calls[0][0];
      expect(call.cursor).toEqual({ id: 't2' });
      expect(call.skip).toBe(1);
    });
  });

  describe('create', () => {
    it('stores the amount as BigInt, the account currency and the day', async () => {
      const { prisma, service } = setup();
      prisma.account.findFirst.mockResolvedValue(account({ currency: 'EUR' }));
      const dto = await service.create('u1', { ...expense, note: '  Milk ' });
      const data = prisma.transaction.create.mock.calls[0][0].data;
      expect(data).toMatchObject({
        userId: 'u1',
        type: 'expense',
        amount: 12_050n,
        currency: 'EUR',
        toAccountId: null,
        note: 'Milk',
      });
      expect(dto.amount).toBe('12050');
      expect(dto.date).toBe('2026-11-27');
    });

    it('looks up the account and category only among the user’s own', async () => {
      const { prisma, service } = setup();
      await service.create('u1', expense);
      expect(prisma.account.findFirst.mock.calls[0][0].where).toEqual({
        id: 'a1',
        userId: 'u1',
      });
      expect(prisma.category.findFirst.mock.calls[0][0].where).toEqual({
        id: 'k1',
        userId: 'u1',
      });
    });

    it('404s on someone else’s or a missing account or category', async () => {
      const { prisma, service } = setup();
      prisma.account.findFirst.mockResolvedValueOnce(null);
      await expect(service.create('u1', expense)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      prisma.category.findFirst.mockResolvedValueOnce(null);
      await expect(service.create('u1', expense)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it('rejects a category of the other kind', async () => {
      const { prisma, service } = setup();
      prisma.category.findFirst.mockResolvedValue(category({ kind: 'income' }));
      await expect(service.create('u1', expense)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects an archived account or category', async () => {
      const { prisma, service } = setup();
      prisma.account.findFirst.mockResolvedValueOnce(
        account({ archivedAt: new Date() }),
      );
      await expect(service.create('u1', expense)).rejects.toBeInstanceOf(
        ConflictException,
      );
      prisma.category.findFirst.mockResolvedValueOnce(
        category({ archivedAt: new Date() }),
      );
      await expect(service.create('u1', expense)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('creates a transfer between two accounts of the same currency, with no category', async () => {
      const { prisma, service } = setup();
      prisma.account.findFirst
        .mockResolvedValueOnce(account({ id: 'a1' }))
        .mockResolvedValueOnce(account({ id: 'a2' }));
      await service.create('u1', transfer);
      const data = prisma.transaction.create.mock.calls[0][0].data;
      expect(data).toMatchObject({
        type: 'transfer',
        accountId: 'a1',
        toAccountId: 'a2',
        categoryId: null,
      });
      expect(prisma.category.findFirst).not.toHaveBeenCalled();
    });

    it('rejects a transfer between different currencies', async () => {
      const { prisma, service } = setup();
      prisma.account.findFirst
        .mockResolvedValueOnce(account({ id: 'a1', currency: 'MAD' }))
        .mockResolvedValueOnce(account({ id: 'a2', currency: 'EUR' }));
      await expect(service.create('u1', transfer)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('404s when the transaction is not the user’s', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findFirst.mockResolvedValue(null);
      await expect(
        service.update('u1', 'x', { amount: '100' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.transaction.findFirst.mock.calls[0][0].where).toEqual({
        id: 'x',
        userId: 'u1',
      });
    });

    it('changes only what was sent and writes scoped to the user', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findFirst.mockResolvedValue(row());
      await service.update('u1', 't1', { amount: '999', note: null });
      const call = prisma.transaction.updateMany.mock.calls[0][0];
      expect(call.where).toEqual({ id: 't1', userId: 'u1' });
      expect(call.data).toMatchObject({ amount: 999n, note: null });
      expect(call.data).not.toHaveProperty('date');
    });

    it('lets a transaction keep an account that was archived since', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findFirst.mockResolvedValue(row());
      prisma.account.findFirst.mockResolvedValue(
        account({ archivedAt: new Date() }),
      );
      await expect(
        service.update('u1', 't1', { amount: '10' }),
      ).resolves.toBeDefined();
    });

    it('rejects moving it to an archived account', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findFirst.mockResolvedValue(row());
      prisma.account.findFirst.mockResolvedValue(
        account({ id: 'a9', archivedAt: new Date() }),
      );
      await expect(
        service.update('u1', 't1', { accountId: 'a9' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('refuses a category on a transfer and a destination on an expense', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findFirst.mockResolvedValue(
        row({ type: 'transfer', categoryId: null, toAccountId: 'a2' }),
      );
      await expect(
        service.update('u1', 't1', { categoryId: 'k1' }),
      ).rejects.toBeInstanceOf(BadRequestException);

      prisma.transaction.findFirst.mockResolvedValue(row());
      await expect(
        service.update('u1', 't1', { toAccountId: 'a2' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('takes the currency from the new account', async () => {
      const { prisma, service } = setup();
      prisma.transaction.findFirst.mockResolvedValue(row());
      prisma.account.findFirst.mockResolvedValue(
        account({ id: 'a2', currency: 'EUR' }),
      );
      await service.update('u1', 't1', { accountId: 'a2' });
      expect(prisma.transaction.updateMany.mock.calls[0][0].data).toMatchObject(
        {
          accountId: 'a2',
          currency: 'EUR',
        },
      );
    });
  });

  it('deletes only the user’s own transaction and 404s otherwise', async () => {
    const { prisma, service } = setup();
    await expect(service.remove('u1', 't1')).resolves.toBeUndefined();
    expect(prisma.transaction.deleteMany.mock.calls[0][0].where).toEqual({
      id: 't1',
      userId: 'u1',
    });
    prisma.transaction.deleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.remove('u1', 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('erases only the given user’s transactions for the data-deletion job', async () => {
    const { prisma, service } = setup();
    await service.removeAllForUser('u1');
    expect(prisma.transaction.deleteMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
    });
  });
});
