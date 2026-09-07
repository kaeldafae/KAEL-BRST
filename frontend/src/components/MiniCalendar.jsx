import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({ ocupadas = [], vip = false, onPick, value }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = view.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const todayIso = now.toISOString().slice(0, 10);
  const iso = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const navBtn = `w-7 h-7 rounded-full flex items-center justify-center transition-all ${vip ? 'text-[#E5C158] hover:bg-[#D4AF37]/15' : 'text-[#366A8B] hover:bg-[#EAF2F7]'}`;

  return (
    <div data-testid="occupation-calendar" className={`rounded-2xl p-4 ${vip ? 'bg-[#0F1A3A] border border-[#D4AF37]/25' : 'bg-[#F7F5F0] border border-[#366A8B]/12'}`}>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setOffset(offset - 1)} data-testid="calendar-prev" aria-label="Mes anterior" className={navBtn}><ChevronLeft size={15} /></button>
        <div className={`text-[12px] font-bold uppercase tracking-[.15em] ${vip ? 'text-[#E5C158]' : 'text-[#1C2D37]'}`}>{monthName}</div>
        <button type="button" onClick={() => setOffset(offset + 1)} data-testid="calendar-next" aria-label="Mes siguiente" className={navBtn}><ChevronRight size={15} /></button>
      </div>
      <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const f = iso(d);
          const busy = ocupadas.includes(f);
          const isSelected = value === f;
          const isToday = f === todayIso;
          const past = f < todayIso;
          let cls = vip ? 'text-[#C8D3E0] hover:bg-[#D4AF37]/15' : 'text-[#1C2D37] hover:bg-[#EAF2F7]';
          if (busy) cls = 'bg-red-500/90 text-white font-bold cursor-not-allowed';
          else if (isSelected) cls = vip ? 'bg-[#D4AF37] text-[#0A1128] font-bold' : 'bg-[#366A8B] text-white font-bold';
          else if (past) cls = vip ? 'text-[#8A9BAE]/50' : 'text-[#7A8F9E]/50';
          return (
            <button key={i} type="button" disabled={busy || !onPick} onClick={() => onPick && onPick(f)}
              data-testid={`calendar-day-${f}`}
              className={`aspect-square rounded-lg text-[11px] flex items-center justify-center transition-all ${cls} ${isToday && !busy ? 'ring-1 ring-current' : ''}`}>
              {d}
            </button>
          );
        })}
      </div>
      <div className={`mt-3 flex items-center gap-4 text-[10px] ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/90" /> Reservado</span>
        <span className="inline-flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded ${vip ? 'bg-[#D4AF37]' : 'bg-[#366A8B]'}`} /> Seleccionado</span>
      </div>
    </div>
  );
}
