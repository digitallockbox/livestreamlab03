import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Upload, Zap, Settings2, Eye, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['Gaming','Music','Talk Show','Education','Creative','Sports','Tech','Other'];
const VISIBILITY = [
  { value: 'public', label: 'Public', IconComp: Eye, desc: 'Anyone can watch' },
  { value: 'subscribers', label: 'Subscribers', IconComp: Users, desc: 'Subscribers only' },
  { value: 'private', label: 'Private', IconComp: Lock, desc: 'Only you' },
];

export default function GoLive() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
          <Radio className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Go Live</h1>
          <p className="text-sm text-muted-foreground">Set up your stream and start broadcasting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">Stream Info</h3>
            <div>
              <Label className="mb-1.5 block">Stream Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Give your stream a compelling title..." className="bg-secondary border-border text-base" />
            </div>
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea placeholder="Tell viewers what this stream is about..." className="bg-secondary border-border resize-none" rows={3} />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Thumbnail</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG · 1280×720 recommended</p>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Visibility</h3>
            <div className="grid grid-cols-3 gap-3">
              {VISIBILITY.map(({ value, label, IconComp, desc }) => (
                <button key={value} onClick={() => setVisibility(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${visibility === value ? 'border-primary/50 bg-primary/10' : 'border-border bg-secondary hover:border-border/80'}`}>
                  <IconComp className={`w-4 h-4 mb-2 ${visibility === value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-semibold ${visibility === value ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Stream Settings */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">Stream Settings</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Resolution</Label>
                <Select defaultValue="1080p">
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1080p (Recommended)', '720p', '480p', '360p'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Bitrate</Label>
                <Select defaultValue="6000">
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ v: '6000', l: '6000 kbps (Best)' }, { v: '4500', l: '4500 kbps' }, { v: '3000', l: '3000 kbps' }, { v: '1500', l: '1500 kbps' }].map(b => <SelectItem key={b.v} value={b.v}>{b.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right — preview + $STREAMING + CTA */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Radio className="w-7 h-7 text-primary/40" />
                </div>
                <p className="text-sm text-muted-foreground">Camera Preview</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Will appear when live</p>
              </div>
            </div>
            <div className="p-3 flex items-center gap-2 border-t border-border">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">Not streaming</span>
            </div>
          </div>

          {/* $STREAMING panel */}
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">$STREAMING Tips Active</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Viewers can tip you $STREAMING tokens in real time during your stream. All tips route directly to your CreatorVault.</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Your cut</span>
              <span className="font-bold text-accent">100%</span>
            </div>
          </div>

          {/* CTA */}
          <Button onClick={() => navigate('/streaming/console')} disabled={!title}
            className="w-full bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/25 gap-2 text-base py-6 font-bold rounded-xl">
            <Radio className="w-5 h-5" /> Start Streaming
          </Button>
          <Button variant="outline" className="w-full border-border gap-2">
            Schedule for Later
          </Button>
        </div>
      </div>
    </div>
  );
}