"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Label } from "@/components/ui/label";
import { OptionSelect } from "@/components/ui/select";
import { useMe } from "@/features/auth/use-auth";
import type { UpdateProfileInput } from "@lifeos/shared";
import { useUpdateProfile } from "./use-update-profile";
import { CURRENCIES } from "@/lib/currencies";

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
        <OptionSelect
          id="currency"
          value={user?.currency ?? "MAD"}
          disabled={update.isPending}
          onValueChange={(currency) => save({ currency })}
          options={CURRENCIES.map((c) => ({ value: c, label: c, description: names.of(c) }))}
        />
        <p className="text-sm text-muted-foreground">{t("currencyHint")}</p>
      </div>
    </div>
  );
}
