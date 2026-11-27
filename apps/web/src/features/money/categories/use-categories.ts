"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CategoriesResponse,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@lifeos/shared";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";

export const categoriesKey = ["money", "categories"] as const;

export function useCategories() {
  // One request that includes archived categories, so showing them needs no refetch.
  // The API creates the user's default categories on the first call.
  return useQuery({
    queryKey: categoriesKey,
    queryFn: () => api<CategoriesResponse>("/money/categories?includeArchived=true"),
  });
}

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: categoriesKey });
}

export function useCreateCategory() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      api<Category>("/money/categories", { method: "POST", body: JSON.stringify(input) }),
    onSuccess,
  });
}

export function useUpdateCategory() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      api<Category>(`/money/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess,
  });
}

export function useDeleteCategory() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/money/categories/${id}`, { method: "DELETE" }),
    onSuccess,
  });
}

/** Display name: the user's own name, or the translated default for an untouched default. */
export function useCategoryName() {
  const t = useTranslations("Money.categories");
  return (category: Pick<Category, "name" | "systemKey">) =>
    category.name ??
    // systemKey is a plain string from the API; the messages files hold one entry per default.
    (category.systemKey ? t(`defaults.${category.systemKey}` as Parameters<typeof t>[0]) : "");
}
