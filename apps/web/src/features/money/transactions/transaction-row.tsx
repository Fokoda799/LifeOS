"use client";

import type { Account, Category, Transaction } from "@lifeos/shared";
import { ArrowLeftRight, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryBadge } from "@/features/money/categories/category-badge";
import { useCategoryName } from "@/features/money/categories/use-categories";
import { Amount } from "@/features/money/shared/amount";
import { cn } from "@/lib/utils";

export function TransactionRow({
  transaction,
  account,
  toAccount,
  category,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  account: Account | undefined;
  toAccount: Account | undefined;
  category: Category | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Money.transactions");
  const nameOf = useCategoryName();
  const isTransfer = transaction.type === "transfer";

  const title = isTransfer ? t("transferTitle") : category ? nameOf(category) : t("uncategorized");
  const subtitle = isTransfer
    ? t("transferRoute", { from: account?.name ?? "", to: toAccount?.name ?? "" })
    : (account?.name ?? "");

  return (
    <li className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3">
      {isTransfer ? (
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <ArrowLeftRight aria-hidden className="size-5 rtl:-scale-x-100" />
        </span>
      ) : (
        <CategoryBadge icon={category?.icon ?? "tag"} color={category?.color ?? "slate"} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-extrabold">{title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {subtitle}
          {transaction.note ? ` · ${transaction.note}` : ""}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-lg font-extrabold",
          transaction.type === "income" && "text-income",
          transaction.type === "expense" && "text-expense",
        )}
      >
        <Amount
          minor={transaction.type === "expense" ? `-${transaction.amount}` : transaction.amount}
          currency={transaction.currency}
        />
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t("actionsFor", { name: title })}>
            <EllipsisVertical aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil aria-hidden />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 aria-hidden />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
