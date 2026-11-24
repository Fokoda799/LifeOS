import {
  Banknote,
  CreditCard,
  Landmark,
  PiggyBank,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@lifeos/shared";

export const accountTypeIcons: Record<AccountType, LucideIcon> = {
  cash: Banknote,
  bank: Landmark,
  savings: PiggyBank,
  credit_card: CreditCard,
  e_wallet: Smartphone,
};
