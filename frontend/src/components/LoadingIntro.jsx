import { useEffect, useRef, useState } from 'react';
import { boatById, companyOf } from '@/data/catalog';

const WAVE1 = 'M0 17 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0';
const FAST_MS = 800;
const MIN_SHOW_MS = 1600;
const KEY = 'kael-intro-shown';

export default function LoadingIntro() {
  const [visible, setVisible] = useState(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return false;
    try { return sessionStorage.getItem(KEY) !== '1'; } catch { return true; }
  });
  const boatRef = useRef(null);
  const overlayRef = useRef(null);

  // VIP si se aterriza directamente en la ficha de un barco de empresa premium
  let vip = false;
  const path = window.location.pathname;
  if (path.startsWith('/barco/')) {
    const boat = boatById(path.split('/')[2]);
    vip = companyOf(boat)?.tier === 'premium';
  }

  useEffect(() => {
    if (!visible) return;
    const boat = boatRef.current;
    const overlay = overlayRef.current;
    const t0 = performance.now();
    let sailT0 = null;
    let raf;

    const markShown = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* noop */ } };

    const finish = () => {
      cancelAnimationFrame(raf);
      markShown();
      overlay.classList.add('is-leaving');
      setTimeout(() => setVisible(false), 750);
    };

    const speedUp = () => {
      if (sailT0 !== null) return;
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - t0));
      setTimeout(() => { sailT0 = performance.now(); }, wait);
    };

    const loop = (now) => {
      if (boat) {
        if (sailT0 === null) {
          const sway = Math.sin((now - t0) / 900) * 3;
          boat.style.transform = `translateX(${sway.toFixed(2)}%)`;
          boat.style.opacity = '1';
        } else {
          const p = Math.min(1, (now - sailT0) / FAST_MS);
          const eased = p * p * (3 - 2 * p);
          boat.style.transform = `translateX(${(-175 * eased).toFixed(2)}%)`;
          boat.style.opacity = (1 - eased * 0.9).toFixed(3);
          if (p >= 1) { finish(); return; }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    if (document.readyState === 'complete') speedUp();
    else window.addEventListener('load', speedUp);
    const guard = setTimeout(speedUp, 8000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(guard);
      window.removeEventListener('load', speedUp);
    };
  }, [visible]);

  if (!visible) return null;

  const boatColor = vip ? '#D4AF37' : '#366A8B';
  const wave1 = vip ? '#D4AF37' : '#366A8B';
  const wave2 = vip ? '#366A8B' : '#8FB3C9';

  return (
    <div ref={overlayRef} data-testid="loading-intro-screen" aria-hidden="true"
      className="kael-intro-overlay fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: vip ? 'rgba(6,11,28,.45)' : 'rgba(250,248,243,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div
        className={`relative overflow-hidden rounded-[32px] w-full max-w-[540px] h-[360px] sm:h-[400px] ${
          vip ? 'vip-glow' : 'shadow-[0_40px_120px_rgba(28,45,55,.22)]'
        }`}
        style={{
          background: vip
            ? 'radial-gradient(120% 100% at 50% 0%, #0F1A3A 0%, #0A1128 60%, #060B1C 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F3EFE6 100%)',
          border: vip ? '1px solid rgba(212,175,55,.35)' : '1px solid rgba(54,106,139,.15)',
        }}>
        {vip && [...Array(14)].map((_, i) => (
          <span key={i} className="absolute rounded-full"
            style={{
              left: `${(i * 53) % 100}%`, top: `${(i * 29) % 55}%`,
              width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
              background: i % 4 === 0 ? '#D4AF37' : 'rgba(200,211,224,.5)', opacity: .5,
            }} />
        ))}

        {/* boat */}
        <div className="absolute left-0 right-0" style={{ bottom: '30%' }}>
          <div ref={boatRef} data-testid="loading-intro-boat" className="will-change-transform" style={{ transform: 'translateX(0%)' }}>
            <div className="intro-bob mx-auto w-[170px] sm:w-[210px]">
              <svg viewBox="0 0 260 215" fill="none" stroke={boatColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: vip ? 'drop-shadow(0 0 18px rgba(212,175,55,.45))' : 'drop-shadow(0 6px 16px rgba(54,106,139,.3))' }}>
                <path d="M34,154 L222,154 L198,186 L58,186 Z" />
                <path d="M130,22 L130,154" />
                <path d="M130,28 L214,47 L130,66 Z" />
                <path d="M130,66 C102,100 74,132 46,150 L130,150 Z" />
                <path d="M130,72 C156,104 176,132 200,150 L130,150 Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* waves */}
        <div className="absolute left-0 right-0 overflow-hidden" style={{ bottom: '25%', height: 34 }}>
          <div className="intro-wave absolute inset-y-0" style={{ width: '200%' }}>
            <svg viewBox="0 0 960 34" preserveAspectRatio="none" className="h-full w-1/2 float-left" fill="none"><path d={WAVE1} stroke={wave1} strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" /></svg>
            <svg viewBox="0 0 960 34" preserveAspectRatio="none" className="h-full w-1/2 float-left" fill="none"><path d={WAVE1} stroke={wave1} strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div className="absolute left-0 right-0 overflow-hidden" style={{ bottom: '23%', height: 34 }}>
          <div className="intro-wave intro-wave-2 absolute inset-y-0" style={{ width: '200%' }}>
            <svg viewBox="0 0 960 34" preserveAspectRatio="none" className="h-full w-1/2 float-left" fill="none"><path d={WAVE1} stroke={wave2} strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" /></svg>
            <svg viewBox="0 0 960 34" preserveAspectRatio="none" className="h-full w-1/2 float-left" fill="none"><path d={WAVE1} stroke={wave2} strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" /></svg>
          </div>
        </div>

        {/* wordmark */}
        <div className="absolute inset-x-0 bottom-[8%] text-center">
          <div className={`font-display text-3xl sm:text-4xl tracking-[.35em] ${vip ? 'text-[#F7F5F0]' : 'text-[#1C2D37]'}`} data-testid="loading-intro-word">KAEL</div>
          <div className={`mt-2 text-[10px] uppercase tracking-[.4em] ${vip ? 'text-[#D4AF37]/80' : 'text-[#366A8B]/80'}`}>
            {vip ? 'Selección VIP' : 'Náutica de excepción'}
          </div>
        </div>
      </div>
    </div>
  );
}
