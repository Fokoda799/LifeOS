import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  Transaction,
  TransactionsResponse,
  TransactionType,
  UpdateTransactionInput,
} from '@lifeos/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { toDbDate, toTransactionDto } from './transactions.mapper';

type Refs = {
  type: TransactionType;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    q: ListTransactionsQuery,
  ): Promise<TransactionsResponse> {
    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...(q.type && { type: q.type }),
        ...(q.categoryId && { categoryId: q.categoryId }),
        ...(q.accountId && {
          OR: [{ accountId: q.accountId }, { toAccountId: q.accountId }],
        }),
        ...((q.from || q.to) && {
          date: {
            ...(q.from && { gte: toDbDate(q.from) }),
            ...(q.to && { lte: toDbDate(q.to) }),
          },
        }),
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take: q.limit + 1,
      ...(q.cursor && { cursor: { id: q.cursor }, skip: 1 }),
    });
    const page = rows.slice(0, q.limit);
    return {
      transactions: page.map(toTransactionDto),
      nextCursor: rows.length > q.limit ? page[page.length - 1].id : null,
    };
  }

  async get(userId: string, id: string): Promise<Transaction> {
    return toTransactionDto(await this.getOwned(userId, id));
  }

  async create(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    const refs: Refs = {
      type: input.type,
      accountId: input.accountId,
      toAccountId: input.type === 'transfer' ? input.toAccountId : null,
      categoryId: input.type === 'transfer' ? null : input.categoryId,
    };
    const currency = await this.checkRefs(userId, refs);
    const row = await this.prisma.transaction.create({
      data: {
        userId,
        ...refs,
        currency,
        amount: BigInt(input.amount),
        date: toDbDate(input.date),
        note: input.note?.trim() || null,
      },
    });
    return toTransactionDto(row);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    const existing = await this.getOwned(userId, id);
    const refs: Refs = {
      type: existing.type,
      accountId: input.accountId ?? existing.accountId,
      toAccountId: input.toAccountId ?? existing.toAccountId,
      categoryId: input.categoryId ?? existing.categoryId,
    };
    const currency = await this.checkRefs(userId, refs, existing);
    await this.prisma.transaction.updateMany({
      where: { id, userId },
      data: {
        accountId: refs.accountId,
        toAccountId: refs.toAccountId,
        categoryId: refs.categoryId,
        currency,
        ...(input.amount !== undefined && { amount: BigInt(input.amount) }),
        ...(input.date !== undefined && { date: toDbDate(input.date) }),
        ...(input.note !== undefined && { note: input.note?.trim() || null }),
      },
    });
    return this.get(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.transaction.deleteMany({
      where: { id, userId },
    });
    if (count === 0) throw new NotFoundException('Transaction not found');
  }

  /** Used by the data-deletion job. Runs before accounts and categories are erased. */
  async removeAllForUser(userId: string): Promise<void> {
    await this.prisma.transaction.deleteMany({ where: { userId } });
  }

  /**
   * Every rule that ties a transaction to its accounts and category, for create and update.
   * Returns the currency to store. `previous` lets an existing transaction keep an account
   * or category that was archived since, but a newly chosen one can't be archived.
   */
  private async checkRefs(
    userId: string,
    refs: Refs,
    previous?: Omit<Refs, 'type'>,
  ): Promise<string> {
    const account = await this.ownedAccount(
      userId,
      refs.accountId,
      previous?.accountId,
    );

    if (refs.type === 'transfer') {
      if (refs.categoryId) {
        throw new BadRequestException('A transfer has no category');
      }
      if (!refs.toAccountId || refs.toAccountId === refs.accountId) {
        throw new BadRequestException('Choose two different accounts');
      }
      const to = await this.ownedAccount(
        userId,
        refs.toAccountId,
        previous?.toAccountId,
      );
      if (to.currency !== account.currency) {
        throw new BadRequestException(
          'A transfer needs two accounts in the same currency',
        );
      }
      return account.currency;
    }

    if (refs.toAccountId) {
      throw new BadRequestException(
        'Only a transfer has a destination account',
      );
    }
    const category = refs.categoryId
      ? await this.prisma.category.findFirst({
          where: { id: refs.categoryId, userId },
        })
      : null;
    if (!category) throw new NotFoundException('Category not found');
    if (category.kind !== refs.type) {
      throw new BadRequestException(
        `An ${refs.type} transaction needs an ${refs.type} category`,
      );
    }
    if (category.archivedAt && category.id !== previous?.categoryId) {
      throw new ConflictException('This category is archived');
    }
    return account.currency;
  }

  private async ownedAccount(
    userId: string,
    id: string,
    previousId?: string | null,
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    if (account.archivedAt && id !== previousId) {
      throw new ConflictException('This account is archived');
    }
    return account;
  }

  private async getOwned(userId: string, id: string) {
    const row = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Transaction not found');
    return row;
  }
}
