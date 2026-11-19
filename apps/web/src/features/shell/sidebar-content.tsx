"use client";

import { useTranslations } from "next-intl";
import { tools, type ToolId } from "@/features/tools/registry";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { navFor } from "./navigation";
import { ToolSwitcher } from "./tool-switcher";

const base = "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 font-bold transition-colors";

export function SidebarContent({
  activeTool,
  onNavigate,
}: {
  activeTool: ToolId | null;
  onNavigate?: () => void;
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

  return (
    <div className="flex h-full flex-col gap-6">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="px-2 text-2xl font-extrabold text-primary"
      >
        LifeOS
      </Link>
      <ToolSwitcher activeTool={activeTool} />
      <nav aria-label={tool ? tt(`${tool.id}.name`) : ts("mainDashboard")}>
        <ul className="grid gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            if (!item.enabled) {
              return (
                <li key={item.key}>
                  <span
                    aria-disabled="true"
                    className={cn(
                      base,
                      "cursor-not-allowed border-transparent text-muted-foreground opacity-60",
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                    {tn(item.key)}
                    <span className="ms-auto text-xs">{tt("soon")}</span>
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
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    base,
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                  {tn(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
