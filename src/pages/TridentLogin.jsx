import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Zap, Shield, Eye, EyeOff, Radio, Lock,
  CheckCircle2, ArrowRight, Cpu, Globe, AlertTriangle
} from 'lucide-react';

const FEATURES = [
  { icon: Zap, label: '$STREAMING Token Economy', desc: 'Earn and spend native tokens across the platform.' },
  { icon: Radio, label: 'Live Streaming Infrastructure', desc: 'Low-latency streams with auto-split revenue.' },
  { icon: Shield, label: 'Aegis Security Layer', desc: 'Military-grade vault protection for your earnings.' },
  { icon: Globe, label: 'Trident OS Bridge', desc: 'Real-time settlement across all revenue channels.' },
];

export default function TridentLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [phantomLoading, setPhantomLoading] = useState(false);
  const [phantomError, setPhantomError] = useState('');
  const navigate = useNavigate();

  const connectPhantom = async () => {
    try {
      setPhantomError('');
      setPhantomLoading(true);
      
      // Check if Phantom is installed
      const provider = window.phantom?.solana;
      if (!provider) {
        setPhantomError('Phantom wallet not found. Install it at phantom.app');
        setPhantomLoading(false);
        return;
      }

      // Request connection
      const response = await provider.connect();
      const userPublicKey = response.publicKey.toString();
      
      // Simulate auth with wallet address
      await new Promise(r => setTimeout(r, 800));
      
      // Store wallet address and proceed
      localStorage.setItem('phantomWallet', userPublicKey);
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 4001) {
        setPhantomError(err.message || 'Failed to connect Phantom');
      }
      setPhantomLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (mode === 'register') {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-background via-card to-background border-r border-border relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-foreground text-lg">LiveStreamLab</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground font-mono">Powered by Trident OS</span>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-display text-4xl font-bold leading-tight">
              Your Creator Empire
              <span className="block text-gradient-brand mt-1">Starts Here.</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-sm">
              Stream, sell, earn — all through one sovereign platform built on the Trident OS infrastructure.
            </p>
          </motion.div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-8 border-t border-border pt-6">
          {[['14,800+', 'Creators'], ['$3.4M', 'ARR'], ['182M', '$STREAMING']].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="font-display font-bold text-foreground">{val}</p>
              <p className="text-xs text-muted-foreground">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">LiveStreamLab</span>
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-accent/10 text-accent border-accent/20 gap-1 text-xs font-mono">
                <Cpu className="w-3 h-3" /> Trident OS — Auth Layer
              </Badge>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {mode === 'login'
                ? 'Sign in to your creator console.'
                : 'Join 14,800+ creators on the network.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <Label className="text-sm">Full Name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 bg-secondary border-border h-11"
                  required
                />
              </div>
            )}

            <div>
              <Label className="text-sm">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 bg-secondary border-border h-11"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm">Password</Label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary border-border h-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Trident OS Protection Included
                </p>
                {['End-to-end encrypted vault', 'Auto-split revenue engine', '$STREAMING token rewards'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In to Console' : 'Create Creator Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-3">or</div>
          </div>

          {/* SSO Buttons */}
          <div className="space-y-3">
            <Button
              onClick={connectPhantom}
              disabled={phantomLoading}
              className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white text-xs gap-2 font-semibold"
              type="button"
            >
              {phantomLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                  </svg>
                  Connect Phantom Wallet
                </>
              )}
            </Button>
            {phantomError && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {phantomError}
              </p>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-3">or email</div>
            </div>
          </div>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured by Trident OS · AES-256 · Solana SPL</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}