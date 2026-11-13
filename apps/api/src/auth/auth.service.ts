import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { LoginInput, RegisterInput } from '@lifeos/shared';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  // Used so a login for an unknown email takes about as long as a real one.
  private readonly dummyHash: Promise<string> = argon2.hash(
    'not-a-real-password',
  );

  constructor(private readonly users: UsersService) {}

  async register(input: RegisterInput) {
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
      return this.users.toPublic(user);
    } catch (e) {
      // Two simultaneous sign-ups with the same email: Prisma unique violation.
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  async login(input: LoginInput) {
    const user = await this.users.findByEmail(input.email);
    const hash = user?.passwordHash ?? (await this.dummyHash);
    const valid = await argon2.verify(hash, input.password);
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.users.toPublic(user);
  }
}
