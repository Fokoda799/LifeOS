import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolDataRegistry, type ToolDataPurger } from '../users/tool-data';
import { AccountsService } from './accounts.service';

@Injectable()
export class MoneyDataPurger implements ToolDataPurger, OnModuleInit {
  readonly toolId = 'money' as const;

  constructor(
    private readonly registry: ToolDataRegistry,
    private readonly accounts: AccountsService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  /** Erases everything the user stored in Money. New Money tables go here (children first). */
  async purge(userId: string) {
    await this.accounts.removeAllForUser(userId);
  }
}
