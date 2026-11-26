"use client";

import type { Account } from "@lifeos/shared";
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
import { useDeleteAccount } from "./use-accounts";

export function DeleteAccountDialog({
  account,
  onOpenChange,
}: {
  account: Account | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Money.accounts");
  const remove = useDeleteAccount();

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      {account && (
        <DialogContent data-tool="money" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {t("deleteTitle", { name: account.name })}
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
                remove.mutate(account.id, {
                  onSuccess: () => {
                    toast.success(t("toastDeleted", { name: account.name }));
                    onOpenChange(false);
                  },
                  onError: () => toast.error(t("errorSave")),
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
