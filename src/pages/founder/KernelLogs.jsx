import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Download, RefreshCw, Filter, Search, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const INITIAL_LOGS = [
  { id: 1, level: 'info', engine: 'settlement', msg: 'Settlement cycle started — batch 4822', time: '00:00:01' },
  { id: 2, level: 'success', engine: 'autosplit', msg: 'AutoSplit: 1,205 transactions distributed — 100% success', time: '00:00:03' },
  { id: 3, level: 'info', engine: 'stream_ingest', msg: 'Stream session opened — CryptoSage · 2,431 viewers', time: '00:00:08' },
  { id: 4, level: 'warning', engine: 'settlement', msg: 'Settlement queue depth elevated — 210ms latency', time: '00:00:12' },
  { id: 5, level: 'info', engine: 'payouts', msg: 'Payout cycle queued — $18,420 pending', time: '00:00:20' },
  { id: 6, level: 'success', engine: 'settlement', msg: 'Batch 4822 finalized — 0 errors', time: '00:00:35' },
  { id: 7, level: 'info', engine: 'overwatch', msg: 'Anomaly scan initiated — 0 flags raised', time: '00:00:40' },
  { id: 8, level: 'error', engine: 'dao', msg: 'DAO engine unavailable — mainnet deployment pending', time: '00:00:55' },
  { id: 9, level: 'info', engine: 'stream_ingest', msg: 'CDN edge cache refreshed — US-East, EU-West', time: '00:01:04' },
  { id: 10, level: 'success', engine: 'payouts', msg: 'Payout processed — $4,200 · luna_stream', time: '00:01:20' },
];

const LEVELS = ['all', 'info', 'success', 'warning', 'error'];

export default function KernelLogs() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [streaming, setStreaming] = useState(true);

  useEffect(() => {
    if (!streaming) return;
    const EXTRA = [
      { level: 'info', engine: 'settlement', msg: 'Heartbeat OK — all validators responding' },
      { level: 'success', engine: 'autosplit', msg: 'Split settled — pixel_queen · $840 distributed' },
      { level: 'warning', engine: 'overwatch', msg: 'Unusual tip volume detected — monitoring' },
      { level: 'info', engine: 'stream_ingest', msg: 'New stream — neon_wolf · 1,200 viewers' },
    ];
    const interval = setInterval(() => {
      const entry = EXTRA[Math.floor(Math.random() * EXTRA.length)];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLogs(l => [{ ...entry, id: Date.now(), time }, ...l.slice(0, 99)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [streaming]);

  const filtered = logs.filter(l => {
    const matchLevel = filter === 'all' || l.level === filter;
    const matchSearch = !search || l.msg.toLowerCase().includes(search.toLowerCase()) || l.engine.includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const levelStyle = (level) => {
    if (level === 'success') return { text: 'text-accent', bg: 'bg-accent/10 text-accent border-accent/20', icon: CheckCircle2 };
    if (level === 'warning') return { text: 'text-yellow-400', bg: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20', icon: AlertTriangle };
    if (level === 'error') return { text: 'text-destructive', bg: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle };
    return { text: 'text-muted-foreground', bg: 'bg-secondary text-muted-foreground border-border', icon: Info };
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Kernel Logs</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Real-time Trident OS engine output stream.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setStreaming(!streaming)}>
              {streaming ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Live</> : <><RefreshCw className="w-3.5 h-3.5" /> Paused</>}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-8 h-8 text-xs bg-card border-border" />
          </div>
          <div className="flex gap-1.5">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setFilter(l)} className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize transition-all ${filter === l ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground bg-card hover:text-foreground'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Log Viewer */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">kernel :: logs</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {streaming && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />}
              {filtered.length} entries
            </div>
          </div>

          <div className="font-mono text-xs divide-y divide-border/30 max-h-[600px] overflow-y-auto">
            {filtered.map((log, i) => {
              const { text, bg, icon: LevelIcon } = levelStyle(log.level);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/10"
                >
                  <span className="text-muted-foreground w-16 flex-shrink-0 pt-0.5">{log.time}</span>
                  <Badge className={`text-xs ${bg} flex-shrink-0 gap-1 py-0`}>
                    <LevelIcon className="w-2.5 h-2.5" />{log.level}
                  </Badge>
                  <span className="text-primary/70 w-20 flex-shrink-0 truncate pt-0.5">[{log.engine}]</span>
                  <span className={`flex-1 ${text}`}>{log.msg}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}