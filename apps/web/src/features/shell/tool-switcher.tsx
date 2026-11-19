"use client";

import { ChevronsUpDown, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tools, type ToolId } from "@/features/tools/registry";
import { Link } from "@/i18n/navigation";

export function ToolSwitcher({ activeTool }: { activeTool: ToolId | null }) {
  const ts = useTranslations("Shell");
  const tt = useTranslations("Tools");
  const current = tools.find((x) => x.id === activeTool);
  const CurrentIcon = current?.icon ?? LayoutGrid;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ts("switchTool")}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-muted p-3 text-start font-bold transition-colors hover:border-primary data-[state=open]:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <CurrentIcon aria-hidden className="size-5" />
          </span>
          <span className="flex-1 truncate">
            {current ? tt(`${current.id}.name`) : ts("mainDashboard")}
          </span>
          <ChevronsUpDown aria-hidden className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-56 w-(--radix-dropdown-menu-trigger-width)"
      >
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutGrid aria-hidden />
            {ts("mainDashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {tools.map((tool) => {
          const Icon = tool.icon;
          if (tool.status === "soon") {
            return (
              <DropdownMenuItem key={tool.id} disabled>
                <Icon aria-hidden />
                {tt(`${tool.id}.name`)}
                <span className="ms-auto text-xs">{tt("soon")}</span>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem key={tool.id} asChild>
              <Link href={`/${tool.id}`}>
                <Icon aria-hidden />
                {tt(`${tool.id}.name`)}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
