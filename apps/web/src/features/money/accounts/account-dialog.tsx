"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ACCOUNT_TYPES,
  accountTypeSchema,
  currencySchema,
  minorToInput,
  parseAmount,
  type Account,
} from "@lifeos/shared";
import { useLocale, useTranslations } from "next-intl";
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
import { OptionSelect } from "@/components/ui/select";
import { validationKey } from "@/features/auth/errors";
import { FormField } from "@/features/auth/form-field";
import { useMe } from "@/features/auth/use-auth";
import { CURRENCIES } from "@/lib/currencies";
import { accountTypeIcons } from "./account-types";
import { useCreateAccount, useUpdateAccount } from "./use-accounts";

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  type: accountTypeSchema,
  currency: currencySchema,
  openingBalance: z.string(),
});
type Values = z.infer<typeof schema>;

export function AccountDialog({
  open,
  account,
  onOpenChange,
}: {
  open: boolean;
  /** Present when editing, absent when creating. */
  account?: Account;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Money.accounts");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialogs render in a portal, so data-tool has to be repeated here. */}
      <DialogContent data-tool="money" className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {account ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <AccountForm account={account} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AccountForm({ account, onDone }: { account?: Account; onDone: () => void }) {
  const t = useTranslations("Money.accounts");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const { data: me } = useMe();
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const pending = create.isPending || update.isPending;

  const defaultCurrency = account?.currency ?? me?.currency ?? "MAD";
  const currencies: string[] = CURRENCIES.includes(defaultCurrency as (typeof CURRENCIES)[number])
    ? [...CURRENCIES]
    : [defaultCurrency, ...CURRENCIES];

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
      name: account?.name ?? "",
      type: account?.type ?? "cash",
      currency: defaultCurrency,
      openingBalance: account ? minorToInput(account.openingBalance, account.currency) : "",
    },
  });

  const nameKey = validationKey(errors.name);
  const currency = useWatch({ control, name: "currency" });
  const currencyNames = new Intl.DisplayNames(locale, { type: "currency" });

  const onSubmit = handleSubmit((values) => {
    const raw = values.openingBalance.trim();
    const minor = raw === "" ? "0" : parseAmount(raw, values.currency, { allowNegative: true });
    if (minor === null) {
      setError("openingBalance", { type: "amount" });
      return;
    }
    const callbacks = {
      onSuccess: () => {
        toast.success(t(account ? "toastSaved" : "toastCreated"));
        onDone();
      },
      onError: () => toast.error(t("errorSave")),
    };
    if (account) {
      update.mutate(
        { id: account.id, input: { name: values.name, type: values.type, openingBalance: minor } },
        callbacks,
      );
    } else {
      create.mutate(
        { name: values.name, type: values.type, currency: values.currency, openingBalance: minor },
        callbacks,
      );
    }
  });

  return (
    <form noValidate className="grid gap-5" onSubmit={onSubmit}>
      <FormField
        id="name"
        label={t("name")}
        dir="auto"
        autoFocus
        autoComplete="off"
        placeholder={t("namePlaceholder")}
        error={nameKey && tv(nameKey)}
        {...register("name")}
      />

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-bold">{t("type")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACCOUNT_TYPES.map((value) => {
            const Icon = accountTypeIcons[value];
            return (
              <label key={value} className="cursor-pointer">
                <input type="radio" value={value} className="peer sr-only" {...register("type")} />
                <span className="flex items-center gap-2 rounded-xl border-2 border-border p-3 text-sm font-bold transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {t(`types.${value}`)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="currency">{t("currency")}</Label>
        <OptionSelect
          id="currency"
          disabled={!!account}
          value={currency}
          onValueChange={(c) => setValue("currency", c)}
          options={currencies.map((c) => ({
            value: c,
            label: c,
            description: currencyNames.of(c),
          }))}
        />
        {account && <p className="text-sm text-muted-foreground">{t("currencyLocked")}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="openingBalance">{t("openingBalance")}</Label>
        <Input
          id="openingBalance"
          dir="ltr"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          aria-invalid={!!errors.openingBalance}
          aria-describedby="openingBalance-hint"
          {...register("openingBalance")}
        />
        {errors.openingBalance ? (
          <p id="openingBalance-hint" role="alert" className="text-sm text-destructive">
            {tv("amount")}
          </p>
        ) : (
          <p id="openingBalance-hint" className="text-sm text-muted-foreground">
            {t("openingBalanceHint")}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {account ? (pending ? t("saving") : t("save")) : pending ? t("creating") : t("create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
