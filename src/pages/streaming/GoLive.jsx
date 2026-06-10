import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio, Upload, Zap, Settings2, Eye, Lock, Users, Copy, Check,
  Calendar, Clock, Tag, Plus, X, UserPlus, Shield, Key, ChevronDown, ChevronRight,
  Loader2, AlertCircle
} from 'lucide-react';
import { streamingApi } from '@/lib/tridentApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = ['Gaming','Music','Talk Show','Education','Creative','Sports','Tech','Other'];
const VISIBILITY = [
  { value: 'public',      label: 'Public',      IconComp: Eye,   desc: 'Anyone can watch' },
  { value: 'subscribers', label: 'Subscribers', IconComp: Users, desc: 'Subscribers only' },
  { value: 'private',     label: 'Private',      IconComp: Lock,  desc: 'Only you' },
];

const MOCK_STREAM_KEY = 'sk_live_a3f9c2d1e8b74g5h6j7k';
const MOCK_RTMP_URL   = 'rtmp://live.trident.io/app';

function SectionCard({ title, icon: Icon, children, collapsible = false }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        className={`w-full flex items-center gap-2 px-5 pt-5 pb-3 ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider flex-1 text-left">{title}</h3>
        {collapsible && (open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />)}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

export default function GoLive() {
  const navigate = useNavigate();

  // Core fields
  const [title, setTitle]             = useState('');
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility]   = useState('public');

  // Thumbnail
  const [thumbnail, setThumbnail]     = useState(null);
  const thumbRef = useRef();

  // Tags
  const [tagInput, setTagInput]       = useState('');
  const [tags, setTags]               = useState([]);

  // Settings
  const [resolution, setResolution]   = useState('1080p');
  const [bitrate, setBitrate]         = useState('6000');
  const [latency, setLatency]         = useState('low');

  // Monetisation
  const [tipsEnabled, setTipsEnabled]       = useState(true);
  const [tipGoal, setTipGoal]               = useState('');
  const [subOnlyChat, setSubOnlyChat]       = useState(false);
  const [slowMode, setSlowMode]             = useState(false);

  // Co-hosts
  const [coHostInput, setCoHostInput] = useState('');
  const [coHosts, setCoHosts]         = useState([]);

  // Schedule
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Stream key
  const [keyVisible, setKeyVisible]   = useState(false);
  const [keyCopied, setKeyCopied]     = useState(false);
  const [urlCopied, setUrlCopied]     = useState(false);

  // API state
  const [goLiveLoading, setGoLiveLoading] = useState(false);
  const [goLiveError, setGoLiveError]     = useState(null);

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const handleThumbDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '');
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const addCoHost = () => {
    const h = coHostInput.trim();
    if (h && !coHosts.includes(h)) {
      setCoHosts(prev => [...prev, h]);
      setCoHostInput('');
    }
  };

  const copyText = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const canGoLive = title.trim().length > 0;

  const handleGoLive = async () => {
    setGoLiveLoading(true);
    setGoLiveError(null);
    try {
      const res = await streamingApi.start({
        title, category, description, tags, visibility,
        resolution, bitrate, latency,
        tips_enabled: tipsEnabled, tip_goal: tipGoal,
        sub_only_chat: subOnlyChat, slow_mode: slowMode,
        co_hosts: coHosts,
        scheduled: scheduleMode,
        schedule_date: scheduleDate,
        schedule_time: scheduleTime,
      });
      navigate('/streaming/console', {
        state: { title, category, description, tags, visibility, thumbnail, resolution, bitrate, tipsEnabled, tipGoal, streamId: res?.stream_id }
      });
    } catch (err) {
      setGoLiveError(err.message);
    } finally {
      setGoLiveLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto pb-12">
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

      {goLiveError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" /> {goLiveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stream Info */}
          <SectionCard title="Stream Info">
            <div>
              <Label className="mb-1.5 block">Stream Title <span className="text-destructive">*</span></Label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Give your stream a compelling title..."
                className="bg-secondary border-border text-base" maxLength={120} />
              <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/120</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label className="mb-1.5 block">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['English','Spanish','French','German','Japanese','Portuguese','Korean'].map(l => (
                      <SelectItem key={l} value={l.toLowerCase().slice(0,2)}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Tell viewers what this stream is about..."
                className="bg-secondary border-border resize-none" rows={3} maxLength={500} />
              <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
            </div>
          </SectionCard>

          {/* Thumbnail */}
          <SectionCard title="Thumbnail">
            <div
              onClick={() => !thumbnail && thumbRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleThumbDrop}
              className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all cursor-pointer
                ${thumbnail ? 'border-primary/40' : 'border-border hover:border-primary/50 hover:bg-primary/5'}`}
              style={{ minHeight: '160px' }}
            >
              {thumbnail ? (
                <div className="relative">
                  <img src={thumbnail} alt="Thumbnail" className="w-full object-cover" style={{ maxHeight: '220px' }} />
                  <button
                    onClick={e => { e.stopPropagation(); setThumbnail(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-destructive/80 transition-colors">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); thumbRef.current.click(); }}
                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-xs text-white hover:bg-black/80 transition-colors">
                    Replace
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center group">
                  <Upload className="w-8 h-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG · 1280×720 recommended</p>
                </div>
              )}
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
            </div>
          </SectionCard>

          {/* Tags */}
          <SectionCard title="Tags" icon={Tag}>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Add a tag and press Enter"
                className="bg-secondary border-border text-sm" maxLength={30} />
              <Button size="sm" variant="outline" onClick={addTag} className="border-border shrink-0 gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1.5 text-xs py-1 px-2.5">
                    #{t}
                    <button onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                      <X className="w-3 h-3 hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{tags.length}/8 tags</p>
          </SectionCard>

          {/* Visibility */}
          <SectionCard title="Visibility" icon={Shield}>
            <div className="grid grid-cols-3 gap-3">
              {VISIBILITY.map(({ value, label, IconComp, desc }) => (
                <button key={value} onClick={() => setVisibility(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${visibility === value ? 'border-primary/50 bg-primary/10' : 'border-border bg-secondary hover:border-primary/30'}`}>
                  <IconComp className={`w-4 h-4 mb-2 ${visibility === value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-semibold ${visibility === value ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Co-hosts */}
          <SectionCard title="Co-Hosts" icon={UserPlus} collapsible>
            <div className="flex gap-2">
              <Input value={coHostInput} onChange={e => setCoHostInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCoHost()}
                placeholder="@username or email"
                className="bg-secondary border-border text-sm" />
              <Button size="sm" variant="outline" onClick={addCoHost} className="border-border shrink-0 gap-1">
                <Plus className="w-3.5 h-3.5" /> Invite
              </Button>
            </div>
            {coHosts.length > 0 && (
              <div className="space-y-2">
                {coHosts.map(h => (
                  <div key={h} className="flex items-center justify-between bg-secondary border border-border rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs text-primary font-bold">{h[0].toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-foreground">{h}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">Invited</Badge>
                      <button onClick={() => setCoHosts(prev => prev.filter(x => x !== h))}>
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Monetisation */}
          <SectionCard title="Monetisation" icon={Zap} collapsible>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">$STREAMING Tips</p>
                  <p className="text-xs text-muted-foreground">Viewers can tip tokens in real time</p>
                </div>
                <Switch checked={tipsEnabled} onCheckedChange={setTipsEnabled} />
              </div>
              {tipsEnabled && (
                <div>
                  <Label className="mb-1.5 block text-xs">Tip Goal (optional)</Label>
                  <div className="relative max-w-xs">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent" />
                    <Input value={tipGoal} onChange={e => setTipGoal(e.target.value)}
                      type="number" placeholder="e.g. 1000"
                      className="bg-secondary border-border text-sm pl-8" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">A goal bar will show in the stream overlay</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Subscriber-Only Chat</p>
                  <p className="text-xs text-muted-foreground">Restrict chat to subscribers</p>
                </div>
                <Switch checked={subOnlyChat} onCheckedChange={setSubOnlyChat} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Slow Mode</p>
                  <p className="text-xs text-muted-foreground">Limit chat to 1 message per 10s</p>
                </div>
                <Switch checked={slowMode} onCheckedChange={setSlowMode} />
              </div>
            </div>
          </SectionCard>

          {/* Stream Settings */}
          <SectionCard title="Stream Settings" icon={Settings2} collapsible>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1.5 block">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1080p','720p','480p','360p'].map(r => <SelectItem key={r} value={r}>{r}{r === '1080p' ? ' (Recommended)' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Bitrate</Label>
                <Select value={bitrate} onValueChange={setBitrate}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ v: '6000', l: '6000 kbps (Best)' }, { v: '4500', l: '4500 kbps' }, { v: '3000', l: '3000 kbps' }, { v: '1500', l: '1500 kbps' }].map(b =>
                      <SelectItem key={b.v} value={b.v}>{b.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Latency</Label>
                <Select value={latency} onValueChange={setLatency}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (2–3s)</SelectItem>
                    <SelectItem value="normal">Normal (5–7s)</SelectItem>
                    <SelectItem value="ultra">Ultra-Low (1s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>

          {/* Stream Key / RTMP */}
          <SectionCard title="Streaming Software (OBS / RTMP)" icon={Key} collapsible>
            <p className="text-xs text-muted-foreground">Use these credentials in OBS, Streamlabs, or any RTMP-compatible software.</p>
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block text-xs">RTMP Server URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={MOCK_RTMP_URL} className="bg-secondary border-border text-sm font-mono text-muted-foreground" />
                  <Button size="icon" variant="outline" className="border-border shrink-0"
                    onClick={() => copyText(MOCK_RTMP_URL, setUrlCopied)}>
                    {urlCopied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Stream Key</Label>
                <div className="flex gap-2">
                  <Input readOnly type={keyVisible ? 'text' : 'password'} value={MOCK_STREAM_KEY}
                    className="bg-secondary border-border text-sm font-mono text-muted-foreground" />
                  <Button size="sm" variant="outline" className="border-border shrink-0 text-xs h-9 px-3"
                    onClick={() => setKeyVisible(v => !v)}>
                    {keyVisible ? 'Hide' : 'Show'}
                  </Button>
                  <Button size="icon" variant="outline" className="border-border shrink-0"
                    onClick={() => copyText(MOCK_STREAM_KEY, setKeyCopied)}>
                    {keyCopied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-destructive/70 mt-1">Never share your stream key publicly.</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-5">
          {/* Preview card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center relative overflow-hidden">
              {thumbnail ? (
                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Radio className="w-7 h-7 text-primary/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Camera Preview</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Will appear when live</p>
                </div>
              )}
              {thumbnail && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <p className="text-white text-xs font-semibold truncate">{title || 'Untitled Stream'}</p>
                </div>
              )}
            </div>
            <div className="p-3 flex items-center gap-2 border-t border-border">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">Not streaming</span>
              {category && <Badge variant="secondary" className="text-xs ml-auto">{category}</Badge>}
            </div>
          </div>

          {/* $STREAMING panel */}
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">$STREAMING Tips {tipsEnabled ? 'Active' : 'Paused'}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tipsEnabled
                ? 'Viewers can tip you $STREAMING tokens in real time. All tips route directly to your CreatorVault.'
                : 'Tips are currently disabled. Enable them in Monetisation settings above.'}
            </p>
            {tipsEnabled && (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Your cut</span>
                <span className="font-bold text-accent">100%</span>
              </div>
            )}
            {tipsEnabled && tipGoal && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tip Goal</span>
                  <span className="font-medium text-foreground">${tipGoal}</span>
                </div>
                <div className="h-1.5 rounded-full bg-background/40">
                  <div className="h-full w-0 rounded-full bg-accent" />
                </div>
              </div>
            )}
          </div>

          {/* Schedule toggle */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Schedule</span>
              </div>
              <Switch checked={scheduleMode} onCheckedChange={setScheduleMode} />
            </div>
            {scheduleMode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs">Date</Label>
                  <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                    className="bg-secondary border-border text-sm" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Time</Label>
                  <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                    className="bg-secondary border-border text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          {scheduleMode ? (
            <Button
              disabled={!canGoLive || !scheduleDate || !scheduleTime}
              className="w-full bg-primary hover:bg-primary/90 shadow-lg gap-2 text-base py-6 font-bold rounded-xl">
              <Clock className="w-5 h-5" /> Schedule Stream
            </Button>
          ) : (
            <Button
              onClick={handleGoLive}
              disabled={!canGoLive || goLiveLoading}
              className="w-full bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/25 gap-2 text-base py-6 font-bold rounded-xl">
              {goLiveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5" />}
              {goLiveLoading ? 'Starting Stream…' : 'Go Live Now'}
            </Button>
          )}
          <Button variant="outline" onClick={() => setScheduleMode(v => !v)}
            className="w-full border-border gap-2 text-sm">
            {scheduleMode ? 'Go Live Instead' : <><Calendar className="w-4 h-4" /> Schedule for Later</>}
          </Button>

          {/* Readiness checklist */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pre-stream Checklist</p>
            {[
              { label: 'Stream title set', done: title.length > 0 },
              { label: 'Category selected', done: !!category },
              { label: 'Thumbnail uploaded', done: !!thumbnail },
              { label: 'Visibility configured', done: true },
              { label: '$STREAMING tips configured', done: true },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-accent/20 text-accent' : 'bg-secondary border border-border'}`}>
                  {item.done && <Check className="w-2.5 h-2.5" />}
                </div>
                <span className={`text-xs ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}