import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from '@lifeos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { toAccountDto } from './accounts.mapper';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async list(userId: string, includeArchived: boolean): Promise<Account[]> {
    const rows = await this.prisma.account.findMany({
      where: { userId, ...(includeArchived ? {} : { archivedAt: null }) },
      orderBy: { createdAt: 'asc' },
    });
    const deltas = await this.deltas(
      userId,
      rows.map((r: { id: string }) => r.id),
    );
    return rows.map((r: Parameters<typeof toAccountDto>[0]) =>
      toAccountDto(r, deltas.get(r.id)),
    );
  }

  async get(userId: string, id: string): Promise<Account> {
    const row = await this.getOwned(userId, id);
    const deltas = await this.deltas(userId, [id]);
    return toAccountDto(row, deltas.get(id));
  }

  async create(userId: string, input: CreateAccountInput): Promise<Account> {
    const currency =
      input.currency ?? (await this.users.findById(userId))?.currency ?? 'MAD';
    const row = await this.prisma.account.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        currency,
        openingBalance: BigInt(input.openingBalance ?? '0'),
      },
    });
    return toAccountDto(row);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateAccountInput,
  ): Promise<Account> {
    const existing = await this.getOwned(userId, id);
    const { archived, openingBalance, ...rest } = input;
    await this.prisma.account.updateMany({
      where: { id, userId },
      data: {
        ...rest,
        ...(openingBalance !== undefined && {
          openingBalance: BigInt(openingBalance),
        }),
        // Archiving twice keeps the first date.
        ...(archived !== undefined && {
          archivedAt: archived ? (existing.archivedAt ?? new Date()) : null,
        }),
      },
    });
    return this.get(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    // P2-03: refuse with 409 when the account has transactions (archive instead).
    const { count } = await this.prisma.account.deleteMany({
      where: { id, userId },
    });
    if (count === 0) throw new NotFoundException('Account not found');
  }

  private async getOwned(userId: string, id: string) {
    const row = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException('Account not found');
    return row;
  }

  /** Sum of each account's transactions. Empty until P2-07 adds the real query. */
  private deltas(
    _userId: string,
    _accountIds: string[],
  ): Promise<Map<string, bigint>> {
    return Promise.resolve(new Map());
  }

  async removeAllForUser(userId: string): Promise<void> {
    await this.prisma.account.deleteMany({ where: { userId } });
  }
}
