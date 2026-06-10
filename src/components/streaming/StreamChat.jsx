import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Wifi, WifiOff } from 'lucide-react';

const WS_BASE = 'wss://api.tridentsystem.live/chat/stream';

export default function StreamChat({ streamId }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef                 = useRef(null);
  const scrollRef                 = useRef(null);

  // WebSocket lifecycle
  useEffect(() => {
    if (!streamId) return;

    const ws = new WebSocket(`${WS_BASE}/${streamId}`);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages(prev => [...prev.slice(-199), msg]); // keep last 200
      } catch (err) {
        console.error('Chat parse error:', err);
      }
    };

    ws.onclose  = () => setConnected(false);
    ws.onerror  = () => setConnected(false);

    return () => ws.close();
  }, [streamId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({ streamId, text: input.trim() }));
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium border-b border-border ${
        connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
      }`}>
        {connected
          ? <><Wifi className="w-3 h-3" /> Connected</>
          : <><WifiOff className="w-3 h-3" /> Connecting…</>
        }
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-4 bg-background/50">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span className="font-semibold text-accent">{msg.user}</span>
              <span className="text-muted-foreground">: {msg.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/50">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected ? 'Say something…' : 'Waiting for connection…'}
            disabled={!connected}
            className="h-8 text-xs"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!connected || !input.trim()}
            className="h-8 w-8 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}