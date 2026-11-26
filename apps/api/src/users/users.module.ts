import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserToolsService } from './user-tools.service';
import { UserToolsController } from './user-tools.controller';
import { ToolDataRegistry } from './tool-data';
import { ToolDataPurgeService } from './tool-data-purge.service';

@Module({
  controllers: [UsersController, UserToolsController],
  providers: [
    UsersService,
    UserToolsService,
    ToolDataRegistry,
    ToolDataPurgeService,
  ],
  exports: [UsersService, UserToolsService, ToolDataRegistry],
})
export class UsersModule {}
