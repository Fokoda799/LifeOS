"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/features/auth/use-auth";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const ta = useTranslations("Auth");
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 dir="auto" className="text-3xl">
        {user && t("welcome", { name: user.name ?? user.email })}
      </h1>
      <Button variant="outline" onClick={() => logout.mutate()}>
        {ta("signOut")}
      </Button>
    </main>
  );
}
