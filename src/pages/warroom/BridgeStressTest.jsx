import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  Zap, Activity, Radio, CheckCircle2, AlertCircle, Clock,
  Play, Square, BarChart3, Wifi, AlertTriangle
} from "lucide-react";

const STRESS_SCENARIOS = [
  { id: "burst", label: "Burst Load", description: "20 rapid-fire transactions", count: 20, delayMs: 100 },
  { id: "surge", label: "Viewer Surge", description: "Simulate 5k viewer spike", count: 10, delayMs: 300 },
  { id: "sustained", label: "Sustained Load", description: "60s continuous traffic", count: 40, delayMs: 1500 },
  { id: "single", label: "Single Probe", description: "One clean health check", count: 1, delayMs: 0 },
];

const PROBE_PATHS = [
  "/system/health",
  "/analytics/overview",
  "/creator/profile",
  "/payouts/summary",
  "/store/items",
];

export default function BridgeStressTest() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, avgLatency: 0 });
  const [selectedScenario, setSelectedScenario] = useState("single");
  const stopRef = useRef(false);

  const runProbe = useCallback(async (path) => {
    const start = Date.now();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    try {
      await base44.functions.invoke("tridentProxy", { method: "GET", path });
      const latency = Date.now() - start;
      return { id, path, status: "success", latency, timestamp: new Date().toLocaleTimeString() };
    } catch {
      const latency = Date.now() - start;
      return { id, path, status: "failed", latency, timestamp: new Date().toLocaleTimeString() };
    }
  }, []);

  const runScenario = useCallback(async () => {
    const scenario = STRESS_SCENARIOS.find(s => s.id === selectedScenario);
    setRunning(true);
    stopRef.current = false;
    setResults([]);
    setStats({ total: 0, success: 0, failed: 0, avgLatency: 0 });

    let total = 0, success = 0, failed = 0, totalLatency = 0;

    for (let i = 0; i < scenario.count; i++) {
      if (stopRef.current) break;
      const path = PROBE_PATHS[i % PROBE_PATHS.length];
      const result = await runProbe(path);
      total++;
      if (result.status === "success") success++; else failed++;
      totalLatency += result.latency;

      setResults(prev => [result, ...prev].slice(0, 50));
      setStats({ total, success, failed, avgLatency: Math.round(totalLatency / total) });

      if (scenario.delayMs > 0) {
        await new Promise(r => setTimeout(r, scenario.delayMs));
      }
    }

    setRunning(false);
  }, [selectedScenario, runProbe]);

  const stop = () => { stopRef.current = true; setRunning(false); };

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;
  const healthColor = successRate >= 90 ? "text-accent" : successRate >= 60 ? "text-yellow-400" : "text-destructive";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Bridge Stress Test</h1>
          <p className="text-sm text-muted-foreground mt-1">UI → tridentProxy → Trident OS · Real-time latency &amp; fault analysis</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5">
          <Wifi className="w-3 h-3" /> Base44 ↔ Trident Bridge
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Probes", value: stats.total, icon: Activity, color: "text-primary" },
          { label: "Success", value: stats.success, icon: CheckCircle2, color: "text-accent" },
          { label: "Failed", value: stats.failed, icon: AlertCircle, color: "text-destructive" },
          { label: "Avg Latency", value: stats.total > 0 ? `${stats.avgLatency}ms` : "—", icon: Clock, color: "text-chart-3" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
            <div>
              <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Health bar */}
      {stats.total > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Bridge Health</span>
            <span className={`text-sm font-bold font-mono ${healthColor}`}>{successRate}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${successRate >= 90 ? "bg-accent" : successRate >= 60 ? "bg-yellow-400" : "bg-destructive"}`}
              initial={{ width: 0 }}
              animate={{ width: `${successRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Scenario Selector + Controls */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-foreground">Stress Scenario</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STRESS_SCENARIOS.map(s => (
            <button key={s.id} onClick={() => !running && setSelectedScenario(s.id)}
              className={`p-3 rounded-xl border text-left transition-all ${selectedScenario === s.id
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-secondary hover:border-primary/30"
              } ${running ? "opacity-50 cursor-not-allowed" : ""}`}>
              <p className={`text-sm font-semibold ${selectedScenario === s.id ? "text-primary" : "text-foreground"}`}>{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button onClick={runScenario} disabled={running}
            className="bg-primary hover:bg-primary/90 gap-2">
            <Play className="w-4 h-4" /> {running ? "Running..." : "Run Test"}
          </Button>
          {running && (
            <Button onClick={stop} variant="outline" className="border-destructive text-destructive gap-2">
              <Square className="w-4 h-4" /> Stop
            </Button>
          )}
        </div>
      </div>

      {/* Live Results Feed */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Radio className={`w-4 h-4 ${running ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
            Live Probe Feed
          </h3>
          {results.length > 0 && (
            <button onClick={() => { setResults([]); setStats({ total: 0, success: 0, failed: 0, avgLatency: 0 }); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
          )}
        </div>

        {results.length === 0 && !running && (
          <div className="text-center py-10 text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a scenario and run a test to see results</p>
          </div>
        )}

        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          <AnimatePresence initial={false}>
            {results.map(r => (
              <motion.div key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono ${
                  r.status === "success"
                    ? "bg-accent/5 border border-accent/10"
                    : "bg-destructive/5 border border-destructive/10"
                }`}>
                {r.status === "success"
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                }
                <span className="text-muted-foreground flex-shrink-0">{r.timestamp}</span>
                <span className={`flex-1 truncate ${r.status === "success" ? "text-accent" : "text-destructive"}`}>{r.path}</span>
                <span className={`flex-shrink-0 font-bold ${r.latency > 1000 ? "text-yellow-400" : r.status === "success" ? "text-accent" : "text-destructive"}`}>
                  {r.latency}ms
                </span>
                <Badge className={`text-[9px] flex-shrink-0 ${r.status === "success" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"}`}>
                  {r.status}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}