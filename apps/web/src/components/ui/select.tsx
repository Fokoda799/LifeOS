"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  /** Smaller second line, for example "Cash · MAD". */
  description?: string;
  /** Shown before the label in the list and in the closed field. */
  icon?: React.ReactNode;
};

/**
 * The app's dropdown. Use it instead of a native <select> so every list looks the same,
 * can show icons, and follows the theme and text direction. Radix Select doesn't allow an
 * empty-string option, so "no choice" is the placeholder: pass value="" to show it.
 */
export function OptionSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  invalid,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border-2 border-input bg-muted px-3 text-start text-base font-bold text-foreground transition-colors outline-none",
          "data-[placeholder]:font-normal data-[placeholder]:text-muted-foreground",
          "focus-visible:border-ring focus-visible:bg-background data-[state=open]:border-ring data-[state=open]:bg-background",
          "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selected && (
            <span className="flex min-w-0 items-center gap-2">
              {selected.icon}
              <span dir="auto" className="truncate">
                {selected.label}
              </span>
              {selected.description && (
                <span className="truncate text-sm font-normal text-muted-foreground">
                  {selected.description}
                </span>
              )}
            </span>
          )}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) overflow-hidden rounded-2xl border-2 border-border bg-popover text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport className="max-h-72 p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent"
              >
                {option.icon}
                <span className="grid min-w-0 flex-1">
                  <SelectPrimitive.ItemText>
                    <span dir="auto" className="truncate">
                      {option.label}
                    </span>
                  </SelectPrimitive.ItemText>
                  {option.description && (
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
                <SelectPrimitive.ItemIndicator>
                  <CheckIcon aria-hidden className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
