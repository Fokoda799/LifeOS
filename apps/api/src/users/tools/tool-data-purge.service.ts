import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { ToolId } from '@lifeos/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { ToolDataRegistry } from './tool-data';

@Injectable()
export class ToolDataPurgeService {
  private readonly logger = new Logger(ToolDataPurgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ToolDataRegistry,
  ) {}

  // Every day at 03:00 UTC.
  @Cron('0 3 * * *', { name: 'tool-data-purge', timeZone: 'UTC' })
  async handleCron() {
    const purged = await this.purgeDue();
    if (purged > 0) this.logger.log(`Erased ${purged} tool data set(s)`);
  }

  /** Erases every tool data set whose grace period has ended. Returns how many. */
  async purgeDue(now = new Date()): Promise<number> {
    const due: { userId: string; toolId: ToolId }[] =
      await this.prisma.userTool.findMany({
        where: { deletionScheduledFor: { lte: now } },
      });

    let purged = 0;
    for (const { userId, toolId } of due) {
      const purger = this.registry.get(toolId);
      if (!purger) {
        // Never mark it done: the data would silently stay.
        this.logger.warn(`No data purger registered for "${toolId}", skipping`);
        continue;
      }
      const stillDue = { userId, toolId, deletionScheduledFor: { lte: now } };
      try {
        // Re-check: the user may have cancelled since the list was read.
        if ((await this.prisma.userTool.count({ where: stillDue })) === 0)
          continue;
        await purger.purge(userId);
        // Row gone = the tool starts fresh if it is added again.
        await this.prisma.userTool.deleteMany({ where: stillDue });
        purged++;
      } catch (error) {
        // The row stays due, so tomorrow's run retries it.
        this.logger.error(
          `Erasing "${toolId}" data failed for user ${userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
    return purged;
  }
}
