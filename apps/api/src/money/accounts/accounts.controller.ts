import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  accountIdSchema,
  accountSchema,
  accountsResponseSchema,
  createAccountSchema,
  listAccountsQuerySchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from '@lifeos/shared';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ApiErrors, ZodBody, ZodResponse } from '../../common/openapi';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { RequireTool } from '../../users/tools/tool-access';
import { AccountsService } from './accounts.service';

const idPipe = new ZodValidationPipe(accountIdSchema);

@ApiTags('money')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@RequireTool('money')
@Controller('money/accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    enum: ['true', 'false'],
  })
  @ZodResponse(200, accountsResponseSchema)
  @ApiErrors(400, 401, 403)
  async list(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(listAccountsQuerySchema))
    query: { includeArchived: boolean },
  ) {
    return {
      accounts: await this.accounts.list(user.id, query.includeArchived),
    };
  }

  @Post()
  @ZodBody(createAccountSchema)
  @ZodResponse(201, accountSchema)
  @ApiErrors(400, 401, 403)
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput,
  ) {
    return this.accounts.create(user.id, body);
  }

  @Get(':id')
  @ZodResponse(200, accountSchema)
  @ApiErrors(400, 401, 403, 404)
  get(@CurrentUser() user: { id: string }, @Param('id', idPipe) id: string) {
    return this.accounts.get(user.id, id);
  }

  @Patch(':id')
  @ZodBody(updateAccountSchema)
  @ZodResponse(200, accountSchema)
  @ApiErrors(400, 401, 403, 404)
  update(
    @CurrentUser() user: { id: string },
    @Param('id', idPipe) id: string,
    @Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput,
  ) {
    return this.accounts.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiErrors(400, 401, 403, 404)
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', idPipe) id: string,
  ) {
    await this.accounts.remove(user.id, id);
  }
}
