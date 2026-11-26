import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolDataRegistry, type ToolDataPurger } from '../users/tool-data';
import { AccountsService } from './accounts.service';
import { CategoriesService } from './categories.service';

@Injectable()
export class MoneyDataPurger implements ToolDataPurger, OnModuleInit {
  readonly toolId = 'money' as const;

  constructor(
    private readonly registry: ToolDataRegistry,
    private readonly accounts: AccountsService,
    private readonly categories: CategoriesService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  /** Erases everything the user stored in Money. New Money tables go here (children first). */
  async purge(userId: string) {
    // Children first. P2-03 adds transactions before these two.
    await this.categories.removeAllForUser(userId);
    await this.accounts.removeAllForUser(userId);
  }
}
