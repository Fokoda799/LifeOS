"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useMe } from "@/features/auth/use-auth";
import { useUserTools } from "@/features/tools/use-user-tools";
import { Link } from "@/i18n/navigation";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tt = useTranslations("Tools");
  const { data: user } = useMe();
  const { data: userTools } = useUserTools();

  return (
    <div className="grid gap-6">
      <p>{user && t("welcome", { name: user.name ?? user.email })}</p>
      {userTools?.tools.length === 0 && (
        <section className="grid max-w-xl gap-3 rounded-3xl border-2 border-dashed border-border bg-card p-6">
          <h2 className="text-xl">{tt("emptyTitle")}</h2>
          <p className="text-muted-foreground">{tt("emptyDescription")}</p>
          <Button asChild className="justify-self-start">
            <Link href="/tools">{tt("browse")}</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
