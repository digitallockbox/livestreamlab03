import React, { useState } from "react";
import { Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [50, 100, 250, 500, 1000, 5000];

export default function TipModal({ onClose }) {
  const [selected, setSelected] = useState(100);
  const [custom, setCustom] = useState('');
  const [sent, setSent] = useState(false);

  const amount = custom ? parseInt(custom) : selected;

  const handleSend = () => {
    setSent(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <p className="font-display font-bold text-xl text-foreground">Tip Sent!</p>
            <p className="text-sm text-muted-foreground mt-1">{amount} $STREAMING sent to ShadowCreator</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Send Tip</h2>
                <p className="text-xs text-muted-foreground">Tip with $STREAMING tokens</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setSelected(p); setCustom(''); }}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selected === p && !custom
                      ? 'bg-accent text-accent-foreground shadow-md shadow-accent/25'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <Input
                value={custom}
                onChange={e => { setCustom(e.target.value); setSelected(null); }}
                placeholder="Custom amount..."
                className="bg-secondary border-border text-center font-semibold"
                type="number"
              />
            </div>

            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between mb-5">
              <span className="text-sm text-muted-foreground">Sending</span>
              <span className="font-display font-bold text-lg text-accent flex items-center gap-1.5">
                <Zap className="w-4 h-4" />{amount || 0} $STR
              </span>
            </div>

            <Button
              onClick={handleSend}
              disabled={!amount}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2 h-11"
            >
              <Zap className="w-4 h-4" /> Send Tip
            </Button>
          </>
        )}
      </div>
    </div>
  );
}