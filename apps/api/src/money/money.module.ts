import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { MoneyDataPurger } from './money-data-purger';

@Module({
  imports: [UsersModule],
  controllers: [AccountsController],
  providers: [AccountsService, MoneyDataPurger],
})
export class MoneyModule {}
