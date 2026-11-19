import { useTranslations } from "next-intl";

export default function MoneyPage() {
  const tt = useTranslations("Tools");
  const ts = useTranslations("Shell");
  return (
    <div className="grid gap-2">
      <h1 className="text-3xl">{tt("money.name")}</h1>
      <p className="text-muted-foreground">{ts("comingSoonText")}</p>
    </div>
  );
}
