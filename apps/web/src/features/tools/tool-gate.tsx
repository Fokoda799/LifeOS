"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import type { ToolId } from "./registry";
import { useUserTools } from "./use-user-tools";

/** Wrap a tool's routes. Users who haven't added the tool are sent to the gallery. */
export function ToolGate({ toolId, children }: { toolId: ToolId; children: React.ReactNode }) {
  const router = useRouter();
  const { data } = useUserTools();
  const enabled = data?.tools.some((x) => x.toolId === toolId) ?? false;

  useEffect(() => {
    if (data && !enabled) router.replace("/tools");
  }, [data, enabled, router]);

  return enabled ? children : null;
}
