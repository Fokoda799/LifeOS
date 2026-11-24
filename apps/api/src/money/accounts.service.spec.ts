import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';

const row = (over = {}) => ({
  id: 'c1',
  userId: 'u1',
  name: 'Cash',
  type: 'cash' as const,
  currency: 'MAD',
  openingBalance: 0n,
  archivedAt: null as Date | null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...over,
});

function setup() {
  const prisma = {
    account: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      deleteMany: vi.fn(),
    },
  };
  const users = { findById: vi.fn().mockResolvedValue({ currency: 'EUR' }) };
  const service = new AccountsService(prisma as never, users as never);
  return { prisma, users, service };
}

describe('AccountsService', () => {
  it('lists only the user’s non-archived accounts by default', async () => {
    const { prisma, service } = setup();
    await service.list('u1', false);
    expect(prisma.account.findMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
      archivedAt: null,
    });
  });

  it('includes archived accounts on request, still scoped to the user', async () => {
    const { prisma, service } = setup();
    await service.list('u1', true);
    expect(prisma.account.findMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
    });
  });

  it('defaults the currency to the user’s profile currency', async () => {
    const { prisma, service } = setup();
    prisma.account.create.mockResolvedValue(row({ currency: 'EUR' }));
    await service.create('u1', { name: 'Bank', type: 'bank' });
    expect(prisma.account.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      currency: 'EUR',
      openingBalance: 0n,
    });
  });

  it('uses an explicit currency and converts the opening balance to BigInt', async () => {
    const { prisma, users, service } = setup();
    prisma.account.create.mockResolvedValue(row());
    await service.create('u1', {
      name: 'Card',
      type: 'credit_card',
      currency: 'USD',
      openingBalance: '-500000',
    });
    expect(users.findById).not.toHaveBeenCalled();
    expect(prisma.account.create.mock.calls[0][0].data).toMatchObject({
      currency: 'USD',
      openingBalance: -500000n,
    });
  });

  it('returns 404 for an account that belongs to someone else', async () => {
    const { prisma, service } = setup();
    prisma.account.findFirst.mockResolvedValue(null);
    await expect(service.get('u1', 'other')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.account.findFirst.mock.calls[0][0].where).toEqual({
      id: 'other',
      userId: 'u1',
    });
  });

  it('scopes updates to the user and archives with a date', async () => {
    const { prisma, service } = setup();
    prisma.account.findFirst.mockResolvedValue(row());
    await service.update('u1', 'c1', { archived: true });
    const call = prisma.account.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: 'c1', userId: 'u1' });
    expect(call.data.archivedAt).toBeInstanceOf(Date);
  });

  it('keeps the first archive date and clears it on unarchive', async () => {
    const { prisma, service } = setup();
    const first = new Date('2026-02-01T00:00:00.000Z');
    prisma.account.findFirst.mockResolvedValue(row({ archivedAt: first }));
    await service.update('u1', 'c1', { archived: true });
    expect(prisma.account.updateMany.mock.calls[0][0].data.archivedAt).toBe(
      first,
    );
    await service.update('u1', 'c1', { archived: false });
    expect(
      prisma.account.updateMany.mock.calls[1][0].data.archivedAt,
    ).toBeNull();
  });

  it('deletes only the user’s own account and 404s otherwise', async () => {
    const { prisma, service } = setup();
    prisma.account.deleteMany.mockResolvedValueOnce({ count: 1 });
    await expect(service.remove('u1', 'c1')).resolves.toBeUndefined();
    expect(prisma.account.deleteMany.mock.calls[0][0].where).toEqual({
      id: 'c1',
      userId: 'u1',
    });
    prisma.account.deleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.remove('u1', 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
