import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { publicApi } from '@/lib/tridentApi';
import { toast } from 'sonner';

export default function StreamChat({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await publicApi.getStreamChat({ streamId });
        setMessages(data?.messages || []);
      } catch (err) {
        console.error('Failed to load chat:', err);
      }
    };

    loadMessages();

    // Poll for new messages every 2s
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [streamId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    try {
      await publicApi.sendStreamChat({
        streamId,
        message: input.trim()
      });
      setInput('');
      // Reload messages
      const data = await publicApi.getStreamChat({ streamId });
      setMessages(data?.messages || []);
    } catch (err) {
      toast.error('Failed to send message');
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 p-4 bg-background/50"
      >
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
            placeholder="Say something..."
            disabled={sending}
            className="h-8 text-xs"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !input.trim()}
            className="h-8 w-8 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}