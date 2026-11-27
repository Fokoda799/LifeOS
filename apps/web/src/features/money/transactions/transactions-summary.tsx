"use client";

import type { TransactionsSummary } from "@lifeos/shared";
import { useTranslations } from "next-intl";
import { Amount } from "@/features/money/shared/amount";
import { cn } from "@/lib/utils";

/** Income, spending and net for the current filters, one card per currency. */
export function TransactionsSummaryCards({ totals }: { totals: TransactionsSummary["totals"] }) {
  const t = useTranslations("Money.transactions");
  if (totals.length === 0) return null;

  return (
    <section aria-label={t("summaryLabel")} className="grid gap-3">
      {totals.map((total) => (
        <div
          key={total.currency}
          className="grid gap-4 rounded-3xl border-2 border-border bg-card p-5 sm:grid-cols-3"
        >
          <Stat label={t("summaryIncome")} className="text-income">
            <Amount minor={total.income} currency={total.currency} />
          </Stat>
          <Stat label={t("summaryExpense")} className="text-expense">
            <Amount minor={`-${total.expense}`} currency={total.currency} />
          </Stat>
          <Stat
            label={t("summaryNet")}
            className={total.net.startsWith("-") ? "text-expense" : "text-foreground"}
          >
            <Amount minor={total.net} currency={total.currency} />
          </Stat>
        </div>
      ))}
    </section>
  );
}

function Stat({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-extrabold", className)}>{children}</p>
    </div>
  );
}
