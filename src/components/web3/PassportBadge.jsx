import { BookOpen } from "lucide-react";

export default function PassportBadge({ rank }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs text-primary font-medium">
      <BookOpen size={14} /> Passport Rank {rank || 1}
    </span>
  );
}