import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { boatById, companyOf } from '@/data/catalog';

export default function MiniLoader() {
  const { pathname } = useLocation();
  const [state, setState] = useState(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    let vip = false;
    if (pathname.startsWith('/barco/')) {
      const boat = boatById(pathname.split('/')[2]);
      vip = companyOf(boat)?.tier === 'premium';
    }
    setState({ vip });
    const t = setTimeout(() => setState(null), 950);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!state) return null;
  const color = state.vip ? '#D4AF37' : '#366A8B';

  return (
    <div data-testid="route-loader"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] rounded-full pl-4 pr-5 py-2.5 flex items-center gap-3 shadow-xl ${
        state.vip ? 'bg-[#0A1128] border border-[#D4AF37]/40 vip-glow' : 'bg-white border border-[#366A8B]/15'
      }`}>
      <div className="relative w-[104px] h-6 overflow-hidden">
        <svg className="mini-boat absolute top-0 left-0" width="26" height="22" viewBox="0 0 260 215" fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34,154 L222,154 L198,186 L58,186 Z" />
          <path d="M130,22 L130,154" />
          <path d="M130,28 L214,47 L130,66 Z" />
          <path d="M130,66 C102,100 74,132 46,150 L130,150 Z" />
          <path d="M130,72 C156,104 176,132 200,150 L130,150 Z" />
        </svg>
      </div>
      <span className={`text-[10px] uppercase tracking-[.25em] font-bold ${state.vip ? 'text-[#E5C158]' : 'text-[#366A8B]'}`}>
        Cargando
      </span>
    </div>
  );
}
