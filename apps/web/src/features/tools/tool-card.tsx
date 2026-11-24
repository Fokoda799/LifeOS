"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Tool } from "./registry";
import { ToolAction } from "./tool-action";

export function StatusBadge({ tool, added }: { tool: Tool; added: boolean }) {
  const t = useTranslations("Tools");
  if (tool.status === "soon") {
    return <Badge className="bg-muted text-muted-foreground">{t("comingSoon")}</Badge>;
  }
  return added ? <Badge className="bg-primary/10 text-primary">{t("added")}</Badge> : null;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", className)}>
      {children}
    </span>
  );
}

export function ToolCard({
  tool,
  added,
  onOpenDetails,
  onRemove,
}: {
  tool: Tool;
  added: boolean;
  onOpenDetails: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("Tools");
  const Icon = tool.icon;

  return (
    // data-tool gives this card its own accent color (purple, amber…).
    <article
      data-tool={tool.id}
      className="grid content-between gap-5 rounded-3xl border-2 border-border bg-card p-5"
    >
      {/* The body opens the details. Buttons sit outside it, so nothing is nested. */}
      <button
        type="button"
        onClick={onOpenDetails}
        className="grid gap-3 rounded-2xl text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Icon aria-hidden className="size-6" />
        </span>
        <span className="flex flex-wrap items-center gap-2 text-xl font-extrabold">
          {t(`${tool.id}.name`)}
          <StatusBadge tool={tool} added={added} />
        </span>
        <span className="text-muted-foreground">{t(`${tool.id}.tagline`)}</span>
      </button>
      <ToolAction tool={tool} added={added} onRemove={onRemove} />
    </article>
  );
}
