import { useState } from 'react';
import { Zap, Lock, ThumbsUp, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const RELATED = [
  { title: 'Studio Tour 2026', views: '3.2K', thumb: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&q=80' },
  { title: 'Live Q&A Replay — March', views: '5.6K', thumb: 'https://images.unsplash.com/photo-1581368135153-a506cf13b1e1?w=200&q=80' },
  { title: 'Mindset Masterclass', views: '8.9K', thumb: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=80' },
];

const COMMENTS = [
  { user: 'viewer_x', text: 'This changed my entire perspective. Thank you!', likes: 24 },
  { user: 'creatorPro', text: 'Best content I\'ve seen this year.', likes: 18 },
  { user: 'samFan2026', text: 'When is the next episode?', likes: 7 },
];

export default function VideoPlayer() {
  const [unlocked, setUnlocked] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="flex flex-col xl:flex-row gap-0">
        <div className="flex-1 min-w-0">
          {/* Video */}
          <div className="relative bg-black aspect-video w-full flex items-center justify-center">
            {!unlocked ? (
              <div className="text-center p-8">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl mb-2">Premium Content</h3>
                <p className="text-muted-foreground text-sm mb-6">Unlock this video with $STREAMING tokens</p>
                <Button onClick={() => setUnlocked(true)} className="bg-primary hover:bg-primary/90 gap-2">
                  <Zap className="w-4 h-4" /> Unlock for 500 $STREAMING
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-lg">▶ Video Player</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 border-b border-border">
            <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">Premium</Badge>
            <h1 className="text-xl font-display font-bold mb-2">Mindset Masterclass — Full Course</h1>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>8,900 views</span>
                <span>2 weeks ago</span>
                <span className="flex items-center gap-1 text-primary"><Zap className="w-3 h-3" />2,100 unlocks</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 border-border"><ThumbsUp className="w-4 h-4" />4.2K</Button>
                <Button variant="outline" size="sm" className="gap-2 border-border"><Share2 className="w-4 h-4" />Share</Button>
                <Button variant="outline" size="sm" className="gap-2 border-border"><Bookmark className="w-4 h-4" />Save</Button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="p-6 space-y-4">
            <h2 className="font-display font-semibold">Comments</h2>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="bg-muted" rows={2} />
            <Button size="sm" className="bg-primary hover:bg-primary/90">Post Comment</Button>
            <div className="space-y-4 mt-4">
              {COMMENTS.map(({ user, text, likes }) => (
                <div key={user} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">{user.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-medium">{user}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{text}</p>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-1 h-6 px-2"><ThumbsUp className="w-3 h-3 mr-1" />{likes}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="xl:w-80 border-l border-border p-4 space-y-3">
          <h2 className="font-display font-semibold text-sm mb-4">Related Videos</h2>
          {RELATED.map(({ title, views, thumb }) => (
            <div key={title} className="flex gap-3 cursor-pointer group hover:bg-muted/20 rounded-lg p-2 transition-colors">
              <img src={thumb} alt={title} className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
              <div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}