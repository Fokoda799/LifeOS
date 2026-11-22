import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserToolsService } from './user-tools.service';
import { UserToolsController } from './user-tools.controller';

@Module({
  controllers: [UsersController, UserToolsController],
  providers: [UsersService, UserToolsService],
  exports: [UsersService, UserToolsService],
})
export class UsersModule {}
