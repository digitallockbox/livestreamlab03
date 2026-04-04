import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2,
  FileText, Zap, Shield, Lock, DollarSign, User, Calendar
} from "lucide-react";

const CHAINS = ["Ethereum", "Polygon", "Base", "Arbitrum"];
const CURRENCIES = ["USD", "$STREAMING", "USDC", "ETH"];

function Step1({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Project Title *</Label>
          <Input value={data.title} onChange={e => onChange("title", e.target.value)}
            placeholder="e.g. Branded Podcast Series — 6 Episodes"
            className="bg-secondary border-border text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Client / Collaborator *</Label>
          <Input value={data.client} onChange={e => onChange("client", e.target.value)}
            placeholder="Name or company"
            className="bg-secondary border-border text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Client Email</Label>
          <Input type="email" value={data.client_email} onChange={e => onChange("client_email", e.target.value)}
            placeholder="client@company.com"
            className="bg-secondary border-border text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Deadline</Label>
          <Input type="date" value={data.due} onChange={e => onChange("due", e.target.value)}
            className="bg-secondary border-border text-sm" />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Project Scope / Deliverables *</Label>
        <Textarea value={data.scope} onChange={e => onChange("scope", e.target.value)}
          placeholder="Describe exactly what will be delivered, formats, revision rounds, exclusivity terms..."
          rows={5} className="bg-secondary border-border text-sm resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Currency</Label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => onChange("currency", c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${data.currency === c ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Blockchain</Label>
          <div className="flex flex-wrap gap-2">
            {CHAINS.map(c => (
              <button key={c} onClick={() => onChange("chain", c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${data.chain === c ? "bg-accent/10 text-accent border-accent/20" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      {data.currency === "$STREAMING" && (
        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-2">
          <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-accent">$STREAMING contracts auto-route through CreatorVault. Funds escrow instantly on signing.</p>
        </div>
      )}
    </div>
  );
}

function Step2({ milestones, total, onChange, onAdd, onRemove }) {
  const milestoneTotal = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const remaining = (parseFloat(total) || 0) - milestoneTotal;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Define the payment milestones. Funds are held in escrow and auto-released when each milestone is confirmed.</p>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Total Contract Value *</Label>
        <div className="relative max-w-xs">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input type="number" value={total} onChange={e => onChange("total", e.target.value)}
            placeholder="0.00" className="bg-secondary border-border text-sm pl-8" />
        </div>
      </div>

      <div className="space-y-2">
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-2 items-start bg-background border border-border rounded-xl p-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <Input value={m.label} onChange={e => onChange("milestone_label", e.target.value, i)}
                  placeholder={`Milestone ${i + 1} — e.g. Deposit, Delivery, Approval`}
                  className="bg-secondary border-border text-xs h-8" />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input type="number" value={m.amount} onChange={e => onChange("milestone_amount", e.target.value, i)}
                  placeholder="0.00" className="bg-secondary border-border text-xs h-8 pl-7" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex flex-wrap gap-1">
                {["on_confirm", "on_date", "manual"].map(t => (
                  <button key={t} onClick={() => onChange("milestone_trigger", t, i)}
                    title={t === "on_confirm" ? "Auto-release on confirmation" : t === "on_date" ? "Release on date" : "Manual release"}
                    className={`px-2 py-1 rounded-lg text-xs border transition-all
                      ${m.trigger === t ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border"}`}>
                    {t === "on_confirm" ? "Auto" : t === "on_date" ? "Date" : "Manual"}
                  </button>
                ))}
              </div>
              {milestones.length > 1 && (
                <button onClick={() => onRemove(i)} className="ml-1 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={onAdd} className="border-dashed border-border gap-1.5 text-xs h-8 w-full">
        <Plus className="w-3.5 h-3.5" /> Add Milestone
      </Button>

      {parseFloat(total) > 0 && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between
          ${Math.abs(remaining) < 0.01 ? "bg-accent/10 border-accent/20 text-accent" : "bg-chart-3/10 border-chart-3/20 text-chart-3"}`}>
          <span>{Math.abs(remaining) < 0.01 ? "✓ Milestones add up perfectly" : `Unallocated: $${remaining.toFixed(2)}`}</span>
          <span className="font-mono">${milestoneTotal.toFixed(2)} / ${parseFloat(total).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function Step3({ data, milestones }) {
  const [deployed, setDeployed] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const mockHash = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => { setDeploying(false); setDeployed(true); }, 2200);
  };

  if (deployed) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Contract Deployed!</h3>
          <p className="text-sm text-muted-foreground mt-1">Smart contract live on {data.chain}. Invite sent to {data.client}.</p>
        </div>
        <div className="bg-background border border-border rounded-xl p-3 inline-block mx-auto text-left">
          <p className="text-xs text-muted-foreground mb-1">Contract Hash</p>
          <code className="text-sm font-mono text-primary">{mockHash}</code>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" className="border-border text-xs h-8">View on Chain</Button>
          <Button size="sm" variant="ghost" className="text-xs h-8 text-muted-foreground">Download PDF</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-8">Send to Client</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Review your contract before deploying it on-chain. Funds will be escrowed automatically once the client countersigns.</p>

      {/* Summary */}
      <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{data.title || "Untitled Contract"}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><p className="text-muted-foreground mb-0.5">Client</p><p className="font-medium text-foreground">{data.client || "—"}</p></div>
          <div><p className="text-muted-foreground mb-0.5">Total</p><p className="font-medium text-foreground">{data.currency} {parseFloat(data.total || 0).toLocaleString()}</p></div>
          <div><p className="text-muted-foreground mb-0.5">Chain</p><p className="font-medium text-foreground">{data.chain}</p></div>
          <div><p className="text-muted-foreground mb-0.5">Due</p><p className="font-medium text-foreground">{data.due || "—"}</p></div>
        </div>
        {data.scope && <p className="text-xs text-muted-foreground border-t border-border pt-2 line-clamp-3">{data.scope}</p>}
      </div>

      {/* Milestones */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Payment Milestones</p>
        <div className="space-y-1.5">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-xs text-foreground">{m.label || `Milestone ${i + 1}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground">${parseFloat(m.amount || 0).toLocaleString()}</span>
                <Badge className="text-xs border bg-secondary text-muted-foreground border-border capitalize">
                  {m.trigger === "on_confirm" ? "Auto-release" : m.trigger === "on_date" ? "Date-release" : "Manual"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security notice */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
        <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Aegis escrow protection enabled.</span> Funds are locked until each milestone is confirmed by both parties. Disputes trigger Omega arbitration.
        </p>
      </div>

      <Button onClick={handleDeploy} disabled={deploying}
        className="w-full bg-primary hover:bg-primary/90 font-bold gap-2 py-5">
        {deploying ? (
          <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Deploying to {data.chain}...</>
        ) : (
          <><Lock className="w-4 h-4" />Deploy Smart Contract</>
        )}
      </Button>
    </div>
  );
}

const STEPS = ["Project Scope", "Payment Milestones", "Review & Deploy"];

export default function ContractBuilder({ onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", client: "", client_email: "", due: "",
    scope: "", currency: "USD", chain: "Ethereum", total: "",
  });
  const [milestones, setMilestones] = useState([
    { label: "Deposit", amount: "", trigger: "on_confirm" },
    { label: "Final Delivery", amount: "", trigger: "on_confirm" },
  ]);

  const handleFormChange = (key, val, index) => {
    if (key === "milestone_label") {
      setMilestones(ms => ms.map((m, i) => i === index ? { ...m, label: val } : m));
    } else if (key === "milestone_amount") {
      setMilestones(ms => ms.map((m, i) => i === index ? { ...m, amount: val } : m));
    } else if (key === "milestone_trigger") {
      setMilestones(ms => ms.map((m, i) => i === index ? { ...m, trigger: val } : m));
    } else if (key === "total") {
      setForm(f => ({ ...f, total: val }));
    } else {
      setForm(f => ({ ...f, [key]: val }));
    }
  };

  const canAdvance = () => {
    if (step === 0) return form.title && form.client && form.scope;
    if (step === 1) return form.total && milestones.every(m => m.label && m.amount);
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">New Smart Contract</h3>
            <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-all
              ${i < step ? "bg-accent border-accent text-accent-foreground" : i === step ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground"}`}>
              {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-accent/40" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {step === 0 && <Step1 data={form} onChange={handleFormChange} />}
        {step === 1 && (
          <Step2
            milestones={milestones}
            total={form.total}
            onChange={handleFormChange}
            onAdd={() => setMilestones(ms => [...ms, { label: "", amount: "", trigger: "on_confirm" }])}
            onRemove={i => setMilestones(ms => ms.filter((_, idx) => idx !== i))}
          />
        )}
        {step === 2 && <Step3 data={form} milestones={milestones} />}
      </div>

      {/* Navigation */}
      {step < 2 && (
        <div className="flex justify-between">
          <Button variant="outline" className="border-border text-xs h-9"
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}>
            {step === 0 ? "Cancel" : <><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</>}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-xs h-9 gap-1.5"
            disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}>
            {step === 1 ? "Review Contract" : "Continue"} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}