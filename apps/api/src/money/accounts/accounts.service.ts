import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Account,
  CreateAccountInput,
  TransactionType,
  UpdateAccountInput,
} from '@lifeos/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { computeDeltas } from '../transactions/balance';
import { toAccountDto } from './accounts.mapper';

type OutgoingRow = {
  accountId: string;
  type: TransactionType;
  _sum: { amount: bigint | null };
};
type IncomingRow = {
  toAccountId: string | null;
  _sum: { amount: bigint | null };
};

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
    const used = await this.prisma.transaction.count({
      where: { userId, OR: [{ accountId: id }, { toAccountId: id }] },
    });
    if (used > 0) {
      throw new ConflictException(
        'This account has transactions. Archive it instead.',
      );
    }
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

  /** What each account's transactions add to its opening balance (see computeDeltas). */
  private async deltas(
    userId: string,
    accountIds: string[],
  ): Promise<Map<string, bigint>> {
    if (accountIds.length === 0) return new Map();
    const [outgoing, incoming] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['accountId', 'type'],
        where: { userId, accountId: { in: accountIds } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['toAccountId'],
        where: { userId, toAccountId: { in: accountIds } },
        _sum: { amount: true },
      }),
    ]);
    return computeDeltas(
      outgoing.map((r: OutgoingRow) => ({
        accountId: r.accountId,
        type: r.type,
        sum: r._sum.amount ?? 0n,
      })),
      incoming.flatMap((r: IncomingRow) =>
        r.toAccountId
          ? [{ accountId: r.toAccountId, sum: r._sum.amount ?? 0n }]
          : [],
      ),
    );
  }

  async removeAllForUser(userId: string): Promise<void> {
    await this.prisma.account.deleteMany({ where: { userId } });
  }
}
