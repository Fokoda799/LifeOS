"use client";

import { useTranslations } from "next-intl";
import { useMe } from "@/features/auth/use-auth";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { data: user } = useMe();
  return (
    <h1 dir="auto" className="text-3xl">
      {user && t("welcome", { name: user.name ?? user.email })}
    </h1>
  );
}
