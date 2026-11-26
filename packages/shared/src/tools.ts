import { z } from "zod";

export const toolIds = ["money", "tasks", "training"] as const;
export const toolIdSchema = z.enum(toolIds);
export type ToolId = z.infer<typeof toolIdSchema>;

/** Tools that exist today. A tool is added here when it ships. */
export const availableToolIds: readonly ToolId[] = ["money"];

/** How long a tool's data is kept after the user asks to delete it. */
export const TOOL_DATA_GRACE_DAYS = 30;

export const userToolSchema = z.object({
  toolId: toolIdSchema,
  addedAt: z.iso.datetime(),
  /** Set while the tool is removed (hidden). The data is kept. */
  removedAt: z.iso.datetime().nullable(),
  /** Set when the user asked to delete the tool's data: erased on this date unless cancelled. */
  deletionScheduledFor: z.iso.datetime().nullable(),
});
export type UserTool = z.infer<typeof userToolSchema>;

export const userToolsResponseSchema = z.object({ tools: z.array(userToolSchema) });
export type UserToolsResponse = z.infer<typeof userToolsResponseSchema>;

export const listUserToolsQuerySchema = z.object({
  includeRemoved: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});
