import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, X, CheckCircle2 } from 'lucide-react';
import { publicApi } from '@/lib/tridentApi';

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function TipModal({ creator, onClose, onSuccess }) {
  const [amount, setAmount]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState(null);

  const handleTip = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await publicApi.sendTip({ toCreatorId: creator?.id, amount: Number(amount) });
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
    } catch (err) {
      setError(err.message || 'Tip failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="font-semibold text-lg">Tip Sent!</p>
            <p className="text-muted-foreground text-sm">
              {amount} $STREAMING sent to {creator?.name || 'creator'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Send Tip</h3>
                <p className="text-xs text-muted-foreground">to {creator?.name || 'creator'}</p>
              </div>
            </div>

            {/* Preset amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_AMOUNTS.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                    amount === String(p)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Input
              type="number"
              min="1"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(null); }}
              placeholder="Custom amount in $STREAMING"
              className="mb-2"
            />

            {error && <p className="text-destructive text-xs mb-3">{error}</p>}

            <Button onClick={handleTip} disabled={loading} className="w-full gap-2">
              <Zap className="w-4 h-4" />
              {loading ? 'Sending…' : `Tip ${amount ? amount + ' ' : ''}$STREAMING`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}