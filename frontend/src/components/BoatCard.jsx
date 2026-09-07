import { Link } from 'react-router-dom';
import { Crown, Users, Ruler, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { companyOf, euro } from '@/data/catalog';
import CompanyLogo from '@/components/CompanyLogo';

export default function BoatCard({ boat }) {
  const company = companyOf(boat);
  const vip = company?.tier === 'premium';

  return (
    <motion.div
      data-testid={`boat-card-${boat.id}`}
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-3xl overflow-hidden transition-all duration-500 ${
        vip ? 'vip-glow bg-[#0A1128] text-[#F7F5F0]' : 'bg-white text-[#1C2D37] shadow-[0_2px_20px_rgba(28,45,55,.08)] hover:shadow-[0_14px_40px_rgba(28,45,55,.14)]'
      }`}
    >
      {vip && <div className="gold-shimmer absolute inset-x-0 top-0 h-[3px] z-10" />}
      <Link to={`/barco/${boat.id}`} className="block" data-testid={`boat-card-link-${boat.id}`}>
        <div className="relative h-52 overflow-hidden">
          <img src={boat.images[0]} alt={boat.name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          {vip && (
            <div data-testid="vip-tier-badge"
              className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-[#0A1128]/85 backdrop-blur px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#E5C158] border border-[#D4AF37]/50">
              <Crown size={12} /> VIP Partner
            </div>
          )}
          {boat.demo && (
            <div className={`absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] uppercase tracking-[.15em] ${vip ? 'bg-white/10 text-[#C8D3E0]' : 'bg-[#1C2D37]/70 text-white'}`}>
              Ejemplo
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="font-display text-xl leading-snug">{boat.name}</h3>
          <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
            <span className="inline-flex items-center gap-1"><Users size={12} /> {boat.pax} personas</span>
            <span className="inline-flex items-center gap-1"><Ruler size={12} /> {boat.length}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {boat.port}</span>
          </div>
          <div className={`mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[.2em] font-semibold ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`}>
            <CompanyLogo company={company} size={22} />
            {company?.name}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className={`font-mono2 tabular text-sm rounded-full px-4 py-2 ${
              vip ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] font-semibold' : 'bg-[#EAF2F7] text-[#234A63]'
            }`}>
              desde {euro(boat.price)}
            </span>
            <span className={`text-[11px] uppercase tracking-[.15em] font-semibold transition-transform duration-300 group-hover:translate-x-1 ${vip ? 'text-[#E5C158]' : 'text-[#366A8B]'}`}>
              Ver ficha →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
