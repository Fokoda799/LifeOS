import { Dumbbell, ListChecks, Wallet, type LucideIcon } from "lucide-react";

export type ToolId = "money" | "tasks" | "training";
export type ToolStatus = "live" | "soon";
export type Tool = { id: ToolId; icon: LucideIcon; status: ToolStatus };

// To add a tool: add it here, add a [data-tool="<id>"] block in globals.css,
// add messages Tools.<id>.{name,tagline,description,features.one|two|three},
// add a preview in previews.tsx, and add it to the API (shared toolIds + Prisma ToolId).
export const tools: readonly Tool[] = [
  { id: "money", icon: Wallet, status: "live" },
  { id: "tasks", icon: ListChecks, status: "soon" },
  { id: "training", icon: Dumbbell, status: "soon" },
];
