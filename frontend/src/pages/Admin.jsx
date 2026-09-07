import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Flag, RefreshCw, Link2, Copy } from 'lucide-react';
import CompanyLogo from '@/components/CompanyLogo';
import { COMPANIES_LIST, COMPANIES } from '@/data/catalog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ESTADOS = ['pendiente', 'contactada', 'confirmada', 'rechazada', 'cancelada'];

const ESTADO_STYLE = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-300',
  contactada: 'bg-sky-100 text-sky-800 border-sky-300',
  confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rechazada: 'bg-red-100 text-red-700 border-red-300',
  cancelada: 'bg-gray-200 text-gray-600 border-gray-300',
};

const IMPORTANCIA_STYLE = {
  alta: 'bg-red-100 text-red-700 border-red-300',
  media: 'bg-amber-100 text-amber-800 border-amber-300',
  baja: 'bg-gray-100 text-gray-600 border-gray-300',
};

export default function Admin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [tab, setTab] = useState('solicitudes');
  const [portales, setPortales] = useState([]);
  const [enlaces, setEnlaces] = useState({});

  const load = useCallback(() => {
    axios.get(`${API}/solicitudes`).then((r) => setSolicitudes(r.data)).catch(() => {});
    axios.get(`${API}/notas-internas`).then((r) => setNotas(r.data)).catch(() => {});
    axios.get(`${API}/portal-tokens`).then((r) => setPortales(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const generarEnlace = async (companyId) => {
    try {
      const r = await axios.post(`${API}/portal-tokens/${companyId}`);
      const url = `${window.location.origin}${r.data.path}`;
      setEnlaces((e) => ({ ...e, [companyId]: url }));
      load();
      toast.success('Enlace generado', { description: 'Cópialo ahora: por seguridad no se puede recuperar después.' });
    } catch {
      toast.error('No se pudo generar el enlace');
    }
  };

  const copiar = (url) => {
    navigator.clipboard.writeText(url).then(() => toast.success('Enlace copiado'));
  };

  const setEstado = async (id, estado) => {
    try {
      await axios.patch(`${API}/solicitudes/${id}/estado`, { estado });
      setSolicitudes((s) => s.map((x) => (x.id === id ? { ...x, estado } : x)));
      toast.success(`Solicitud marcada como ${estado}`, {
        description: estado === 'confirmada'
          ? 'Ese día el barco aparecerá como no disponible en la web.'
          : (estado === 'cancelada' || estado === 'rechazada')
            ? 'El día vuelve a quedar disponible en la web.'
            : undefined,
      });
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  return (
    <main className="pt-32 sm:pt-40 pb-24" data-testid="admin-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Panel interno</div>
            <h1 className="font-display text-4xl tracking-tight mt-2">Solicitudes y quejas</h1>
          </div>
          <button onClick={load} data-testid="admin-refresh-btn"
            className="inline-flex items-center gap-2 rounded-full border border-[#366A8B]/25 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.12em] text-[#366A8B] hover:bg-[#EAF2F7] transition-all">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        <div className="mt-8 flex gap-2">
          <button onClick={() => setTab('solicitudes')} data-testid="admin-tab-solicitudes"
            className={`rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.12em] transition-all ${tab === 'solicitudes' ? 'bg-[#1C2D37] text-white' : 'bg-white border border-[#366A8B]/20 text-[#4B6170]'}`}>
            Solicitudes ({solicitudes.length})
          </button>
          <button onClick={() => setTab('quejas')} data-testid="admin-tab-quejas"
            className={`rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.12em] transition-all inline-flex items-center gap-2 ${tab === 'quejas' ? 'bg-[#1C2D37] text-white' : 'bg-white border border-[#366A8B]/20 text-[#4B6170]'}`}>
            <Flag size={13} /> Quejas IA ({notas.length})
          </button>
        </div>

        {tab === 'solicitudes' && (
          <div className="mt-6 flex flex-col gap-4" data-testid="admin-solicitudes-list">
            {solicitudes.length === 0 && <p className="text-sm text-[#7A8F9E]">Todavía no hay solicitudes.</p>}
            {solicitudes.map((s) => (
              <div key={s.id} data-testid={`admin-solicitud-${s.id}`}
                className="rounded-2xl bg-white shadow-[0_2px_20px_rgba(28,45,55,.07)] p-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="min-w-[180px]">
                  <div className="font-mono2 text-xs text-[#366A8B] font-bold">{s.referencia}</div>
                  <div className="font-display text-lg leading-tight mt-0.5">{s.boatName}</div>
                  <div className="text-xs text-[#7A8F9E] mt-0.5">{s.fecha} · {s.personas} personas</div>
                </div>
                <div className="flex-1 min-w-[200px] text-sm">
                  <div className="font-semibold">{s.nombre}</div>
                  <div className="text-[#7A8F9E] text-xs">{s.email} · {s.telefono}</div>
                  {s.comentarios && <div className="text-xs mt-1 italic text-[#4B6170]">“{s.comentarios}”</div>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${ESTADO_STYLE[s.estado] || ESTADO_STYLE.pendiente}`} data-testid={`admin-estado-badge-${s.id}`}>
                    {s.estado}
                  </span>
                  <select value={s.estado} onChange={(e) => setEstado(s.id, e.target.value)} data-testid={`admin-estado-${s.id}`}
                    className="rounded-xl border border-[#366A8B]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#366A8B]">
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'quejas' && (
          <div className="mt-6 flex flex-col gap-4" data-testid="admin-notas-list">
            {notas.length === 0 && <p className="text-sm text-[#7A8F9E]">Sin quejas registradas por el asistente.</p>}
            {notas.map((n) => (
              <div key={n.id} data-testid={`admin-nota-${n.id}`}
                className="rounded-2xl bg-white shadow-[0_2px_20px_rgba(28,45,55,.07)] p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${IMPORTANCIA_STYLE[n.importancia] || IMPORTANCIA_STYLE.media}`}>
                  {n.importancia}
                </span>
                <div className="flex-1 min-w-[240px]">
                  <div className="text-sm font-semibold">{n.resumen}</div>
                  <div className="text-xs text-[#7A8F9E] mt-1 italic">“{n.mensaje}”</div>
                  <div className="text-[11px] text-[#7A8F9E] mt-1.5">
                    {n.empresa && <>Empresa: <b className="text-[#1C2D37]">{n.empresa}</b> · </>}
                    {new Date(n.creado).toLocaleString('es-ES')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* portales privados de empresa */}
        <div className="mt-14" data-testid="admin-portales">
          <h2 className="font-display text-2xl tracking-tight">Portales privados de empresa</h2>
          <p className="mt-2 text-sm text-[#7A8F9E] max-w-[60ch]">
            Producto de pago: cada empresa recibe un enlace secreto a su portal de reservas (no aparece enlazado en la web).
            Genera el enlace, cópialo en el momento y envíalo a la empresa. Si se pierde, genera uno nuevo (el anterior queda revocado).
          </p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {COMPANIES_LIST.map((c) => {
              const t = portales.find((p) => p.company_id === c.id);
              const url = enlaces[c.id];
              return (
                <div key={c.id} className="rounded-2xl bg-white shadow-[0_2px_20px_rgba(28,45,55,.07)] p-5" data-testid={`admin-portal-${c.id}`}>
                  <div className="flex items-center gap-3">
                    <CompanyLogo company={COMPANIES[c.id]} size={38} />
                    <div className="flex-1">
                      <div className="text-sm font-bold">{c.name}</div>
                      <div className="text-[11px] text-[#7A8F9E]">
                        {t?.active ? `Portal activo${t.last_used_at ? ` · último acceso ${new Date(t.last_used_at).toLocaleDateString('es-ES')}` : ''}` : 'Sin portal generado'}
                      </div>
                    </div>
                    <button onClick={() => generarEnlace(c.id)} data-testid={`admin-portal-generate-${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0A1128] text-[#E5C158] text-[11px] font-bold uppercase tracking-[.1em] px-4 py-2.5 hover:bg-[#366A8B] hover:text-white transition-all">
                      <Link2 size={12} /> {t?.active ? 'Regenerar' : 'Generar'}
                    </button>
                  </div>
                  {url && (
                    <div className="mt-3 flex items-center gap-2">
                      <input readOnly value={url} data-testid={`admin-portal-url-${c.id}`}
                        className="flex-1 rounded-lg bg-[#F3EFE6] px-3 py-2 text-xs font-mono2 outline-none" />
                      <button onClick={() => copiar(url)} data-testid={`admin-portal-copy-${c.id}`} aria-label="Copiar enlace"
                        className="w-9 h-9 rounded-lg bg-[#366A8B] text-white flex items-center justify-center hover:bg-[#234A63] transition-all">
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
