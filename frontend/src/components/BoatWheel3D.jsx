import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { BOATS, COMPANIES_LIST, boatsByCompany, companyOf, euro } from '@/data/catalog';
import CompanyLogo from '@/components/CompanyLogo';

const PARTICLES = [...Array(16)].map((_, i) => ({
  left: `${(i * 61) % 100}%`,
  bottom: `${(i * 37) % 40}%`,
  size: 2 + (i % 3),
  dur: 3.5 + (i % 5),
  delay: (i * 0.7) % 4,
}));

export default function BoatWheel3D() {
  const companies = useMemo(() => COMPANIES_LIST.filter((c) => boatsByCompany(c.id).length > 0), []);
  const [companyId, setCompanyId] = useState('all');
  const boats = useMemo(() => (companyId === 'all' ? BOATS : boatsByCompany(companyId)), [companyId]);
  const [index, setIndex] = useState(0);
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const drag = useRef({ startX: 0, base: 0 });

  const step = 360 / Math.max(boats.length, 1);
  const radius = boats.length < 2 ? 0 : Math.round(130 / Math.tan(Math.PI / boats.length)) + 90;
  const current = boats[index];
  const vip = current ? companyOf(current)?.tier === 'premium' : false;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedLabel = companyId === 'all' ? 'Todas las empresas' : companies.find((c) => c.id === companyId)?.name;
  const selectedThumb = companyId === 'all' ? BOATS[0].images[0] : boatsByCompany(companyId)[0]?.images[0];
  const chooseCompany = (id) => { setCompanyId(id); setDropdownOpen(false); };

  useEffect(() => {
    const onDocDown = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const goTo = useCallback((i) => {
    setIndex((prev) => {
      const n = ((i % boats.length) + boats.length) % boats.length;
      setAngle(-n * (360 / Math.max(boats.length, 1)));
      return n;
    });
  }, [boats.length]);

  useEffect(() => { setIndex(0); setAngle(0); }, [companyId]);

  useEffect(() => {
    if (dragging || hovering || boats.length < 2) return;
    const t = setInterval(() => goTo(index + 1), 4500);
    return () => clearInterval(t);
  }, [index, dragging, hovering, boats.length, goTo]);

  const onPointerDown = (e) => {
    setDragging(true);
    drag.current = { startX: e.clientX ?? e.touches?.[0]?.clientX ?? 0, base: angle };
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    setAngle(drag.current.base + (x - drag.current.startX) * 0.35);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const nearest = Math.round(-angle / step);
    goTo(nearest);
  };

  return (
    <div data-testid="wheel-3d-container">
      {/* company selector — lista personalizada */}
      <div className="flex items-center gap-4 mb-10 flex-wrap" data-testid="wheel-company-select-wrap">
        <span className="text-[11px] uppercase tracking-[.22em] font-bold text-[#7A8F9E]">Empresa</span>
        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} data-testid="wheel-company-select"
            className="flex items-center gap-3 rounded-2xl bg-white border border-[#366A8B]/20 pl-2 pr-4 py-2 shadow-[0_2px_16px_rgba(28,45,55,.06)] transition-all hover:border-[#366A8B]/50 min-w-[280px]">
            <img src={selectedThumb} alt="" className="w-11 h-11 rounded-xl object-cover" />
            <span className="flex-1 text-left">
              <span className="block text-sm font-semibold text-[#1C2D37] leading-tight">{selectedLabel}</span>
            </span>
            <span className="text-xs text-[#7A8F9E] tabular">{boats.length} embarcacion{boats.length === 1 ? '' : 'es'}</span>
            <ChevronLeft size={15} className={`-rotate-90 text-[#366A8B] transition-transform duration-300 ${dropdownOpen ? 'rotate-90' : ''}`} />
          </button>

          {dropdownOpen && (
            <div data-testid="wheel-company-dropdown"
              className="absolute top-full left-0 mt-2 w-full min-w-[320px] rounded-2xl bg-white border border-[#366A8B]/15 shadow-[0_24px_60px_rgba(10,17,40,.18)] overflow-hidden z-30">
              <div className="max-h-[300px] overflow-y-auto">
                <button type="button" onClick={() => chooseCompany('all')} data-testid="wheel-option-all"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-[#366A8B]/8 ${companyId === 'all' ? 'bg-[#EAF2F7]' : 'hover:bg-[#F7F5F0]'}`}>
                  <img src={BOATS[0].images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="flex-1 text-sm font-semibold text-[#1C2D37]">Todas las empresas</span>
                  <span className="text-xs text-[#7A8F9E] tabular pr-1">{BOATS.length}</span>
                </button>
                {companies.map((c) => {
                  const cb = boatsByCompany(c.id);
                  const vipC = c.tier === 'premium';
                  return (
                    <button key={c.id} type="button" onClick={() => chooseCompany(c.id)} data-testid={`wheel-option-${c.id}`}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-[#366A8B]/8 last:border-0 ${
                        companyId === c.id ? (vipC ? 'bg-[#0A1128]' : 'bg-[#EAF2F7]') : 'hover:bg-[#F7F5F0]'
                      }`}>
                      <img src={cb[0]?.images[0]} alt="" className={`w-10 h-10 rounded-lg object-cover ${vipC ? 'ring-1 ring-[#D4AF37]/60' : ''}`} />
                      <span className={`flex-1 text-sm font-semibold inline-flex items-center gap-1.5 ${companyId === c.id && vipC ? 'text-[#E5C158]' : 'text-[#1C2D37]'}`}>
                        {vipC && <Crown size={12} className="text-[#D4AF37]" />}
                        {c.name}
                      </span>
                      <span className={`text-xs tabular pr-1 ${companyId === c.id && vipC ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>{cb.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {companyId !== 'all' && companyOf(boats[0])?.tier === 'premium' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#0A1128] px-4 py-1.5 text-[10px] uppercase tracking-[.18em] font-bold text-[#E5C158]" data-testid="wheel-company-vip-chip">
            <Crown size={11} /> Empresa VIP
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-stretch">
        {/* stage */}
        <div
          data-testid="wheel-stage"
          className={`wheel-stage relative h-[440px] sm:h-[500px] rounded-[32px] overflow-hidden select-none touch-pan-y transition-all duration-1000 ${
            vip ? 'vip-glow' : 'shadow-[0_20px_60px_rgba(28,45,55,.10)]'
          }`}
          style={{
            background: vip
              ? 'radial-gradient(130% 100% at 50% 0%, #0F1A3A 0%, #0A1128 55%, #060B1C 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #F3EFE6 100%)',
            cursor: dragging ? 'grabbing' : 'grab',
            transitionProperty: 'background, box-shadow',
          }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={() => { onPointerUp(); setHovering(false); }}
          onMouseEnter={() => setHovering(true)}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        >
          {/* VIP gold particles */}
          {vip && PARTICLES.map((p, i) => (
            <span key={i} className="wheel-particle absolute rounded-full"
              style={{ left: p.left, bottom: p.bottom, width: p.size, height: p.size, background: '#D4AF37', animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
          ))}
          {vip && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-[#0A1128]/80 backdrop-blur border border-[#D4AF37]/50 px-4 py-1.5 text-[10px] uppercase tracking-[.25em] text-[#E5C158] font-bold" data-testid="wheel-vip-indicator">
              <Crown size={12} /> Selección VIP
            </div>
          )}

          {/* floor */}
          <div className="absolute left-1/2 bottom-[72px] -translate-x-1/2 w-[70%] h-24 rounded-[50%]"
            style={{ background: vip ? 'radial-gradient(ellipse, rgba(212,175,55,.22), transparent 70%)' : 'radial-gradient(ellipse, rgba(54,106,139,.18), transparent 70%)' }} />

          {/* ring */}
          <div className="wheel-ring absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%,-50%) translateZ(-${radius}px) rotateY(${angle}deg)`,
              transition: dragging ? 'none' : 'transform 1s cubic-bezier(.22,1,.36,1)',
            }}>
            {boats.map((b, i) => {
              const c = companyOf(b);
              const isFront = i === index;
              const cardVip = c?.tier === 'premium';
              return (
                <div key={b.id}
                  className="wheel-card absolute w-[220px] sm:w-[250px] h-[280px] sm:h-[310px] rounded-2xl overflow-hidden"
                  style={{
                    left: '50%', top: '50%',
                    marginLeft: '-110px', marginTop: '-140px',
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    opacity: isFront ? 1 : 0.45,
                    filter: isFront ? 'none' : 'saturate(.6)',
                    transition: 'opacity .6s, filter .6s',
                    boxShadow: isFront ? (cardVip ? '0 0 0 2px rgba(212,175,55,.8), 0 24px 60px rgba(212,175,55,.25)' : '0 24px 60px rgba(28,45,55,.3)') : 'none',
                  }}
                  data-testid={isFront ? 'wheel-boat-card-active' : `wheel-boat-card-${i}`}
                  onClick={() => { if (!dragging && !isFront) goTo(i); }}
                >
                  <img src={b.images[0]} alt={b.name} className="h-full w-full object-cover" draggable={false} />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 to-transparent">
                    <div className={`text-[10px] uppercase tracking-[.18em] font-bold ${cardVip ? 'text-[#E5C158]' : 'text-[#9CC3DB]'}`}>{c?.name}</div>
                    <div className="text-white font-display text-lg leading-tight mt-0.5">{b.name}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* nav arrows */}
          <button onClick={() => goTo(index - 1)} data-testid="wheel-prev-btn" aria-label="Barco anterior"
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all ${vip ? 'bg-white/10 text-[#E5C158] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-[#0A1128]' : 'bg-white text-[#1C2D37] shadow-md hover:bg-[#1C2D37] hover:text-white'}`}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => goTo(index + 1)} data-testid="wheel-next-btn" aria-label="Barco siguiente"
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all ${vip ? 'bg-white/10 text-[#E5C158] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-[#0A1128]' : 'bg-white text-[#1C2D37] shadow-md hover:bg-[#1C2D37] hover:text-white'}`}>
            <ChevronRight size={18} />
          </button>

          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[.25em] ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
            Arrastra para girar
          </div>
        </div>

        {/* side panel */}
        {current && (
          <aside data-testid="wheel-selected-panel"
            className={`rounded-[32px] p-8 flex flex-col justify-between transition-all duration-700 ${
              vip ? 'bg-[#0A1128] text-[#F7F5F0] vip-glow relative overflow-hidden' : 'bg-white text-[#1C2D37] shadow-[0_2px_24px_rgba(28,45,55,.08)]'
            }`}>
            {vip && <div className="gold-shimmer absolute inset-x-0 top-0 h-[3px]" />}
            <div>
              <div className={`text-[11px] uppercase tracking-[.2em] font-bold flex items-center gap-2.5 ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`}>
                <CompanyLogo company={companyOf(current)} size={34} />
                {vip && <Crown size={12} />} {companyOf(current)?.name}
              </div>
              <h3 className="font-display text-3xl mt-3 leading-tight">{current.name}</h3>
              <p className={`mt-3 text-sm ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
                {current.type} · {current.pax} personas · {current.port}
              </p>
              <div className={`mt-6 font-mono2 tabular text-2xl ${vip ? 'text-[#E5C158]' : 'text-[#234A63]'}`}>
                desde {euro(current.price)} <span className="text-sm opacity-70">/ día</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Link to={`/barco/${current.id}`} data-testid="wheel-panel-view-btn"
                className={`rounded-full text-center text-[12px] uppercase tracking-[.15em] font-bold px-6 py-3.5 transition-all ${
                  vip ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] hover:shadow-[0_8px_30px_rgba(212,175,55,.4)]' : 'bg-[#1C2D37] text-white hover:bg-[#366A8B]'
                }`}>
                Ver esta embarcación
              </Link>
              <Link to={`/barco/${current.id}#solicitar`} data-testid="wheel-panel-request-btn"
                className={`rounded-full text-center text-[12px] uppercase tracking-[.15em] font-bold px-6 py-3.5 border transition-all ${
                  vip ? 'border-[#D4AF37]/50 text-[#E5C158] hover:bg-[#D4AF37]/10' : 'border-[#366A8B]/30 text-[#366A8B] hover:bg-[#EAF2F7]'
                }`}>
                Solicitar disponibilidad
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
