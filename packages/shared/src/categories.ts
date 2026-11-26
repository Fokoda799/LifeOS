import { z } from "zod";

export const CATEGORY_KINDS = ["expense", "income"] as const;
export const categoryKindSchema = z.enum(CATEGORY_KINDS);
export type CategoryKind = z.infer<typeof categoryKindSchema>;

/** Icon and color are keys, not raw values: the web app maps them to lucide icons and theme tokens. */
export const CATEGORY_ICONS = [
  "cart",
  "food",
  "car",
  "home",
  "receipt",
  "health",
  "education",
  "bag",
  "game",
  "plane",
  "family",
  "tag",
  "briefcase",
  "laptop",
  "trend",
  "gift",
  "wallet",
  "fuel",
  "phone",
  "shirt",
  "fitness",
  "baby",
  "pet",
  "coffee",
] as const;
export const categoryIconSchema = z.enum(CATEGORY_ICONS);
export type CategoryIcon = z.infer<typeof categoryIconSchema>;

export const CATEGORY_COLORS = [
  "teal",
  "blue",
  "indigo",
  "purple",
  "pink",
  "red",
  "orange",
  "amber",
  "green",
  "slate",
] as const;
export const categoryColorSchema = z.enum(CATEGORY_COLORS);
export type CategoryColor = z.infer<typeof categoryColorSchema>;

export const MAX_CATEGORIES_PER_USER = 100;

/**
 * Every user gets their own copy of these. `key` is the translation key
 * (Money.categories.defaults.<key> in the web messages): add new defaults here
 * AND in the three messages files.
 */
export const DEFAULT_CATEGORIES: readonly {
  key: string;
  kind: CategoryKind;
  icon: CategoryIcon;
  color: CategoryColor;
}[] = [
  { key: "groceries", kind: "expense", icon: "cart", color: "green" },
  { key: "restaurants", kind: "expense", icon: "food", color: "orange" },
  { key: "transport", kind: "expense", icon: "car", color: "blue" },
  { key: "housing", kind: "expense", icon: "home", color: "indigo" },
  { key: "bills", kind: "expense", icon: "receipt", color: "slate" },
  { key: "health", kind: "expense", icon: "health", color: "red" },
  { key: "education", kind: "expense", icon: "education", color: "purple" },
  { key: "shopping", kind: "expense", icon: "bag", color: "pink" },
  { key: "entertainment", kind: "expense", icon: "game", color: "amber" },
  { key: "travel", kind: "expense", icon: "plane", color: "teal" },
  { key: "family", kind: "expense", icon: "family", color: "pink" },
  { key: "other_expense", kind: "expense", icon: "tag", color: "slate" },
  { key: "salary", kind: "income", icon: "wallet", color: "green" },
  { key: "freelance", kind: "income", icon: "laptop", color: "teal" },
  { key: "investments", kind: "income", icon: "trend", color: "blue" },
  { key: "gifts_received", kind: "income", icon: "gift", color: "pink" },
  { key: "other_income", kind: "income", icon: "tag", color: "slate" },
];

export const categorySchema = z.object({
  id: z.string(),
  kind: categoryKindSchema,
  /** Set on the user's copy of a default category. */
  systemKey: z.string().nullable(),
  /** Custom name. Null on an untouched default: show the translated default name. */
  name: z.string().nullable(),
  icon: categoryIconSchema,
  color: categoryColorSchema,
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type Category = z.infer<typeof categorySchema>;

export const categoriesResponseSchema = z.object({ categories: z.array(categorySchema) });
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;

const nameSchema = z.string().trim().min(1).max(40);

export const createCategorySchema = z.strictObject({
  kind: categoryKindSchema,
  name: nameSchema,
  icon: categoryIconSchema,
  color: categoryColorSchema,
});
export type CreateCategoryInput = z.input<typeof createCategorySchema>;

// kind is not editable: it would change the meaning of the category's transactions.
export const updateCategorySchema = z.strictObject({
  /** null resets a default category to its translated name. */
  name: nameSchema.nullable().optional(),
  icon: categoryIconSchema.optional(),
  color: categoryColorSchema.optional(),
  archived: z.boolean().optional(),
});
export type UpdateCategoryInput = z.input<typeof updateCategorySchema>;

export const categoryIdSchema = z.cuid();

export const listCategoriesQuerySchema = z.object({
  includeArchived: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});
