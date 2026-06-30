import { Link, useLocation } from "react-router-dom";
import { Wallet, User, ShieldCheck, Award, BookOpen, BarChart3 } from "lucide-react";

const NAV = [
  { to: "/web3/profile", label: "Profile", icon: User },
  { to: "/web3/verify", label: "Verification", icon: ShieldCheck },
  { to: "/web3/badges", label: "Badges", icon: Award },
  { to: "/web3/passport", label: "Passport", icon: BookOpen },
  { to: "/web3/economy", label: "Economy", icon: BarChart3 }
];

export default function CreatorSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar min-h-screen p-4 hidden md:block">
      <Link to="/web3/passport" className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Wallet size={16} className="text-white" />
        </div>
        <span className="font-display font-bold">Web3 Creator</span>
      </Link>
      <nav className="space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === to
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}