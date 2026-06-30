import { ShieldCheck, Shield } from "lucide-react";

export default function VerificationBadge({ level, size = 16 }) {
  if (!level || level === "none") return null;
  const full = level === "full";
  const Icon = full ? ShieldCheck : Shield;
  return <Icon size={size} className={full ? "text-accent" : "text-muted-foreground"} aria-label={`${level} verified`} />;
}