import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { MoneyDataPurger } from './money-data-purger';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';

@Module({
  imports: [UsersModule],
  controllers: [AccountsController, CategoriesController],
  providers: [AccountsService, MoneyDataPurger, CategoriesService],
})
export class MoneyModule {}
