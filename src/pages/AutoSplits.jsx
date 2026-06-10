import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, Zap, Shield, Edit2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const DEFAULT_SPLITS = [
  { id: '1', name: 'Creator (You)', address: '7xKp...f3Nq', percentage: 70, locked: true, type: 'creator' },
  { id: '2', name: 'Platform Fee', address: 'Trident Treasury', percentage: 20, locked: true, type: 'platform' },
  { id: '3', name: 'Heir Split', address: '4mBq...r8Wa', percentage: 10, locked: false, type: 'heir' },
];

export default function AutoSplits() {
  const [splits, setSplits] = useState(DEFAULT_SPLITS);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPct, setNewPct] = useState('');

  const total = splits.reduce((s, r) => s + r.percentage, 0);
  const remaining = 100 - total;

  const addSplit = () => {
    if (!newName || !newPct) return;
    setSplits(prev => [...prev, {
      id: Date.now().toString(),
      name: newName,
      address: newAddress || 'No address set',
      percentage: Number(newPct),
      locked: false,
      type: 'custom',
    }]);
    setNewName(''); setNewAddress(''); setNewPct('');
    setAdding(false);
  };

  const removeSplit = (id) => setSplits(prev => prev.filter(s => s.id !== id));

  const typeColor = (type) => {
    if (type === 'creator') return 'text-accent bg-accent/10 border-accent/20';
    if (type === 'platform') return 'text-primary bg-primary/10 border-primary/20';
    if (type === 'heir') return 'text-chart-4 bg-chart-4/10 border-chart-4/20';
    return 'text-muted-foreground bg-secondary border-border';
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Auto-Splits</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Configure how revenue is automatically distributed on settlement.</p>
          </div>
          <Button onClick={() => setAdding(true)} className="gap-2 bg-primary hover:bg-primary/90 text-sm">
            <Plus className="w-4 h-4" /> Add Split
          </Button>
        </motion.div>

        {/* Total Bar */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total allocation</span>
            <span className={`font-bold ${total === 100 ? 'text-accent' : total > 100 ? 'text-destructive' : 'text-yellow-400'}`}>
              {total}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden flex">
            {splits.map(s => (
              <div
                key={s.id}
                className={`h-full transition-all ${s.type === 'creator' ? 'bg-accent' : s.type === 'platform' ? 'bg-primary' : s.type === 'heir' ? 'bg-chart-4' : 'bg-chart-3'}`}
                style={{ width: `${s.percentage}%` }}
              />
            ))}
          </div>
          {total !== 100 && (
            <p className={`text-xs ${total > 100 ? 'text-destructive' : 'text-yellow-400'}`}>
              {total > 100 ? `Over-allocated by ${total - 100}%. Reduce splits.` : `${remaining}% unallocated.`}
            </p>
          )}
          {total === 100 && (
            <p className="text-xs text-accent flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fully allocated — ready to settle.
            </p>
          )}
        </div>

        {/* Splits List */}
        <div className="space-y-3">
          {splits.map((split, i) => (
            <motion.div
              key={split.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-sm">{split.name}</p>
                  <Badge className={`text-xs capitalize ${typeColor(split.type)}`}>{split.type}</Badge>
                  {split.locked && <Badge className="text-xs bg-secondary text-muted-foreground border-border"><Shield className="w-3 h-3 mr-1" />Locked</Badge>}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{split.address}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display font-bold text-2xl text-foreground">{split.percentage}<span className="text-sm text-muted-foreground">%</span></p>
                </div>
                {!split.locked && (
                  <button onClick={() => removeSplit(split.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Split Form */}
        {adding && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-primary/20 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Add New Split Recipient</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name / Label</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Co-creator" className="mt-1 bg-secondary border-border text-sm h-9" />
              </div>
              <div>
                <Label className="text-xs">Percentage</Label>
                <Input value={newPct} onChange={e => setNewPct(e.target.value)} placeholder="0" type="number" min="0" max="100" className="mt-1 bg-secondary border-border text-sm h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Wallet Address (optional)</Label>
              <Input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Solana address..." className="mt-1 bg-secondary border-border text-sm h-9 font-mono" />
            </div>
            <div className="flex gap-2">
              <Button onClick={addSplit} size="sm" className="bg-primary hover:bg-primary/90 gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Split
              </Button>
              <Button onClick={() => setAdding(false)} size="sm" variant="outline" className="text-xs">Cancel</Button>
            </div>
          </motion.div>
        )}

        {/* Save */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="text-sm">Reset to Default</Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2 text-sm" disabled={total !== 100}>
            <Zap className="w-4 h-4" /> Save Split Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}