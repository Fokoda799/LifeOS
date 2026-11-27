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
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionFiltersSchema,
  transactionsSummarySchema,
  type TransactionFilters,
  transactionIdSchema,
  transactionSchema,
  transactionsResponseSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type ListTransactionsQuery,
  type UpdateTransactionInput,
} from '@lifeos/shared';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ApiErrors, ZodBody, ZodResponse } from '../../common/openapi';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { RequireTool } from '../../users/tools/tool-access';
import { TransactionsService } from './transactions.service';

const idPipe = new ZodValidationPipe(transactionIdSchema);

@ApiTags('money')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@RequireTool('money')
@Controller('money/transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  @ApiQuery({ name: 'accountId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['income', 'expense', 'transfer'],
  })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '1 to 100, default 50',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'nextCursor of the previous page',
  })
  @ZodResponse(200, transactionsResponseSchema)
  @ApiErrors(400, 401, 403)
  list(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(listTransactionsQuerySchema))
    query: ListTransactionsQuery,
  ) {
    return this.transactions.list(user.id, query);
  }

  @Get('summary')
  @ApiQuery({ name: 'accountId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['income', 'expense', 'transfer'],
  })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'q', required: false, description: 'Search the note' })
  @ZodResponse(200, transactionsSummarySchema)
  @ApiErrors(400, 401, 403)
  summary(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(transactionFiltersSchema))
    query: TransactionFilters,
  ) {
    return this.transactions.summary(user.id, query);
  }

  @Post()
  @ZodBody(createTransactionSchema)
  @ZodResponse(201, transactionSchema)
  @ApiErrors(400, 401, 403, 404, 409)
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createTransactionSchema))
    body: CreateTransactionInput,
  ) {
    return this.transactions.create(user.id, body);
  }

  @Get(':id')
  @ZodResponse(200, transactionSchema)
  @ApiErrors(400, 401, 403, 404)
  get(@CurrentUser() user: { id: string }, @Param('id', idPipe) id: string) {
    return this.transactions.get(user.id, id);
  }

  @Patch(':id')
  @ZodBody(updateTransactionSchema)
  @ZodResponse(200, transactionSchema)
  @ApiErrors(400, 401, 403, 404, 409)
  update(
    @CurrentUser() user: { id: string },
    @Param('id', idPipe) id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    body: UpdateTransactionInput,
  ) {
    return this.transactions.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiErrors(400, 401, 403, 404)
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', idPipe) id: string,
  ) {
    await this.transactions.remove(user.id, id);
  }
}
