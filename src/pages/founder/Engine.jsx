import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Play, Square, RefreshCw, Terminal, Zap, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { founderApi } from '@/lib/tridentApi';

// Route all engine calls through the secure tridentProxy backend function
const proxy = {
  run:     (body) => base44.functions.invoke('tridentProxy', { method: 'POST', path: '/engine/run', body }).then(r => r.data),
  status:  ()     => base44.functions.invoke('tridentProxy', { method: 'GET',  path: '/founder/engine/status' }).then(r => r.data),
  restart: ()     => base44.functions.invoke('tridentProxy', { method: 'POST', path: '/founder/engine/restart' }).then(r => r.data),
  mode:    (mode) => base44.functions.invoke('tridentProxy', { method: 'POST', path: '/founder/engine/mode', body: { mode } }).then(r => r.data),
};

const ENGINES = [
  { id: 'settlement', name: 'Settlement Engine', desc: 'Processes $STREAMING token settlements on Solana', status: 'running', uptime: '99.98%', cycles: '4,821' },
  { id: 'autosplit', name: 'AutoSplit Engine', desc: 'Automatically distributes revenue to configured split targets', status: 'running', uptime: '100%', cycles: '1,204' },
  { id: 'stream_ingest', name: 'Stream Ingest Engine', desc: 'Manages live stream ingestion and CDN routing', status: 'running', uptime: '99.94%', cycles: '342' },
  { id: 'overwatch', name: 'Overwatch AI Engine', desc: 'Real-time anomaly detection and engagement intelligence', status: 'standby', uptime: '—', cycles: '0' },
  { id: 'payouts', name: 'Payout Engine', desc: 'Queues and processes USD payout cycles', status: 'running', uptime: '99.99%', cycles: '89' },
  { id: 'dao', name: 'DAO Governance Engine', desc: 'Handles on-chain proposal voting and execution', status: 'offline', uptime: '—', cycles: '0' },
];

export default function Engine() {
  const [engines, setEngines] = useState(ENGINES);
  const [running, setRunning] = useState({});
  const [logs, setLogs] = useState([]);
  const [simMode, setSimMode] = useState('SIM');
  const [simLoading, setSimLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    proxy.status()
      .then(data => {
        setLiveStatus(data);
        const ts = new Date().toLocaleTimeString();
        setLogs(l => [{ msg: `[${ts}] ✓ Live engine status loaded`, type: 'success' }, ...l]);
        if (data?.mode) setSimMode(data.mode);
      })
      .catch(err => {
        const ts = new Date().toLocaleTimeString();
        setLogs(l => [{ msg: `[${ts}] ⚠ Could not reach live status: ${err.message}`, type: 'error' }, ...l]);
      });
  }, []);

  const runEngine = async (engine) => {
    setRunning(r => ({ ...r, [engine.id]: true }));
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [{ msg: `[${timestamp}] Running engine: ${engine.name}...`, type: 'info' }, ...l]);

    try {
      await proxy.run({ engine_id: engine.id });
      setLogs(l => [{ msg: `[${timestamp}] ✓ ${engine.name} completed successfully`, type: 'success' }, ...l]);
      setEngines(e => e.map(en => en.id === engine.id ? { ...en, status: 'running' } : en));
    } catch (err) {
      setLogs(l => [{ msg: `[${timestamp}] ✗ ${engine.name} failed: ${err.message}`, type: 'error' }, ...l]);
    }

    setRunning(r => ({ ...r, [engine.id]: false }));
  };

  const toggleSimMode = async () => {
    const next = simMode === 'SIM' ? 'REAL' : 'SIM';
    setSimLoading(true);
    const ts = new Date().toLocaleTimeString();
    try {
      await proxy.mode(next);
      setSimMode(next);
      setLogs(l => [{ msg: `[${ts}] ✓ Engine mode set to ${next}`, type: 'success' }, ...l]);
    } catch (err) {
      setLogs(l => [{ msg: `[${ts}] ✗ Mode switch failed: ${err.message}`, type: 'error' }, ...l]);
    }
    setSimLoading(false);
  };

  const restartAll = async () => {
    const ts = new Date().toLocaleTimeString();
    setLogs(l => [{ msg: `[${ts}] Restarting all engines...`, type: 'info' }, ...l]);
    try {
      await proxy.restart();
      setLogs(l => [{ msg: `[${ts}] ✓ Engine restart initiated`, type: 'success' }, ...l]);
    } catch (err) {
      setLogs(l => [{ msg: `[${ts}] ✗ Restart failed: ${err.message}`, type: 'error' }, ...l]);
    }
  };

  const statusBadge = (s) => {
    if (s === 'running') return 'bg-accent/10 text-accent border-accent/20';
    if (s === 'standby') return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
    return 'bg-secondary text-muted-foreground border-border';
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-mono gap-1">
                <Cpu className="w-3 h-3" /> Founder OS
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Engine Control</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Run and monitor Trident OS engines.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs gap-1.5 cursor-pointer ${simMode === 'REAL' ? 'bg-red-400/10 text-red-400 border-red-400/30' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'}`}
              onClick={toggleSimMode}>
              {simLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              {simMode === 'REAL' ? 'LIVE MODE' : 'SIM MODE'} — click to toggle
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={restartAll}>
              <RefreshCw className="w-3.5 h-3.5" /> Restart All
            </Button>
          </div>
        </motion.div>

        {/* Engines Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {engines.map((engine, i) => (
            <motion.div
              key={engine.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-card border rounded-xl p-5 space-y-4 ${engine.status === 'offline' ? 'border-border opacity-60' : 'border-border'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{engine.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{engine.desc}</p>
                </div>
                <Badge className={`text-xs capitalize ${statusBadge(engine.status)}`}>{engine.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary rounded-lg px-3 py-2 text-xs">
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-bold text-foreground mt-0.5">{engine.uptime}</p>
                </div>
                <div className="bg-secondary rounded-lg px-3 py-2 text-xs">
                  <p className="text-muted-foreground">Cycles Run</p>
                  <p className="font-bold text-foreground mt-0.5">{engine.cycles}</p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => runEngine(engine)}
                disabled={running[engine.id]}
                className={`w-full gap-2 text-xs ${engine.status === 'offline' ? 'opacity-50' : ''}`}
                variant={engine.status === 'running' ? 'outline' : 'default'}
              >
                {running[engine.id] ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {running[engine.id] ? 'Running...' : `Run ${engine.name}`}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Console Output */}
        {logs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">engine-console :: output</span>
            </div>
            <div className="p-4 space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <p key={i} className={log.type === 'success' ? 'text-accent' : log.type === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                  {log.msg}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}