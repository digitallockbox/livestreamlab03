import React, { useEffect, useState } from "react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Page, Card, Input, transfersAPI } from "@/components/creator/os";

export default function Wallet() {
  const { wallet, balance, loadingBalance, refreshBalance, sendStreaming } = useStreamingIdentity();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!wallet) return;
    transfersAPI.list(wallet).then((r) => setHistory(r.transfers || [])).finally(() => setLoading(false));
  }, [wallet]);
  const send = async () => {
    if (!wallet || !recipient.trim() || !amount) return;
    setBusy(true); setError(""); setSig(null);
    try {
      const s = await sendStreaming(recipient.trim(), Number(amount));
      setSig(s);
      await transfersAPI.record({ sender: wallet, recipient: recipient.trim(), amount: Number(amount), signature: s });
      refreshBalance();
      setRecipient(""); setAmount("");
    } catch (e) { setError(e?.message || "Transfer failed"); }
    finally { setBusy(false); }
  };
  return (
    <Page title="STREAMING Wallet" subtitle="On-chain $STREAMING transfers via Phantom">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-muted-foreground">Balance (on-chain)</p>
          <button onClick={refreshBalance} className="text-2xl font-display font-bold text-accent">
            {loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span>
          </button>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground">Your address</p>
          <p className="font-mono text-sm break-all">{wallet}</p>
        </Card>
      </div>
      <Card className="space-y-3 max-w-lg">
        <h3 className="font-display font-semibold">Send $STREAMING</h3>
        <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient wallet address" className="font-mono" />
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
        <button onClick={send} disabled={busy || !recipient.trim() || !amount} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          {busy ? "Signing…" : "Send (Phantom)"}
        </button>
        {sig && <p className="text-xs text-accent break-all">✓ Tx: {sig}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </Card>
      <Card>
        <h3 className="font-display font-semibold mb-3">Transfer History</h3>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : history.length === 0 ? <p className="text-sm text-muted-foreground">No transfers yet.</p> : history.map((t) => (
          <div key={t.id} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm">
            <span className="font-mono text-xs">{t.sender_wallet === wallet ? "→ " + (t.recipient_wallet || "").slice(0, 8) : "← " + (t.sender_wallet || "").slice(0, 8)}…</span>
            <span className="font-medium">{t.amount} $STREAMING</span>
          </div>
        ))}
      </Card>
    </Page>
  );
}