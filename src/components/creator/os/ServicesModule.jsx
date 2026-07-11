import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { autosplitsApi, creatorApi } from "@/lib/tridentApi";
import { Card, Spinner } from "@/components/creator/os";

export default function ServicesModule() {
  const { walletAddress } = useIdentity();
  const [splits, setSplits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState("");
  const [percent, setPercent] = useState("");

  const load = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const [splitRes, aRes] = await Promise.allSettled([
        autosplitsApi.list({ creatorWallet: walletAddress }),
        creatorApi.analytics({ creatorWallet: walletAddress }),
      ]);
      if (splitRes.status === "fulfilled") setSplits(splitRes.value?.splits || []);
      if (aRes.status === "fulfilled") setAnalytics(aRes.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [walletAddress]);

  const createSplit = async () => {
    if (!walletAddress || !recipient || !percent) return;
    await autosplitsApi.create({ creatorWallet: walletAddress, recipientWallet: recipient, percentage: Number(percent) });
    setRecipient(""); setPercent("");
    load();
  };

  const deleteSplit = async (id) => {
    await autosplitsApi.delete({ creatorWallet: walletAddress, splitId: id });
    load();
  };

  const totalAllocated = splits.reduce((sum, s) => sum + (s.percentage || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Auto-Splits</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${totalAllocated >= 100 ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>
            {totalAllocated}% allocated
          </span>
        </div>
        {splits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No auto-splits configured. Revenue goes 100% to your wallet.</p>
        ) : (
          <div className="space-y-2">
            {splits.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs truncate">{s.recipientWallet}</p>
                  <p className="text-sm text-primary font-medium">{s.percentage}%</p>
                </div>
                <button onClick={() => deleteSplit(s.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-display font-bold text-lg mb-4">Add Split</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-3">
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient wallet" className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          <input value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="% (e.g. 25)" type="number" className="rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          <button onClick={createSplit} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </Card>
      {analytics && (
        <Card>
          <h3 className="font-display font-bold text-lg mb-4">Service Analytics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-display font-bold">${analytics.totalRevenue || 0}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Active Splits</p>
              <p className="text-lg font-display font-bold">{splits.length}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-display font-bold">{100 - totalAllocated}%</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}