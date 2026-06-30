import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No revenue data yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(262 83% 62%)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(262 83% 62%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="hsl(220 10% 48%)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(230 22% 10%)",
            border: "1px solid hsl(230 18% 17%)",
            borderRadius: 8,
            color: "hsl(220 20% 95%)"
          }}
        />
        <Area type="monotone" dataKey="value" stroke="hsl(262 83% 62%)" fill="url(#revGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}