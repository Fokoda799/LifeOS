"use client";

import { useTranslations } from "next-intl";
import { useMe } from "@/features/auth/use-auth";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { data: user } = useMe();
  return <p dir="auto">{user && t("welcome", { name: user.name ?? user.email })}</p>;
}
