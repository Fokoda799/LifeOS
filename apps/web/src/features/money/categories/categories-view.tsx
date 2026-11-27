"use client";

import { CATEGORY_KINDS, type Category, type CategoryKind } from "@lifeos/shared";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryDialog } from "./category-dialog";
import { CategoryRow } from "./category-row";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { useCategories, useCategoryName, useUpdateCategory } from "./use-categories";

const gridClass = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

export function CategoriesView() {
  const t = useTranslations("Money.categories");
  const tc = useTranslations("Common");
  const nameOf = useCategoryName();
  const { data, isPending, isError, refetch } = useCategories();
  const update = useUpdateCategory();
  const [kind, setKind] = useState<CategoryKind>("expense");
  // null = closed, {} = create, { category } = edit
  const [dialog, setDialog] = useState<{ category?: Category } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const inKind = (data?.categories ?? []).filter((c) => c.kind === kind);
  const active = inKind.filter((c) => c.archivedAt === null);
  const archived = inKind.filter((c) => c.archivedAt !== null);

  function toggleArchive(category: Category) {
    const archiving = category.archivedAt === null;
    update.mutate(
      { id: category.id, input: { archived: archiving } },
      {
        onSuccess: () =>
          toast.success(
            t(archiving ? "toastArchived" : "toastRestored", { name: nameOf(category) }),
          ),
        onError: () => toast.error(t("errorSave")),
      },
    );
  }

  const row = (category: Category) => (
    <CategoryRow
      key={category.id}
      category={category}
      onEdit={() => setDialog({ category })}
      onToggleArchive={() => toggleArchive(category)}
      onDelete={() => setDeleting(category)}
    />
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-muted-foreground">{t("description")}</p>
        <Button onClick={() => setDialog({})}>
          <Plus aria-hidden />
          {t("new")}
        </Button>
      </div>

      <div role="group" aria-label={t("kindsLabel")} className="grid grid-cols-2 gap-2">
        {CATEGORY_KINDS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
            className={cn(
              "rounded-xl border-2 p-3 text-sm font-extrabold transition-colors",
              kind === value && value === "income"
                ? "border-primary bg-primary/10 text-primary"
                : kind === value && value === "expense"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {t(`kinds.${value}`)}
          </button>
        ))}
      </div>

      {isPending && <p className="text-muted-foreground">{tc("loading")}</p>}

      {isError && (
        <div className="flex flex-wrap items-center gap-3">
          <p role="alert" className="text-destructive">
            {t("errorLoad")}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {tc("retry")}
          </Button>
        </div>
      )}

      {data && active.length === 0 && <p className="text-muted-foreground">{t("emptyKind")}</p>}

      {active.length > 0 && <ul className={gridClass}>{active.map(row)}</ul>}

      {archived.length > 0 && (
        <details className="grid gap-4">
          <summary className="cursor-pointer text-sm font-bold text-muted-foreground">
            {t("archived", { count: archived.length })}
          </summary>
          <ul className={`mt-4 ${gridClass}`}>{archived.map(row)}</ul>
        </details>
      )}

      <CategoryDialog
        open={dialog !== null}
        category={dialog?.category}
        defaultKind={kind}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <DeleteCategoryDialog
        category={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
