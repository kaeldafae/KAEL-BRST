import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Crown, Minus } from 'lucide-react';
import Reveal from '@/components/Reveal';
import RequestForm from '@/components/RequestForm';
import CompanyLogo from '@/components/CompanyLogo';
import { boatById, companyOf, euro } from '@/data/catalog';

export default function BoatDetail() {
  const { id } = useParams();
  const boat = boatById(id);
  const company = companyOf(boat);
  const vip = company?.tier === 'premium';
  const [img, setImg] = useState(0);

  useEffect(() => { setImg(0); }, [id]);

  if (!boat) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-[#7A8F9E]">Embarcación no encontrada.</p>
        <Link to="/barcos" className="text-[#366A8B] font-semibold">Volver al catálogo</Link>
      </main>
    );
  }

  const specs = [
    ['Tipo', boat.type], ['Capacidad', `${boat.pax} personas`], ['Eslora', boat.length],
    ['Puerto base', boat.port], ['Patrón', boat.skipper], ['Camarotes', boat.camarotes], ['Baños', boat.banos],
  ];

  return (
    <main data-testid="boat-detail-view"
      className={`transition-colors duration-1000 ${vip ? 'bg-[#0A1128] text-[#F7F5F0]' : 'bg-[#FAF8F3] text-[#1C2D37]'}`}
      style={{ transitionProperty: 'background-color, color' }}>
      <div className="pt-32 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <Reveal>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/barcos" className={`text-[11px] uppercase tracking-[.2em] font-bold ${vip ? 'text-[#8A9BAE] hover:text-[#E5C158]' : 'text-[#7A8F9E] hover:text-[#366A8B]'} transition-colors`} data-testid="boat-back-link">
              ← Flota
            </Link>
            {vip && (
              <span data-testid="vip-tier-badge" className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#E5C158] vip-pulse">
                <Crown size={12} /> Empresa VIP
              </span>
            )}
          </div>
          <div className={`mt-4 flex items-center gap-3 text-[12px] uppercase tracking-[.22em] font-bold ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`}>
            <CompanyLogo company={company} size={30} />
            {company?.name}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-3">{boat.name}</h1>
          <p className={`mt-4 text-base sm:text-lg max-w-[60ch] ${vip ? 'text-[#C8D3E0]' : 'text-[#4B6170]'}`}>{boat.description}</p>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <Reveal>
              <div className={`img-frame overflow-hidden h-[340px] sm:h-[480px] ${vip ? 'vip-glow' : 'shadow-[0_24px_60px_rgba(28,45,55,.18)]'}`} data-testid="boat-gallery">
                <img src={boat.images[img]} alt={boat.name} className="h-full w-full object-cover" />
              </div>
              <div className="mt-4 flex gap-3">
                {boat.images.map((src, i) => (
                  <button key={i} onClick={() => setImg(i)} data-testid={`boat-thumb-${i}`}
                    className={`h-16 w-24 rounded-xl overflow-hidden transition-all ${i === img ? (vip ? 'ring-2 ring-[#D4AF37]' : 'ring-2 ring-[#366A8B]') : 'opacity-50 hover:opacity-90'}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className={`mt-12 rounded-[24px] p-7 grid sm:grid-cols-3 gap-6 ${vip ? 'bg-[#0F1A3A] border border-[#D4AF37]/20' : 'bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)]'}`} data-testid="boat-specs">
                {specs.map(([k, v]) => (
                  <div key={k}>
                    <div className={`text-[10px] uppercase tracking-[.2em] font-bold ${vip ? 'text-[#D4AF37]' : 'text-[#7A8F9E]'}`}>{k}</div>
                    <div className="mt-1.5 font-mono2 text-sm tabular">{v}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 gap-8">
              <Reveal delay={0.12}>
                <h3 className="font-display text-xl mb-4">Incluido</h3>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {boat.included.map((x) => (
                    <li key={x} className="flex gap-2.5 items-start"><Check size={15} className={`mt-0.5 shrink-0 ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`} />{x}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.18}>
                <h3 className="font-display text-xl mb-4">No incluido</h3>
                <ul className={`flex flex-col gap-2.5 text-sm ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
                  {boat.excluded.map((x) => (
                    <li key={x} className="flex gap-2.5 items-start"><Minus size={15} className="mt-0.5 shrink-0" />{x}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <Reveal delay={0.05}>
              <div className={`rounded-[24px] p-7 ${vip ? 'bg-[#0F1A3A] border border-[#D4AF37]/25 relative overflow-hidden' : 'bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)]'}`} data-testid="boat-price-card">
                {vip && <div className="gold-shimmer absolute inset-x-0 top-0 h-[3px]" />}
                <div className={`text-[10px] uppercase tracking-[.22em] font-bold ${vip ? 'text-[#D4AF37]' : 'text-[#7A8F9E]'}`}>Precio orientativo</div>
                <div className={`mt-2 font-mono2 tabular text-4xl ${vip ? 'text-[#E5C158]' : 'text-[#234A63]'}`}>
                  {euro(boat.price)} <span className="text-base opacity-60">/ día</span>
                </div>
                <p className={`mt-4 text-xs leading-relaxed ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
                  El precio final lo confirma la empresa náutica según fecha, ruta y extras. KAEL no cobra nada por la solicitud.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <RequestForm boat={boat} vip={vip} />
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
