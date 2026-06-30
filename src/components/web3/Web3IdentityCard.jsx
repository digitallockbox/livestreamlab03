import Web3NameBadge from "./Web3NameBadge";
import VerificationBadge from "./VerificationBadge";
import CreatorBadge from "./CreatorBadge";

export default function Web3IdentityCard({ profile }) {
  if (!profile) return null;
  const short = profile.wallet_address ? profile.wallet_address.slice(0, 10) + "..." : "";
  const initial = (profile.display_name || profile.ens_name || "W").charAt(0).toUpperCase();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-xl overflow-hidden shrink-0">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
        ) : (
          initial
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display font-semibold truncate">{profile.display_name || "Unnamed"}</h3>
          <VerificationBadge level={profile.verification_level} />
          <CreatorBadge tier={profile.badge_tier} />
        </div>
        <div className="mt-1"><Web3NameBadge profile={profile} /></div>
        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{short}</p>
      </div>
    </div>
  );
}