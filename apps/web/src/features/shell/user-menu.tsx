"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useLocale, useTranslations, type Locale } from "next-intl";
import { useTheme } from "next-themes";
import { NAMES } from "@/components/language-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useMe } from "@/features/auth/use-auth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const ts = useTranslations("Shell");
  const tTheme = useTranslations("Theme");
  const tLang = useTranslations("Language");
  const tAuth = useTranslations("Auth");
  const { data: user } = useMe();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const display = user?.name ?? user?.email;
  const initial = (display ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ts("userMenu")}
          title={collapsed ? display : undefined}
          className={cn(
            "rounded-2xl border-2 border-transparent transition-colors hover:bg-muted data-[state=open]:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            collapsed
              ? "mx-auto grid size-12 place-items-center"
              : "flex w-full items-center gap-3 p-2 text-start",
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-primary-foreground">
            {initial}
          </span>
          {!collapsed && (
            <>
              <span className="grid min-w-0 flex-1">
                <span dir="auto" className="truncate font-bold">
                  {display}
                </span>
                {user?.name && (
                  <span className="truncate text-xs text-muted-foreground">
                    <bdi dir="ltr">{user.email}</bdi>
                  </span>
                )}
              </span>
              <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="max-h-(--radix-dropdown-menu-content-available-height) min-w-60 overflow-y-auto"
      >
        <DropdownMenuLabel className="grid gap-0.5 font-normal">
          <span dir="auto" className="truncate font-bold">
            {display}
          </span>
          {user?.name && (
            <span className="truncate text-xs text-muted-foreground">
              <bdi dir="ltr">{user.email}</bdi>
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {tTheme("label")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {(["light", "dark", "system"] as const).map((v) => (
            <DropdownMenuRadioItem key={v} value={v}>
              {tTheme(v)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {tLang("label")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(l) => router.replace(pathname, { locale: l as Locale })}
        >
          {routing.locales.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l}>
              {NAMES[l]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()}>
          <LogOut aria-hidden />
          {tAuth("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
