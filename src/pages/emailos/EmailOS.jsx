import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Inbox, Shield, DollarSign, Zap, Radio, Terminal,
  Crown, Megaphone, Users, AlertTriangle, CheckCircle2,
  Clock, ArrowRight, Filter, RefreshCw, Eye, ChevronRight,
  Activity, Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EMAILS } from '@/lib/constants/emails';
import { Link } from 'react-router-dom';

// ─── Lane Config ────────────────────────────────────────────────────────────
const LANES = [
  {
    key: 'contact',
    alias: EMAILS.contact,
    label: 'Public Contact',
    osRoute: 'public/contact',
    icon: Mail,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    tag: 'general',
    logStream: 'logs/public',
    dashboard: '/explorer',
    description: 'General inquiries from the web',
    escalateTo: null,
  },
  {
    key: 'support',
    alias: EMAILS.support,
    label: 'Creator Support',
    osRoute: 'support/tickets/create',
    icon: Inbox,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    tag: 'support-ticket',
    logStream: 'logs/support',
    dashboard: '/admin',
    description: 'Creator support tickets — assign + SLA track',
    escalateTo: null,
  },
  {
    key: 'admin',
    alias: EMAILS.admin,
    label: 'Operator Admin',
    osRoute: 'operator/admin/inbox',
    icon: Shield,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    tag: 'admin',
    logStream: 'logs/admin',
    dashboard: '/admin',
    description: 'Operator dashboard actions & inbox',
    escalateTo: null,
  },
  {
    key: 'billing',
    alias: EMAILS.billing,
    label: 'Billing & Payouts',
    osRoute: 'finance/payouts/inbox',
    icon: DollarSign,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    tag: 'finance',
    logStream: 'logs/finance',
    dashboard: '/vault',
    description: 'Payout validation & invoice review',
    escalateTo: null,
  },
  {
    key: 'security',
    alias: EMAILS.security,
    label: 'Security Alerts',
    osRoute: 'security/alerts',
    icon: Shield,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    tag: 'security-critical',
    logStream: 'logs/security',
    dashboard: '/war-room',
    description: 'Breach alerts, compliance, fraud signals',
    escalateTo: ['founder', 'admin'],
  },
  {
    key: 'systembot',
    alias: EMAILS.systembot,
    label: 'System Events',
    osRoute: 'system/events',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    tag: 'system-event',
    logStream: 'logs/system/events',
    dashboard: '/logs',
    description: 'Automated bot notifications & system pings',
    escalateTo: null,
  },
  {
    key: 'systemboot',
    alias: EMAILS.systemboot,
    label: 'Boot Logs',
    osRoute: 'system/bootlogs',
    icon: Terminal,
    color: 'text-muted-foreground',
    bg: 'bg-secondary',
    border: 'border-border',
    tag: 'boot-event',
    logStream: 'logs/system/boot',
    dashboard: '/logs',
    description: 'Engine startup logs & boot timeline',
    escalateTo: ['systembot'],
  },
  {
    key: 'founder',
    alias: EMAILS.founder,
    label: 'Founder Lane',
    osRoute: 'founder/escalations',
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    tag: 'priority-founder',
    logStream: 'logs/founder',
    dashboard: '/founder',
    description: 'Priority escalations — bypasses all queues',
    escalateTo: null,
  },
  {
    key: 'creators',
    alias: EMAILS.creators,
    label: 'Creator Broadcast',
    osRoute: 'broadcast/creators',
    icon: Megaphone,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    tag: 'broadcast',
    logStream: 'logs/broadcast/creators',
    dashboard: '/admin',
    description: 'Announcements queued to all creators',
    escalateTo: null,
  },
  {
    key: 'operators',
    alias: EMAILS.operators,
    label: 'Operator Broadcast',
    osRoute: 'broadcast/operators',
    icon: Users,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    tag: 'ops-broadcast',
    logStream: 'logs/broadcast/operators',
    dashboard: '/admin',
    description: 'Announcements queued to all operators',
    escalateTo: null,
  },
];

// Mock recent activity per lane
const MOCK_EVENTS = {
  security:   [{ id: 1, from: 'alert@cloudflare.com', subject: 'Suspicious login attempt detected', time: '4m ago', tag: 'security-critical' }],
  founder:    [{ id: 2, from: 'partner@vcfund.io', subject: 'Term sheet — Series A follow-on', time: '12m ago', tag: 'priority-founder' }],
  support:    [
    { id: 3, from: 'creator@example.com', subject: 'Payout not received for March cycle', time: '18m ago', tag: 'support-ticket' },
    { id: 4, from: 'creator2@example.com', subject: 'Cannot upload video — 500 error', time: '41m ago', tag: 'support-ticket' },
  ],
  billing:    [{ id: 5, from: 'stripe@stripe.com', subject: 'Payout batch #2841 initiated', time: '1h ago', tag: 'finance' }],
  systemboot: [{ id: 6, from: 'systemboot@livestreamlab.live', subject: 'Omega engine started — boot OK', time: '2h ago', tag: 'boot-event' }],
  systembot:  [{ id: 7, from: 'systembot@livestreamlab.live', subject: 'Token velocity anomaly detected', time: '3h ago', tag: 'system-event' }],
  admin:      [],
  contact:    [{ id: 8, from: 'press@techcrunch.com', subject: 'Interview request — platform story', time: '5h ago', tag: 'general' }],
  creators:   [],
  operators:  [],
};

const TABS = ['All Lanes', 'Escalations', 'Workflows', 'Log Streams'];

function LaneCard({ lane, onSelect, selected }) {
  const Icon = lane.icon;
  const events = MOCK_EVENTS[lane.key] || [];
  const hasEvents = events.length > 0;
  const isEscalating = lane.escalateTo?.length > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect(lane.key)}
      className={`rounded-xl border bg-card p-5 cursor-pointer transition-all ${
        selected === lane.key ? `${lane.border} shadow-lg` : 'border-border hover:border-border/80'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${lane.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${lane.color}`} />
        </div>
        <div className="flex items-center gap-1.5">
          {isEscalating && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-1.5 py-0">escalates</Badge>}
          {hasEvents && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {events.length}
            </span>
          )}
        </div>
      </div>
      <p className="font-semibold text-sm text-foreground">{lane.label}</p>
      <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">{lane.alias}</p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{lane.description}</p>
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
        <code className="text-[10px] text-muted-foreground font-mono">/{lane.osRoute}</code>
        <Badge className={`${lane.bg} ${lane.color} border-0 text-[10px] px-1.5 py-0`}>{lane.tag}</Badge>
      </div>
    </motion.div>
  );
}

function LaneDetail({ lane }) {
  const Icon = lane.icon;
  const events = MOCK_EVENTS[lane.key] || [];

  return (
    <motion.div
      key={lane.key}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className={`rounded-xl border ${lane.border} bg-card p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${lane.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${lane.color}`} />
            </div>
            <div>
              <p className="font-display font-bold text-foreground">{lane.label}</p>
              <p className="text-xs font-mono text-muted-foreground">{lane.alias}</p>
            </div>
          </div>
          <Link to={lane.dashboard}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              Open Dashboard <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Route info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'OS Route', value: `/${lane.osRoute}`, icon: Radio },
          { label: 'Auto-Tag', value: lane.tag, icon: Filter },
          { label: 'Log Stream', value: lane.logStream, icon: Activity },
        ].map(({ label, value, icon: ItemIcon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ItemIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
            <code className="text-xs text-foreground font-mono">{value}</code>
          </div>
        ))}
      </div>

      {/* Escalation rules */}
      {lane.escalateTo?.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm font-semibold text-destructive">Escalation Rules</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs bg-card px-2 py-1 rounded-md border border-border font-mono">{lane.alias}</code>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            {lane.escalateTo.map(target => {
              const t = LANES.find(l => l.key === target);
              return t ? (
                <code key={target} className="text-xs bg-card px-2 py-1 rounded-md border border-destructive/30 font-mono text-destructive">{t.alias}</code>
              ) : null;
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">This lane auto-escalates to the lanes above on every inbound event.</p>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Recent Inbound</p>
          <Badge className="bg-secondary text-muted-foreground border-border text-xs">{events.length} events</Badge>
        </div>
        {events.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No recent events on this lane.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {events.map(ev => (
              <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ev.subject}</p>
                    <p className="text-xs text-muted-foreground">{ev.from} · {ev.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${lane.bg} ${lane.color} border-0 text-[10px]`}>{ev.tag}</Badge>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EscalationView() {
  const escalatingLanes = LANES.filter(l => l.escalateTo?.length);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" /> Active Escalation Rules
        </h3>
        <div className="space-y-4">
          {escalatingLanes.map(lane => {
            const Icon = lane.icon;
            return (
              <div key={lane.key} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
                <div className={`w-8 h-8 rounded-lg ${lane.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${lane.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{lane.label}</p>
                  <code className="text-[10px] text-muted-foreground font-mono">{lane.alias}</code>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  {lane.escalateTo.map(target => {
                    const t = LANES.find(l => l.key === target);
                    return t ? (
                      <code key={target} className="text-[10px] font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded">{t.alias}</code>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escalation matrix */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Escalation Matrix</h3>
        <div className="space-y-3 text-sm">
          {[
            { trigger: 'security@', action: 'Tag: security-critical → notify founder@ + admin@ → write logs/security → trigger alert workflow', severity: 'critical' },
            { trigger: 'founder@', action: 'Tag: priority-founder → immediate push to Founder OS → bypass all queues → mark "requires founder review"', severity: 'high' },
            { trigger: 'systemboot@', action: 'Append to boot timeline → trigger system health check → notify systembot@ if anomaly detected', severity: 'medium' },
          ].map(rule => (
            <div key={rule.trigger} className={`p-4 rounded-xl border ${
              rule.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' :
              rule.severity === 'high' ? 'border-yellow-400/30 bg-yellow-400/5' :
              'border-border bg-secondary/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-xs font-mono font-bold text-foreground">{rule.trigger}</code>
                <Badge className={`text-[10px] ${
                  rule.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  rule.severity === 'high' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                  'bg-muted text-muted-foreground border-border'
                }`}>{rule.severity}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowsView() {
  const WORKFLOWS = [
    {
      name: 'Support Workflow',
      trigger: 'support@livestreamlab.live',
      color: 'border-primary/30 bg-primary/5',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      steps: [
        { icon: CheckCircle2, label: 'Create ticket', color: 'text-accent' },
        { icon: Users, label: 'Assign to support agent', color: 'text-primary' },
        { icon: Mail, label: 'Notify creator', color: 'text-chart-4' },
        { icon: Clock, label: 'Track SLA', color: 'text-yellow-400' },
      ],
    },
    {
      name: 'Billing Workflow',
      trigger: 'billing@livestreamlab.live',
      color: 'border-accent/30 bg-accent/5',
      badgeColor: 'bg-accent/10 text-accent border-accent/20',
      steps: [
        { icon: CheckCircle2, label: 'Validate payout', color: 'text-accent' },
        { icon: DollarSign, label: 'Check invoices', color: 'text-chart-3' },
        { icon: Mail, label: 'Notify finance lane', color: 'text-chart-4' },
      ],
    },
    {
      name: 'Security Workflow',
      trigger: 'security@livestreamlab.live',
      color: 'border-destructive/30 bg-destructive/5',
      badgeColor: 'bg-destructive/10 text-destructive border-destructive/20',
      steps: [
        { icon: Shield, label: 'Run security scan', color: 'text-destructive' },
        { icon: Crown, label: 'Notify founder', color: 'text-yellow-400' },
        { icon: Activity, label: 'Log event to security stream', color: 'text-primary' },
        { icon: Zap, label: 'Trigger automated response', color: 'text-accent' },
      ],
    },
    {
      name: 'System Workflow',
      trigger: 'systembot@ / systemboot@',
      color: 'border-yellow-400/30 bg-yellow-400/5',
      badgeColor: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
      steps: [
        { icon: Terminal, label: 'Log event', color: 'text-muted-foreground' },
        { icon: Activity, label: 'Run diagnostics', color: 'text-primary' },
        { icon: Zap, label: 'Notify system lane', color: 'text-yellow-400' },
      ],
    },
    {
      name: 'Broadcast Workflow',
      trigger: 'creators@ / operators@',
      color: 'border-chart-4/30 bg-chart-4/5',
      badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      steps: [
        { icon: Megaphone, label: 'Queue announcement', color: 'text-chart-4' },
        { icon: Users, label: 'Send to all recipients', color: 'text-primary' },
        { icon: CheckCircle2, label: 'Log broadcast event', color: 'text-accent' },
      ],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {WORKFLOWS.map(wf => (
        <div key={wf.name} className={`rounded-xl border ${wf.color} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display font-bold text-sm text-foreground">{wf.name}</p>
            <Badge className={`text-[10px] ${wf.badgeColor}`}>auto</Badge>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mb-4">Triggered by: {wf.trigger}</p>
          <div className="space-y-2">
            {wf.steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs w-5">
                    <span>{i + 1}.</span>
                  </div>
                  <StepIcon className={`w-3.5 h-3.5 ${step.color} flex-shrink-0`} />
                  <p className="text-xs text-foreground">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LogStreamsView() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Active Log Streams
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {LANES.map(lane => {
            const Icon = lane.icon;
            const events = MOCK_EVENTS[lane.key] || [];
            return (
              <div key={lane.key} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg ${lane.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${lane.color}`} />
                  </div>
                  <div>
                    <code className="text-xs font-mono text-foreground">{lane.logStream}</code>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{lane.alias}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{events.length} recent</span>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <Badge className={`${lane.bg} ${lane.color} border-0 text-[10px]`}>{lane.tag}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EmailOS() {
  const [tab, setTab] = useState('All Lanes');
  const [selected, setSelected] = useState(null);

  const totalEvents = Object.values(MOCK_EVENTS).flat().length;
  const escalatingCount = LANES.filter(l => l.escalateTo?.length).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Email OS</h1>
            <p className="text-muted-foreground mt-0.5">Operational communication engine — {LANES.length} active lanes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
            <Activity className="w-3 h-3" /> {totalEvents} pending events
          </Badge>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5">
            <AlertTriangle className="w-3 h-3" /> {escalatingCount} escalation rules
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Sync
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelected(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ALL LANES */}
      {tab === 'All Lanes' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={`grid gap-4 ${selected ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {/* Lane cards */}
            <div className={`${selected ? 'md:col-span-1' : 'sm:col-span-2 lg:col-span-3 xl:col-span-4'} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${selected ? '2' : '3'} xl:grid-cols-${selected ? '2' : '4'} gap-4`}>
              {LANES.map(lane => (
                <LaneCard key={lane.key} lane={lane} onSelect={k => setSelected(selected === k ? null : k)} selected={selected} />
              ))}
            </div>
          </div>
          {selected && (
            <LaneDetail lane={LANES.find(l => l.key === selected)} />
          )}
        </motion.div>
      )}

      {/* ESCALATIONS */}
      {tab === 'Escalations' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <EscalationView />
        </motion.div>
      )}

      {/* WORKFLOWS */}
      {tab === 'Workflows' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <WorkflowsView />
        </motion.div>
      )}

      {/* LOG STREAMS */}
      {tab === 'Log Streams' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <LogStreamsView />
        </motion.div>
      )}
    </div>
  );
}