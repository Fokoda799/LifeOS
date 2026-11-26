import { minorUnitsSchema, type MinorUnits } from "./money";

/** Minor-unit digits of a currency from Intl: MAD 2, JPY 0, KWD 3. */
export function currencyDigits(currency: string): number {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

function normalize(input: string): string {
  return input
    .replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) & 0xf)) // Arabic-Indic digits
    .replace(/\u066b/g, ".") // Arabic decimal separator
    .replace(/\u066c/g, ",") // Arabic thousands separator
    .replace(/\s/g, ""); // spaces, NBSP, narrow NBSP
}

/**
 * Text typed by a user -> minor units ("1,500.25" MAD -> "150025"). Null if invalid.
 * The last "." or "," is the decimal point only when at most `digits` digits follow it;
 * every other separator must be a grouping separator ("1,500" is 1500).
 */
export function parseAmount(
  input: string,
  currency: string,
  options: { allowNegative?: boolean } = {},
): MinorUnits | null {
  const digits = currencyDigits(currency);
  let s = normalize(input);
  let negative = false;
  if (s.startsWith("-") || s.startsWith("\u2212")) {
    negative = true;
    s = s.slice(1);
  }
  if (negative && !options.allowNegative) return null;
  if (!/^[\d.,]+$/.test(s)) return null;

  let intPart = s;
  let fracPart = "";
  const last = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  if (last !== -1) {
    const tail = s.slice(last + 1);
    if (tail.length >= 1 && tail.length <= digits) {
      intPart = s.slice(0, last) || "0";
      fracPart = tail;
      // The decimal separator can't double as the grouping one ("1,500,25").
      if (intPart.includes(s.charAt(last))) return null;
    }
  }
  if (!/^(0|[1-9]\d*|[1-9]\d{0,2}([.,]\d{3})+)$/.test(intPart)) return null;
  if (new Set(intPart.match(/[.,]/g)).size > 1) return null;

  const value = BigInt(`${intPart.replace(/[.,]/g, "")}${fracPart.padEnd(digits, "0")}`);
  const result = (negative && value !== 0n ? -value : value).toString();
  return minorUnitsSchema.safeParse(result).success ? result : null;
}

/** Minor units -> plain editable text ("150025" MAD -> "1500.25"), no grouping. */
export function minorToInput(minor: MinorUnits, currency: string): string {
  const digits = currencyDigits(currency);
  const value = BigInt(minor);
  const negative = value < 0n;
  const abs = (negative ? -value : value).toString().padStart(digits + 1, "0");
  const intPart = digits === 0 ? abs : abs.slice(0, -digits);
  const frac = digits === 0 ? "" : abs.slice(-digits);
  return `${negative ? "-" : ""}${intPart}${frac ? `.${frac}` : ""}`;
}

/** For display only. Intl formats the exact decimal string, so no float touches the amount. */
export function formatMinor(minor: MinorUnits, currency: string, locale: string): string {
  const formatter = new Intl.NumberFormat(`${locale}-u-nu-latn`, { style: "currency", currency });
  return formatter.format(minorToInput(minor, currency) as unknown as number);
}

/** Totals per currency (accounts can be in different currencies, so never mix them). */
export function sumByCurrency(
  items: ReadonlyArray<{ currency: string; amount: MinorUnits }>,
): { currency: string; total: MinorUnits }[] {
  const totals = new Map<string, bigint>();
  for (const { currency, amount } of items) {
    totals.set(currency, (totals.get(currency) ?? 0n) + BigInt(amount));
  }
  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, total]) => ({ currency, total: total.toString() }));
}
