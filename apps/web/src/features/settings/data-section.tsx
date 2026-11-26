"use client";

import { TOOL_DATA_GRACE_DAYS, type ToolId, type UserTool } from "@lifeos/shared";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
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
import { tools, type Tool } from "@/features/tools/registry";
import {
  useAllUserTools,
  useCancelDataDeletion,
  useRequestDataDeletion,
} from "@/features/tools/use-user-tools";
import { SettingsSection } from "./settings-section";

const DAY_MS = 24 * 60 * 60 * 1000;

export function DataSection() {
  const t = useTranslations("Settings");
  const { data } = useAllUserTools();
  const [confirming, setConfirming] = useState<Tool | null>(null);
  const rows = new Map<ToolId, UserTool>(data?.tools.map((r) => [r.toolId, r] as const));

  return (
    <SettingsSection
      title={t("dataTitle")}
      description={t("dataDescription", { days: TOOL_DATA_GRACE_DAYS })}
    >
      <ul className="grid gap-3">
        {tools
          .filter((tool) => tool.status === "live")
          .map((tool) => (
            <ToolDataRow
              key={tool.id}
              tool={tool}
              row={rows.get(tool.id)}
              onDelete={() => setConfirming(tool)}
            />
          ))}
      </ul>
      <p className="text-sm text-muted-foreground">{t("dataSupport")}</p>
      <ConfirmDeleteDialog
        tool={confirming}
        onOpenChange={(open) => !open && setConfirming(null)}
      />
    </SettingsSection>
  );
}

function ToolDataRow({
  tool,
  row,
  onDelete,
}: {
  tool: Tool;
  row: UserTool | undefined;
  onDelete: () => void;
}) {
  const t = useTranslations("Settings");
  const tt = useTranslations("Tools");
  const format = useFormatter();
  const cancel = useCancelDataDeletion();
  const Icon = tool.icon;
  const name = tt(`${tool.id}.name`);
  const date = row?.deletionScheduledFor
    ? format.dateTime(new Date(row.deletionScheduledFor), { dateStyle: "long" })
    : null;

  return (
    // data-tool gives the row its tool's accent color.
    <li
      data-tool={tool.id}
      className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border p-4"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{name}</p>
        <p className="text-sm text-muted-foreground">
          {date ? t("dataPending", { date }) : row ? t("dataKept") : t("dataNone")}
        </p>
        {date && <p className="text-sm text-muted-foreground">{t("dataPendingHint", { name })}</p>}
      </div>
      {date ? (
        <Button
          variant="outline"
          size="sm"
          disabled={cancel.isPending}
          onClick={() =>
            cancel.mutate(tool.id, {
              onSuccess: () => toast.success(t("toastCancelled")),
              onError: () => toast.error(t("dataError")),
            })
          }
        >
          {t("dataCancel")}
        </Button>
      ) : (
        row && (
          <Button variant="outline" size="sm" onClick={onDelete}>
            {t("dataDelete")}
          </Button>
        )
      )}
    </li>
  );
}

function ConfirmDeleteDialog({
  tool,
  onOpenChange,
}: {
  tool: Tool | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!tool} onOpenChange={onOpenChange}>
      {tool && <ConfirmContent tool={tool} onOpenChange={onOpenChange} />}
    </Dialog>
  );
}

function ConfirmContent({
  tool,
  onOpenChange,
}: {
  tool: Tool;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Settings");
  const tt = useTranslations("Tools");
  const format = useFormatter();
  const request = useRequestDataDeletion();
  const name = tt(`${tool.id}.name`);
  // Fixed when the dialog opens, so the shown date doesn't drift while it is open.
  const [openedAt] = useState(() => Date.now());
  const fmt = (d: Date) => format.dateTime(d, { dateStyle: "long" });
  const deleteOn = fmt(new Date(openedAt + TOOL_DATA_GRACE_DAYS * DAY_MS));

  return (
    <DialogContent data-tool={tool.id} className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-extrabold">
          {t("dataDeleteTitle", { name })}
        </DialogTitle>
        <DialogDescription>
          {t("dataDeleteDescription", { name, date: deleteOn })}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {tt("cancel")}
        </Button>
        <Button
          variant="destructive"
          disabled={request.isPending}
          onClick={() =>
            request.mutate(tool.id, {
              onSuccess: (row) => {
                toast.success(
                  t("toastScheduled", {
                    date: row.deletionScheduledFor
                      ? fmt(new Date(row.deletionScheduledFor))
                      : deleteOn,
                  }),
                );
                onOpenChange(false);
              },
              onError: () => toast.error(t("dataError")),
            })
          }
        >
          {t("dataConfirm")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
