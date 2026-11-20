import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { Env } from '../config/env';
import type { VerificationPurpose } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';
import { renderMail, type MailLocale } from '../mail/templates';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const CODE_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_SENDS_PER_HOUR = 5;
const TOKEN_TTL_SECONDS = 15 * 60;

type TokenPayload = { sub: string; purpose: VerificationPurpose; vid: string };

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private get secret() {
    return this.config.get('CODE_HMAC_SECRET', { infer: true });
  }

  private hash(email: string, purpose: VerificationPurpose, code: string) {
    return createHmac('sha256', this.secret)
      .update(`${email}:${purpose}:${code}`)
      .digest('hex');
  }

  private sameHash(a: string, b: string) {
    const x = Buffer.from(a, 'hex');
    const y = Buffer.from(b, 'hex');
    return x.length === y.length && timingSafeEqual(x, y);
  }

  /**
   * Always resolves quietly, whether or not the email has an account, was
   * rate-limited or was sent. The HTTP answer must not reveal any of that.
   */
  async start(purpose: VerificationPurpose, email: string, locale: MailLocale) {
    const webOrigin = this.config.get('WEB_ORIGIN', { infer: true });
    const user = await this.users.findByEmail(email);

    if (purpose === 'REGISTER' && user) {
      this.mail.send({
        to: email,
        ...renderMail({ kind: 'exists', locale, webOrigin, email }),
      });
      return;
    }
    if (purpose === 'PASSWORD_RESET' && !user) return;

    const now = Date.now();
    const recent = await this.prisma.verificationCode.findMany({
      where: { email, purpose, createdAt: { gt: new Date(now - 3_600_000) } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (recent.length >= MAX_SENDS_PER_HOUR) return;
    if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS)
      return;

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.prisma.$transaction([
      // A new code cancels any earlier unused one.
      this.prisma.verificationCode.updateMany({
        where: { email, purpose, usedAt: null, expiresAt: { gt: new Date() } },
        data: { expiresAt: new Date() },
      }),
      this.prisma.verificationCode.create({
        data: {
          email,
          purpose,
          codeHash: this.hash(email, purpose, code),
          expiresAt: new Date(now + CODE_TTL_MS),
        },
      }),
    ]);

    this.mail.send({
      to: email,
      ...renderMail({
        kind: purpose === 'REGISTER' ? 'register' : 'reset',
        locale,
        webOrigin,
        email,
        code,
      }),
    });
  }

  /** Checks the code and returns a short-lived token proving the email. */
  async verify(purpose: VerificationPurpose, email: string, code: string) {
    const invalid = () => new BadRequestException('Invalid or expired code');

    const record = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        purpose,
        usedAt: null,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.attempts >= MAX_ATTEMPTS) throw invalid();

    // Count the attempt first, with a compare-and-set, so parallel guesses can't dodge the limit.
    const counted = await this.prisma.verificationCode.updateMany({
      where: { id: record.id, attempts: record.attempts },
      data: { attempts: { increment: 1 } },
    });
    if (counted.count === 0) throw invalid();

    if (!this.sameHash(record.codeHash, this.hash(email, purpose, code)))
      throw invalid();

    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });
    const payload: TokenPayload = { sub: email, purpose, vid: record.id };
    return this.jwt.signAsync(payload, {
      secret: this.secret,
      expiresIn: TOKEN_TTL_SECONDS,
    });
  }

  /** Validates the token and burns it (single use). Returns the verified email. */
  async consume(token: string, purpose: VerificationPurpose) {
    const invalid = () => new BadRequestException('Invalid or expired token');

    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token, {
        secret: this.secret,
      });
    } catch {
      throw invalid();
    }
    if (payload.purpose !== purpose) throw invalid();

    const claimed = await this.prisma.verificationCode.updateMany({
      where: {
        id: payload.vid,
        email: payload.sub,
        purpose,
        verifiedAt: { not: null },
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) throw invalid();
    return payload.sub;
  }
}
