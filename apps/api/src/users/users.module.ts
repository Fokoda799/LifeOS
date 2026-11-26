import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserToolsService } from './tools/user-tools.service';
import { UserToolsController } from './tools/user-tools.controller';
import { ToolDataRegistry } from './tools/tool-data';
import { ToolDataPurgeService } from './tools/tool-data-purge.service';

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
