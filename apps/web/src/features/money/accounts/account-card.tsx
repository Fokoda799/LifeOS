"use client";

import type { Account } from "@lifeos/shared";
import { Archive, ArchiveRestore, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { accountTypeIcons } from "./account-types";
import { Amount } from "../shared/amount";

export function AccountCard({
  account,
  onEdit,
  onToggleArchive,
  onDelete,
}: {
  account: Account;
  onEdit: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Money.accounts");
  const Icon = accountTypeIcons[account.type];
  const archived = account.archivedAt !== null;

  return (
    <article
      className={cn(
        "grid gap-4 rounded-3xl border-2 border-border bg-card p-5",
        archived && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold">{account.name}</h3>
          <p className="text-sm text-muted-foreground">
            {t(`types.${account.type}`)} · <bdi dir="ltr">{account.currency}</bdi>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("actionsFor", { name: account.name })}
            >
              <EllipsisVertical aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil aria-hidden />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onToggleArchive}>
              {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
              {archived ? t("restore") : t("archive")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 aria-hidden />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        className={cn(
          "text-2xl font-extrabold",
          account.balance.startsWith("-") && "text-destructive",
        )}
      >
        <Amount minor={account.balance} currency={account.currency} />
      </p>
    </article>
  );
}
