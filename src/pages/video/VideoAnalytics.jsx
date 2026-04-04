import { Eye, Clock, Zap, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const viewData = [
  { day: 'Mon', views: 1200 }, { day: 'Tue', views: 980 }, { day: 'Wed', views: 1540 },
  { day: 'Thu', views: 2100 }, { day: 'Fri', views: 1870 }, { day: 'Sat', views: 3200 }, { day: 'Sun', views: 2800 },
];

const revenueData = [
  { day: 'Mon', revenue: 120 }, { day: 'Tue', revenue: 90 }, { day: 'Wed', revenue: 210 },
  { day: 'Thu', revenue: 340 }, { day: 'Fri', revenue: 280 }, { day: 'Sat', revenue: 490 }, { day: 'Sun', revenue: 380 },
];

export default function VideoAnalytics() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader title="Video Analytics" subtitle="Performance data for your video library." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Views" value="29,600" icon={Eye} trend="+18% this week" trendUp accent />
        <StatCard title="Watch Time" value="1,240 hrs" icon={Clock} trend="+12% this week" trendUp />
        <StatCard title="Revenue" value="$1,760" icon={TrendingUp} trend="+28% this week" trendUp />
        <StatCard title="$STREAMING Unlocks" value="3,420" icon={Zap} trend="+34% this week" trendUp />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display font-semibold mb-4">Views This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viewData}>
              <XAxis dataKey="day" stroke="#4B5563" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4B5563" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8 }} />
              <Bar dataKey="views" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display font-semibold mb-4">Revenue This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <XAxis dataKey="day" stroke="#4B5563" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4B5563" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#34D399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Videos */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display font-semibold mb-4">Top Performing Videos</h2>
        <div className="space-y-3">
          {[
            { title: 'How I Built My Empire', views: 12400, revenue: 540, unlocks: 1200 },
            { title: 'Mindset Masterclass', views: 8900, revenue: 890, unlocks: 2100 },
            { title: 'Live Q&A Replay', views: 5600, revenue: 210, unlocks: 120 },
          ].map(({ title, views, revenue, unlocks }) => (
            <div key={title} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{views.toLocaleString()} views · {unlocks.toLocaleString()} unlocks</p>
              </div>
              <span className="font-semibold text-accent">${revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}