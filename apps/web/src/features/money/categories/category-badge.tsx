import type { CategoryColor, CategoryIcon } from "@lifeos/shared";
import { cn } from "@/lib/utils";
import { categoryColorClasses, categoryIcons, isIconKey } from "./category-style";

/** The colored icon tile for a category. Reused by the transaction forms later. */
export function CategoryBadge({
  icon,
  color,
  className,
}: {
  /** An icon key or a single emoji. */
  icon: CategoryIcon;
  color: CategoryColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl",
        categoryColorClasses[color].tint,
        className,
      )}
    >
      {isIconKey(icon) ? (
        (() => {
          const Icon = categoryIcons[icon];
          return <Icon aria-hidden className="size-5" />;
        })()
      ) : (
        <span aria-hidden className="text-xl leading-none">
          {icon}
        </span>
      )}
    </span>
  );
}
