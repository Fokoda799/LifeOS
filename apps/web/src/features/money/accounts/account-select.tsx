"use client";

import type { Account } from "@lifeos/shared";
import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { OptionSelect } from "@/components/ui/select";
import { accountTypeIcons } from "./account-types";

const tile = "grid size-8 shrink-0 place-items-center rounded-lg bg-money/15 text-money";

/**
 * Dropdown of accounts, each with the icon of its type. With `allLabel` the first option is
 * "all accounts" and an empty value means that option.
 */
export function AccountSelect({
  accounts,
  value,
  onValueChange,
  allLabel,
  placeholder,
  id,
  invalid,
  className,
  ariaLabel,
}: {
  accounts: Account[];
  value: string;
  onValueChange: (id: string) => void;
  allLabel?: string;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const t = useTranslations("Money.accounts");
  const ALL = "__all";

  const options = [
    ...(allLabel
      ? [
          {
            value: ALL,
            label: allLabel,
            icon: (
              <span className={tile}>
                <Layers aria-hidden className="size-4" />
              </span>
            ),
          },
        ]
      : []),
    ...accounts.map((account) => {
      const Icon = accountTypeIcons[account.type];
      return {
        value: account.id,
        label: account.name,
        description: `${t(`types.${account.type}`)} · ${account.currency}`,
        icon: (
          <span className={tile}>
            <Icon aria-hidden className="size-4" />
          </span>
        ),
      };
    }),
  ];

  return (
    <OptionSelect
      id={id}
      value={allLabel && value === "" ? ALL : value}
      onValueChange={(v) => onValueChange(v === ALL ? "" : v)}
      options={options}
      placeholder={placeholder}
      invalid={invalid}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
