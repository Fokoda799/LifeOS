"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  TRANSACTION_TYPES,
  minorToInput,
  parseAmount,
  transactionDateSchema,
  transactionTypeSchema,
  type Account,
  type Category,
  type Transaction,
  type TransactionType,
} from "@lifeos/shared";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validationKey } from "@/features/auth/errors";
import { AccountSelect } from "@/features/money/accounts/account-select";
import { CategoryBadge } from "@/features/money/categories/category-badge";
import { useCategoryName } from "@/features/money/categories/use-categories";
import { ApiRequestError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCreateTransaction, useUpdateTransaction } from "./use-transactions";

const schema = z.object({
  type: transactionTypeSchema,
  amount: z.string(),
  accountId: z.string().min(1),
  toAccountId: z.string(),
  categoryId: z.string(),
  date: transactionDateSchema,
  note: z.string().trim().max(200),
});
type Values = z.infer<typeof schema>;

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function TransactionDialog({
  open,
  transaction,
  accounts,
  categories,
  defaultType,
  onOpenChange,
}: {
  open: boolean;
  /** Present when editing, absent when creating. */
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  defaultType: TransactionType;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Money.transactions");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialogs render in a portal, so data-tool has to be repeated here. */}
      <DialogContent
        data-tool="money"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg custom-scrollbar"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {transaction ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          defaultType={defaultType}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  transaction,
  accounts,
  categories,
  defaultType,
  onDone,
}: {
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  defaultType: TransactionType;
  onDone: () => void;
}) {
  const t = useTranslations("Money.transactions");
  const tv = useTranslations("Validation");
  const nameOf = useCategoryName();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const pending = create.isPending || update.isPending;

  // An existing transaction keeps its account or category even if archived since.
  const usableAccounts = accounts.filter(
    (a) =>
      a.archivedAt === null || a.id === transaction?.accountId || a.id === transaction?.toAccountId,
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction?.type ?? defaultType,
      amount: transaction ? minorToInput(transaction.amount, transaction.currency) : "",
      accountId: transaction?.accountId ?? usableAccounts[0]?.id ?? "",
      toAccountId: transaction?.toAccountId ?? "",
      categoryId: transaction?.categoryId ?? "",
      date: transaction?.date ?? today(),
      note: transaction?.note ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const accountId = useWatch({ control, name: "accountId" });
  const toAccountId = useWatch({ control, name: "toAccountId" });
  const categoryId = useWatch({ control, name: "categoryId" });

  const account = accounts.find((a) => a.id === accountId);
  const isTransfer = type === "transfer";

  // A transfer goes to another account in the same currency.
  const toOptions = usableAccounts.filter(
    (a) => a.id !== accountId && a.currency === account?.currency,
  );
  const toValid = toOptions.some((a) => a.id === toAccountId);
  useEffect(() => {
    if (toAccountId && !toValid) setValue("toAccountId", "");
  }, [toAccountId, toValid, setValue]);

  const categoryOptions = categories.filter(
    (c) => c.kind === type && (c.archivedAt === null || c.id === transaction?.categoryId),
  );
  const categoryValid = categoryOptions.some((c) => c.id === categoryId);
  useEffect(() => {
    if (categoryId && !categoryValid) setValue("categoryId", "");
  }, [categoryId, categoryValid, setValue]);

  const dateKey = validationKey(errors.date);
  const noteKey = validationKey(errors.note);

  const onSubmit = handleSubmit((values) => {
    const minor = parseAmount(values.amount.trim(), account?.currency ?? "MAD");
    if (minor === null || minor === "0") {
      setError("amount", { type: "amount" });
      return;
    }
    if (values.type === "transfer" && !values.toAccountId) {
      setError("toAccountId", { type: "required" });
      return;
    }
    if (values.type !== "transfer" && !values.categoryId) {
      setError("categoryId", { type: "required" });
      return;
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(t(transaction ? "toastSaved" : "toastCreated"));
        onDone();
      },
      onError: (error: Error) =>
        toast.error(
          error instanceof ApiRequestError && error.status === 409
            ? t("errorArchived")
            : t("errorSave"),
        ),
    };

    if (transaction) {
      update.mutate(
        {
          id: transaction.id,
          input: {
            amount: minor,
            accountId: values.accountId,
            date: values.date,
            note: values.note || null,
            ...(values.type === "transfer"
              ? { toAccountId: values.toAccountId }
              : { categoryId: values.categoryId }),
          },
        },
        callbacks,
      );
    } else if (values.type === "transfer") {
      create.mutate(
        {
          type: "transfer",
          amount: minor,
          accountId: values.accountId,
          toAccountId: values.toAccountId,
          date: values.date,
          note: values.note || undefined,
        },
        callbacks,
      );
    } else {
      create.mutate(
        {
          type: values.type,
          amount: minor,
          accountId: values.accountId,
          categoryId: values.categoryId,
          date: values.date,
          note: values.note || undefined,
        },
        callbacks,
      );
    }
  });

  return (
    <form noValidate className="grid gap-5" onSubmit={onSubmit}>
      {transaction ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{t(`types.${transaction.type}`)}</span>
          {" · "}
          {t("typeLocked")}
        </p>
      ) : (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-bold">{t("type")}</legend>
          <div className="grid grid-cols-3 gap-2">
            {TRANSACTION_TYPES.map((value) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" value={value} className="peer sr-only" {...register("type")} />
                <span className="flex items-center justify-center rounded-xl border-2 border-border p-3 text-sm font-bold transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                  {t(`types.${value}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid gap-2">
        <Label htmlFor="amount">
          {t("amount")}
          {account && <bdi dir="ltr"> ({account.currency})</bdi>}
        </Label>
        <Input
          id="amount"
          dir="ltr"
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          placeholder="0.00"
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? "amount-error" : undefined}
          {...register("amount")}
        />
        {errors.amount && (
          <p id="amount-error" role="alert" className="text-sm text-destructive">
            {tv("amount")}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="accountId">{isTransfer ? t("fromAccount") : t("account")}</Label>
        <AccountSelect
          id="accountId"
          accounts={usableAccounts}
          value={accountId}
          onValueChange={(id) => setValue("accountId", id, { shouldValidate: true })}
        />
      </div>

      {isTransfer ? (
        <div className="grid gap-2">
          <Label htmlFor="toAccountId">{t("toAccount")}</Label>
          <AccountSelect
            id="toAccountId"
            accounts={toOptions}
            value={toAccountId}
            placeholder={t("chooseAccount")}
            invalid={!!errors.toAccountId}
            onValueChange={(id) => setValue("toAccountId", id, { shouldValidate: true })}
          />
          {toOptions.length === 0 && account && (
            <p className="text-sm text-muted-foreground">
              {t("noMatchingAccount", { currency: account.currency })}
            </p>
          )}
          {errors.toAccountId && (
            <p role="alert" className="text-sm text-destructive">
              {tv("required")}
            </p>
          )}
        </div>
      ) : (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-bold">{t("category")}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categoryOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={categoryId === c.id}
                onClick={() => setValue("categoryId", c.id, { shouldValidate: true })}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 border-border p-2 text-start text-sm font-bold transition-colors",
                  categoryId === c.id && "border-primary bg-primary/10",
                )}
              >
                <CategoryBadge icon={c.icon} color={c.color} className="size-8 rounded-xl" />
                <span dir="auto" className="min-w-0 truncate">
                  {nameOf(c)}
                </span>
              </button>
            ))}
          </div>
          {errors.categoryId && (
            <p role="alert" className="text-sm text-destructive">
              {tv("required")}
            </p>
          )}
        </fieldset>
      )}

      <div className="grid gap-2">
        <Label htmlFor="date">{t("date")}</Label>
        <Input id="date" type="date" dir="ltr" aria-invalid={!!errors.date} {...register("date")} />
        {dateKey && (
          <p role="alert" className="text-sm text-destructive">
            {tv(dateKey)}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">{t("note")}</Label>
        <Input
          id="note"
          dir="auto"
          autoComplete="off"
          maxLength={200}
          placeholder={t("notePlaceholder")}
          aria-invalid={!!errors.note}
          {...register("note")}
        />
        {noteKey && (
          <p role="alert" className="text-sm text-destructive">
            {tv(noteKey)}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {transaction
            ? pending
              ? t("saving")
              : t("save")
            : pending
              ? t("creating")
              : t("create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
