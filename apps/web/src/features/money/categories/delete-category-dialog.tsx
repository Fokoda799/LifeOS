"use client";

import type { Category } from "@lifeos/shared";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategoryName, useDeleteCategory } from "./use-categories";

export function DeleteCategoryDialog({
  category,
  onOpenChange,
}: {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Money.categories");
  const nameOf = useCategoryName();
  const remove = useDeleteCategory();

  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      {category && (
        <DialogContent data-tool="money" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {t("deleteTitle", { name: nameOf(category) })}
            </DialogTitle>
            <DialogDescription>{t("deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(category.id, {
                  onSuccess: () => {
                    toast.success(t("toastDeleted", { name: nameOf(category) }));
                    onOpenChange(false);
                  },
                  onError: () => toast.error(t("errorDelete")),
                })
              }
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
