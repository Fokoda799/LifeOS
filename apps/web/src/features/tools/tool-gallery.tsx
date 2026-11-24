"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { RemoveToolDialog } from "./remove-tool-dialog";
import { tools, type ToolId } from "./registry";
import { ToolCard } from "./tool-card";
import { ToolDetailsDialog } from "./tool-details-dialog";
import { useAddedToolIds } from "./use-user-tools";

export function ToolGallery() {
  const t = useTranslations("Tools");
  const added = useAddedToolIds();
  const [detailsId, setDetailsId] = useState<ToolId | null>(null);
  const [removeId, setRemoveId] = useState<ToolId | null>(null);
  const find = (id: ToolId | null) => tools.find((x) => x.id === id) ?? null;

  return (
    <div className="grid gap-6">
      <p className="max-w-2xl text-muted-foreground">{t("galleryDescription")}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            added={added.has(tool.id)}
            onOpenDetails={() => setDetailsId(tool.id)}
            onRemove={() => setRemoveId(tool.id)}
          />
        ))}
      </div>

      <ToolDetailsDialog
        tool={find(detailsId)}
        added={detailsId ? added.has(detailsId) : false}
        onOpenChange={(open) => !open && setDetailsId(null)}
        onRemove={() => {
          // Close the details, then ask for confirmation.
          setRemoveId(detailsId);
          setDetailsId(null);
        }}
      />
      <RemoveToolDialog tool={find(removeId)} onOpenChange={(open) => !open && setRemoveId(null)} />
    </div>
  );
}
