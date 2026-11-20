export function AuthCard(props: {
  eyebrow?: string;
  title: string;
  description: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8">
      <div className="grid gap-2">
        {props.eyebrow && <p className="text-sm font-bold text-primary">{props.eyebrow}</p>}
        <h1 className="text-4xl">{props.title}</h1>
        <p className="text-muted-foreground">{props.description}</p>
      </div>
      {props.children}
      <p className="flex flex-wrap justify-center gap-1 text-sm text-muted-foreground">
        {props.footer}
      </p>
    </section>
  );
}
