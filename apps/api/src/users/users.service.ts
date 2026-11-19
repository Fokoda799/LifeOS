import { Injectable } from '@nestjs/common';
import { userSchema, type User as PublicUser } from '@lifeos/shared';
import { PrismaService } from '../prisma/prisma.service';

type NewUser = {
  email: string;
  passwordHash: string;
  name?: string;
  locale: string;
  currency: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: NewUser) {
    return this.prisma.user.create({ data });
  }

  update(
    id: string,
    data: {
      name?: string | null;
      locale?: string;
      currency?: string;
      them?: string;
    },
  ) {
    // Always scoped to the authenticated user's own id.
    return this.prisma.user.update({ where: { id }, data });
  }

  /** Strips the password hash and validates the shape sent to clients. */
  toPublic(user: {
    id: string;
    email: string;
    name: string | null;
    locale: string;
    currency: string;
  }): PublicUser {
    return userSchema.parse({
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale,
      currency: user.currency,
    });
  }
}
