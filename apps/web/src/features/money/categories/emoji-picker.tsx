"use client";

import { useMemo, useState } from "react";
import { EmojiPicker as Picker, defaultEmojiDataResolver, type EmojiDataResolver } from "frimousse";
import { useLocale, useTranslations } from "next-intl";

// Emojis you don't want to display.
const EXCLUDED_EMOJIS = new Set([
  "🤑",
  "💩",
  "👻",
  // Add more emojis here.
]);

// Emojibase category indexes.
// Index 2 is the component group, not a normal emoji collection.
const CATEGORIES = [
  { id: 0, icon: "😀", labels: ["Smileys", "Émoticônes", "الوجوه"] },
  { id: 1, icon: "👋", labels: ["People", "Personnes", "الأشخاص"] },
  { id: 3, icon: "🐻", labels: ["Animals", "Animaux", "الحيوانات"] },
  { id: 4, icon: "🍔", labels: ["Food", "Nourriture", "الطعام"] },
  { id: 5, icon: "🚗", labels: ["Travel", "Voyage", "السفر"] },
  { id: 6, icon: "⚽", labels: ["Activities", "Activités", "الأنشطة"] },
  { id: 7, icon: "💡", labels: ["Objects", "Objets", "الأشياء"] },
  { id: 8, icon: "❤️", labels: ["Symbols", "Symboles", "الرموز"] },
  { id: 9, icon: "🏳️", labels: ["Flags", "Drapeaux", "الأعلام"] },
] as const;

const ALL_LABELS = ["All", "Tout", "الكل"];

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const t = useTranslations("Money.categories");
  const locale = useLocale();

  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Filter the original Frimousse dataset.
  const resolver = useMemo<EmojiDataResolver>(
    () => async (requestedLocale, options) => {
      const data = await defaultEmojiDataResolver(requestedLocale, options);

      return {
        ...data,
        emojis: data.emojis.filter(
          (emoji) =>
            !EXCLUDED_EMOJIS.has(emoji.emoji) &&
            (activeCategory === null || emoji.category === activeCategory),
        ),
        categories: data.categories.filter(
          (category) => activeCategory === null || category.index === activeCategory,
        ),
      };
    },
    [activeCategory],
  );

  const languageIndex = locale === "fr" ? 1 : locale === "ar" ? 2 : 0;

  return (
    <Picker.Root
      key={`${locale}-${activeCategory ?? "all"}`}
      locale={locale === "fr" ? "fr" : "en"}
      columns={8}
      resolveEmojiData={resolver}
      onEmojiSelect={({ emoji }) => onSelect(emoji)}
      onKeyDownCapture={(e) => e.key === "Enter" && e.preventDefault()}
      className="
        flex h-90 w-full min-w-0 flex-col
        overflow-hidden rounded-2xl
        border border-border bg-card
      "
    >
      {/* Category tabs */}
      <div
        role="tablist"
        className="
          flex shrink-0 gap-1 overflow-x-auto
          border-b border-border p-2
          scrollbar-none
          [&::-webkit-scrollbar]:hidden
        "
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === null}
          onClick={() => setActiveCategory(null)}
          className={`flex min-w-10 flex-col items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
            activeCategory === null
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="text-lg">✨</span>
          {ALL_LABELS[languageIndex]}
        </button>

        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            title={category.labels[languageIndex]}
            className={`
              flex shrink-0 min-w-14.5 flex-col
              items-center justify-center gap-1
              rounded-xl px-2 py-2 text-xs
              transition-colors
              ${
                activeCategory === category.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            {category.labels[languageIndex]}
          </button>
        ))}
      </div>

      {/* Search */}
      <Picker.Search
        autoFocus
        aria-label={t("emojiSearch")}
        placeholder={t("emojiSearch")}
        className="m-2 h-10 shrink-0 rounded-xl border-2 border-input bg-muted px-3 text-sm outline-none focus-visible:border-ring focus-visible:bg-background"
      />

      {/* Emoji collection */}
      <Picker.Viewport
        className="
          min-h-0 min-w-0 flex-1
          overflow-x-hidden overflow-y-auto
          overscroll-contain outline-none
        "
      >
        <Picker.Loading className="grid h-full place-items-center text-sm text-muted-foreground">
          {t("emojiLoading")}
        </Picker.Loading>

        <Picker.Empty className="grid h-full place-items-center text-sm text-muted-foreground">
          {t("emojiEmpty")}
        </Picker.Empty>

        <Picker.List
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                {...props}
                className="bg-card px-3 pt-3 pb-1.5 text-xs font-bold text-muted-foreground"
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div {...props} className="grid grid-cols-8 gap-1 px-2 py-1">
                {children}
              </div>
            ),

            Emoji: ({ emoji, ...props }) => (
              <button
                {...props}
                type="button"
                title={emoji.label}
                className="
                  flex aspect-square w-full min-w-0
                  items-center justify-center
                  rounded-lg text-xl
                  transition-colors
                  hover:bg-muted
                  data-active:bg-accent
                "
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </Picker.Viewport>
    </Picker.Root>
  );
}
