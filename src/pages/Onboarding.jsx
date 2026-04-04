import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Zap, CheckCircle, User, Palette, Wallet, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const STEPS = [
  { id: 1, label: 'Profile Setup', icon: User },
  { id: 2, label: 'Channel Branding', icon: Palette },
  { id: 3, label: 'CreatorVault', icon: Wallet },
  { id: 4, label: 'Monetization', icon: DollarSign },
  { id: 5, label: 'Finish', icon: CheckCircle },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const next = () => step < 5 ? setStep(step + 1) : navigate('/dashboard');
  const back = () => step > 1 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />
      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">Set Up Your Creator Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Just a few steps to launch your empire</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map(({ id, label, icon: Icon }, i) => (
            <div key={id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  step > id ? 'bg-accent border-accent' : step === id ? 'bg-primary border-primary' : 'bg-muted border-border'
                }`}>
                  {step > id ? <CheckCircle className="w-4 h-4 text-accent-foreground" /> : <Icon className={`w-4 h-4 ${step === id ? 'text-white' : 'text-muted-foreground'}`} />}
                </div>
                <span className={`text-xs hidden md:block ${step === id ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${step > id ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-border bg-card p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-lg">Profile Setup</h2>
              <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Your name" className="bg-muted" /></div>
              <div className="space-y-2"><Label>Username</Label><Input placeholder="@username" className="bg-muted" /></div>
              <div className="space-y-2"><Label>Bio</Label><Textarea placeholder="Tell the world about yourself..." className="bg-muted" rows={3} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-lg">Channel Branding</h2>
              <div className="space-y-2"><Label>Channel Name</Label><Input placeholder="My Creator Channel" className="bg-muted" /></div>
              <div className="space-y-2"><Label>Banner Image URL</Label><Input placeholder="https://..." className="bg-muted" /></div>
              <div className="space-y-2"><Label>Primary Color</Label>
                <div className="flex gap-2">
                  {['#7C3AED','#10B981','#F59E0B','#EF4444','#3B82F6'].map(c => (
                    <div key={c} className="w-8 h-8 rounded-full cursor-pointer border-2 border-border hover:border-white" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-lg">Connect CreatorVault</h2>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
                <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display font-semibold mb-2">CreatorVault Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">Connect your CreatorVault to receive $STREAMING payouts, tips, and revenue splits.</p>
                <Button className="bg-primary hover:bg-primary/90 gap-2"><Zap className="w-4 h-4" /> Connect CreatorVault</Button>
              </div>
              <Button variant="ghost" className="w-full text-muted-foreground">Skip for now</Button>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-lg">Monetization Preferences</h2>
              {[
                { label: 'Enable $STREAMING Tips', desc: 'Allow viewers to send tips during streams' },
                { label: 'Premium Video Unlocks', desc: 'Gate content behind $STREAMING payments' },
                { label: 'Podcast Boosts', desc: 'Let fans boost your podcast episodes' },
                { label: 'Creator Store', desc: 'Sell digital products and downloads' },
                { label: 'Affiliate Marketplace', desc: 'Earn commissions from affiliate links' },
              ].map(({ label, desc }) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="mt-1 accent-primary" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
          {step === 5 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-display font-bold text-2xl">You're all set!</h2>
              <p className="text-muted-foreground">Your creator account is ready. Start streaming, uploading, and earning.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Streaming','Video','Podcast','Store','Affiliates','$STREAMING'].map(b => (
                  <Badge key={b} className="bg-primary/20 text-primary border-primary/30">{b}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={back} disabled={step === 1}>Back</Button>
            <Button onClick={next} className="bg-primary hover:bg-primary/90">
              {step === 5 ? 'Go to Dashboard' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}