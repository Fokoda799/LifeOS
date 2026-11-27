import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ToolId } from '@lifeos/shared';
import { UserToolsService } from './user-tools.service';

const REQUIRED_TOOL = 'requiredTool';

@Injectable()
export class ToolAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userTools: UserToolsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const toolId = this.reflector.getAllAndOverride<ToolId | undefined>(
      REQUIRED_TOOL,
      [context.getHandler(), context.getClass()],
    );
    if (!toolId) return true;

    // The global JwtAuthGuard has already run, so the user is on the request.
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id: string } }>();
    const userId = request.user?.id;
    if (!userId) throw new UnauthorizedException();

    if (!(await this.userTools.has(userId, toolId))) {
      throw new ForbiddenException('This tool is not enabled for your account');
    }
    return true;
  }
}

/** Put on a tool's controller (or a route). Users who haven't added the tool get 403. */
export const RequireTool = (toolId: ToolId) =>
  applyDecorators(
    SetMetadata(REQUIRED_TOOL, toolId),
    UseGuards(ToolAccessGuard),
  );
