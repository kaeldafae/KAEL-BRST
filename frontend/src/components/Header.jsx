import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MARKETS_LIST } from '@/data/catalog';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    `text-[13px] uppercase tracking-[.14em] font-semibold transition-colors ${isActive ? 'text-[#366A8B]' : 'text-[#4B6170] hover:text-[#1C2D37]'}`;

  return (
    <header data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-[#FAF8F3]/85 border-b border-[#366A8B]/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-brand-logo">
          <img src="/img/logo.png" alt="KAEL" className="h-7 w-auto" />
          <span className="hidden sm:inline text-[10px] uppercase tracking-[.2em] text-[#7A8F9E] border border-[#366A8B]/20 rounded-full px-3 py-1">
            {MARKETS_LIST.length} destinos
          </span>
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <NavLink to="/" end className={linkCls} data-testid="nav-link-inicio">Inicio</NavLink>
          <NavLink to="/barcos" className={linkCls} data-testid="nav-link-barcos">Barcos</NavLink>
          <NavLink to="/rutas" className={linkCls} data-testid="nav-link-rutas">Rutas</NavLink>
          <Link to="/barcos" data-testid="nav-cta-solicitar"
            className="rounded-full bg-[#0A1128] text-[#F7F5F0] text-[13px] font-semibold uppercase tracking-[.12em] px-5 py-2.5 transition-all hover:bg-[#366A8B] hover:shadow-lg">
            Solicitar barco
          </Link>
        </nav>
      </div>
    </header>
  );
}
