import { useTranslations } from "next-intl";

export default function MoneyPage() {
  const ts = useTranslations("Shell");
  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground">{ts("comingSoonText")}</p>
    </div>
  );
}
