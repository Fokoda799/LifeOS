import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_CATEGORIES, MAX_CATEGORIES_PER_USER } from '@lifeos/shared';
import { CategoriesService } from './categories.service';

const row = (over = {}) => ({
  id: 'c1',
  userId: 'u1',
  kind: 'expense' as const,
  systemKey: null as string | null,
  name: 'Coffee' as string | null,
  icon: 'coffee',
  color: 'amber',
  archivedAt: null as Date | null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...over,
});

function setup() {
  const prisma = {
    category: {
      count: vi.fn().mockResolvedValue(DEFAULT_CATEGORIES.length),
      createMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  return { prisma, service: new CategoriesService(prisma as never) };
}

describe('CategoriesService', () => {
  it('gives a new user their own copy of every default, without duplicating', async () => {
    const { prisma, service } = setup();
    prisma.category.count.mockResolvedValueOnce(0);
    await service.list('u1', false);
    const call = prisma.category.createMany.mock.calls[0][0];
    expect(call.skipDuplicates).toBe(true);
    expect(call.data).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(call.data.every((d: { userId: string }) => d.userId === 'u1')).toBe(
      true,
    );
    expect(call.data[0]).toMatchObject({
      systemKey: 'groceries',
      kind: 'expense',
    });
  });

  it('fills in only what is missing when new defaults are released', async () => {
    const { prisma, service } = setup();
    prisma.category.count.mockResolvedValueOnce(DEFAULT_CATEGORIES.length - 1);
    await service.list('u1', false);
    expect(prisma.category.createMany).toHaveBeenCalledTimes(1);
  });

  it('does not seed again when the user already has all defaults', async () => {
    const { prisma, service } = setup();
    await service.list('u1', false);
    expect(prisma.category.createMany).not.toHaveBeenCalled();
  });

  it('lists only the user’s non-archived categories by default', async () => {
    const { prisma, service } = setup();
    await service.list('u1', false);
    expect(prisma.category.findMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
      archivedAt: null,
    });
    await service.list('u1', true);
    expect(prisma.category.findMany.mock.calls[1][0].where).toEqual({
      userId: 'u1',
    });
  });

  it('creates a custom category for the user', async () => {
    const { prisma, service } = setup();
    prisma.category.count.mockResolvedValue(20);
    prisma.category.create.mockResolvedValue(row());
    await service.create('u1', {
      kind: 'expense',
      name: 'Coffee',
      icon: 'coffee',
      color: 'amber',
    });
    expect(prisma.category.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      name: 'Coffee',
    });
  });

  it('refuses to go over the category limit', async () => {
    const { prisma, service } = setup();
    prisma.category.count.mockResolvedValue(MAX_CATEGORIES_PER_USER);
    await expect(
      service.create('u1', {
        kind: 'expense',
        name: 'X',
        icon: 'tag',
        color: 'slate',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns 404 for a category that belongs to someone else', async () => {
    const { prisma, service } = setup();
    prisma.category.findFirst.mockResolvedValue(null);
    await expect(
      service.update('u1', 'x', { color: 'red' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.category.findFirst.mock.calls[0][0].where).toEqual({
      id: 'x',
      userId: 'u1',
    });
  });

  it('renames a default and resets it with null', async () => {
    const { prisma, service } = setup();
    prisma.category.findFirst.mockResolvedValue(
      row({ systemKey: 'groceries', name: null }),
    );
    await service.update('u1', 'c1', { name: 'Souk' });
    expect(prisma.category.updateMany.mock.calls[0][0].where).toEqual({
      id: 'c1',
      userId: 'u1',
    });
    expect(prisma.category.updateMany.mock.calls[0][0].data.name).toBe('Souk');
    await service.update('u1', 'c1', { name: null });
    expect(prisma.category.updateMany.mock.calls[1][0].data.name).toBeNull();
  });

  it('does not let a custom category lose its name', async () => {
    const { prisma, service } = setup();
    prisma.category.findFirst.mockResolvedValue(row());
    await expect(
      service.update('u1', 'c1', { name: null }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.category.updateMany).not.toHaveBeenCalled();
  });

  it('archives with a date, keeps the first date, and restores', async () => {
    const { prisma, service } = setup();
    const first = new Date('2026-02-01T00:00:00.000Z');
    prisma.category.findFirst.mockResolvedValue(row({ archivedAt: first }));
    await service.update('u1', 'c1', { archived: true });
    expect(prisma.category.updateMany.mock.calls[0][0].data.archivedAt).toBe(
      first,
    );
    await service.update('u1', 'c1', { archived: false });
    expect(
      prisma.category.updateMany.mock.calls[1][0].data.archivedAt,
    ).toBeNull();
  });

  it('refuses to delete a default category', async () => {
    const { prisma, service } = setup();
    prisma.category.findFirst.mockResolvedValue(
      row({ systemKey: 'groceries' }),
    );
    await expect(service.remove('u1', 'c1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.category.deleteMany).not.toHaveBeenCalled();
  });

  it('deletes a custom category, scoped to the user', async () => {
    const { prisma, service } = setup();
    prisma.category.findFirst.mockResolvedValue(row());
    await service.remove('u1', 'c1');
    expect(prisma.category.deleteMany.mock.calls[0][0].where).toEqual({
      id: 'c1',
      userId: 'u1',
    });
  });

  it('erases all of a user’s categories for the data-deletion job', async () => {
    const { prisma, service } = setup();
    await service.removeAllForUser('u1');
    expect(prisma.category.deleteMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
    });
  });
});
