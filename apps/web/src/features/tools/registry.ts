import { Dumbbell, ListChecks, Wallet, type LucideIcon } from "lucide-react";

export type ToolId = "money" | "tasks" | "training";
export type ToolStatus = "live" | "soon";
export type Tool = { id: ToolId; icon: LucideIcon; status: ToolStatus };

// To add a tool: add it here, add a [data-tool="<id>"] block in globals.css,
// add messages Tools.<id>.*, and add a preview in previews.tsx (TypeScript will remind you).
export const tools: readonly Tool[] = [
  { id: "money", icon: Wallet, status: "live" },
  { id: "tasks", icon: ListChecks, status: "soon" },
  { id: "training", icon: Dumbbell, status: "soon" },
];
