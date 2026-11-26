"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ToolId, UserTool, UserToolsResponse } from "@lifeos/shared";
import { api } from "@/lib/api";

export const userToolsKey = ["user-tools"] as const;

export function useUserTools() {
  return useQuery({
    queryKey: userToolsKey,
    queryFn: () => api<UserToolsResponse>("/users/me/tools"),
  });
}

/** The ids of the tools this user has added (empty while loading). */
export function useAddedToolIds() {
  const { data } = useUserTools();
  return new Set<ToolId>(data?.tools.map((x) => x.toolId));
}

// Returning the promise keeps the mutation "pending" until the list is refreshed,
// so the UI never shows a stale state after success.
export function useAddTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toolId: ToolId) => api<UserTool>(`/users/me/tools/${toolId}`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userToolsKey }),
  });
}

export function useRemoveTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toolId: ToolId) => api<void>(`/users/me/tools/${toolId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userToolsKey }),
  });
}

/** Every tool the user has used, including removed ones (for Settings). */
export function useAllUserTools() {
  return useQuery({
    queryKey: [...userToolsKey, "all"],
    queryFn: () => api<UserToolsResponse>("/users/me/tools?includeRemoved=true"),
  });
}

// Both refresh every "user-tools" query, so the sidebar and Settings stay in step.
export function useRequestDataDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toolId: ToolId) =>
      api<UserTool>(`/users/me/tools/${toolId}/data-deletion`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userToolsKey }),
  });
}

export function useCancelDataDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toolId: ToolId) =>
      api<void>(`/users/me/tools/${toolId}/data-deletion`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userToolsKey }),
  });
}
