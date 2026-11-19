import { Check, Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ToolId } from "./registry";

function MoneyPreview() {
  const t = useTranslations("Tools.preview");
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm text-muted-foreground">{t("balance")}</p>
        <p className="text-3xl font-extrabold tabular-nums">
          <bdi dir="ltr">28,450.75 MAD</bdi>
        </p>
      </div>
      <div aria-hidden className="flex h-20 items-end gap-2">
        {[40, 65, 50, 85, 60, 95].map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={cn("flex-1 rounded-t-lg", i === 5 ? "bg-primary" : "bg-primary/30")}
          />
        ))}
      </div>
    </div>
  );
}

function TasksPreview() {
  const t = useTranslations("Tools.preview");
  const items = ["task1", "task2", "task3"] as const;
  return (
    <ul className="grid gap-2">
      {items.map((key, i) => {
        const done = i < 2;
        return (
          <li key={key} className="flex items-center gap-3 rounded-xl border-2 border-border p-3">
            <span
              aria-hidden
              className={cn(
                "grid size-6 place-items-center rounded-md border-2",
                done ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {done && <Check className="size-4" />}
            </span>
            <span className={cn(done && "text-muted-foreground line-through")}>{t(key)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function TrainingPreview() {
  const t = useTranslations("Tools.preview");
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Flame aria-hidden className="size-10 text-primary" />
        <p className="text-xl font-extrabold">{t("streak", { count: 5 })}</p>
      </div>
      <div aria-hidden className="flex gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-8 rounded-full border-2",
              i < 5 ? "border-primary bg-primary" : "border-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export const previews: Record<ToolId, () => React.JSX.Element> = {
  money: MoneyPreview,
  tasks: TasksPreview,
  training: TrainingPreview,
};
