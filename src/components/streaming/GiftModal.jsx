import React, { useState } from "react";
import { Gift, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const GIFTS = [
  { id: "spark", emoji: "⚡", label: "Spark", cost: 50 },
  { id: "fire", emoji: "🔥", label: "Fire", cost: 100 },
  { id: "rocket", emoji: "🚀", label: "Rocket", cost: 250 },
  { id: "crown", emoji: "👑", label: "Crown", cost: 500 },
  { id: "diamond", emoji: "💎", label: "Diamond", cost: 1000 },
  { id: "galaxy", emoji: "🌌", label: "Galaxy", cost: 5000 },
];

export default function GiftModal({ onClose }) {
  const [selected, setSelected] = useState(GIFTS[1]);
  const [sent, setSent] = useState(false);

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
            <div className="text-5xl mb-4">{selected.emoji}</div>
            <p className="font-display font-bold text-xl text-foreground">{selected.label} Gift Sent!</p>
            <p className="text-sm text-muted-foreground mt-1">{selected.cost} $STR gifted to ShadowCreator</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Send Gift</h2>
                <p className="text-xs text-muted-foreground">Gift with $STREAMING tokens</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {GIFTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    selected.id === g.id
                      ? 'border-chart-3/50 bg-chart-3/10'
                      : 'border-border bg-secondary hover:border-border/60'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{g.label}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-accent" />{g.cost}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between mb-5">
              <span className="text-sm text-muted-foreground">Gift</span>
              <span className="font-display font-bold text-foreground flex items-center gap-2">
                {selected.emoji} {selected.label}
                <span className="text-accent text-sm flex items-center gap-0.5">
                  <Zap className="w-3 h-3" />{selected.cost} $STR
                </span>
              </span>
            </div>

            <Button
              onClick={handleSend}
              className="w-full bg-chart-3 hover:bg-chart-3/90 text-white font-bold gap-2 h-11"
            >
              <Gift className="w-4 h-4" /> Send Gift
            </Button>
          </>
        )}
      </div>
    </div>
  );
}