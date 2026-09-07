import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Send, PhoneCall, FileCheck2 } from 'lucide-react';
import Reveal from '@/components/Reveal';
import BoatWheel3D from '@/components/BoatWheel3D';
import BoatCard from '@/components/BoatCard';
import CompanyLogo from '@/components/CompanyLogo';
import { BOATS, COMPANIES_LIST, MARKETS_LIST, companyOf } from '@/data/catalog';

const HERO_BOATS = BOATS.filter((b) => ['demo-boat-ibiza-yate', 'demo-boat-dubai-yate', 'demo-boat-canarias-cata', 'demo-boat-polinesia-yate'].includes(b.id));
const MARQUEE_ITEMS = ['Lanchas', 'Yates', 'Catamaranes', 'Con patrón', 'Sin patrón', 'Empresas verificadas'];

function MaskedLine({ children, delay = 0 }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }}
        transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.span>
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [heroIdx, setHeroIdx] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const hero = HERO_BOATS[heroIdx];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_BOATS.length), 5200);
    return () => clearInterval(t);
  }, []);

  const [search, setSearch] = useState({ market: '', fecha: '2026-08-20', personas: 8, type: '', skipper: '' });
  const submitSearch = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => v && q.set(k, v));
    navigate(`/barcos?${q.toString()}`);
  };

  const fieldCls = 'w-full bg-transparent border-b border-[#366A8B]/25 focus:border-[#366A8B] outline-none py-2.5 text-sm text-[#1C2D37] transition-colors';
  const labelCls = 'block text-[10px] uppercase tracking-[.22em] font-bold text-[#7A8F9E] mb-1';

  return (
    <main>
      {/* HERO */}
      <section ref={heroRef} data-testid="hero-section" className="pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.8 }}
              className="flex justify-between gap-4 text-[11px] uppercase tracking-[.2em] font-bold text-[#366A8B]">
              <span>{MARKETS_LIST.length} destinos</span>
              <span>Plataforma de intermediación náutica</span>
            </motion.div>
            <h1 data-testid="hero-title" className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mt-6">
              <MaskedLine delay={0.15}>Tu día en el mar</MaskedLine>
              <MaskedLine delay={0.3}><em className="text-[#366A8B]">empieza aquí.</em></MaskedLine>
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8 }}
              className="mt-6 text-base sm:text-lg text-[#4B6170] max-w-[46ch] leading-relaxed">
              Compara embarcaciones de empresas náuticas verificadas y solicita disponibilidad en un paso. Sin pagos por adelantado.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-9 flex items-center gap-4 flex-wrap">
              <Link to="/barcos" data-testid="hero-cta-fleet"
                className="rounded-full bg-[#1C2D37] text-[#FAF8F3] text-[13px] font-bold uppercase tracking-[.14em] px-8 py-4 transition-all hover:bg-[#366A8B] hover:shadow-xl">
                Ver la flota
              </Link>
              <div className="flex gap-2">
                <button onClick={() => setHeroIdx((heroIdx - 1 + HERO_BOATS.length) % HERO_BOATS.length)} data-testid="hero-prev-btn" aria-label="Barco anterior"
                  className="w-11 h-11 rounded-full border border-[#366A8B]/25 flex items-center justify-center text-[#366A8B] hover:bg-[#366A8B] hover:text-white transition-all">
                  <ChevronLeft size={17} />
                </button>
                <button onClick={() => setHeroIdx((heroIdx + 1) % HERO_BOATS.length)} data-testid="hero-next-btn" aria-label="Barco siguiente"
                  className="w-11 h-11 rounded-full border border-[#366A8B]/25 flex items-center justify-center text-[#366A8B] hover:bg-[#366A8B] hover:text-white transition-all">
                  <ChevronRight size={17} />
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div style={{ y: photoY }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="relative img-frame h-[380px] sm:h-[480px] overflow-hidden shadow-[0_30px_80px_rgba(28,45,55,.25)]" data-testid="hero-photo">
              <AnimatePresence mode="sync">
                <motion.img key={hero.id} src={hero.images[0]} alt={hero.name}
                  initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover" />
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-white font-display text-2xl">{hero.name}</div>
                <div className="text-white/70 text-xs uppercase tracking-[.15em] mt-1">{hero.type} · {hero.pax} personas · {hero.port}</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-2" data-testid="hero-thumbs">
                {HERO_BOATS.map((b, i) => (
                  <button key={b.id} onClick={() => setHeroIdx(i)} data-testid={`hero-thumb-${i}`}
                    className={`h-14 w-20 rounded-xl overflow-hidden transition-all ${i === heroIdx ? 'ring-2 ring-[#366A8B] opacity-100' : 'opacity-50 hover:opacity-90'}`}>
                    <img src={b.images[0]} alt={b.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <Link to={`/barco/${hero.id}`} data-testid="hero-open-boat-btn"
                className="rounded-full bg-[#366A8B] text-white text-[12px] font-bold uppercase tracking-[.14em] px-6 py-3 hover:bg-[#234A63] transition-all">
                Ver esta embarcación
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-[#366A8B]/12 py-5 overflow-hidden" aria-hidden="true">
        <div className="marquee-track font-display text-2xl sm:text-3xl text-[#1C2D37]/85 italic">
          {[...Array(2)].map((_, r) => (
            <span key={r} className="flex items-center">
              {MARQUEE_ITEMS.map((m, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-6">{m}</span><span className="text-[#D4AF37] not-italic text-xl">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* LA RUEDA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">La flota</div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight mt-3">Elige tu empresa y tu barco</h2>
            </div>
            <p className="text-sm text-[#7A8F9E] max-w-[36ch]">Arrastra, usa las flechas o pulsa un barco para girar la rueda. Las empresas VIP se destacan en dorado.</p>
          </Reveal>
          <Reveal delay={0.1}><BoatWheel3D /></Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            ['0 €', 'No cobramos nada al solicitar. Pagas a la empresa náutica.'],
            ['2 h', 'Compromiso de primera respuesta de las empresas.'],
            ['100 %', 'Empresas verificadas: identidad, habilitación y seguros.'],
            [`${MARKETS_LIST.length}`, 'Destinos en los que estamos incorporando empresas verificadas.'],
          ].map(([n, l], i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="font-display text-5xl tracking-tight">{n}</div>
              <div className="mt-3 text-sm text-[#7A8F9E] leading-relaxed max-w-[28ch]">{l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-[#F3EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="img-frame overflow-hidden h-[380px] sm:h-[520px] shadow-[0_24px_60px_rgba(28,45,55,.18)]">
              <img src="/img/boats/catamaran-grupo.webp" alt="Grupo disfrutando de un día en catamarán" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Cómo funciona</div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight mt-3">Tú eliges el barco. Nosotros enviamos tu solicitud.</h2>
              <p className="mt-5 text-base text-[#4B6170] max-w-[46ch] leading-relaxed">La empresa náutica confirma disponibilidad, horario y precio directamente contigo. El contrato y el pago son con ella, no con nosotros.</p>
            </Reveal>
            <div className="mt-10 relative">
              <div className="absolute left-[27px] top-3 bottom-3 border-l-2 border-dashed border-[#366A8B]/25" aria-hidden="true" />
              {[
                [Search, 'Eliges tu barco', 'Compara embarcaciones de empresas verificadas.'],
                [Send, 'Envías una solicitud', 'Fecha, personas y contacto. Sin ningún pago.'],
                [PhoneCall, 'La empresa te contacta', 'Confirma disponibilidad real, horario y precio final.'],
                [FileCheck2, 'Contratas con la empresa', 'El alquiler y el pago se formalizan directamente con ella.'],
              ].map(([Icon, t, d], i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="relative flex gap-6 items-start pb-9 last:pb-0 group" data-testid={`how-step-${i + 1}`}>
                    <div className="relative z-10 w-14 h-14 rounded-full bg-white border border-[#366A8B]/15 shadow-[0_4px_16px_rgba(28,45,55,.08)] flex items-center justify-center text-[#366A8B] transition-all duration-300 group-hover:bg-[#366A8B] group-hover:text-white group-hover:scale-105">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <div className="pt-2.5">
                      <div className="font-display text-xl">{t}</div>
                      <div className="text-sm text-[#7A8F9E] mt-1 max-w-[40ch]">{d}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-16">
          <Reveal>
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/8 px-6 py-5 text-sm text-[#4B6170]">
              Una solicitud no es una reserva confirmada. La reserva existe cuando la empresa náutica acepta y confirma las condiciones contigo.
            </div>
          </Reveal>
        </div>
      </section>

      {/* BUSCADOR */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-10">¿Qué barco estás buscando?</h2>
            <form onSubmit={submitSearch} data-testid="home-search-form"
              className="rounded-[28px] bg-white shadow-[0_2px_30px_rgba(28,45,55,.08)] p-7 sm:p-9 grid sm:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
              <div>
                <label className={labelCls}>Destino</label>
                <select className={fieldCls} value={search.market} onChange={(e) => setSearch({ ...search, market: e.target.value })} data-testid="hero-search-input-destination">
                  <option value="">Todos los destinos</option>
                  {MARKETS_LIST.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Fecha</label>
                <input type="date" className={fieldCls} value={search.fecha} onChange={(e) => setSearch({ ...search, fecha: e.target.value })} data-testid="hero-search-input-date" />
              </div>
              <div>
                <label className={labelCls}>Personas</label>
                <input type="number" min="1" className={fieldCls} value={search.personas} onChange={(e) => setSearch({ ...search, personas: e.target.value })} data-testid="hero-search-input-pax" />
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select className={fieldCls} value={search.type} onChange={(e) => setSearch({ ...search, type: e.target.value })} data-testid="hero-search-select-type">
                  <option value="">Todos</option>
                  <option value="Lancha">Lancha</option><option value="Yate">Yate</option><option value="Catamarán">Catamarán</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Patrón</label>
                <select className={fieldCls} value={search.skipper} onChange={(e) => setSearch({ ...search, skipper: e.target.value })} data-testid="hero-search-select-skipper">
                  <option value="">Indiferente</option>
                  <option value="Con patrón">Con patrón</option><option value="Sin patrón">Sin patrón</option>
                </select>
              </div>
              <button type="submit" data-testid="hero-search-submit-btn"
                className="rounded-full bg-[#1C2D37] text-[#FAF8F3] text-[12px] font-bold uppercase tracking-[.15em] px-6 py-3.5 hover:bg-[#366A8B] transition-all">
                Buscar
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* GRID EMBARCACIONES */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight m-0">Embarcaciones</h2>
            <Link to="/barcos" className="text-[12px] uppercase tracking-[.15em] font-bold text-[#366A8B] hover:text-[#234A63] transition-colors">Ver todas con filtros →</Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7" data-testid="home-boats-grid">
            {BOATS.slice(0, 6).map((b) => <BoatCard key={b.id} boat={b} />)}
          </div>
        </div>
      </section>

      {/* EMPRESAS */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Empresas verificadas</div>
            <p className="mt-4 text-base text-[#4B6170] max-w-[52ch]">Ninguna embarcación se publica sin verificar identidad, habilitación para la actividad, documentación y seguros.</p>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="home-companies-grid">
            {COMPANIES_LIST.slice(0, 4).map((c, i) => {
              const vip = c.tier === 'premium';
              return (
                <Reveal key={c.id} delay={i * 0.06}>
                  <div className={`rounded-3xl p-6 h-full transition-all ${vip ? 'bg-[#0A1128] text-[#F7F5F0] vip-glow relative overflow-hidden' : 'bg-white shadow-[0_2px_20px_rgba(28,45,55,.07)]'}`}>
                    {vip && <div className="gold-shimmer absolute inset-x-0 top-0 h-[3px]" />}
                    <div className="flex items-center gap-3.5">
                      <CompanyLogo company={c} size={46} />
                      <div>
                        <div className={`text-[10px] uppercase tracking-[.2em] font-bold ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`}>{vip ? 'VIP' : 'Verificada'}</div>
                        <div className="font-display text-xl mt-0.5">{c.name}</div>
                      </div>
                    </div>
                    <div className={`text-xs mt-2 ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>{c.base}</div>
                    <div className={`mt-4 flex gap-4 text-[11px] font-mono2 ${vip ? 'text-[#C8D3E0]' : 'text-[#4B6170]'}`}>
                      <span>SLA {c.sla}</span><span>{c.confirmRate} confirma</span><span>★ {c.rating}</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <Reveal>
            <div className="border-t-2 border-[#1C2D37] pt-10 flex flex-wrap justify-between items-end gap-10">
              <h2 className="font-display tracking-tight leading-[0.95] max-w-[16ch] m-0" style={{ fontSize: 'clamp(34px,6vw,80px)' }}>
                Alquila tu barco donde quieras navegar
              </h2>
              <Link to="/barcos" data-testid="closing-cta-btn"
                className="rounded-full bg-[#0A1128] text-[#E5C158] border border-[#D4AF37]/40 text-[13px] font-bold uppercase tracking-[.14em] px-9 py-4.5 py-4 transition-all hover:vip-glow hover:bg-[#0F1A3A]">
                Ver la flota
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
