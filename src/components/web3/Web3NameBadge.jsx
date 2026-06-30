export default function Web3NameBadge({ profile, size = "sm" }) {
  if (!profile) return null;
  const short = profile.wallet_address
    ? profile.wallet_address.slice(0, 6) + "..." + profile.wallet_address.slice(-4)
    : "";
  const cls = size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border ${cls} font-mono`}>
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      {profile.ens_name || profile.display_name || short}
    </span>
  );
}