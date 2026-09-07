import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Flag, RefreshCw, Link2, Copy, LogOut, Lock, Crown, FileText, AlertTriangle } from 'lucide-react';
import CompanyLogo from '@/components/CompanyLogo';
import { COMPANIES_LIST, COMPANIES, BOATS, euro } from '@/data/catalog';

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

const boatCompany = Object.fromEntries(BOATS.map((b) => [b.id, b.companyId]));

export default function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('kael-admin-token') || '');
  const [loginForm, setLoginForm] = useState({ email: 'admin@kael.com', password: '' });
  const [loginError, setLoginError] = useState('');
  const [solicitudes, setSolicitudes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [tab, setTab] = useState('solicitudes');
  const [portales, setPortales] = useState([]);
  const [enlaces, setEnlaces] = useState({});
  const [cfgForm, setCfgForm] = useState({});
  const [facturaMes, setFacturaMes] = useState({});
  const [exportMes, setExportMes] = useState(new Date().toISOString().slice(0, 7));

  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('kael-admin-token');
    setToken('');
  }, []);

  const load = useCallback(() => {
    if (!token) return;
    const onErr = (e) => { if (e.response?.status === 401) logout(); };
    axios.get(`${API}/solicitudes`, auth).then((r) => setSolicitudes(r.data)).catch(onErr);
    axios.get(`${API}/notas-internas`, auth).then((r) => setNotas(r.data)).catch(onErr);
    axios.get(`${API}/portal-tokens`, auth).then((r) => {
      setPortales(r.data);
      const cfg = {};
      r.data.forEach((p) => { cfg[p.company_id] = { commission_pct: p.commission_pct, portal_plan: p.portal_plan, portal_price: p.portal_price }; });
      setCfgForm(cfg);
    }).catch(onErr);
  }, [token, auth, logout]);

  useEffect(() => { load(); }, [load]);

  const doLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const r = await axios.post(`${API}/admin/login`, loginForm);
      sessionStorage.setItem('kael-admin-token', r.data.token);
      setToken(r.data.token);
      toast.success('Sesión iniciada');
    } catch (err) {
      const d = err.response?.data?.detail;
      setLoginError(typeof d === 'string' ? d : 'No se pudo iniciar sesión');
    }
  };

  const setEstado = async (id, estado) => {
    try {
      await axios.patch(`${API}/solicitudes/${id}/estado`, { estado }, auth);
      setSolicitudes((s) => s.map((x) => (x.id === id ? { ...x, estado, comision: estado === 'confirmada' ? x.comision : 0 } : x)));
      toast.success(`Solicitud marcada como ${estado}`, {
        description: estado === 'confirmada'
          ? 'Ese día queda bloqueado en la web.'
          : (estado === 'cancelada' || estado === 'rechazada') ? 'El día vuelve a estar disponible.' : undefined,
      });
    } catch { toast.error('No se pudo actualizar'); }
  };

  const generarEnlace = async (companyId) => {
    try {
      const r = await axios.post(`${API}/portal-tokens/${companyId}`, {}, auth);
      const url = `${window.location.origin}${r.data.path}`;
      setEnlaces((e) => ({ ...e, [companyId]: url }));
      load();
      toast.success('Enlace generado', { description: 'Cópialo ahora: por seguridad no se puede recuperar después.' });
    } catch { toast.error('No se pudo generar el enlace'); }
  };

  const copiar = (url) => { navigator.clipboard.writeText(url).then(() => toast.success('Enlace copiado')); };

  const descargarFactura = async (cid) => {
    const mes = facturaMes[cid] || new Date().toISOString().slice(0, 7);
    try {
      const r = await axios.get(`${API}/empresas/${cid}/factura`, { params: { mes }, responseType: 'blob', ...auth });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-kael-${cid}-${mes}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Factura descargada');
    } catch {
      toast.error('No se pudo generar la factura');
    }
  };

  const exportarCSV = async () => {
    try {
      const r = await axios.get(`${API}/contabilidad/comisiones.csv`, { params: { mes: exportMes }, responseType: 'blob', ...auth });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kael-comisiones-${exportMes}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV de comisiones descargado');
    } catch {
      toast.error('No se pudo exportar');
    }
  };

  const guardarCfg = async (cid) => {
    try {
      await axios.patch(`${API}/empresas/${cid}/config`, {
        commission_pct: Number(cfgForm[cid].commission_pct),
        portal_plan: cfgForm[cid].portal_plan,
        portal_price: Number(cfgForm[cid].portal_price),
      }, auth);
      toast.success(`Condiciones de ${COMPANIES[cid]?.name} guardadas`);
      load();
    } catch { toast.error('No se pudo guardar'); }
  };

  const comisionPorEmpresa = useMemo(() => {
    const totals = {};
    solicitudes.forEach((s) => {
      if (s.estado === 'confirmada' && s.comision) {
        const cid = boatCompany[s.boatId];
        if (cid) totals[cid] = (totals[cid] || 0) + s.comision;
      }
    });
    return totals;
  }, [solicitudes]);

  if (!token) {
    return (
      <main className="pt-40 pb-24 min-h-[70vh]" data-testid="admin-login">
        <form onSubmit={doLogin} className="max-w-sm mx-auto rounded-[28px] bg-white shadow-[0_20px_60px_rgba(28,45,55,.12)] p-8">
          <Lock size={26} className="text-[#366A8B]" />
          <h1 className="font-display text-2xl mt-3">Panel interno</h1>
          <p className="text-sm text-[#7A8F9E] mt-1">Acceso solo para el equipo de KAEL.</p>
          <input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            placeholder="Email" data-testid="admin-login-email"
            className="mt-6 w-full rounded-xl bg-[#F7F5F0] px-4 py-3 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
          <input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            placeholder="Contraseña" data-testid="admin-login-password"
            className="mt-3 w-full rounded-xl bg-[#F7F5F0] px-4 py-3 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
          {loginError && <div className="mt-3 text-xs font-semibold text-red-500" data-testid="admin-login-error">{loginError}</div>}
          <button type="submit" data-testid="admin-login-submit"
            className="mt-6 w-full rounded-full bg-[#0A1128] text-white text-[12px] font-bold uppercase tracking-[.14em] px-6 py-3.5 hover:bg-[#366A8B] transition-all">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="pt-32 sm:pt-40 pb-24" data-testid="admin-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Panel interno</div>
            <h1 className="font-display text-4xl tracking-tight mt-2">Solicitudes, comisiones y portales</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={load} data-testid="admin-refresh-btn"
              className="inline-flex items-center gap-2 rounded-full border border-[#366A8B]/25 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.12em] text-[#366A8B] hover:bg-[#EAF2F7] transition-all">
              <RefreshCw size={14} /> Actualizar
            </button>
            <button onClick={logout} data-testid="admin-logout-btn"
              className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.12em] text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {/* modelo de comisiones */}
        <div className="mt-8 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/8 px-6 py-5 text-sm text-[#4B6170]" data-testid="admin-modelo-info">
          <b>Modelo:</b> el cliente paga la señal y el resto directamente a la empresa náutica. KAEL nunca cobra al cliente:
          factura a cada empresa su comisión pactada (10–20 %) por cada reserva confirmada. Ver el desglose legal en <a href="/legal" className="text-[#366A8B] font-semibold underline">/legal</a>.
        </div>

        {/* exportar contabilidad */}
        <div className="mt-4 rounded-2xl bg-white shadow-[0_2px_20px_rgba(28,45,55,.07)] p-5 flex items-center gap-4 flex-wrap" data-testid="admin-export-card">
          <FileText size={20} className="text-[#366A8B] shrink-0" />
          <div className="flex-1 min-w-[220px]">
            <div className="text-sm font-bold">Exportar contabilidad</div>
            <div className="text-xs text-[#7A8F9E]">CSV con todas las comisiones confirmadas del mes (IVA desglosado y señales), listo para tu gestor.</div>
          </div>
          <input type="month" value={exportMes} onChange={(e) => setExportMes(e.target.value)} data-testid="admin-export-month"
            className="rounded-lg bg-[#F7F5F0] px-3 py-2 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
          <button onClick={exportarCSV} data-testid="admin-export-csv-btn"
            className="rounded-full bg-[#1C2D37] text-white text-[11px] font-bold uppercase tracking-[.12em] px-5 py-2.5 hover:bg-[#366A8B] transition-all">
            Exportar CSV
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
                  {s.senal_pagada && (
                    <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] ${
                      s.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`} data-testid={`admin-senal-${s.id}`}>
                      {s.estado === 'confirmada' ? 'Señal pagada' : <><AlertTriangle size={10} /> Señal cobrada sin confirmar</>}
                      {s.importe_senal ? ` · ${euro(s.importe_senal)}` : ''}
                    </span>
                  )}
                  {s.importe != null && (
                    <div className="mt-1.5 text-xs font-mono2">
                      Importe {euro(s.importe)}
                      {s.comision ? <span className="text-[#B8860B] font-bold"> · Comisión KAEL {euro(s.comision)}</span> : null}
                    </div>
                  )}
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

        {/* portales + comisiones por empresa */}
        <div className="mt-14" data-testid="admin-portales">
          <h2 className="font-display text-2xl tracking-tight">Empresas: comisión, portal y enlaces</h2>
          <p className="mt-2 text-sm text-[#7A8F9E] max-w-[64ch]">
            Fija la comisión pactada con cada empresa (habitualmente 10–20 %), activa su portal privado (producto de pago mensual)
            y genera su enlace secreto. Si se pierde, regenera: el anterior queda revocado.
          </p>
          <div className="mt-6 grid lg:grid-cols-2 gap-4">
            {COMPANIES_LIST.map((c) => {
              const t = portales.find((p) => p.company_id === c.id);
              const cfg = cfgForm[c.id] || { commission_pct: 15, portal_plan: 'inactivo', portal_price: 29 };
              const url = enlaces[c.id];
              const activo = cfg.portal_plan === 'activo';
              return (
                <div key={c.id} className="rounded-2xl bg-white shadow-[0_2px_20px_rgba(28,45,55,.07)] p-5" data-testid={`admin-portal-${c.id}`}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <CompanyLogo company={COMPANIES[c.id]} size={38} />
                    <div className="flex-1 min-w-[140px]">
                      <div className="text-sm font-bold inline-flex items-center gap-1.5">
                        {c.name}
                        {c.tier === 'premium' && <Crown size={12} className="text-[#D4AF37]" />}
                      </div>
                      <div className="text-[11px] text-[#7A8F9E]">
                        {t?.active ? `Enlace activo${t.last_used_at ? ` · último acceso ${new Date(t.last_used_at).toLocaleDateString('es-ES')}` : ''}` : 'Sin enlace generado'}
                        {(comisionPorEmpresa[c.id] || 0) > 0 && <> · <b className="text-[#B8860B]">Comisiones: {euro(comisionPorEmpresa[c.id])}</b></>}
                      </div>
                    </div>
                    <span data-testid={`admin-portal-plan-${c.id}`}
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${activo ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                      Portal {activo ? `${euro(cfg.portal_price)}/mes` : 'inactivo'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[.15em] font-bold text-[#7A8F9E] mb-1">Comisión %</label>
                      <input type="number" min="0" max="50" step="0.5" value={cfg.commission_pct}
                        onChange={(e) => setCfgForm({ ...cfgForm, [c.id]: { ...cfg, commission_pct: e.target.value } })}
                        data-testid={`admin-commission-${c.id}`}
                        className="w-full rounded-lg bg-[#F7F5F0] px-3 py-2 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[.15em] font-bold text-[#7A8F9E] mb-1">Portal</label>
                      <select value={cfg.portal_plan}
                        onChange={(e) => setCfgForm({ ...cfgForm, [c.id]: { ...cfg, portal_plan: e.target.value } })}
                        data-testid={`admin-plan-${c.id}`}
                        className="w-full rounded-lg bg-[#F7F5F0] px-3 py-2 text-sm outline-none focus:ring-2 ring-[#366A8B]/30">
                        <option value="inactivo">Inactivo</option>
                        <option value="activo">Activo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[.15em] font-bold text-[#7A8F9E] mb-1">Precio €/mes</label>
                      <input type="number" min="0" value={cfg.portal_price}
                        onChange={(e) => setCfgForm({ ...cfgForm, [c.id]: { ...cfg, portal_price: e.target.value } })}
                        data-testid={`admin-price-${c.id}`}
                        className="w-full rounded-lg bg-[#F7F5F0] px-3 py-2 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => guardarCfg(c.id)} data-testid={`admin-config-save-${c.id}`}
                      className="rounded-full bg-[#366A8B] text-white text-[11px] font-bold uppercase tracking-[.1em] px-4 py-2.5 hover:bg-[#234A63] transition-all">
                      Guardar condiciones
                    </button>
                    <button onClick={() => generarEnlace(c.id)} data-testid={`admin-portal-generate-${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0A1128] text-[#E5C158] text-[11px] font-bold uppercase tracking-[.1em] px-4 py-2.5 hover:bg-[#366A8B] hover:text-white transition-all">
                      <Link2 size={12} /> {t?.active ? 'Regenerar enlace' : 'Generar enlace'}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-semibold ${t?.contrato_aceptado_at ? 'text-emerald-600' : 'text-amber-600'}`} data-testid={`admin-contrato-${c.id}`}>
                      {t?.contrato_aceptado_at ? `Contrato firmado el ${new Date(t.contrato_aceptado_at).toLocaleDateString('es-ES')}` : 'Contrato pendiente de firma'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input type="month" value={facturaMes[c.id] || new Date().toISOString().slice(0, 7)}
                      onChange={(e) => setFacturaMes({ ...facturaMes, [c.id]: e.target.value })}
                      data-testid={`admin-factura-mes-${c.id}`}
                      className="rounded-lg bg-[#F7F5F0] px-3 py-2 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    <button onClick={() => descargarFactura(c.id)} data-testid={`admin-factura-${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#366A8B]/30 text-[#366A8B] text-[11px] font-bold uppercase tracking-[.1em] px-4 py-2.5 hover:bg-[#EAF2F7] transition-all">
                      <FileText size={12} /> Factura PDF
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
