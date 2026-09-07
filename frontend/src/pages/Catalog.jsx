import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import BoatCard from '@/components/BoatCard';
import Reveal from '@/components/Reveal';
import { BOATS, MARKETS_LIST, companyOf } from '@/data/catalog';

export default function Catalog() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({
    market: params.get('market') || '',
    type: params.get('type') || '',
    skipper: params.get('skipper') || '',
    vip: false,
  });

  const boats = useMemo(() => BOATS.filter((b) => {
    const c = companyOf(b);
    if (filters.market && c?.marketId !== filters.market) return false;
    if (filters.type && b.type !== filters.type) return false;
    if (filters.skipper && b.skipper !== filters.skipper) return false;
    if (filters.vip && c?.tier !== 'premium') return false;
    return true;
  }), [filters]);

  const selectCls = 'w-full bg-white border border-[#366A8B]/20 rounded-xl px-4 py-3 text-sm text-[#1C2D37] outline-none focus:border-[#366A8B] transition-colors';
  const labelCls = 'block text-[10px] uppercase tracking-[.22em] font-bold text-[#7A8F9E] mb-2';

  return (
    <main className="pt-32 sm:pt-40 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Catálogo</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">Toda la flota</h1>
          <p className="mt-4 text-base text-[#4B6170] max-w-[52ch]">Compara embarcaciones de empresas verificadas. Las empresas con tier premium aparecen destacadas en dorado.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 rounded-[24px] bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)] p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end" data-testid="catalog-filter-bar">
            <div>
              <label className={labelCls}>Destino</label>
              <select className={selectCls} value={filters.market} onChange={(e) => setFilters({ ...filters, market: e.target.value })} data-testid="filter-destination">
                <option value="">Todos los destinos</option>
                {MARKETS_LIST.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select className={selectCls} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} data-testid="filter-type">
                <option value="">Todos</option>
                <option value="Lancha">Lancha</option><option value="Yate">Yate</option><option value="Catamarán">Catamarán</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Patrón</label>
              <select className={selectCls} value={filters.skipper} onChange={(e) => setFilters({ ...filters, skipper: e.target.value })} data-testid="filter-skipper">
                <option value="">Indiferente</option>
                <option value="Con patrón">Con patrón</option><option value="Sin patrón">Sin patrón</option>
              </select>
            </div>
            <button
              onClick={() => setFilters({ ...filters, vip: !filters.vip })}
              data-testid="vip-filter-toggle"
              className={`rounded-xl px-4 py-3 text-[12px] uppercase tracking-[.14em] font-bold transition-all inline-flex items-center justify-center gap-2 ${
                filters.vip ? 'bg-[#0A1128] text-[#E5C158] border border-[#D4AF37]/60 vip-glow vip-pulse' : 'bg-white text-[#4B6170] border border-[#366A8B]/20 hover:border-[#D4AF37]/60'
              }`}>
              <Crown size={14} className={filters.vip ? 'text-[#D4AF37]' : 'text-[#7A8F9E]'} />
              Solo empresas VIP
            </button>
          </div>
        </Reveal>

        <div className="mt-6 text-sm text-[#7A8F9E]" data-testid="catalog-count">
          {boats.length} embarcación{boats.length === 1 ? '' : 'es'}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-7" data-testid="catalog-grid">
          {boats.map((b) => <BoatCard key={b.id} boat={b} />)}
        </div>
        {boats.length === 0 && (
          <div className="mt-16 text-center text-[#7A8F9E]" data-testid="catalog-empty">No hay embarcaciones con esos filtros. Prueba a ampliar la búsqueda.</div>
        )}
      </div>
    </main>
  );
}
