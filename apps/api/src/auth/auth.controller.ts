import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  authResultSchema,
  loginSchema,
  okSchema,
  refreshBodySchema,
  registerSchema,
  type StartVerificationData,
  startVerificationSchema,
  userSchema,
  type LoginInput,
  type RegisterInput,
  verifyCodeSchema,
  verifiedTokenSchema,
  type VerifyCodeInput,
  registerCompleteSchema,
  type RegisterCompleteData,
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@lifeos/shared';
import type { Request, Response } from 'express';
import type { Env } from '../config/env';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApiErrors, ZodBody, ZodResponse } from '../common/openapi';
import { AuthService } from './auth.service';
import type { ClientMeta, Tokens } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';
import { VerificationService } from './verification.service';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const REFRESH_PATH = '/api/v1/auth';

const metaOf = (req: Request): ClientMeta => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

const ClientHeader = () =>
  ApiHeader({
    name: 'x-client',
    required: false,
    enum: ['mobile'],
    description:
      "Send 'mobile' to receive tokens in the response body instead of cookies",
  });

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
    private readonly verification: VerificationService,
  ) {}

  private respond(
    req: Request,
    res: Response,
    result: { user: unknown; tokens: Tokens },
  ) {
    const secure =
      this.config.get('NODE_ENV', { infer: true }) === 'production';
    const base = { httpOnly: true, sameSite: 'lax' as const, secure };
    res.cookie(ACCESS_COOKIE, result.tokens.accessToken, {
      ...base,
      path: '/',
      maxAge: result.tokens.accessExpiresIn * 1000,
    });
    res.cookie(REFRESH_COOKIE, result.tokens.refreshToken, {
      ...base,
      path: REFRESH_PATH,
      maxAge: result.tokens.refreshExpiresAt.getTime() - Date.now(),
    });

    // Mobile apps ask for the tokens in the body instead of cookies.
    if (req.header('x-client') === 'mobile') {
      return {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      };
    }
    return { user: result.user };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create an account and sign in' })
  @ClientHeader()
  @ZodBody(registerSchema)
  @ZodResponse(201, authResultSchema, 'Account created')
  @ApiErrors(400, 409)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(req, res, await this.auth.register(body, metaOf(req)));
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ClientHeader()
  @ZodBody(loginSchema)
  @ZodResponse(200, authResultSchema, 'Signed in')
  @ApiErrors(400, 401)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(req, res, await this.auth.login(body, metaOf(req)));
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Rotate the refresh token and get a new access token',
  })
  @ClientHeader()
  @ZodBody(refreshBodySchema)
  @ZodResponse(200, authResultSchema, 'New tokens issued')
  @ApiErrors(401)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fromBody = (req.body as { refreshToken?: unknown } | undefined)
      ?.refreshToken;
    const token = req.cookies?.[REFRESH_COOKIE] ?? fromBody;
    if (typeof token !== 'string') {
      return this.auth.refresh('', metaOf(req)); // throws 401
    }
    return this.respond(req, res, await this.auth.refresh(token, metaOf(req)));
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke the refresh token and clear cookies' })
  @ZodBody(refreshBodySchema)
  @ApiResponse({ status: 204, description: 'Signed out' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const fromBody = (req.body as { refreshToken?: unknown } | undefined)
      ?.refreshToken;
    const token = req.cookies?.[REFRESH_COOKIE] ?? fromBody;
    await this.auth.logout(typeof token === 'string' ? token : undefined);
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_PATH });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the signed-in user' })
  @ApiBearerAuth()
  @ApiCookieAuth(ACCESS_COOKIE)
  @ZodResponse(200, userSchema)
  @ApiErrors(401)
  me(@CurrentUser() user: { id: string }) {
    return this.auth.me(user.id);
  }

  @Public()
  @Post('register/start')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Step 1: email a verification code (always answers 202)',
  })
  @ZodBody(startVerificationSchema)
  @ZodResponse(202, okSchema)
  @ApiErrors(400)
  async registerStart(
    @Body(new ZodValidationPipe(startVerificationSchema))
    body: StartVerificationData,
  ) {
    await this.verification.start('REGISTER', body.email, body.locale);
    return { ok: true as const };
  }

  @Public()
  @Post('register/verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Step 2: check the code, get a 15-minute registration token',
  })
  @ZodBody(verifyCodeSchema)
  @ZodResponse(200, verifiedTokenSchema)
  @ApiErrors(400)
  async registerVerify(
    @Body(new ZodValidationPipe(verifyCodeSchema)) body: VerifyCodeInput,
  ) {
    return {
      token: await this.verification.verify('REGISTER', body.email, body.code),
    };
  }

  @Public()
  @Post('register/complete')
  @ClientHeader()
  @ZodBody(registerCompleteSchema)
  @ZodResponse(201, authResultSchema, 'Account created')
  @ApiErrors(400, 409)
  async registerComplete(
    @Body(new ZodValidationPipe(registerCompleteSchema))
    body: RegisterCompleteData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(
      req,
      res,
      await this.auth.registerComplete(body, metaOf(req)),
    );
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(202)
  @ApiOperation({ summary: 'Email a password reset code (always answers 202)' })
  @ZodBody(startVerificationSchema)
  @ZodResponse(202, okSchema)
  @ApiErrors(400)
  async passwordForgot(
    @Body(new ZodValidationPipe(startVerificationSchema))
    body: StartVerificationData,
  ) {
    await this.verification.start('PASSWORD_RESET', body.email, body.locale);
    return { ok: true as const };
  }

  @Public()
  @Post('password/verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Check the reset code, get a 15-minute reset token',
  })
  @ZodBody(verifyCodeSchema)
  @ZodResponse(200, verifiedTokenSchema)
  @ApiErrors(400)
  async passwordVerify(
    @Body(new ZodValidationPipe(verifyCodeSchema)) body: VerifyCodeInput,
  ) {
    return {
      token: await this.verification.verify(
        'PASSWORD_RESET',
        body.email,
        body.code,
      ),
    };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(204)
  @ApiOperation({ summary: 'Set a new password and sign out every session' })
  @ZodBody(resetPasswordSchema)
  @ApiResponse({ status: 204, description: 'Password changed' })
  @ApiErrors(400)
  async passwordReset(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
  ) {
    await this.auth.resetPassword(body);
  }
}
