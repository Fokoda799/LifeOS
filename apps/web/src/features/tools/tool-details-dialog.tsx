"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { previews } from "./previews";
import type { Tool } from "./registry";
import { StatusBadge } from "./tool-card";
import { ToolAction } from "./tool-action";

const featureKeys = ["one", "two", "three"] as const;

export function ToolDetailsDialog({
  tool,
  added,
  onOpenChange,
  onRemove,
}: {
  tool: Tool | null;
  added: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("Tools");

  return (
    <Dialog open={!!tool} onOpenChange={onOpenChange}>
      {tool && <DetailsContent tool={tool} added={added} onRemove={onRemove} t={t} />}
    </Dialog>
  );
}

function DetailsContent({
  tool,
  added,
  onRemove,
  t,
}: {
  tool: Tool;
  added: boolean;
  onRemove: () => void;
  t: ReturnType<typeof useTranslations<"Tools">>;
}) {
  const Icon = tool.icon;
  const Preview = previews[tool.id];

  return (
    // Dialogs render in a portal, so data-tool has to be repeated here.
    <DialogContent data-tool={tool.id} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader className="gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Icon aria-hidden className="size-6" />
        </span>
        <DialogTitle className="flex flex-wrap items-center gap-2 text-2xl font-extrabold leading-tight">
          {t(`${tool.id}.name`)}
          <StatusBadge tool={tool} added={added} />
        </DialogTitle>
        <DialogDescription>{t(`${tool.id}.description`)}</DialogDescription>
      </DialogHeader>

      <div className="rounded-2xl border-2 border-border bg-muted p-4">
        <Preview />
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-bold text-muted-foreground">{t("featuresLabel")}</h3>
        <ul className="grid gap-2">
          {featureKeys.map((k) => (
            <li key={k} className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              {t(`${tool.id}.features.${k}`)}
            </li>
          ))}
        </ul>
      </div>

      <DialogFooter className="sm:flex-col">
        <ToolAction tool={tool} added={added} onRemove={onRemove} />
      </DialogFooter>
    </DialogContent>
  );
}
