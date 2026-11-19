"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Language names are shown in their own language on purpose.
export const NAMES: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export function LanguageSwitcher({
  onChange,
}: {
  onChange?: (locale: (typeof routing.locales)[number]) => void;
}) {
  const t = useTranslations("Language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="radiogroup" aria-label={t("label")} className="flex gap-2">
      {routing.locales.map((l) => (
        <Button
          key={l}
          type="button"
          role="radio"
          aria-checked={l === locale}
          lang={l}
          size="sm"
          variant={l === locale ? "default" : "outline"}
          onClick={() => {
            onChange?.(l);
            router.replace(pathname, { locale: l });
          }}
        >
          {NAMES[l]}
        </Button>
      ))}
    </div>
  );
}
