"use client";

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
import type { Tool } from "./registry";
import { useRemoveTool } from "./use-user-tools";

export function RemoveToolDialog({
  tool,
  onOpenChange,
}: {
  tool: Tool | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Tools");
  const remove = useRemoveTool();
  const name = tool ? t(`${tool.id}.name`) : "";

  return (
    <Dialog open={!!tool} onOpenChange={onOpenChange}>
      {tool && (
        <DialogContent data-tool={tool.id} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {t("removeTitle", { name })}
            </DialogTitle>
            <DialogDescription>{t("removeDescription", { name })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(tool.id, {
                  onSuccess: () => {
                    toast.success(t("toastRemoved", { name }));
                    onOpenChange(false);
                  },
                  onError: () => toast.error(t("errorToggle")),
                })
              }
            >
              {remove.isPending ? t("removing") : t("remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
