"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtl } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { previews } from "./previews";
import { tools } from "./registry";

const INTERVAL_MS = 6000;

function subscribeMotion(cb: () => void) {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ToolShowcase() {
  const t = useTranslations("Tools");
  const locale = useLocale();
  // Server snapshot is "reduced" so nothing autoplays before hydration.
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => true);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const playing = !reduced && !interacting && !userPaused;

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % tools.length), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [playing, index]);

  const tool = tools[index];
  const Icon = tool.icon;
  const Preview = previews[tool.id];

  function onKeyDown(e: React.KeyboardEvent) {
    const rtl = isRtl(locale);
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const delta = e.key === forward ? 1 : e.key === back ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + tools.length) % tools.length;
    setIndex(next);
    tabs.current[next]?.focus();
  }

  return (
    <aside
      aria-label={t("label")}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
      className="relative hidden overflow-hidden lg:order-first rounded-3xl bg-primary p-10 text-primary-foreground lg:sticky lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)] lg:flex-col lg:justify-between"
    >
      {/* Flat decorative circles that take the active tool's accent. */}
      <div data-tool={tool.id} aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -end-20 -top-20 size-72 rounded-full bg-primary opacity-90 transition-colors duration-500" />
        <span className="absolute -bottom-16 -start-16 size-56 rounded-full bg-primary opacity-60 transition-colors duration-500" />
      </div>

      <h2 className="relative text-3xl leading-tight">{t("heading")}</h2>

      <div data-tool={tool.id} className="relative">
        <article
          key={tool.id}
          id="tool-panel"
          role="tabpanel"
          aria-labelledby={`tool-tab-${tool.id}`}
          className={cn(
            "grid gap-5 rounded-3xl border-2 border-border bg-card p-6 text-card-foreground",
            "shadow-[0_6px_0_0_var(--primary-edge)]",
            "animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none",
          )}
        >
          <header className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Icon aria-hidden className="size-6" />
            </span>
            <div>
              <h3 className="text-xl">{t(`${tool.id}.name`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`${tool.id}.tagline`)}</p>
            </div>
            {tool.status === "soon" && (
              <span className="ms-auto rounded-full border-2 border-border px-3 py-1 text-xs font-bold text-muted-foreground">
                {t("soon")}
              </span>
            )}
          </header>
          <Preview />
        </article>
      </div>

      <div className="relative flex items-center gap-2">
        <div
          role="tablist"
          aria-label={t("label")}
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-2"
        >
          {tools.map((item, i) => {
            const ItemIcon = item.icon;
            const selected = i === index;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tool-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="tool-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground",
                  selected
                    ? "border-primary-foreground bg-primary-foreground text-primary"
                    : "border-primary-foreground/40 hover:border-primary-foreground",
                )}
              >
                <ItemIcon aria-hidden className="size-4" />
                {t(`${item.id}.name`)}
              </button>
            );
          })}
        </div>
        {!reduced && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? t("play") : t("pause")}
            className="ms-auto grid size-10 place-items-center rounded-full border-2 border-primary-foreground/40 hover:border-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
          >
            {userPaused ? (
              <Play aria-hidden className="size-4" />
            ) : (
              <Pause aria-hidden className="size-4" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
