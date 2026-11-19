import { Body, Controller, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  updateProfileSchema,
  userSchema,
  type UpdateProfileInput,
} from '@lifeos/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiErrors, ZodBody, ZodResponse } from '../common/openapi';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('me')
  @ApiOperation({
    summary: "Update the signed-in user's profile and preferences",
  })
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ZodBody(updateProfileSchema)
  @ZodResponse(200, userSchema)
  @ApiErrors(400, 401)
  async updateMe(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput,
  ) {
    return this.users.toPublic(await this.users.update(user.id, body));
  }
}
