"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ToolId } from "@/features/tools/registry";
import { SidebarContent } from "./sidebar-content";

export function Topbar({
  activeTool,
  onOpenPalette,
}: {
  activeTool: ToolId | null;
  onOpenPalette: () => void;
}) {
  const ts = useTranslations("Shell");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-border bg-background px-4 py-3 lg:px-8">
      <div className="lg:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label={ts("openMenu")}>
              <Menu aria-hidden />
            </Button>
          </SheetTrigger>
          {/* Sheets render in a portal, so data-tool has to be repeated here. */}
          <SheetContent side="left" data-tool={activeTool ?? undefined} className="w-72 p-4">
            <SheetTitle className="sr-only">{ts("openMenu")}</SheetTitle>
            <SidebarContent activeTool={activeTool} onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="ms-auto flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onOpenPalette} aria-label={ts("search")}>
          <Search aria-hidden className="size-4" />
          <span className="hidden sm:inline">{ts("search")}</span>
          <kbd className="hidden rounded border-2 border-border px-1.5 text-xs text-muted-foreground md:inline">
            Ctrl K
          </kbd>
        </Button>
      </div>
    </header>
  );
}
