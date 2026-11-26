import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  listUserToolsQuerySchema,
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
  @ApiQuery({
    name: 'includeRemoved',
    required: false,
    enum: ['true', 'false'],
  })
  @ZodResponse(200, userToolsResponseSchema, 'Tools the user has added')
  @ApiErrors(400, 401)
  async list(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(listUserToolsQuerySchema))
    query: { includeRemoved: boolean },
  ) {
    return { tools: await this.userTools.list(user.id, query.includeRemoved) };
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

  @Post(':toolId/data-deletion')
  @HttpCode(200)
  @ZodResponse(200, userToolSchema, 'Deletion scheduled (idempotent)')
  @ApiErrors(400, 401, 404)
  requestDataDeletion(
    @CurrentUser() user: { id: string },
    @Param('toolId', new ZodValidationPipe(toolIdSchema)) toolId: ToolId,
  ) {
    return this.userTools.requestDataDeletion(user.id, toolId);
  }

  @Delete(':toolId/data-deletion')
  @HttpCode(204)
  @ApiErrors(400, 401)
  async cancelDataDeletion(
    @CurrentUser() user: { id: string },
    @Param('toolId', new ZodValidationPipe(toolIdSchema)) toolId: ToolId,
  ) {
    await this.userTools.cancelDataDeletion(user.id, toolId);
  }
}
