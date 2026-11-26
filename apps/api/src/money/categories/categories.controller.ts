import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
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
  categoriesResponseSchema,
  categoryIdSchema,
  categorySchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@lifeos/shared';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ApiErrors, ZodBody, ZodResponse } from '../../common/openapi';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { RequireTool } from '../../users/tools/tool-access';
import { CategoriesService } from './categories.service';

const idPipe = new ZodValidationPipe(categoryIdSchema);

@ApiTags('money')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@RequireTool('money')
@Controller('money/categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    enum: ['true', 'false'],
  })
  @ZodResponse(200, categoriesResponseSchema)
  @ApiErrors(400, 401, 403)
  async list(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(listCategoriesQuerySchema))
    query: { includeArchived: boolean },
  ) {
    return {
      categories: await this.categories.list(user.id, query.includeArchived),
    };
  }

  @Post()
  @ZodBody(createCategorySchema)
  @ZodResponse(201, categorySchema)
  @ApiErrors(400, 401, 403, 409)
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createCategorySchema))
    body: CreateCategoryInput,
  ) {
    return this.categories.create(user.id, body);
  }

  @Patch(':id')
  @ZodBody(updateCategorySchema)
  @ZodResponse(200, categorySchema)
  @ApiErrors(400, 401, 403, 404)
  update(
    @CurrentUser() user: { id: string },
    @Param('id', idPipe) id: string,
    @Body(new ZodValidationPipe(updateCategorySchema))
    body: UpdateCategoryInput,
  ) {
    return this.categories.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiErrors(400, 401, 403, 404, 409)
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', idPipe) id: string,
  ) {
    await this.categories.remove(user.id, id);
  }
}
