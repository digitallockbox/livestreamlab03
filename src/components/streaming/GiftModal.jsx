import React, { useState } from "react";
import { Gift, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const GIFTS = [
  { id: "bolt", emoji: "⚡", name: "Lightning Bolt", cost: 50, desc: "Quick energy burst" },
  { id: "rocket", emoji: "🚀", name: "Rocket", cost: 150, desc: "Blast off!" },
  { id: "crown", emoji: "👑", name: "Crown", cost: 500, desc: "Royal status" },
  { id: "diamond", emoji: "💎", name: "Diamond", cost: 1000, desc: "Ultimate respect" },
  { id: "fire", emoji: "🔥", name: "Fire Storm", cost: 250, desc: "Heat it up" },
  { id: "star", emoji: "⭐", name: "Superstar", cost: 750, desc: "You're a star" },
];

export default function GiftModal({ open, onClose }) {
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = () => {
    if (!selected) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSelected(null); onClose(); }, 1800);
  };

  const gift = GIFTS.find(g => g.id === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4 animate-bounce">{gift?.emoji}</div>
            <p className="font-display font-bold text-lg text-foreground">{gift?.name} Sent!</p>
            <p className="text-sm text-muted-foreground mt-1">ShadowCreator received your gift</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Send a Gift</h3>
                <p className="text-xs text-muted-foreground">Powered by $STREAMING</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {GIFTS.map(g => (
                <button key={g.id} onClick={() => setSelected(g.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${selected === g.id ? 'border-chart-3/50 bg-chart-3/10' : 'border-border bg-secondary hover:border-chart-3/30'}`}>
                  <div className="text-2xl mb-1">{g.emoji}</div>
                  <p className="text-xs font-semibold text-foreground">{g.name}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <Zap className="w-2.5 h-2.5 text-accent" />
                    <span className="text-xs text-accent font-bold">{g.cost}</span>
                  </div>
                </button>
              ))}
            </div>

            {gift && (
              <div className="bg-secondary rounded-xl px-3 py-2 mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{gift.emoji} {gift.name}</span>
                <span className="text-sm font-bold text-accent flex items-center gap-1"><Zap className="w-3 h-3" />{gift.cost} $STR</span>
              </div>
            )}

            <Button onClick={handleSend} disabled={!selected}
              className="w-full bg-chart-3/20 hover:bg-chart-3/30 text-chart-3 border border-chart-3/30 font-bold gap-2">
              <Gift className="w-4 h-4" /> Send Gift
            </Button>
          </>
        )}
      </div>
    </div>
  );
}