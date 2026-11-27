"use client";

import type { Transaction } from "@lifeos/shared";
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
import { useDeleteTransaction } from "./use-transactions";

export function DeleteTransactionDialog({
  transaction,
  onOpenChange,
}: {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Money.transactions");
  const remove = useDeleteTransaction();

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      {transaction && (
        <DialogContent data-tool="money" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">{t("deleteTitle")}</DialogTitle>
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
                remove.mutate(transaction.id, {
                  onSuccess: () => {
                    toast.success(t("toastDeleted"));
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
