import { ThemeToggle } from "@/components/theme-toggle";
import { ComponentsDemo } from "./components-demo";

// Class names are written out in full so Tailwind can detect them.
const swatches = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["muted", "bg-muted"],
  ["primary", "bg-primary"],
  ["income", "bg-income"],
  ["expense", "bg-expense"],
  ["warning", "bg-warning"],
  ["info", "bg-info"],
  ["tasks", "bg-tasks"],
  ["training", "bg-training"],
] as const;

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Design tokens</h1>
        <ThemeToggle />
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {swatches.map(([name, cls]) => (
          <div key={name} className="overflow-hidden rounded-lg border">
            <div className={`h-14 ${cls}`} />
            <p className="bg-card px-3 py-2 text-xs text-muted-foreground">{name}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Dépenses du mois · Total balance</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            28,450.75 <span className="text-lg text-muted-foreground">MAD</span>
          </p>
          <div className="mt-4 flex gap-6 text-sm tabular-nums">
            <span className="text-income">+8,650.00</span>
            <span className="text-expense">−6,230.45</span>
          </div>
        </div>

        <div dir="rtl" lang="ar" className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">الرصيد الإجمالي</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            28,450.75 <span className="text-lg text-muted-foreground">درهم</span>
          </p>
          <p className="mt-4 text-sm text-warning">اقتربت من حد الميزانية</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Money
        </button>
        <button className="rounded-lg bg-tasks px-4 py-2 text-sm font-medium text-tasks-foreground">
          Tasks
        </button>
        <button className="rounded-lg bg-training px-4 py-2 text-sm font-medium text-training-foreground">
          Training
        </button>
        <button className="rounded-lg border bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          Secondary
        </button>
        <input
          placeholder="Enter amount"
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </section>

      <ComponentsDemo />
    </main>
  );
}
