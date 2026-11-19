"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "system", Icon: Monitor },
] as const;

const subscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Theme");
  // false on the server and during hydration, true afterwards: avoids a mismatch.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const activeIndex = mounted ? options.findIndex((o) => o.value === theme) : -1;

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      className="relative inline-flex items-center rounded-full border-2 border-border bg-muted p-1"
    >
      {/* Sliding thumb. Only rendered once the theme is known, so it never animates in from the wrong spot. */}
      {activeIndex >= 0 && (
        <span
          aria-hidden
          style={{ "--i": activeIndex } as React.CSSProperties}
          className={cn(
            "absolute start-1 top-1 size-9 rounded-full bg-primary",
            "translate-x-[calc(var(--i)*100%)] rtl:-translate-x-[calc(var(--i)*100%)]",
            "transition-transform duration-200 ease-out motion-reduce:transition-none",
          )}
        />
      )}
      {options.map(({ value, Icon }, i) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={i === activeIndex}
          aria-label={t(value)}
          title={t(value)}
          onClick={() => setTheme(value)}
          className={cn(
            "relative z-10 inline-flex size-9 items-center justify-center rounded-full transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            i === activeIndex
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
