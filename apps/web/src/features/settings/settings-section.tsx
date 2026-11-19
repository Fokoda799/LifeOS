export function SettingsSection(props: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 rounded-3xl border-2 border-border bg-card p-6">
      <div className="grid gap-1">
        <h2 className="text-xl">{props.title}</h2>
        <p className="text-sm text-muted-foreground">{props.description}</p>
      </div>
      {props.children}
    </section>
  );
}
