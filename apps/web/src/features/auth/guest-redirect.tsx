"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useMe } from "./use-auth";

export function GuestRedirect() {
  const { data } = useMe();
  const router = useRouter();
  useEffect(() => {
    if (data) router.replace("/dashboard");
  }, [data, router]);
  return null;
}
