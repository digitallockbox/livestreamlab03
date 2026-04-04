import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, CheckCircle2, Clock, AlertCircle, XCircle,
  DollarSign, User, Calendar, Zap, Plus, ChevronDown, ChevronRight
} from "lucide-react";

const STATUS_CONFIG = {
  active:    { label: "Active",    icon: CheckCircle2, color: "text-accent",       bg: "bg-accent/10 text-accent border-accent/20" },
  pending:   { label: "Pending",   icon: Clock,        color: "text-chart-3",      bg: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-primary",      bg: "bg-primary/10 text-primary border-primary/20" },
  disputed:  { label: "Disputed",  icon: AlertCircle,  color: "text-destructive",  bg: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-muted-foreground", bg: "bg-secondary text-muted-foreground border-border" },
};

const MOCK_CONTRACTS = [
  {
    id: "WFH-001",
    title: "Exclusive Beat License — Summer Drop",
    client: "NovaStar Records",
    creator: "DJ Phantom",
    status: "active",
    total: 4500,
    paid: 2250,
    currency: "USD",
    streaming_bonus: 800,
    created: "2026-03-12",
    due: "2026-04-30",
    milestones: [
      { label: "Deposit (50%)", amount: 2250, status: "paid" },
      { label: "Delivery", amount: 1500, status: "pending" },
      { label: "Final Approval", amount: 750, status: "locked" },
    ],
    contract_hash: "0x3f2a...d9c1",
    chain: "Ethereum",
  },
  {
    id: "WFH-002",
    title: "Branded Livestream Campaign — Q2",
    client: "Apex Sportswear",
    creator: "StreamKing",
    status: "pending",
    total: 12000,
    paid: 0,
    currency: "USD",
    streaming_bonus: 2400,
    created: "2026-04-01",
    due: "2026-05-15",
    milestones: [
      { label: "Deposit (30%)", amount: 3600, status: "pending" },
      { label: "Mid-campaign Report", amount: 4800, status: "locked" },
      { label: "Completion", amount: 3600, status: "locked" },
    ],
    contract_hash: "0x8b1e...44fa",
    chain: "Polygon",
  },
  {
    id: "WFH-003",
    title: "Podcast Series — 12 Episodes",
    client: "MindFuel Media",
    creator: "TalkLab Studio",
    status: "completed",
    total: 6800,
    paid: 6800,
    currency: "USD",
    streaming_bonus: 500,
    created: "2026-01-10",
    due: "2026-03-28",
    milestones: [
      { label: "Pre-production", amount: 2000, status: "paid" },
      { label: "Episodes 1–6", amount: 2400, status: "paid" },
      { label: "Episodes 7–12", amount: 2400, status: "paid" },
    ],
    contract_hash: "0xc77d...902b",
    chain: "Ethereum",
  },
  {
    id: "WFH-004",
    title: "Affiliate Video Pack — 5 Videos",
    client: "GearFlow Inc.",
    creator: "TechCast",
    status: "disputed",
    total: 3200,
    paid: 1600,
    currency: "USD",
    streaming_bonus: 0,
    created: "2026-02-20",
    due: "2026-04-05",
    milestones: [
      { label: "Deposit", amount: 1600, status: "paid" },
      { label: "Delivery", amount: 1600, status: "disputed" },
    ],
    contract_hash: "0x50ac...7f3d",
    chain: "Polygon",
  },
];

const MILESTONE_STYLES = {
  paid:     "bg-accent/10 text-accent border-accent/20",
  pending:  "bg-chart-3/10 text-chart-3 border-chart-3/20",
  locked:   "bg-secondary text-muted-foreground border-border",
  disputed: "bg-destructive/10 text-destructive border-destructive/20",
};

function ContractCard({ contract }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[contract.status];
  const StatusIcon = cfg.icon;
  const progress = Math.round((contract.paid / contract.total) * 100);

  return (
    <div className={`border border-border rounded-2xl overflow-hidden transition-all ${open ? "bg-card" : "bg-secondary/20 hover:bg-secondary/40"}`}>
      {/* Header row */}
      <button onClick={() => setOpen(!open)} className="w-full flex items-start sm:items-center gap-3 p-4 text-left">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground truncate">{contract.title}</span>
            <Badge className={`text-xs border shrink-0 ${cfg.bg}`}>{cfg.label}</Badge>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{contract.client}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due {contract.due}</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${contract.paid.toLocaleString()} / ${contract.total.toLocaleString()}</span>
            {contract.streaming_bonus > 0 && (
              <span className="flex items-center gap-1 text-accent"><Zap className="w-3 h-3" />+${contract.streaming_bonus} $STREAMING</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">{contract.id}</span>
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Payment progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Milestones */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Payment Milestones</p>
            <div className="space-y-2">
              {contract.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2">
                  <span className="text-xs text-foreground">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground">${m.amount.toLocaleString()}</span>
                    <Badge className={`text-xs border capitalize ${MILESTONE_STYLES[m.status]}`}>{m.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart contract info */}
          <div className="bg-background border border-border rounded-xl p-3 flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Contract Hash</p>
              <code className="text-xs font-mono text-primary">{contract.contract_hash}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Chain</p>
              <span className="text-xs text-foreground font-medium">{contract.chain}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created</p>
              <span className="text-xs text-foreground">{contract.created}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Creator</p>
              <span className="text-xs text-foreground">{contract.creator}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {contract.status === "active" && <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-8">Release Next Milestone</Button>}
            {contract.status === "pending" && <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-8">Countersign Contract</Button>}
            {contract.status === "disputed" && <Button size="sm" variant="destructive" className="text-xs h-8">Open Arbitration</Button>}
            <Button size="sm" variant="outline" className="border-border text-xs h-8">View on Chain</Button>
            <Button size="sm" variant="ghost" className="text-xs h-8 text-muted-foreground">Download PDF</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkForHireTab() {
  const [filter, setFilter] = useState("all");

  const counts = MOCK_CONTRACTS.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
  const totalValue = MOCK_CONTRACTS.reduce((s, c) => s + c.total, 0);
  const totalPaid  = MOCK_CONTRACTS.reduce((s, c) => s + c.paid, 0);
  const filtered = filter === "all" ? MOCK_CONTRACTS : MOCK_CONTRACTS.filter(c => c.status === filter);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Contract Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
          { label: "Total Paid Out", value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: "text-accent" },
          { label: "Active Contracts", value: counts.active || 0, icon: FileText, color: "text-chart-3" },
          { label: "Pending Signature", value: counts.pending || 0, icon: Clock, color: "text-chart-4" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + New contract */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "active", "pending", "completed", "disputed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize
                ${filter === f ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
              {f} {f !== "all" && counts[f] ? `(${counts[f]})` : ""}
            </button>
          ))}
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5 text-xs h-8">
          <Plus className="w-3.5 h-3.5" /> New Contract
        </Button>
      </div>

      {/* Contract list */}
      <div className="space-y-3">
        {filtered.map(c => <ContractCard key={c.id} contract={c} />)}
      </div>

      {/* Footer note */}
      <div className="p-4 rounded-2xl bg-card border border-border text-center">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">All contracts are enforced on-chain via smart contract.</span>
          <br />Omega handles milestone releases. Aegis monitors for fraud. Funds are escrowed until delivery is confirmed.
        </p>
      </div>
    </div>
  );
}