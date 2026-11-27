"use client";

import { TRANSACTION_TYPES, type Transaction, type TransactionType } from "@lifeos/shared";
import { Plus, ReceiptText, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountSelect } from "@/features/money/accounts/account-select";
import { useAccounts } from "@/features/money/accounts/use-accounts";
import { CategorySelect } from "@/features/money/categories/category-select";
import { useCategories } from "@/features/money/categories/use-categories";
import { Link } from "@/i18n/navigation";
import { useDebounced } from "@/lib/use-debounced";
import { cn } from "@/lib/utils";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { MonthSwitcher } from "./month-switcher";
import { currentPeriod, periodBounds, type Period } from "./period";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionRow } from "./transaction-row";
import { TransactionsSummaryCards } from "./transactions-summary";
import { useTransactions, useTransactionsSummary } from "./use-transactions";

export function TransactionsView() {
  const t = useTranslations("Money.transactions");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const [type, setType] = useState<TransactionType | undefined>();
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const currentMonth = useMemo(() => currentPeriod(), []);
  // null = all time
  const [period, setPeriod] = useState<Period | null>(currentMonth);

  const filters = {
    type,
    accountId: accountId || undefined,
    categoryId: categoryId || undefined,
    q: q || undefined,
    ...(period ? periodBounds(period) : {}),
  };

  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const transactionsQuery = useTransactions(filters);
  const summaryQuery = useTransactionsSummary(filters);
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    transactionsQuery;

  // null = closed, {} = create, { transaction } = edit
  const [dialog, setDialog] = useState<{ transaction?: Transaction } | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const accounts = useMemo(() => accountsQuery.data?.accounts ?? [], [accountsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data?.categories ?? [], [categoriesQuery.data]);
  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const transactions = useMemo(() => data?.pages.flatMap((p) => p.transactions) ?? [], [data]);
  // The API sends newest first, so same-day transactions are already next to each other.
  const days = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = [];
    for (const tx of transactions) {
      const last = groups[groups.length - 1];
      if (last?.date === tx.date) last.items.push(tx);
      else groups.push({ date: tx.date, items: [tx] });
    }
    return groups;
  }, [transactions]);

  const dayLabel = (date: string) =>
    new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
      dateStyle: "full",
      timeZone: "UTC", // the date is a calendar day, so don't shift it by the viewer's time zone
    }).format(new Date(`${date}T00:00:00Z`));

  const hasAccounts = accounts.some((a) => a.archivedAt === null);
  const filtered = type !== undefined || accountId !== "" || categoryId !== "" || search !== "";

  function clearFilters() {
    setType(undefined);
    setAccountId("");
    setCategoryId("");
    setSearch("");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-muted-foreground">{t("description")}</p>
        <Button onClick={() => setDialog({})} disabled={!hasAccounts}>
          <Plus aria-hidden />
          {t("new")}
        </Button>
      </div>

      {accountsQuery.data && !hasAccounts && (
        <section className="grid justify-items-start gap-3 rounded-3xl border-2 border-dashed border-border bg-card p-8">
          <h2 className="text-xl">{t("noAccountsTitle")}</h2>
          <p className="text-muted-foreground">{t("noAccountsDescription")}</p>
          <Button asChild>
            <Link href="/money/accounts">{t("goToAccounts")}</Link>
          </Button>
        </section>
      )}

      {hasAccounts && (
        <>
          <MonthSwitcher period={period} onChange={setPeriod} currentMonth={currentMonth} />

          <div className="grid gap-3">
            <div role="group" aria-label={t("filtersLabel")} className="flex flex-wrap gap-2">
              {[undefined, ...TRANSACTION_TYPES].map((value) => (
                <button
                  key={value ?? "all"}
                  type="button"
                  aria-pressed={type === value}
                  onClick={() => setType(value)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition-colors",
                    type === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {value ? t(`filterTypes.${value}`) : t("typeAll")}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-48 flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  dir="auto"
                  autoComplete="off"
                  aria-label={t("searchLabel")}
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-9"
                />
              </div>
              <AccountSelect
                ariaLabel={t("accountFilter")}
                className="w-auto min-w-48"
                accounts={accounts}
                allLabel={t("allAccounts")}
                value={accountId}
                onValueChange={setAccountId}
              />
              <CategorySelect
                ariaLabel={t("categoryFilter")}
                className="w-auto min-w-48"
                categories={categories}
                allLabel={t("allCategories")}
                value={categoryId}
                onValueChange={setCategoryId}
              />
              {filtered && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X aria-hidden />
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          </div>

          <TransactionsSummaryCards totals={summaryQuery.data?.totals ?? []} />
        </>
      )}

      {isPending && <p className="text-muted-foreground">{tc("loading")}</p>}

      {isError && (
        <div className="flex flex-wrap items-center gap-3">
          <p role="alert" className="text-destructive">
            {t("errorLoad")}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {tc("retry")}
          </Button>
        </div>
      )}

      {data && hasAccounts && transactions.length === 0 && (
        <section className="grid justify-items-start gap-3 rounded-3xl border-2 border-dashed border-border bg-card p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ReceiptText aria-hidden className="size-6" />
          </span>
          {filtered ? (
            <p className="text-muted-foreground">{t("emptyFiltered")}</p>
          ) : period ? (
            <>
              <h2 className="text-xl">{t("emptyPeriodTitle")}</h2>
              <p className="text-muted-foreground">{t("emptyPeriodDescription")}</p>
              <Button onClick={() => setDialog({})}>
                <Plus aria-hidden />
                {t("new")}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl">{t("emptyTitle")}</h2>
              <p className="text-muted-foreground">{t("emptyDescription")}</p>
              <Button onClick={() => setDialog({})}>
                <Plus aria-hidden />
                {t("new")}
              </Button>
            </>
          )}
        </section>
      )}

      {days.map((day) => (
        <section key={day.date} className="grid gap-3">
          <h2 className="text-sm font-bold text-muted-foreground">{dayLabel(day.date)}</h2>
          <ul className="grid gap-3">
            {day.items.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                account={accountById.get(tx.accountId)}
                toAccount={tx.toAccountId ? accountById.get(tx.toAccountId) : undefined}
                category={tx.categoryId ? categoryById.get(tx.categoryId) : undefined}
                onEdit={() => setDialog({ transaction: tx })}
                onDelete={() => setDeleting(tx)}
              />
            ))}
          </ul>
        </section>
      ))}

      {hasNextPage && (
        <Button
          variant="outline"
          className="justify-self-center"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? t("loadingMore") : t("loadMore")}
        </Button>
      )}

      <TransactionDialog
        open={dialog !== null}
        transaction={dialog?.transaction}
        accounts={accounts}
        categories={categories}
        defaultType={type ?? "expense"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <DeleteTransactionDialog
        transaction={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
