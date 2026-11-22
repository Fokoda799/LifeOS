import { BadRequestException, Injectable } from '@nestjs/common';
import { availableToolIds, type ToolId, type UserTool } from '@lifeos/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<UserTool[]> {
    const rows = await this.prisma.userTool.findMany({
      where: { userId, removedAt: null },
      orderBy: { addedAt: 'asc' },
    });
    return rows.map((r) => ({
      toolId: r.toolId,
      addedAt: r.addedAt.toISOString(),
    }));
  }

  async has(userId: string, toolId: ToolId): Promise<boolean> {
    const count = await this.prisma.userTool.count({
      where: { userId, toolId, removedAt: null },
    });
    return count > 0;
  }

  /** Idempotent. Re-adding a removed tool clears removedAt, so its data comes back. */
  async add(userId: string, toolId: ToolId): Promise<UserTool> {
    if (!availableToolIds.includes(toolId)) {
      throw new BadRequestException('This tool is not available yet');
    }
    const row = await this.prisma.userTool.upsert({
      where: { userId_toolId: { userId, toolId } },
      create: { userId, toolId },
      update: { removedAt: null },
    });
    return { toolId: row.toolId, addedAt: row.addedAt.toISOString() };
  }

  /** Hides the tool. Its data is kept (deleting data is a separate flow, P1-14). */
  async remove(userId: string, toolId: ToolId): Promise<void> {
    await this.prisma.userTool.updateMany({
      where: { userId, toolId, removedAt: null },
      data: { removedAt: new Date() },
    });
  }
}
