"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { shiftPeriod, type Period } from "./period";

/** Previous / next month, plus a switch between one month and all time. */
export function MonthSwitcher({
  period,
  onChange,
  currentMonth,
}: {
  /** null = all time */
  period: Period | null;
  onChange: (period: Period | null) => void;
  currentMonth: Period;
}) {
  const t = useTranslations("Money.transactions");
  const locale = useLocale();

  const label = period
    ? new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(period.year, period.month, 1)))
    : t("allTime");

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={t("periodPrevious")}
        disabled={!period}
        onClick={() => period && onChange(shiftPeriod(period, -1))}
      >
        <ChevronLeft aria-hidden className="rtl:-scale-x-100" />
      </Button>
      <p aria-live="polite" className="min-w-36 text-center font-extrabold">
        {label}
      </p>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={t("periodNext")}
        disabled={!period}
        onClick={() => period && onChange(shiftPeriod(period, 1))}
      >
        <ChevronRight aria-hidden className="rtl:-scale-x-100" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onChange(period ? null : currentMonth)}>
        {period ? t("allTime") : t("thisMonth")}
      </Button>
    </div>
  );
}
