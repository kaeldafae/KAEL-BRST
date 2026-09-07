import { Link } from 'react-router-dom';
import { MARKETS_LIST } from '@/data/catalog';

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-[#0A1128] text-[#C8D3E0] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <img src="/img/logo.png" alt="KAEL" className="h-7 w-auto brightness-0 invert" />
          <p className="mt-5 text-sm leading-relaxed text-[#8A9BAE] max-w-[38ch]">
            KAEL es una plataforma de intermediación náutica. No cobra alquileres ni gestiona pagos:
            conecta tu solicitud con empresas verificadas, que confirman y cobran directamente.
          </p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[.25em] text-[#D4AF37] font-semibold">Destinos</div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {MARKETS_LIST.map((m) => (
              <Link key={m.id} to={`/barcos?market=${m.id}`} className="hover:text-[#E5C158] transition-colors">{m.name}</Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[.25em] text-[#D4AF37] font-semibold">Plataforma</div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link to="/barcos" className="hover:text-[#E5C158] transition-colors">Ver la flota</Link>
            <Link to="/" className="hover:text-[#E5C158] transition-colors">Cómo funciona</Link>
            <Link to="/rutas" className="hover:text-[#E5C158] transition-colors">Destinos y rutas</Link>
            <Link to="/legal" className="hover:text-[#E5C158] transition-colors" data-testid="footer-legal-link">Modelo y aviso legal</Link>
            <Link to="/admin" className="hover:text-[#E5C158] transition-colors" data-testid="footer-admin-link">Panel interno</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 flex flex-wrap justify-between gap-3 text-xs text-[#8A9BAE]">
          <span>© {new Date().getFullYear()} KAEL. Todos los derechos reservados.</span>
          <span>Catálogo de ejemplo: empresas y barcos marcados como “Ejemplo” no son reales.</span>
        </div>
      </div>
    </footer>
  );
}
