import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ToolDataRegistry,
  type ToolDataPurger,
} from '../users/tools/tool-data';
import { AccountsService } from './accounts/accounts.service';
import { CategoriesService } from './categories/categories.service';
import { TransactionsService } from './transactions/transactions.service';

@Injectable()
export class MoneyDataPurger implements ToolDataPurger, OnModuleInit {
  readonly toolId = 'money' as const;

  constructor(
    private readonly registry: ToolDataRegistry,
    private readonly accounts: AccountsService,
    private readonly categories: CategoriesService,
    private readonly transactions: TransactionsService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  /** Erases everything the user stored in Money. New Money tables go here (children first). */
  async purge(userId: string) {
    // Children first: transactions reference both accounts and categories.
    await this.transactions.removeAllForUser(userId);
    await this.categories.removeAllForUser(userId);
    await this.accounts.removeAllForUser(userId);
  }
}
