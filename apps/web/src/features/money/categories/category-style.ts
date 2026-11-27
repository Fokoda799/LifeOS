import {
  Baby,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  PawPrint,
  Plane,
  Receipt,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CategoryColor, CategoryIconKey } from "@lifeos/shared";

/** The API stores icon and color as keys. This is where they become pixels. */
export const categoryIcons: Record<CategoryIconKey, LucideIcon> = {
  cart: ShoppingCart,
  food: Utensils,
  car: Car,
  home: House,
  receipt: Receipt,
  health: HeartPulse,
  education: GraduationCap,
  bag: ShoppingBag,
  game: Gamepad2,
  plane: Plane,
  family: Users,
  tag: Tag,
  briefcase: Briefcase,
  laptop: Laptop,
  trend: TrendingUp,
  gift: Gift,
  wallet: Wallet,
  fuel: Fuel,
  phone: Smartphone,
  shirt: Shirt,
  fitness: Dumbbell,
  baby: Baby,
  pet: PawPrint,
  coffee: Coffee,
};

export function isIconKey(icon: string): icon is CategoryIconKey {
  return icon in categoryIcons;
}

// Full class names on purpose: Tailwind only generates classes it can see in the source.
export const categoryColorClasses: Record<CategoryColor, { tint: string; swatch: string }> = {
  teal: { tint: "bg-cat-teal/15 text-cat-teal", swatch: "bg-cat-teal" },
  blue: { tint: "bg-cat-blue/15 text-cat-blue", swatch: "bg-cat-blue" },
  indigo: { tint: "bg-cat-indigo/15 text-cat-indigo", swatch: "bg-cat-indigo" },
  purple: { tint: "bg-cat-purple/15 text-cat-purple", swatch: "bg-cat-purple" },
  pink: { tint: "bg-cat-pink/15 text-cat-pink", swatch: "bg-cat-pink" },
  red: { tint: "bg-cat-red/15 text-cat-red", swatch: "bg-cat-red" },
  orange: { tint: "bg-cat-orange/15 text-cat-orange", swatch: "bg-cat-orange" },
  amber: { tint: "bg-cat-amber/15 text-cat-amber", swatch: "bg-cat-amber" },
  green: { tint: "bg-cat-green/15 text-cat-green", swatch: "bg-cat-green" },
  slate: { tint: "bg-cat-slate/15 text-cat-slate", swatch: "bg-cat-slate" },
};
