import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  Wallet, ExternalLink, RefreshCw, Copy, CheckCircle2,
  TrendingUp, TrendingDown, Clock, Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ACTIONS = [
  { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'connect', label: 'Connect Wallet', icon: Wallet, color: 'text-chart-4', bg: 'bg-chart-4/10' },
];

const MOCK_TXS = [
  { id: 1, type: 'Stream Tip', direction: 'in', amount: '+250', usd: '+$25.00', from: 'viewer_99', time: '2m ago', status: 'confirmed' },
  { id: 2, type: 'Auto-Split', direction: 'in', amount: '+1,400', usd: '+$140.00', from: 'Platform', time: '18m ago', status: 'confirmed' },
  { id: 3, type: 'Withdrawal', direction: 'out', amount: '-2,000', usd: '-$200.00', from: 'To Phantom', time: '1h ago', status: 'confirmed' },
  { id: 4, type: 'PPV Unlock', direction: 'in', amount: '+199', usd: '+$19.90', from: 'stream_junkie', time: '3h ago', status: 'confirmed' },
  { id: 5, type: 'Transfer', direction: 'out', amount: '-500', usd: '-$50.00', from: 'neon_wolf', time: '1d ago', status: 'confirmed' },
  { id: 6, type: 'Affiliate', direction: 'in', amount: '+320', usd: '+$32.00', from: 'Commission', time: '2d ago', status: 'confirmed' },
];

const TABS = ['Overview', 'Transactions', 'Deposit', 'Withdraw', 'Transfer'];

export default function StreamingWalletPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const walletAddress = '7xKp...f3Nq';
  const balance = 14280;
  const usdValue = (balance * 0.10).toFixed(2);

  const copyAddress = () => {
    navigator.clipboard.writeText('7xKpABCDEF1234567890f3Nq');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs font-mono gap-1">
                <Zap className="w-3 h-3" /> $STREAMING Token
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Your Wallet</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground font-medium">Total Balance</p>
            <div className="flex items-end gap-3 mt-2">
              <span className="font-display text-5xl font-bold text-foreground">{balance.toLocaleString()}</span>
              <span className="text-accent font-bold text-xl mb-1.5">$STREAMING</span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">≈ ${usdValue} USD</p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-mono">{walletAddress}</p>
              <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs ml-auto">
                <Shield className="w-3 h-3 mr-1" /> Protected
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '30-day earnings', value: '+4,820', icon: TrendingUp, color: 'text-accent' },
            { label: '30-day spent', value: '-1,200', icon: TrendingDown, color: 'text-red-400' },
            { label: 'Pending settle', value: '320', icon: Clock, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {ACTIONS.map(({ id, label, icon: Icon, color, bg }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id === 'connect' ? 'Overview' : id.charAt(0).toUpperCase() + id.slice(1))}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Overview / Transactions */}
        {(activeTab === 'Overview' || activeTab === 'Transactions') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
              {MOCK_TXS.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/20 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.direction === 'in' ? 'bg-accent/10' : 'bg-red-400/10'}`}>
                    {tx.direction === 'in'
                      ? <ArrowDownLeft className="w-4 h-4 text-accent" />
                      : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.from} · {tx.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.direction === 'in' ? 'text-accent' : 'text-red-400'}`}>
                      {tx.amount} <span className="text-xs font-normal">$STREAM</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.usd}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab: Deposit */}
        {activeTab === 'Deposit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Deposit $STREAMING</h2>
              <div className="bg-secondary rounded-xl p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Send $STREAMING to your Trident wallet address:</p>
                <p className="font-mono text-sm text-foreground bg-background rounded-lg px-3 py-2 border border-border">7xKpABCDEF1234567890f3Nq</p>
                <Button size="sm" variant="outline" onClick={copyAddress} className="gap-2 text-xs">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Minimum deposit: 100 $STREAMING</p>
                <p>• Confirmations required: 1 (Solana)</p>
                <p>• Credited within: ~30 seconds</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Withdraw */}
        {activeTab === 'Withdraw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Withdraw $STREAMING</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Destination wallet address</Label>
                  <Input placeholder="Solana address..." className="mt-1.5 bg-secondary border-border font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-sm">Amount ($STREAMING)</Label>
                  <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1.5 bg-secondary border-border" type="number" min="0" />
                  <p className="text-xs text-muted-foreground mt-1">Available: {balance.toLocaleString()} $STREAMING</p>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={!amount}>
                  <ArrowUpRight className="w-4 h-4" /> Withdraw {amount && `${amount} $STREAMING`}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Network fee: ~0.000005 SOL · Minimum: 100 $STREAMING</p>
            </div>
          </motion.div>
        )}

        {/* Tab: Transfer */}
        {activeTab === 'Transfer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Transfer to Creator</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Recipient username or wallet</Label>
                  <Input placeholder="@creator or wallet address..." className="mt-1.5 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">Amount ($STREAMING)</Label>
                  <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1.5 bg-secondary border-border" type="number" min="0" />
                </div>
                <div>
                  <Label className="text-sm">Memo (optional)</Label>
                  <Input placeholder="Tip, collab share..." className="mt-1.5 bg-secondary border-border" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={!amount}>
                  <ArrowLeftRight className="w-4 h-4" /> Send {amount && `${amount} $STREAMING`}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}