"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { ApiRequestError } from "@/lib/api";
import { useMe } from "./use-auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Common");
  const router = useRouter();
  const { data, error, isPending, refetch } = useMe();
  const unauthorized = error instanceof ApiRequestError && error.status === 401;

  useEffect(() => {
    if (unauthorized) router.replace("/login");
  }, [unauthorized, router]);

  if (error && !unauthorized) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Button onClick={() => refetch()}>{t("retry")}</Button>
      </div>
    );
  }
  if (isPending || !data) {
    return (
      <div role="status" className="grid min-h-dvh place-items-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }
  return children;
}
