import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Heart, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function CreatorCard({ creator }) {
  const [following, setFollowing] = useState(false);
  const [notified, setNotified] = useState(false);

  if (!creator) return null;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
      <Avatar className="w-16 h-16 flex-shrink-0">
        <AvatarImage src={creator.avatar_url} alt={creator.display_name} />
        <AvatarFallback>{creator.display_name?.[0] || '?'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <Link to={`/user/${creator.username}`} className="hover:opacity-75 transition-opacity">
          <h3 className="font-display font-bold text-lg leading-tight mb-0.5">
            {creator.display_name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">
          @{creator.username}
        </p>
        {creator.bio && (
          <p className="text-sm text-foreground/70 mb-3">
            {creator.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={following ? 'outline' : 'default'}
            onClick={() => setFollowing(!following)}
            className="gap-1.5"
          >
            {following ? (
              <>
                <Heart className="w-3.5 h-3.5 fill-current" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Follow
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant={notified ? 'default' : 'outline'}
            onClick={() => setNotified(!notified)}
            className="gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            {notified ? 'Notified' : 'Notify'}
          </Button>
        </div>
      </div>
    </div>
  );
}