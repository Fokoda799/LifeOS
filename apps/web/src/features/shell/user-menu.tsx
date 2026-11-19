"use client";

import { LogOut, Settings } from "lucide-react";
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
import { UpdateProfileInput } from "@lifeos/shared";
import { useUpdateProfile } from "../settings/use-update-profile";

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const ts = useTranslations("Shell");
  const tTheme = useTranslations("Theme");
  const tLang = useTranslations("Language");
  const tSettings = useTranslations("Settings");
  const tAuth = useTranslations("Auth");
  const { data: user } = useMe();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const display = user?.name ?? user?.email;
  const initial = (display ?? "?").charAt(0).toUpperCase();

  const update = useUpdateProfile();

  function save(input: UpdateProfileInput) {
    update.mutate(input);
  }

  return (
    <div className={cn("flex items-center", !collapsed && "gap-1")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={ts("userMenu")}
            title={collapsed ? display : undefined}
            className={cn(
              "min-w-0 rounded-2xl border-2 border-transparent transition-colors hover:bg-muted data-[state=open]:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              collapsed
                ? "mx-auto grid size-12 place-items-center"
                : "flex flex-1 items-center gap-3 p-2 text-start",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-primary-foreground">
              {initial}
            </span>
            {!collapsed && (
              <span className="grid min-w-0 flex-1 text-start">
                <span className="truncate font-bold">{display}</span>
                {user?.name && (
                  <span className="truncate text-xs text-muted-foreground">
                    <bdi dir="ltr">{user.email}</bdi>
                  </span>
                )}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          className="max-h-(--radix-dropdown-menu-content-available-height) min-w-60 overflow-y-auto"
        >
          <DropdownMenuLabel className="grid gap-0.5 font-normal">
            <span className="truncate font-bold">{display}</span>
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
            onValueChange={(l) => {
              router.replace(pathname, { locale: l as Locale });
              save({ locale: l as Locale });
            }}
          >
            {routing.locales.map((l) => (
              <DropdownMenuRadioItem key={l} value={l} lang={l}>
                {NAMES[l]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => logout.mutate()}
            className="text-destructive focus-visible:outline-destructive"
          >
            <LogOut aria-hidden />
            {tAuth("signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {!collapsed && (
        <button
          type="button"
          onClick={() => router.push("/settings")}
          aria-label={tSettings("title")}
          title={tSettings("title")}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Settings aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
