import { Award } from "lucide-react";

const TIERS = {
  bronze: { color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30", label: "Bronze" },
  silver: { color: "text-slate-300", bg: "bg-slate-400/10 border-slate-400/30", label: "Silver" },
  gold: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Gold" },
  diamond: { color: "text-cyan-300", bg: "bg-cyan-500/10 border-cyan-500/30", label: "Diamond" }
};

export default function CreatorBadge({ tier, size = "sm" }) {
  const t = TIERS[tier] || TIERS.bronze;
  const cls = size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${t.bg} ${t.color} ${cls} font-medium`}>
      <Award size={12} /> {t.label}
    </span>
  );
}