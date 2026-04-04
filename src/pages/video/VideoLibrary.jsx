import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Eye, Zap, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';

const VIDEOS = [
  { id: 1, title: 'How I Built My Empire from Zero', views: 12400, revenue: 540, status: 'published', premium: false, thumb: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80' },
  { id: 2, title: 'Mindset Masterclass — Full Course', views: 8900, revenue: 890, status: 'premium', premium: true, thumb: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80' },
  { id: 3, title: 'Studio Tour 2026', views: 3200, revenue: 120, status: 'published', premium: false, thumb: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80' },
  { id: 4, title: 'Crypto Concepts Explained', views: 0, revenue: 0, status: 'draft', premium: false, thumb: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80' },
  { id: 5, title: 'Live Q&A Replay — March', views: 5600, revenue: 210, status: 'published', premium: false, thumb: 'https://images.unsplash.com/photo-1581368135153-a506cf13b1e1?w=400&q=80' },
  { id: 6, title: 'Premium Workflow Secrets', views: 2100, revenue: 1200, status: 'premium', premium: true, thumb: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80' },
];

const STATUS_COLORS = { published: 'bg-accent/15 text-accent', premium: 'bg-primary/20 text-primary', draft: 'bg-muted text-muted-foreground' };

export default function VideoLibrary() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? VIDEOS : VIDEOS.filter(v => v.status === filter);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="Video Library" subtitle="Manage all your video content.">
        <Link to="/upload-video"><Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Upload Video</Button></Link>
      </PageHeader>

      <div className="flex gap-2">
        {['all','published','premium','draft'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(({ id, title, views, revenue, status, premium, thumb }) => (
          <div key={id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors group">
            <div className="relative aspect-video">
              <img src={thumb} alt={title} className="w-full h-full object-cover" />
              {premium && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              )}
              <Badge className={`absolute bottom-2 left-2 ${STATUS_COLORS[status]} capitalize`}>{status}</Badge>
            </div>
            <div className="p-4">
              <p className="font-medium text-sm line-clamp-2 mb-3">{title}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{views.toLocaleString()} views</div>
                <span className="font-semibold text-accent">${revenue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}