"use client";

import { sumByCurrency, type Account } from "@lifeos/shared";
import { Plus, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountCard } from "./account-card";
import { AccountDialog } from "./account-dialog";
import { Amount } from "../shared/amount";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { useAccounts, useUpdateAccount } from "./use-accounts";

export function AccountsView() {
  const t = useTranslations("Money.accounts");
  const tc = useTranslations("Common");
  const { data, isPending, isError, refetch } = useAccounts();
  const update = useUpdateAccount();
  // null = closed, {} = create, { account } = edit
  const [dialog, setDialog] = useState<{ account?: Account } | null>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);

  const accounts = data?.accounts ?? [];
  const active = accounts.filter((a) => a.archivedAt === null);
  const archived = accounts.filter((a) => a.archivedAt !== null);

  function toggleArchive(account: Account) {
    const archiving = account.archivedAt === null;
    update.mutate(
      { id: account.id, input: { archived: archiving } },
      {
        onSuccess: () =>
          toast.success(t(archiving ? "toastArchived" : "toastRestored", { name: account.name })),
        onError: () => toast.error(t("errorSave")),
      },
    );
  }

  const card = (account: Account) => (
    <AccountCard
      key={account.id}
      account={account}
      onEdit={() => setDialog({ account })}
      onToggleArchive={() => toggleArchive(account)}
      onDelete={() => setDeleting(account)}
    />
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-muted-foreground">{t("description")}</p>
        <Button onClick={() => setDialog({})}>
          <Plus aria-hidden />
          {t("new")}
        </Button>
      </div>

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

      {data && accounts.length === 0 && (
        <section className="grid justify-items-start gap-3 rounded-3xl border-2 border-dashed border-border bg-card p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wallet aria-hidden className="size-6" />
          </span>
          <h2 className="text-xl">{t("emptyTitle")}</h2>
          <p className="text-muted-foreground">{t("emptyDescription")}</p>
          <Button onClick={() => setDialog({})}>
            <Plus aria-hidden />
            {t("new")}
          </Button>
        </section>
      )}

      {active.length > 0 && (
        <>
          <section
            aria-label={t("totalBalance")}
            className="grid gap-2 rounded-3xl border-2 border-border bg-card p-5"
          >
            <p className="text-sm font-bold text-muted-foreground">{t("totalBalance")}</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {sumByCurrency(active.map((a) => ({ currency: a.currency, amount: a.balance }))).map(
                ({ currency, total }) => (
                  <p
                    key={currency}
                    className={
                      total.startsWith("-")
                        ? "text-3xl font-extrabold text-destructive"
                        : "text-3xl font-extrabold"
                    }
                  >
                    <Amount minor={total} currency={currency} />
                  </p>
                ),
              )}
            </div>
          </section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{active.map(card)}</div>
        </>
      )}

      {archived.length > 0 && (
        <details className="grid gap-4">
          <summary className="cursor-pointer text-sm font-bold text-muted-foreground">
            {t("archived", { count: archived.length })}
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{archived.map(card)}</div>
        </details>
      )}

      <AccountDialog
        open={dialog !== null}
        account={dialog?.account}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <DeleteAccountDialog account={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </div>
  );
}
