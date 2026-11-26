"use client";

import { formatMinor } from "@lifeos/shared";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

/** Amounts are always left-to-right and tabular, also inside Arabic text. */
export function Amount({
  minor,
  currency,
  className,
}: {
  minor: string;
  currency: string;
  className?: string;
}) {
  const locale = useLocale();
  return (
    <bdi dir="ltr" className={cn("tabular-nums", className)}>
      {formatMinor(minor, currency, locale)}
    </bdi>
  );
}
