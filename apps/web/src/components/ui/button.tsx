import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

// The "lip": a flat darker edge under the button that it sinks into when pressed.
const chunky =
  "shadow-[0_4px_0_0_var(--btn-edge)] active:translate-y-1 active:shadow-none motion-reduce:transition-none";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold outline-none select-none transition-[transform,box-shadow,filter] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground [--btn-edge:var(--primary-edge)] hover:brightness-105 ${chunky}`,
        destructive: `bg-destructive text-destructive-foreground [--btn-edge:var(--destructive-edge)] hover:brightness-105 ${chunky}`,
        outline: `border-2 border-border bg-card text-foreground [--btn-edge:var(--border)] hover:bg-muted ${chunky}`,
        secondary: `bg-muted text-foreground [--btn-edge:var(--border)] hover:brightness-95 ${chunky}`,
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs",
        sm: "h-9 gap-1.5 rounded-lg px-3.5",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
