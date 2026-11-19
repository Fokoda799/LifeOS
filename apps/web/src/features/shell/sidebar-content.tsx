"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { tools, type ToolId } from "@/features/tools/registry";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { navFor } from "./navigation";
import { ToolSwitcher } from "./tool-switcher";
import { UserMenu } from "./user-menu";

const base = "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 font-bold transition-colors";

export function SidebarContent({
  activeTool,
  collapsed = false,
  onNavigate,
  onToggleCollapsed,
}: {
  activeTool: ToolId | null;
  collapsed?: boolean;
  onNavigate?: () => void;
  /** Only passed on desktop. The mobile drawer has no collapse button. */
  onToggleCollapsed?: () => void;
}) {
  const tn = useTranslations("Nav");
  const tt = useTranslations("Tools");
  const ts = useTranslations("Shell");
  const tool = tools.find((x) => x.id === activeTool);
  const pathname = usePathname();
  const items = navFor(activeTool);

  // The longest matching href wins, so "/money" isn't active on "/money/accounts".
  const activeHref = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const toggleLabel = collapsed ? ts("expandSidebar") : ts("collapseSidebar");
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const logoHeader =
    collapsed && onToggleCollapsed ? (
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded="false"
        aria-label={toggleLabel}
        title={toggleLabel}
        className="group relative mx-auto grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"
      >
        <span
          className="text-xl font-extrabold transition-opacity group-hover:opacity-0"
          aria-hidden
        >
          L
        </span>
        <ToggleIcon
          aria-hidden
          className="absolute size-5 opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100"
        />
      </button>
    ) : (
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="LifeOS"
          className="px-2 text-2xl font-extrabold text-primary"
        >
          LifeOS
        </Link>
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded="true"
            aria-label={toggleLabel}
            title={toggleLabel}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ToggleIcon aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
        )}
      </div>
    );

  return (
    <div className="flex h-full flex-col gap-6">
      {logoHeader}

      <ToolSwitcher activeTool={activeTool} collapsed={collapsed} />

      <nav aria-label={tool ? tt(`${tool.id}.name`) : ts("mainDashboard")}>
        <ul className="grid gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const label = tn(item.key);
            const layout = collapsed ? "justify-center px-0" : undefined;

            if (!item.enabled) {
              return (
                <li key={item.key}>
                  <span
                    aria-disabled="true"
                    title={collapsed ? label : undefined}
                    className={cn(
                      base,
                      layout,
                      "cursor-not-allowed border-transparent text-muted-foreground opacity-60",
                    )}
                  >
                    <Icon aria-hidden className="size-5 shrink-0" />
                    <span className={collapsed ? "sr-only" : undefined}>{label}</span>
                    {!collapsed && <span className="ms-auto text-xs">{tt("soon")}</span>}
                  </span>
                </li>
              );
            }

            const active = item.href === activeHref;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    base,
                    layout,
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-5 shrink-0" />
                  <span className={collapsed ? "sr-only" : undefined}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto grid gap-2">
        <div className="border-t-2 border-border pt-2">
          <UserMenu collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}
