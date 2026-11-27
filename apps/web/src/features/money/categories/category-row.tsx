"use client";

import type { Category } from "@lifeos/shared";
import { Archive, ArchiveRestore, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import { useCategoryName } from "./use-categories";

export function CategoryRow({
  category,
  onEdit,
  onToggleArchive,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Money.categories");
  const nameOf = useCategoryName();
  const name = nameOf(category);
  const archived = category.archivedAt !== null;
  // Defaults can only be archived, so their history is never lost.
  const isDefault = category.systemKey !== null;

  return (
    <li
      className={cn(
        "grid content-start gap-3 rounded-3xl border-2 border-border bg-card p-4",
        archived && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge icon={category.icon} color={category.color} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={t("actionsFor", { name })}>
              <EllipsisVertical aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil aria-hidden />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onToggleArchive}>
              {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
              {archived ? t("restore") : t("archive")}
            </DropdownMenuItem>
            {!isDefault && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 aria-hidden />
                  {t("delete")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-w-0">
        <p dir="auto" className="truncate text-lg font-extrabold">
          {name}
        </p>
        {isDefault && <p className="text-sm text-muted-foreground">{t("defaultLabel")}</p>}
      </div>
    </li>
  );
}
