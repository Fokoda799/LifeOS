import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiError } from '@lifeos/shared';

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let error: string | undefined;
    let errors: ApiError['errors'];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const b = body as {
          message?: unknown;
          error?: unknown;
          errors?: ApiError['errors'];
        };
        if (typeof b.message === 'string') message = b.message;
        else if (Array.isArray(b.message)) message = b.message.join(', ');
        if (typeof b.error === 'string') error = b.error;
        if (Array.isArray(b.errors)) errors = b.errors;
      }
    } else {
      // Unknown error: log it, but never leak details to the client.
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const payload: ApiError = {
      statusCode,
      error: error ?? STATUS_TEXT[statusCode] ?? 'Error',
      message,
      ...(errors ? { errors } : {}),
      path: req.path,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(payload);
  }
}
