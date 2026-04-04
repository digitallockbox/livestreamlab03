import React from "react";
import { motion } from "framer-motion";
import { Zap, Users, DollarSign, TrendingUp, Globe, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "10K+", label: "Active Creators", color: "text-primary", bg: "bg-primary/10" },
  { icon: DollarSign, value: "$2.4M", label: "Total Paid Out", color: "text-accent", bg: "bg-accent/10" },
  { icon: Zap, value: "1.2B", label: "$STREAMING Tipped", color: "text-chart-3", bg: "bg-chart-3/10" },
  { icon: TrendingUp, value: "50M+", label: "Content Views", color: "text-chart-4", bg: "bg-chart-4/10" },
  { icon: Globe, value: "140+", label: "Countries", color: "text-chart-2", bg: "bg-chart-2/10" },
  { icon: Award, value: "99.9%", label: "Uptime SLA", color: "text-primary", bg: "bg-primary/10" },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-6 border-y border-border bg-card/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}