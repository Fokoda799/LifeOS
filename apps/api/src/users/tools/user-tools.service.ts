import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  availableToolIds,
  TOOL_DATA_GRACE_DAYS,
  type ToolId,
  type UserTool,
} from '@lifeos/shared';
import { PrismaService } from '../../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;

type UserToolRow = {
  toolId: ToolId;
  addedAt: Date;
  removedAt: Date | null;
  deletionScheduledFor: Date | null;
};

export function toUserToolDto(row: UserToolRow): UserTool {
  return {
    toolId: row.toolId,
    addedAt: row.addedAt.toISOString(),
    removedAt: row.removedAt?.toISOString() ?? null,
    deletionScheduledFor: row.deletionScheduledFor?.toISOString() ?? null,
  };
}

@Injectable()
export class UserToolsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Active tools by default. `includeRemoved` also returns hidden ones (for Settings). */
  async list(userId: string, includeRemoved = false): Promise<UserTool[]> {
    const rows = await this.prisma.userTool.findMany({
      where: { userId, ...(includeRemoved ? {} : { removedAt: null }) },
      orderBy: { addedAt: 'asc' },
    });
    return rows.map(toUserToolDto);
  }

  async has(userId: string, toolId: ToolId): Promise<boolean> {
    const count = await this.prisma.userTool.count({
      where: { userId, toolId, removedAt: null },
    });
    return count > 0;
  }

  /**
   * Idempotent. Re-adding a removed tool brings its data back, and also cancels
   * a pending data deletion: the user clearly wants the tool again.
   */
  async add(userId: string, toolId: ToolId): Promise<UserTool> {
    if (!availableToolIds.includes(toolId)) {
      throw new BadRequestException('This tool is not available yet');
    }
    const row = await this.prisma.userTool.upsert({
      where: { userId_toolId: { userId, toolId } },
      create: { userId, toolId },
      update: { removedAt: null, deletionScheduledFor: null },
    });
    return toUserToolDto(row);
  }

  /** Hides the tool. Its data is kept (erasing it is requestDataDeletion). */
  async remove(userId: string, toolId: ToolId): Promise<void> {
    await this.prisma.userTool.updateMany({
      where: { userId, toolId, removedAt: null },
      data: { removedAt: new Date() },
    });
  }

  /** Hides the tool and schedules its data for erasure. Idempotent: keeps the first date. */
  async requestDataDeletion(userId: string, toolId: ToolId): Promise<UserTool> {
    const key = { userId_toolId: { userId, toolId } };
    const row = await this.prisma.userTool.findUnique({ where: key });
    if (!row) throw new NotFoundException('You have no data for this tool');
    if (row.deletionScheduledFor) return toUserToolDto(row);

    const now = new Date();
    const updated = await this.prisma.userTool.update({
      where: key,
      data: {
        removedAt: row.removedAt ?? now,
        deletionScheduledFor: new Date(
          now.getTime() + TOOL_DATA_GRACE_DAYS * DAY_MS,
        ),
      },
    });
    return toUserToolDto(updated);
  }

  /** Keeps the data. The tool stays hidden until the user adds it again. */
  async cancelDataDeletion(userId: string, toolId: ToolId): Promise<void> {
    await this.prisma.userTool.updateMany({
      where: { userId, toolId, deletionScheduledFor: { not: null } },
      data: { deletionScheduledFor: null },
    });
  }
}
