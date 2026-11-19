"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { CommandPalette } from "./command-palette";
import { activeToolId } from "./navigation";
import { SidebarContent } from "./sidebar-content";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTool = activeToolId(pathname);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      data-tool={activeTool ?? undefined}
      className="min-h-dvh bg-background lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"
    >
      <aside className="sticky top-0 hidden h-dvh border-e-2 border-border bg-card p-4 lg:block">
        <SidebarContent activeTool={activeTool} />
      </aside>
      <div className="flex min-w-0 flex-col">
        <Topbar activeTool={activeTool} onOpenPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
