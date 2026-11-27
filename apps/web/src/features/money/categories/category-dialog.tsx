"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  MAX_CATEGORIES_PER_USER,
  categoryColorSchema,
  categoryIconSchema,
  categoryKindSchema,
  type Category,
  type CategoryKind,
} from "@lifeos/shared";
import { Smile } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { validationKey } from "@/features/auth/errors";
import { FormField } from "@/features/auth/form-field";
import { ApiRequestError } from "@/lib/api";
import { categoryColorClasses, categoryIcons, isIconKey } from "./category-style";
import { EmojiPicker } from "./emoji-picker";
import { useCategoryName, useCreateCategory, useUpdateCategory } from "./use-categories";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  kind: categoryKindSchema,
  icon: categoryIconSchema,
  color: categoryColorSchema,
});
type Values = z.infer<typeof schema>;

const selected = "border-primary bg-primary/10 text-primary";

const choice =
  "flex items-center justify-center rounded-xl border-2 border-border transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary";

export function CategoryDialog({
  open,
  category,
  defaultKind,
  onOpenChange,
}: {
  open: boolean;
  /** Present when editing, absent when creating. */
  category?: Category;
  /** The kind pre-selected when creating. */
  defaultKind: CategoryKind;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Money.categories");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialogs render in a portal, so data-tool has to be repeated here. */}
      <DialogContent
        data-tool="money"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg custom-scrollbar"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {category ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          defaultKind={defaultKind}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  defaultKind,
  onDone,
}: {
  category?: Category;
  defaultKind: CategoryKind;
  onDone: () => void;
}) {
  const t = useTranslations("Money.categories");
  const tv = useTranslations("Validation");
  const nameOf = useCategoryName();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const pending = create.isPending || update.isPending;

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category ? nameOf(category) : "",
      kind: category?.kind ?? defaultKind,
      icon: category?.icon ?? "tag",
      color: category?.color ?? "teal",
    },
  });

  const nameKey = validationKey(errors.name);
  const icon = useWatch({ control, name: "icon" });
  const [pickerOpen, setPickerOpen] = useState(false);

  function pickIcon(value: string) {
    setValue("icon", value, { shouldDirty: true });
  }

  const onSubmit = handleSubmit((values) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(t(category ? "toastSaved" : "toastCreated"));
        onDone();
      },
      onError: (error: Error) =>
        toast.error(
          error instanceof ApiRequestError && error.status === 409
            ? t("errorLimit", { max: MAX_CATEGORIES_PER_USER })
            : t("errorSave"),
        ),
    };
    if (category) {
      // Typing a default's own name back in resets it to the translated default.
      const isDefaultName =
        category.systemKey !== null &&
        values.name === nameOf({ name: null, systemKey: category.systemKey });
      update.mutate(
        {
          id: category.id,
          input: {
            name: isDefaultName ? null : values.name,
            icon: values.icon,
            color: values.color,
          },
        },
        callbacks,
      );
    } else {
      create.mutate(values, callbacks);
    }
  });

  return (
    <form noValidate className="grid gap-5" onSubmit={onSubmit}>
      <FormField
        id="name"
        label={t("name")}
        dir="auto"
        autoFocus
        autoComplete="off"
        placeholder={t("namePlaceholder")}
        error={nameKey && tv(nameKey)}
        {...register("name")}
      />

      {category ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{t(`kinds.${category.kind}`)}</span>
          {" · "}
          {t("typeLocked")}
        </p>
      ) : (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-bold">{t("type")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {categoryKindSchema.options.map((value) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" value={value} className="peer sr-only" {...register("kind")} />
                <span
                  className={cn(
                    `${choice} p-3 text-sm font-bold`,
                    value === "income"
                      ? "peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary"
                      : "peer-checked:border-destructive peer-checked:bg-destructive/10 peer-checked:text-destructive",
                  )}
                >
                  {t(`kinds.${value}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-sm font-bold">{t("icon")}</legend>
        <div className="grid grid-cols-6 gap-2">
          {CATEGORY_ICONS.map((value) => {
            const Icon = categoryIcons[value];
            return (
              <button
                key={value}
                type="button"
                aria-pressed={icon === value}
                onClick={() => pickIcon(value)}
                className={`${choice} aspect-square ${icon === value ? selected : ""}`}
              >
                <Icon aria-hidden className="size-5" />
                <span className="sr-only">{t(`icons.${value}`)}</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm font-bold text-muted-foreground">{t("emojiTitle")}</p>
        <Button
          type="button"
          variant="outline"
          aria-expanded={pickerOpen}
          onClick={() => setPickerOpen((open) => !open)}
          className="justify-start"
        >
          {isIconKey(icon) ? (
            <Smile aria-hidden />
          ) : (
            <span aria-hidden className="text-xl leading-none">
              {icon}
            </span>
          )}
          {isIconKey(icon) ? t("emojiChoose") : t("emojiChange")}
        </Button>
        {pickerOpen && (
          <EmojiPicker
            onSelect={(emoji) => {
              pickIcon(emoji);
              setPickerOpen(false);
            }}
          />
        )}
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-bold">{t("color")}</legend>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_COLORS.map((value) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" value={value} className="peer sr-only" {...register("color")} />
              <span
                className={`${choice} size-9 rounded-full peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2 peer-checked:ring-offset-background`}
              >
                <span className={`size-6 rounded-full ${categoryColorClasses[value].swatch}`} />
                <span className="sr-only">{t(`colors.${value}`)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {category ? (pending ? t("saving") : t("save")) : pending ? t("creating") : t("create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
