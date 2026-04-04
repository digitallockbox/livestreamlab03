import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, sub, icon: Icon, trend, trendUp, accent = false }) {
  return (
    <div className={`rounded-xl border border-border p-5 bg-gradient-card ${accent ? 'border-primary/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/20' : 'bg-muted'}`}>
            <Icon className={`w-4 h-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-accent' : 'text-destructive'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
}