"use client";

import type { Category } from "@lifeos/shared";
import { Tags } from "lucide-react";
import { OptionSelect } from "@/components/ui/select";
import { CategoryBadge } from "./category-badge";
import { useCategoryName } from "./use-categories";

const ALL = "__all";

/**
 * Dropdown of categories with their icons. With `allLabel` the first option is
 * "all categories" and an empty value means that option.
 */
export function CategorySelect({
  categories,
  value,
  onValueChange,
  allLabel,
  placeholder,
  id,
  className,
  ariaLabel,
}: {
  categories: Category[];
  value: string;
  onValueChange: (id: string) => void;
  allLabel?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const nameOf = useCategoryName();

  const options = [
    ...(allLabel
      ? [
          {
            value: ALL,
            label: allLabel,
            icon: (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-money/15 text-money">
                <Tags aria-hidden className="size-4" />
              </span>
            ),
          },
        ]
      : []),
    ...categories.map((c) => ({
      value: c.id,
      label: nameOf(c),
      icon: <CategoryBadge icon={c.icon} color={c.color} className="size-8 rounded-lg" />,
    })),
  ];

  return (
    <OptionSelect
      id={id}
      value={allLabel && value === "" ? ALL : value}
      onValueChange={(v) => onValueChange(v === ALL ? "" : v)}
      options={options}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
