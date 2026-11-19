"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { activeToolId } from "./navigation";
import { SidebarContent } from "./sidebar-content";
import { Topbar } from "./topbar";

// Per-viewer convenience only: storage can be blocked, so every access is guarded.
const COLLAPSED_KEY = "lifeos:sidebar-collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTool = activeToolId(pathname);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // AuthGate only renders the shell on the client after the session loads,
  // so reading storage here can't cause a hydration mismatch.
  const [collapsed, setCollapsed] = useState(readCollapsed);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

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
      className={cn(
        "min-h-dvh bg-background lg:grid lg:transition-[grid-template-columns] lg:duration-200 motion-reduce:transition-none",
        collapsed ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]" : "lg:grid-cols-[17rem_minmax(0,1fr)]",
      )}
    >
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh overflow-x-hidden border-e-2 border-border bg-card lg:block",
          collapsed ? "p-3" : "p-4",
        )}
      >
        <SidebarContent
          activeTool={activeTool}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
      </aside>
      <div className="flex min-w-0 flex-col">
        <Topbar activeTool={activeTool} onOpenPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
