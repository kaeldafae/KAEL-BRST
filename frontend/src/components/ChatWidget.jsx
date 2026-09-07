import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Flag } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hola, soy el asistente de KAEL. Puedo ayudarte a elegir barco, resolver dudas sobre las empresas o registrar una queja.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [nota, setNota] = useState(null);
  const bottomRef = useRef(null);
  const sessionRef = useRef(null);

  if (!sessionRef.current) {
    let s = null;
    try { s = localStorage.getItem('kael-chat-session'); } catch { /* noop */ }
    if (!s) {
      s = crypto.randomUUID();
      try { localStorage.setItem('kael-chat-session', s); } catch { /* noop */ }
    }
    sessionRef.current = s;
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, nota]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setNota(null);
    setSending(true);
    setMessages((m) => [...m, { role: 'user', text }, { role: 'assistant', text: '' }]);
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionRef.current, mensaje: text }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const data = JSON.parse(payload);
            if (data.t) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: 'assistant', text: copy[copy.length - 1].text + data.t };
                return copy;
              });
            }
            if (data.nota) setNota(data.nota);
          } catch { /* noop */ }
        }
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', text: 'No he podido conectar. Inténtalo de nuevo en unos segundos.' };
        return copy;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} data-testid="chat-widget-button" aria-label="Abrir chat con el asistente"
        className={`fixed bottom-6 right-6 z-[80] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          open ? 'bg-[#1C2D37] text-white rotate-90' : 'bg-[#366A8B] text-white shadow-[0_10px_30px_rgba(54,106,139,.4)]'
        }`}>
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      <div data-testid="chat-panel"
        className={`fixed bottom-24 right-6 z-[80] w-[calc(100vw-3rem)] sm:w-[380px] max-h-[70vh] rounded-[24px] bg-white shadow-[0_24px_80px_rgba(10,17,40,.28)] border border-[#366A8B]/12 flex flex-col overflow-hidden transition-all duration-400 origin-bottom-right ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}>
        <div className="bg-[#0A1128] px-5 py-4 flex items-center gap-3">
          <img src="/img/logomark.svg" alt="" className="w-8 h-8 rounded-lg" />
          <div>
            <div className="text-[#F7F5F0] text-sm font-bold tracking-wide">Asistente KAEL</div>
            <div className="text-[#8A9BAE] text-[11px]">Dudas, empresas y quejas</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#F7F5F0]" data-testid="chat-messages" style={{ minHeight: 260 }}>
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'self-end bg-[#366A8B] text-white rounded-br-md'
                : 'self-start bg-white text-[#1C2D37] shadow-sm rounded-bl-md'
            }`}>
              {m.text}{m.role === 'assistant' && sending && i === messages.length - 1 && !m.text && <span className="opacity-50">…</span>}
            </div>
          ))}
          {nota && (
            <div data-testid="chat-note-flag"
              className="self-start flex items-start gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3.5 py-2.5 text-xs text-[#7a6516]">
              <Flag size={13} className="mt-0.5 shrink-0" />
              <span>Queja registrada para el equipo · importancia <b>{nota.importancia}</b>{nota.resumen ? ` · ${nota.resumen}` : ''}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="p-3 border-t border-[#366A8B]/10 bg-white flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} data-testid="chat-input"
            placeholder="Escribe tu mensaje…"
            className="flex-1 rounded-full bg-[#F3EFE6] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30 transition-all" />
          <button type="submit" disabled={sending || !input.trim()} data-testid="chat-send-btn" aria-label="Enviar mensaje"
            className="w-10 h-10 rounded-full bg-[#0A1128] text-[#E5C158] flex items-center justify-center transition-all hover:bg-[#366A8B] hover:text-white disabled:opacity-40">
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
