"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Label } from "@/components/ui/label";
import { useMe } from "@/features/auth/use-auth";
import type { UpdateProfileInput } from "@lifeos/shared";
import { useUpdateProfile } from "./use-update-profile";

const CURRENCIES = ["MAD", "EUR", "USD", "GBP", "AED", "SAR", "CAD"] as const;

export function PreferencesForm() {
  const t = useTranslations("Settings");
  const tLang = useTranslations("Language");
  const locale = useLocale();
  const { data: user } = useMe();
  const update = useUpdateProfile();
  const names = new Intl.DisplayNames(locale, { type: "currency" });

  function save(input: UpdateProfileInput) {
    update.mutate(input, {
      onSuccess: () => toast.success(t("saved")),
      onError: () => toast.error(t("saveError")),
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="text-sm font-bold">{tLang("label")}</p>
        <LanguageSwitcher onChange={(l) => save({ locale: l })} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="currency">{t("currency")}</Label>
        <select
          id="currency"
          value={user?.currency ?? "MAD"}
          disabled={update.isPending}
          onChange={(e) => save({ currency: e.target.value })}
          className="h-11 w-full rounded-xl border-2 border-input bg-muted px-4 text-base font-bold outline-none focus-visible:border-ring focus-visible:bg-background disabled:opacity-50"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c} · {names.of(c)}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">{t("currencyHint")}</p>
      </div>
    </div>
  );
}
