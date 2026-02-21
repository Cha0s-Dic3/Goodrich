import { FormEvent, useMemo, useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export function AppChatWidget() {
  const { currentPage, language, cart } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hello. I can help with products, cart, checkout, payment, orders, and account support.'
    }
  ]);

  const cartItems = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentPage,
          language,
          cartItems
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const reply = typeof data.reply === 'string' ? data.reply : 'No response.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Failed to contact assistant.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed left-4 bottom-5 z-50">
      {open ? (
        <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#D8C2A3] bg-[#FFF9EE] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#E7D7C2] px-3 py-2">
            <p className="text-sm font-semibold text-[#3D2817]">App Assistant</p>
            <button
              type="button"
              className="rounded-md p-1 text-[#6B5344] hover:bg-[#F3E7D7]"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={
                  msg.role === 'user'
                    ? 'ml-8 rounded-xl bg-[#3D2817] px-3 py-2 text-sm text-white'
                    : 'mr-8 rounded-xl bg-[#F3E7D7] px-3 py-2 text-sm text-[#3D2817]'
                }
              >
                {msg.text}
              </div>
            ))}
            {loading ? (
              <div className="mr-8 rounded-xl bg-[#F3E7D7] px-3 py-2 text-sm text-[#3D2817] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            ) : null}
          </div>

          <form onSubmit={sendMessage} className="border-t border-[#E7D7C2] p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this page..."
              className="flex-1 rounded-lg border border-[#D8C2A3] bg-white px-3 py-2 text-sm text-[#3D2817] outline-none focus:ring-2 focus:ring-[#8B4513]/30"
              maxLength={1500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-[#8B4513] px-3 py-2 text-white disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 w-11 rounded-full border border-[#D8C2A3] bg-[#FFF9EE] text-[#3D2817] shadow-lg hover:bg-[#F7EDDE]"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="mx-auto h-5 w-5" />
        </button>
      )}
    </div>
  );
}

