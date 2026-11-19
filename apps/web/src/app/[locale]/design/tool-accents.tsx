import { Button } from "@/components/ui/button";

const tools = [
  { id: undefined, label: "Platform" },
  { id: "money", label: "Money" },
  { id: "tasks", label: "Tasks" },
  { id: "training", label: "Training" },
] as const;

export function ToolAccents() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {tools.map((t) => (
        <div key={t.label} data-tool={t.id} className="space-y-4 rounded-2xl border-2 p-5">
          <h3 className="text-lg">{t.label}</h3>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div className="h-3 w-2/3 rounded-full bg-primary" />
          </div>
          <p className="text-sm font-bold text-primary">5-day streak</p>
        </div>
      ))}
    </section>
  );
}
