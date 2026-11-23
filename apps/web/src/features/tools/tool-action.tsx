"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Tool } from "./registry";
import { useAddTool } from "./use-user-tools";

export function ToolAction({
  tool,
  added,
  onRemove,
}: {
  tool: Tool;
  added: boolean;
  onRemove: () => void;
}) {
  const t = useTranslations("Tools");
  const add = useAddTool();
  const name = t(`${tool.id}.name`);

  if (tool.status === "soon") {
    return (
      <Button disabled className="w-full">
        {t("comingSoon")}
      </Button>
    );
  }

  if (added) {
    return (
      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/${tool.id}`}>{t("open")}</Link>
        </Button>
        <Button variant="outline" onClick={onRemove}>
          {t("remove")}
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={add.isPending}
      onClick={() =>
        add.mutate(tool.id, {
          onSuccess: () => toast.success(t("toastAdded", { name })),
          onError: () => toast.error(t("errorToggle")),
        })
      }
    >
      {add.isPending ? t("adding") : t("add")}
    </Button>
  );
}
