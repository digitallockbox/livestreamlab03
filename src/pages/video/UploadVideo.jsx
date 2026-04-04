import { Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/ui/PageHeader';

export default function UploadVideo() {
  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <PageHeader title="Upload Video" subtitle="Publish and monetize your video content." />

      {/* Drop zone */}
      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="font-medium mb-1">Drag & drop your video here</p>
        <p className="text-sm text-muted-foreground mb-4">MP4, MOV, AVI up to 10GB</p>
        <Button variant="outline" className="border-border">Browse Files</Button>
      </div>

      <div className="space-y-2">
        <Label>Video Title</Label>
        <Input placeholder="Give your video a compelling title" className="bg-muted" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Describe your video content..." className="bg-muted" rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Thumbnail</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 cursor-pointer">
          <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Upload thumbnail (1280×720)</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />Monetization Options</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Premium Content</p>
            <p className="text-xs text-muted-foreground">Require $STREAMING tokens to unlock</p>
          </div>
          <Switch />
        </div>
        <div className="space-y-2">
          <Label>Unlock Price ($STREAMING)</Label>
          <Input type="number" placeholder="e.g. 500" className="bg-muted" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ad Revenue</p>
            <p className="text-xs text-muted-foreground">Enable ads on this video</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary/90 flex-1">Publish Video</Button>
        <Button variant="outline" className="border-border">Save Draft</Button>
      </div>
    </div>
  );
}