import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { web3Login } from "@/lib/web3/web3Login";
import { toast } from "sonner";

export default function Web3Login() {
  const [wallet, setWallet] = useState("");
  const [ens, setEns] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const connect = async () => {
    if (!wallet.trim()) {
      toast.error("Enter a wallet address");
      return;
    }
    setLoading(true);
    try {
      await web3Login(wallet.trim(), ens.trim());
      toast.success("Web3 session established");
      navigate("/web3/passport");
    } catch (e) {
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold text-center">Web3 Creator Login</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Connect your wallet to enter the creator economy
        </p>
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="bg-muted font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>ENS Name (optional)</Label>
            <Input
              value={ens}
              onChange={(e) => setEns(e.target.value)}
              placeholder="name.eth"
              className="bg-muted"
            />
          </div>
          <Button onClick={connect} disabled={loading} className="w-full gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Connect & Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}