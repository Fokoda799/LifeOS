import { z } from "zod";

export const toolIds = ["money", "tasks", "training"] as const;
export const toolIdSchema = z.enum(toolIds);
export type ToolId = z.infer<typeof toolIdSchema>;

/** Tools that exist today. A tool is added here when it ships. */
export const availableToolIds: readonly ToolId[] = ["money"];

export const userToolSchema = z.object({
  toolId: toolIdSchema,
  addedAt: z.iso.datetime(),
});
export type UserTool = z.infer<typeof userToolSchema>;

export const userToolsResponseSchema = z.object({ tools: z.array(userToolSchema) });
export type UserToolsResponse = z.infer<typeof userToolsResponseSchema>;
