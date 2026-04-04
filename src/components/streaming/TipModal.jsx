import React, { useState } from "react";
import { Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export default function TipModal({ open, onClose }) {
  const [selected, setSelected] = useState(100);
  const [custom, setCustom] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <p className="font-display font-bold text-lg text-foreground">Tip Sent!</p>
            <p className="text-sm text-muted-foreground mt-1">{custom || selected} $STREAMING sent to ShadowCreator</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Send $STREAMING Tip</h3>
                <p className="text-xs text-muted-foreground">100% goes to ShadowCreator</p>
              </div>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {PRESET_AMOUNTS.map(a => (
                <button key={a} onClick={() => { setSelected(a); setCustom(""); }}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${selected === a && !custom ? 'bg-accent/20 border border-accent/50 text-accent' : 'bg-secondary border border-border text-muted-foreground hover:border-accent/30 hover:text-accent'}`}>
                  {a}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mb-5">
              <Input value={custom} onChange={e => { setCustom(e.target.value); setSelected(null); }}
                placeholder="Custom amount..." className="bg-secondary border-border text-center font-semibold" />
              <p className="text-xs text-muted-foreground text-center mt-1">$STREAMING tokens</p>
            </div>

            <Button onClick={handleSend} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2 shadow-lg shadow-accent/20">
              <Zap className="w-4 h-4" /> Send {custom || selected} $STREAMING
            </Button>
          </>
        )}
      </div>
    </div>
  );
}