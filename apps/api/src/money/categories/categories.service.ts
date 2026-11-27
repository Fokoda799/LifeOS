import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DEFAULT_CATEGORIES,
  MAX_CATEGORIES_PER_USER,
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@lifeos/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { sortCategories, toCategoryDto } from './categories.mapper';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, includeArchived: boolean): Promise<Category[]> {
    await this.ensureDefaults(userId);
    const rows = await this.prisma.category.findMany({
      where: { userId, ...(includeArchived ? {} : { archivedAt: null }) },
    });
    return sortCategories(rows).map(toCategoryDto);
  }

  async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    const count = await this.prisma.category.count({ where: { userId } });
    if (count >= MAX_CATEGORIES_PER_USER) {
      throw new ConflictException('You have reached the category limit');
    }
    const row = await this.prisma.category.create({
      data: {
        userId,
        kind: input.kind,
        name: input.name,
        icon: input.icon,
        color: input.color,
      },
    });
    return toCategoryDto(row);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    const existing = await this.getOwned(userId, id);
    if (input.name === null && !existing.systemKey) {
      throw new BadRequestException('A custom category needs a name');
    }
    const { archived, ...rest } = input;
    await this.prisma.category.updateMany({
      where: { id, userId },
      data: {
        ...rest,
        // Archiving twice keeps the first date.
        ...(archived !== undefined && {
          archivedAt: archived ? (existing.archivedAt ?? new Date()) : null,
        }),
      },
    });
    return toCategoryDto(await this.getOwned(userId, id));
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.getOwned(userId, id);
    if (existing.systemKey) {
      // Defaults come back on the next list, so they can only be archived.
      throw new ConflictException(
        "Default categories can't be deleted. Archive it instead.",
      );
    }
    const used = await this.prisma.transaction.count({
      where: { userId, categoryId: id },
    });
    if (used > 0) {
      throw new ConflictException(
        'This category has transactions. Archive it instead.',
      );
    }
    await this.prisma.category.deleteMany({ where: { id, userId } });
  }

  /** Used by the data-deletion job, after the user's transactions are erased. */
  async removeAllForUser(userId: string): Promise<void> {
    await this.prisma.category.deleteMany({ where: { userId } });
  }

  /** Gives the user their own copy of any default category they don't have yet. */
  private async ensureDefaults(userId: string): Promise<void> {
    const have = await this.prisma.category.count({
      where: { userId, systemKey: { not: null } },
    });
    if (have >= DEFAULT_CATEGORIES.length) return;
    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({
        userId,
        kind: c.kind,
        systemKey: c.key,
        icon: c.icon,
        color: c.color,
      })),
      // (userId, systemKey) is unique, so concurrent first loads can't duplicate.
      skipDuplicates: true,
    });
  }

  private async getOwned(userId: string, id: string) {
    const row = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }
}
