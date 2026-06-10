import { useState, useEffect, useCallback } from 'react';
import { STREAMING_TOKEN_MINT, STREAMING_TOKEN_USD_RATE } from '@/lib/constants/tokens';
import { motion } from 'framer-motion';
import {
  Zap, ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  Wallet, RefreshCw, Copy, CheckCircle2,
  TrendingUp, TrendingDown, Clock, Shield, Loader2, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { walletApi } from '@/lib/tridentApi';

const TABS = ['Overview', 'Transactions', 'Deposit', 'Withdraw', 'Transfer'];

const ACTIONS = [
  { id: 'Deposit',     label: 'Deposit',        icon: ArrowDownLeft,  color: 'text-accent',    bg: 'bg-accent/10' },
  { id: 'Withdraw',    label: 'Withdraw',        icon: ArrowUpRight,   color: 'text-red-400',   bg: 'bg-red-400/10' },
  { id: 'Transfer',    label: 'Transfer',        icon: ArrowLeftRight, color: 'text-primary',   bg: 'bg-primary/10' },
  { id: 'connect',     label: 'Connect Wallet',  icon: Wallet,         color: 'text-chart-4',   bg: 'bg-chart-4/10' },
];

export default function StreamingWalletPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [copied, setCopied] = useState(false);

  // --- Wallet data ---
  const [walletData, setWalletData]     = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // --- Form fields ---
  const [withdrawAddr, setWithdrawAddr] = useState('');
  const [withdrawAmt,  setWithdrawAmt]  = useState('');
  const [transferTo,   setTransferTo]   = useState('');
  const [transferAmt,  setTransferAmt]  = useState('');
  const [transferMemo, setTransferMemo] = useState('');
  const [txLoading,    setTxLoading]    = useState(false);
  const [txResult,     setTxResult]     = useState(null);

  const walletAddress = walletData?.address ?? '7xKp...f3Nq';
  const balance       = walletData?.balance ?? 0;
  const usdValue      = (balance * STREAMING_TOKEN_USD_RATE).toFixed(2);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bal, txs] = await Promise.all([
        walletApi.balance({}),
        walletApi.transactions({}),
      ]);
      setWalletData(bal);
      setTransactions(Array.isArray(txs?.transactions) ? txs.transactions : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData?.address ?? '7xKpABCDEF1234567890f3Nq');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Submit handlers ---
  async function handleWithdraw(e) {
    e.preventDefault();
    setTxLoading(true); setTxResult(null);
    try {
      const res = await walletApi.withdraw({ address: withdrawAddr, amount: Number(withdrawAmt) });
      setTxResult({ ok: true, msg: res?.message ?? 'Withdrawal submitted.' });
      setWithdrawAddr(''); setWithdrawAmt('');
      fetchWallet();
    } catch (err) {
      setTxResult({ ok: false, msg: err.message });
    } finally { setTxLoading(false); }
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setTxLoading(true); setTxResult(null);
    try {
      const res = await walletApi.transfer({ to: transferTo, amount: Number(transferAmt), memo: transferMemo });
      setTxResult({ ok: true, msg: res?.message ?? 'Transfer sent.' });
      setTransferTo(''); setTransferAmt(''); setTransferMemo('');
      fetchWallet();
    } catch (err) {
      setTxResult({ ok: false, msg: err.message });
    } finally { setTxLoading(false); }
  }

  async function handleDeposit() {
    setTxLoading(true); setTxResult(null);
    try {
      const res = await walletApi.deposit({});
      setTxResult({ ok: true, msg: res?.message ?? 'Deposit address ready.' });
    } catch (err) {
      setTxResult({ ok: false, msg: err.message });
    } finally { setTxLoading(false); }
  }

  // --- Stats derived from live data ---
  const earned30 = walletData?.earned_30d ?? 0;
  const spent30  = walletData?.spent_30d  ?? 0;
  const pending  = walletData?.pending    ?? 0;

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
          <Button variant="outline" size="sm" onClick={fetchWallet} disabled={loading} className="gap-2 text-xs">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

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
              {loading
                ? <div className="h-12 w-40 bg-secondary rounded-xl animate-pulse" />
                : <span className="font-display text-5xl font-bold text-foreground">{balance.toLocaleString()}</span>
              }
              <span className="text-accent font-bold text-xl mb-1.5">$STREAMING</span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">≈ ${usdValue} USD</p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground font-mono">{walletAddress}</p>
                <p className="text-xs text-muted-foreground/50 font-mono">Mint: {STREAMING_TOKEN_MINT.slice(0, 16)}…</p>
              </div>
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
            { label: '30-day earnings', value: `+${earned30.toLocaleString()}`, icon: TrendingUp,   color: 'text-accent' },
            { label: '30-day spent',    value: `-${spent30.toLocaleString()}`,  icon: TrendingDown, color: 'text-red-400' },
            { label: 'Pending settle',  value: pending.toLocaleString(),        icon: Clock,        color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              {loading
                ? <div className="h-5 w-16 bg-secondary rounded animate-pulse mx-auto mb-1" />
                : <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
              }
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {ACTIONS.map(({ id, label, icon: Icon, color, bg }) => (
            <button
              key={id}
              onClick={() => id !== 'connect' && setActiveTab(id)}
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
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setTxResult(null); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Result Banner */}
        {txResult && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            txResult.ok
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}>
            {txResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {txResult.msg}
          </div>
        )}

        {/* Overview / Transactions */}
        {(activeTab === 'Overview' || activeTab === 'Transactions') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No transactions yet.</div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
                {transactions.map((tx, i) => {
                  const isIn = tx.direction === 'in' || Number(tx.amount) > 0;
                  return (
                    <motion.div
                      key={tx.id ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/20 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIn ? 'bg-accent/10' : 'bg-red-400/10'}`}>
                        {isIn
                          ? <ArrowDownLeft className="w-4 h-4 text-accent" />
                          : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{tx.type ?? tx.description ?? 'Transaction'}</p>
                        <p className="text-xs text-muted-foreground">{tx.from ?? tx.source ?? '—'} · {tx.time ?? tx.created_at ?? ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isIn ? 'text-accent' : 'text-red-400'}`}>
                          {isIn ? '+' : ''}{Number(tx.amount ?? 0).toLocaleString()} <span className="text-xs font-normal">$STREAM</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.usd ?? ''}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Deposit */}
        {activeTab === 'Deposit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Deposit $STREAMING</h2>
              <div className="bg-secondary rounded-xl p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Send $STREAMING to your Trident wallet address:</p>
                <p className="font-mono text-sm text-foreground bg-background rounded-lg px-3 py-2 border border-border break-all">
                  {walletData?.address ?? '7xKpABCDEF1234567890f3Nq'}
                </p>
                <Button size="sm" variant="outline" onClick={copyAddress} className="gap-2 text-xs">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
              </div>
              <Button onClick={handleDeposit} disabled={txLoading} className="w-full bg-primary hover:bg-primary/90 gap-2">
                {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownLeft className="w-4 h-4" />}
                Confirm Deposit
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Minimum deposit: 100 $STREAMING</p>
                <p>• Confirmations required: 1 (Solana)</p>
                <p>• Credited within: ~30 seconds</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Withdraw */}
        {activeTab === 'Withdraw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <form onSubmit={handleWithdraw} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Withdraw $STREAMING</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Destination wallet address</Label>
                  <Input
                    required
                    value={withdrawAddr}
                    onChange={e => setWithdrawAddr(e.target.value)}
                    placeholder="Solana address..."
                    className="mt-1.5 bg-secondary border-border font-mono text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Amount ($STREAMING)</Label>
                  <Input
                    required
                    type="number" min="100"
                    value={withdrawAmt}
                    onChange={e => setWithdrawAmt(e.target.value)}
                    placeholder="0"
                    className="mt-1.5 bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Available: {balance.toLocaleString()} $STREAMING</p>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={txLoading || !withdrawAmt || !withdrawAddr}>
                  {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                  {txLoading ? 'Submitting…' : `Withdraw ${withdrawAmt ? `${withdrawAmt} $STREAMING` : ''}`}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Network fee: ~0.000005 SOL · Minimum: 100 $STREAMING</p>
            </form>
          </motion.div>
        )}

        {/* Transfer */}
        {activeTab === 'Transfer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <form onSubmit={handleTransfer} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Transfer to Creator</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Recipient username or wallet</Label>
                  <Input
                    required
                    value={transferTo}
                    onChange={e => setTransferTo(e.target.value)}
                    placeholder="@creator or wallet address..."
                    className="mt-1.5 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-sm">Amount ($STREAMING)</Label>
                  <Input
                    required
                    type="number" min="1"
                    value={transferAmt}
                    onChange={e => setTransferAmt(e.target.value)}
                    placeholder="0"
                    className="mt-1.5 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-sm">Memo (optional)</Label>
                  <Input
                    value={transferMemo}
                    onChange={e => setTransferMemo(e.target.value)}
                    placeholder="Tip, collab share..."
                    className="mt-1.5 bg-secondary border-border"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={txLoading || !transferAmt || !transferTo}>
                  {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                  {txLoading ? 'Sending…' : `Send ${transferAmt ? `${transferAmt} $STREAMING` : ''}`}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
}