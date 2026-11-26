import { Logger } from '@nestjs/common';
import { ToolDataRegistry } from './tool-data';
import { ToolDataPurgeService } from './tool-data-purge.service';

const due = (userId: string, toolId: 'money' | 'tasks' = 'money') => ({
  userId,
  toolId,
});
const now = new Date('2026-04-01T03:00:00.000Z');

function setup() {
  const prisma = {
    userTool: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(1),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const purge = vi.fn().mockResolvedValue(undefined);
  const registry = new ToolDataRegistry();
  registry.register({ toolId: 'money', purge });
  const service = new ToolDataPurgeService(prisma as never, registry);
  return { prisma, purge, service };
}

describe('ToolDataPurgeService', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('only looks at deletions whose date has passed', async () => {
    const { prisma, service } = setup();
    await service.purgeDue(now);
    expect(prisma.userTool.findMany.mock.calls[0][0].where).toEqual({
      deletionScheduledFor: { lte: now },
    });
  });

  it('erases the data, then removes the row', async () => {
    const { prisma, purge, service } = setup();
    prisma.userTool.findMany.mockResolvedValue([due('u1')]);
    expect(await service.purgeDue(now)).toBe(1);
    expect(purge).toHaveBeenCalledWith('u1');
    expect(prisma.userTool.deleteMany.mock.calls[0][0].where).toEqual({
      userId: 'u1',
      toolId: 'money',
      deletionScheduledFor: { lte: now },
    });
  });

  it('skips a deletion that was cancelled meanwhile', async () => {
    const { prisma, purge, service } = setup();
    prisma.userTool.findMany.mockResolvedValue([due('u1')]);
    prisma.userTool.count.mockResolvedValue(0);
    expect(await service.purgeDue(now)).toBe(0);
    expect(purge).not.toHaveBeenCalled();
    expect(prisma.userTool.deleteMany).not.toHaveBeenCalled();
  });

  it('never marks a tool done when it has no purger', async () => {
    const { prisma, service } = setup();
    prisma.userTool.findMany.mockResolvedValue([due('u1', 'tasks')]);
    expect(await service.purgeDue(now)).toBe(0);
    expect(prisma.userTool.deleteMany).not.toHaveBeenCalled();
  });

  it('keeps a failed deletion for tomorrow and carries on with the others', async () => {
    const { prisma, purge, service } = setup();
    prisma.userTool.findMany.mockResolvedValue([due('u1'), due('u2')]);
    purge
      .mockRejectedValueOnce(new Error('db down'))
      .mockResolvedValueOnce(undefined);
    expect(await service.purgeDue(now)).toBe(1);
    expect(prisma.userTool.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.userTool.deleteMany.mock.calls[0][0].where.userId).toBe('u2');
  });
});
