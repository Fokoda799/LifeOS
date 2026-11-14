import { z } from "zod";

export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
  errors: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional()
    .describe("Field-level validation problems"),
  path: z.string(),
  timestamp: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
