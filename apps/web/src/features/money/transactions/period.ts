/** A calendar month. `month` is 0-11, like Date. */
export type Period = { year: number; month: number };

export function currentPeriod(now = new Date()): Period {
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftPeriod({ year, month }: Period, by: number): Period {
  const d = new Date(Date.UTC(year, month + by, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** First and last day of the month as "YYYY-MM-DD", the format the API filters by. */
export function periodBounds({ year, month }: Period): { from: string; to: string } {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return {
    from: `${year}-${pad(month + 1)}-01`,
    to: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  };
}
