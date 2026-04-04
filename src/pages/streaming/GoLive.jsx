import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Upload, Zap, Settings2, Eye, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['gaming', 'music', 'talk_show', 'education', 'creative', 'sports', 'tech', 'other'];
const VISIBILITY = [
  { value: 'public', label: 'Public', icon: Eye, desc: 'Anyone can watch' },
  { value: 'subscribers', label: 'Subscribers', icon: Users, desc: 'Subscribers only' },
  { value: 'private', label: 'Private', icon: Lock, desc: 'Only you' },
];

export default function GoLive() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Go Live</h1>
            <p className="text-sm text-muted-foreground">Set up your broadcast and start streaming.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-foreground">Stream Details</h3>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stream Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What are you streaming today?"
                className="bg-secondary border-border text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className="capitalize">{c.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <Input placeholder="gaming, fps, live..." className="bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea placeholder="Tell viewers what this stream is about..." className="bg-secondary border-border resize-none" rows={3} />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Thumbnail</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-sm text-muted-foreground">Drag & drop or <span className="text-primary">browse</span> to upload</p>
              <p className="text-xs text-muted-foreground mt-1">1280×720 recommended • PNG, JPG</p>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Visibility</h3>
            <div className="grid grid-cols-3 gap-3">
              {VISIBILITY.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVisibility(v.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    visibility === v.value
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-secondary text-muted-foreground hover:border-border/80'
                  }`}
                >
                  <v.icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{v.label}</span>
                  <span className="text-xs opacity-70">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
              <div className="text-center">
                <Radio className="w-10 h-10 text-primary/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Preview</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-foreground truncate">{title || 'Your stream title'}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{category || 'No category'}</p>
            </div>
          </div>

          {/* Stream Settings */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display font-semibold text-sm text-foreground">Stream Settings</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Resolution</span>
                <Select defaultValue="1080p">
                  <SelectTrigger className="w-24 h-7 text-xs bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1080p', '720p', '480p'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bitrate</span>
                <Select defaultValue="6000">
                  <SelectTrigger className="w-28 h-7 text-xs bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[['6000', '6000 kbps'], ['4500', '4500 kbps'], ['3000', '3000 kbps']].map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frame Rate</span>
                <Select defaultValue="60">
                  <SelectTrigger className="w-20 h-7 text-xs bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['60', '30'].map(f => <SelectItem key={f} value={f}>{f} fps</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* $STREAMING panel */}
          <div className="bg-gradient-to-br from-accent/15 to-primary/10 border border-accent/25 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">$STREAMING Tips Enabled</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Viewers can send you $STREAMING tips in real time. Earnings route instantly to your CreatorVault.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/streaming/console')}
              disabled={!title}
              className="w-full bg-destructive hover:bg-destructive/90 gap-2 text-base font-bold h-12 shadow-lg shadow-destructive/25"
            >
              <Radio className="w-5 h-5" /> Start Streaming
            </Button>
            <Button variant="outline" className="w-full border-border text-muted-foreground">
              Schedule for Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}