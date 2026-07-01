import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import GoalCards from "./GoalCards";
import StrategyBoard from "./StrategyBoard";
import StreamMilestones from "./StreamMilestones";

const monthLabel = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

// WarRoom — unified monthly command center: performance goals, a content
// strategy board, and upcoming stream milestones.
export default function WarRoom() {
  const { walletAddress } = useIdentity();
  const today = new Date();
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);

  const shift = (delta) => {
    const [y, mo] = month.split("-").map(Number);
    const d = new Date(y, mo - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  if (!walletAddress) return <div className="p-6 max-w-3xl mx-auto"><p className="text-sm text-muted-foreground">Connect your wallet to open the War Room.</p></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center"><Rocket className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">War Room</h1>
            <p className="text-sm text-muted-foreground">Monthly strategy, performance goals, and stream milestones.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="w-8 h-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium min-w-[150px] text-center">{monthLabel(month)}</span>
          <button onClick={() => shift(1)} className="w-8 h-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <GoalCards wallet={walletAddress} month={month} />
      <StrategyBoard wallet={walletAddress} month={month} />
      <StreamMilestones wallet={walletAddress} />
    </div>
  );
}