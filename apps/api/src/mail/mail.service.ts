import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { Env } from '../config/env';

export type Mail = { to: string; subject: string; text: string; html: string };

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    const user = config.get('MAIL_USER', { infer: true });
    const pass = config.get('MAIL_PASS', { infer: true });
    const port = config.get('MAIL_PORT', { infer: true });
    this.from = config.get('MAIL_FROM', { infer: true });
    this.transporter = createTransport({
      host: config.get('MAIL_HOST', { infer: true }),
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  /** Fire-and-forget, so response times don't reveal whether an email was sent. */
  send(mail: Mail): void {
    void this.transporter
      .sendMail({ from: this.from, ...mail })
      .catch((err: unknown) =>
        this.logger.error(`Sending mail failed: ${String(err)}`),
      );
  }
}
