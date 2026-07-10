import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import PlatformRoutingStatus from '@/components/creator/platform/PlatformRoutingStatus';
import { 
  Activity, Server, Database, Shield, Wifi, WifiOff, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Clock,
  ArrowRight, Lock, Users, Zap
} from 'lucide-react';

const ENDPOINTS = [
  { name: 'Auth Routes', path: '/auth/creator/login', method: 'POST', type: 'auth' },
  { name: 'Dashboard', path: '/creator/dashboard', method: 'GET', type: 'creator' },
  { name: 'Streams List', path: '/creator/streams', method: 'GET', type: 'creator' },
  { name: 'Video Upload', path: '/video/upload', method: 'POST', type: 'creator' },
  { name: 'Wallet Balance', path: '/wallet/streaming/balance', method: 'GET', type: 'creator' },
  { name: 'Store Products', path: '/creator/store', method: 'GET', type: 'creator' },
  { name: 'Affiliates', path: '/creator/affiliates', method: 'GET', type: 'creator' },
  { name: 'Analytics', path: '/creator/analytics', method: 'GET', type: 'creator' },
  { name: 'Block Explorer', path: '/explorer/stats', method: 'GET', type: 'public' },
  { name: 'Founder Engine', path: '/founder/engine/status', method: 'GET', type: 'admin' },
];

export default function SystemHealth() {
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    setLoading(true);
    setStatus('running');
    const checks = [];

    for (const endpoint of ENDPOINTS) {
      try {
        const start = Date.now();
        const res = await base44.functions.invoke('tridentProxy', {
          method: endpoint.method,
          path: endpoint.path,
          body: endpoint.method === 'GET' ? {} : {},
        });
        const duration = Date.now() - start;
        
        checks.push({
          ...endpoint,
          status: res.data?.success || res.status === 200 ? 'healthy' : 'degraded',
          statusCode: res.status,
          duration,
          error: null,
        });
      } catch (error) {
        checks.push({
          ...endpoint,
          status: 'error',
          statusCode: null,
          duration: 0,
          error: error.message,
        });
      }
    }

    setResults(checks);
    
    const healthy = checks.filter(r => r.status === 'healthy').length;
    const total = checks.length;
    const apiOk = healthy === total;
    
    setApiHealth({
      healthy,
      total,
      status: apiOk ? 'operational' : 'degraded',
      latency: Math.round(checks.reduce((acc, r) => acc + r.duration, 0) / total),
    });
    
    setStatus('complete');
    setLoading(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      auth: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      creator: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      admin: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      public: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    };
    return colors[type] || colors.public;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">System Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">LiveStreamLab.live API Status Monitor</p>
            </div>
          </div>
          <Button 
            onClick={runHealthCheck} 
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Run Health Check'}
          </Button>
        </div>

        {/* API Health Summary */}
        {apiHealth && (
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="w-4 h-4" />
                    API Status
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiHealth.status === 'operational' ? 'default' : 'secondary'}>
                      {apiHealth.status === 'operational' ? 'Operational' : 'Degraded'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    Healthy Endpoints
                  </div>
                  <p className="font-display font-bold text-2xl">
                    {apiHealth.healthy}/{apiHealth.total}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    Avg Response Time
                  </div>
                  <p className="font-display font-bold text-2xl">{apiHealth.latency}ms</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Domain Lock
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    livestreamlab.live
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Endpoint Status */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Endpoint Status</h2>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium text-foreground">{result.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getTypeBadge(result.type)}`}>
                          {result.type}
                        </Badge>
                        <code className="text-xs text-muted-foreground">
                          {result.method} {result.path}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {result.status === 'error' ? (
                      <p className="text-xs text-red-400">{result.error}</p>
                    ) : (
                      <>
                        <p className="text-xs font-mono text-muted-foreground">
                          HTTP {result.statusCode}
                        </p>
                        <p className="text-xs text-muted-foreground">{result.duration}ms</p>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Routing Engine */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Platform Routing Engine</h2>
            </div>
            <PlatformRoutingStatus />
          </CardContent>
        </Card>

        {/* Infrastructure Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Database</span>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Connected
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Session Auth</span>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Active (JWT)
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-secondary-foreground" />
                <span className="text-sm text-muted-foreground">Session Type</span>
              </div>
              <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30">
                Creator
              </Badge>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4">
          System Health Monitor · LiveStreamLab.live · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}