import type { Request } from 'express';

export type AuthedRequest = Request & { user?: { id: string } };
export type ClientMeta = { userAgent?: string; ip?: string };
export type Tokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number; // seconds
  refreshExpiresAt: Date;
};
