import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { LoginInput, RegisterInput } from '@lifeos/shared';
import { UsersService } from '../users/users.service';
import type { ClientMeta } from './auth.types';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  // Used so a login for an unknown email takes about as long as a real one.
  private readonly dummyHash: Promise<string> = argon2.hash(
    'not-a-real-password',
  );

  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async register(input: RegisterInput, meta: ClientMeta) {
    if (await this.users.findByEmail(input.email)) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await argon2.hash(input.password);
    try {
      const user = await this.users.create({
        email: input.email,
        passwordHash,
        name: input.name,
        locale: input.locale,
        currency: input.currency,
      });
      return {
        user: this.users.toPublic(user),
        tokens: await this.tokens.issue(user.id, meta),
      };
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  async login(input: LoginInput, meta: ClientMeta) {
    const user = await this.users.findByEmail(input.email);
    const hash = user?.passwordHash ?? (await this.dummyHash);
    const valid = await argon2.verify(hash, input.password);
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      user: this.users.toPublic(user),
      tokens: await this.tokens.issue(user.id, meta),
    };
  }

  async refresh(refreshToken: string, meta: ClientMeta) {
    const { userId, tokens } = await this.tokens.rotate(refreshToken, meta);
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    return { user: this.users.toPublic(user), tokens };
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) await this.tokens.revoke(refreshToken);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.users.toPublic(user);
  }
}
