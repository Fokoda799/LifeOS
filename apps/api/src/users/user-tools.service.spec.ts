import { NotFoundException } from '@nestjs/common';
import { UserToolsService } from './user-tools.service';

const row = (over = {}) => ({
  userId: 'u1',
  toolId: 'money' as const,
  addedAt: new Date('2026-01-01T00:00:00.000Z'),
  removedAt: null as Date | null,
  deletionScheduledFor: null as Date | null,
  ...over,
});

function setup() {
  const prisma = {
    userTool: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
    },
  };
  return { prisma, service: new UserToolsService(prisma as never) };
}

describe('UserToolsService', () => {
  afterEach(() => vi.useRealTimers());

  it('lists only active tools by default, scoped to the user', async () => {
    const { prisma, service } = setup();
    await service.list('u1');
    expect(prisma.userTool.findMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
      removedAt: null,
    });
  });

  it('includes removed tools on request, still scoped to the user', async () => {
    const { prisma, service } = setup();
    await service.list('u1', true);
    expect(prisma.userTool.findMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
    });
  });

  it('adding a tool again cancels a pending deletion', async () => {
    const { prisma, service } = setup();
    prisma.userTool.upsert.mockResolvedValue(row());
    await service.add('u1', 'money');
    expect(prisma.userTool.upsert.mock.calls[0][0].update).toEqual({
      removedAt: null,
      deletionScheduledFor: null,
    });
  });

  it('refuses to schedule deletion for a tool the user never added', async () => {
    const { prisma, service } = setup();
    prisma.userTool.findUnique.mockResolvedValue(null);
    await expect(
      service.requestDataDeletion('u1', 'money'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('hides the tool and schedules deletion 30 days ahead', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T00:00:00.000Z'));
    const { prisma, service } = setup();
    prisma.userTool.findUnique.mockResolvedValue(row());
    prisma.userTool.update.mockImplementation(({ data }) =>
      Promise.resolve(row(data)),
    );

    const dto = await service.requestDataDeletion('u1', 'money');

    expect(prisma.userTool.update.mock.calls[0][0].where).toEqual({
      userId_toolId: { userId: 'u1', toolId: 'money' },
    });
    expect(dto.deletionScheduledFor).toBe('2026-03-31T00:00:00.000Z');
    expect(dto.removedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('keeps the original removal date when the tool was already removed', async () => {
    const removedAt = new Date('2026-02-01T00:00:00.000Z');
    const { prisma, service } = setup();
    prisma.userTool.findUnique.mockResolvedValue(row({ removedAt }));
    prisma.userTool.update.mockImplementation(({ data }) =>
      Promise.resolve(row(data)),
    );
    await service.requestDataDeletion('u1', 'money');
    expect(prisma.userTool.update.mock.calls[0][0].data.removedAt).toBe(
      removedAt,
    );
  });

  it('is idempotent: a second request keeps the first date', async () => {
    const scheduled = new Date('2026-03-31T00:00:00.000Z');
    const { prisma, service } = setup();
    prisma.userTool.findUnique.mockResolvedValue(
      row({ deletionScheduledFor: scheduled }),
    );
    const dto = await service.requestDataDeletion('u1', 'money');
    expect(prisma.userTool.update).not.toHaveBeenCalled();
    expect(dto.deletionScheduledFor).toBe(scheduled.toISOString());
  });

  it('cancels only the user’s own pending deletion', async () => {
    const { prisma, service } = setup();
    await service.cancelDataDeletion('u1', 'money');
    expect(prisma.userTool.updateMany.mock.calls[0][0]).toEqual({
      where: {
        userId: 'u1',
        toolId: 'money',
        deletionScheduledFor: { not: null },
      },
      data: { deletionScheduledFor: null },
    });
  });
});
