import { Controller, Delete, Get, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  toolIdSchema,
  userToolSchema,
  userToolsResponseSchema,
  type ToolId,
} from '@lifeos/shared';
import { ApiErrors, ZodResponse } from '../common/openapi';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserToolsService } from './user-tools.service';

@ApiTags('users')
@Controller('users/me/tools')
export class UserToolsController {
  constructor(private readonly userTools: UserToolsService) {}

  @Get()
  @ZodResponse(200, userToolsResponseSchema, 'Tools the user has added')
  @ApiErrors(401)
  async list(@CurrentUser() user: { id: string }) {
    return { tools: await this.userTools.list(user.id) };
  }

  @Put(':toolId')
  @ZodResponse(200, userToolSchema, 'The tool is added (idempotent)')
  @ApiErrors(400, 401)
  add(
    @CurrentUser() user: { id: string },
    @Param('toolId', new ZodValidationPipe(toolIdSchema)) toolId: ToolId,
  ) {
    return this.userTools.add(user.id, toolId);
  }

  @Delete(':toolId')
  @HttpCode(204)
  @ApiErrors(400, 401)
  async remove(
    @CurrentUser() user: { id: string },
    @Param('toolId', new ZodValidationPipe(toolIdSchema)) toolId: ToolId,
  ) {
    await this.userTools.remove(user.id, toolId);
  }
}
