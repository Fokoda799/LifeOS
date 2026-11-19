import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const ta = await getTranslations("Auth");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">{ta("signIn")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">{ta("signUp")}</Link>
        </Button>
      </div>
    </main>
  );
}
