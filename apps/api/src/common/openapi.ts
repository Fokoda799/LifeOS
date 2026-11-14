import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { apiErrorSchema } from '@lifeos/shared';
import { z, type ZodType } from 'zod';

// Zod emits plain OpenAPI 3.0 JSON Schema. Swagger's own SchemaObject type is
// stricter than needed, so the cast is intentional.
const toSchema = (schema: ZodType, io: 'input' | 'output') =>
  z.toJSONSchema(schema, { target: 'openapi-3.0', io }) as never;

export const ZodBody = (schema: ZodType) =>
  ApiBody({ schema: toSchema(schema, 'input') });

export const ZodResponse = (
  status: number,
  schema: ZodType,
  description?: string,
) => ApiResponse({ status, description, schema: toSchema(schema, 'output') });

const ERROR_TEXT: Record<number, string> = {
  400: 'Validation failed',
  401: 'Not authenticated or invalid credentials',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
};

export const ApiErrors = (...statuses: number[]) =>
  applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: ERROR_TEXT[status] ?? 'Error',
        schema: toSchema(apiErrorSchema, 'output'),
      }),
    ),
  );
