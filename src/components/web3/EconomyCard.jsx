const ACCENTS = {
  primary: "text-primary",
  accent: "text-accent",
  foreground: "text-foreground"
};

export default function EconomyCard({ label, value, sub, accent = "primary" }) {
  const color = ACCENTS[accent] || ACCENTS.primary;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-display font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}