import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { MoneyDataPurger } from './money-data-purger';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';

@Module({
  imports: [UsersModule],
  controllers: [
    AccountsController,
    CategoriesController,
    TransactionsController,
  ],
  providers: [
    AccountsService,
    MoneyDataPurger,
    CategoriesService,
    TransactionsService,
  ],
})
export class MoneyModule {}
