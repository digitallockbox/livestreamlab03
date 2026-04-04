import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';

const CATEGORIES = ['gaming','music','talk_show','education','creative','sports','tech','other'];

export default function GoLive() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <PageHeader title="Go Live" subtitle="Set up your stream and start broadcasting." />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Stream Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter your stream title..." className="bg-muted text-lg" />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-muted"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('_',' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Tell viewers what this stream is about..." className="bg-muted" rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Thumbnail</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop or click to upload thumbnail</p>
            <p className="text-xs text-muted-foreground mt-1">1280×720 recommended</p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">$STREAMING Tips Enabled</span>
          </div>
          <p className="text-xs text-muted-foreground">Viewers can tip you $STREAMING tokens during your stream in real time.</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate('/streamer-console')} disabled={!title}
            className="bg-red-500 hover:bg-red-600 gap-2 text-base px-8 flex-1">
            <Radio className="w-5 h-5" /> Start Streaming
          </Button>
          <Button variant="outline" className="border-border">Schedule</Button>
        </div>
      </div>
    </div>
  );
}