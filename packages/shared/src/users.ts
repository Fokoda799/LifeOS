import { z } from "zod";
import { currencySchema, localeSchema, themSchema } from "./common";

export const updateProfileSchema = z.object({
  // null clears the name
  name: z.string().trim().min(1).max(80).nullable().optional(),
  locale: localeSchema.optional(),
  currency: currencySchema.optional(),
  them: themSchema.optional(),
});

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
