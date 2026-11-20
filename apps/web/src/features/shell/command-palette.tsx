"use client";

import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations, type Locale } from "next-intl";
import { useTheme } from "next-themes";
import { NAMES } from "@/components/language-switcher";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLogout } from "@/features/auth/use-auth";
import type { ToolId } from "@/features/tools/registry";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { platformNav, toolNav, type NavItem } from "./navigation";
import { UpdateProfileInput } from "@lifeos/shared";
import { useUpdateProfile } from "../settings/use-update-profile";

const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ts = useTranslations("Shell");
  const tn = useTranslations("Nav");
  const tt = useTranslations("Tools");
  const tTheme = useTranslations("Theme");
  const tLang = useTranslations("Language");
  const tAuth = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const logout = useLogout();

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  const update = useUpdateProfile();

  function save(input: UpdateProfileInput) {
    update.mutate(input);
  }

  const destinations = [
    ...platformNav.map((item) => ({ id: `platform-${item.key}`, label: tn(item.key), item })),
    ...(Object.entries(toolNav) as [ToolId, readonly NavItem[]][]).flatMap(([toolId, items]) =>
      items.map((item) => ({
        id: `${toolId}-${item.key}`,
        label: `${tt(`${toolId}.name`)} · ${tn(item.key)}`,
        item,
      })),
    ),
  ].filter((d) => d.item.enabled);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ts("paletteTitle")}
      description={ts("paletteDescription")}
    >
      <CommandInput placeholder={ts("palettePlaceholder")} />
      <CommandList>
        <CommandEmpty>{ts("noResults")}</CommandEmpty>

        <CommandGroup heading={ts("goTo")}>
          {destinations.map(({ id, label, item }) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={id}
                value={label}
                onSelect={() => run(() => router.push(item.href))}
              >
                <Icon aria-hidden />
                {label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading={ts("preferences")}>
          {(["light", "dark", "system"] as const).map((v) => {
            const Icon = themeIcons[v];
            return (
              <CommandItem
                key={v}
                value={`${tTheme("label")} ${tTheme(v)}`}
                onSelect={() => run(() => setTheme(v))}
              >
                <Icon aria-hidden />
                {tTheme("label")}: {tTheme(v)}
              </CommandItem>
            );
          })}
          {routing.locales.map((l) => (
            <CommandItem
              key={l}
              value={`${tLang("label")} ${NAMES[l]}`}
              onSelect={() => {
                run(() => router.replace(pathname, { locale: l as Locale }));
                save;
              }}
            >
              {tLang("label")}: {NAMES[l]}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading={ts("account")}>
          <CommandItem value={tAuth("signOut")} onSelect={() => run(() => logout.mutate())}>
            <LogOut aria-hidden />
            {tAuth("signOut")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
