import {
  ArrowLeftRight,
  Blocks,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Settings,
  Tags,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { tools, type ToolId } from "@/features/tools/registry";

export type NavKey =
  | "dashboard"
  | "settings"
  | "overview"
  | "accounts"
  | "categories"
  | "transactions"
  | "budgets"
  | "goals"
  | "reports"
  | "tools";

export type NavItem = { key: NavKey; href: string; icon: LucideIcon; enabled: boolean };

export const platformNav: readonly NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { key: "tools", href: "/tools", icon: Blocks, enabled: true },
  { key: "settings", href: "/settings", icon: Settings, enabled: true },
];

// Flip `enabled` to true when the page ships.
export const toolNav: Partial<Record<ToolId, readonly NavItem[]>> = {
  money: [
    { key: "overview", href: "/money", icon: Wallet, enabled: true },
    { key: "accounts", href: "/money/accounts", icon: Landmark, enabled: true },
    { key: "categories", href: "/money/categories", icon: Tags, enabled: true },
    { key: "transactions", href: "/money/transactions", icon: ArrowLeftRight, enabled: true },
    { key: "budgets", href: "/money/budgets", icon: PiggyBank, enabled: false },
    { key: "goals", href: "/money/goals", icon: Target, enabled: false },
    { key: "reports", href: "/money/reports", icon: TrendingUp, enabled: false },
  ],
};

/** Which tool the current path belongs to (pathname has no locale prefix). */
export function activeToolId(pathname: string): ToolId | null {
  return tools.find((t) => pathname === `/${t.id}` || pathname.startsWith(`/${t.id}/`))?.id ?? null;
}

export function navFor(toolId: ToolId | null): readonly NavItem[] {
  return toolId ? (toolNav[toolId] ?? []) : platformNav;
}
