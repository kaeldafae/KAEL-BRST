import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Crown, Check, X, PhoneCall, Lock, Inbox, Percent, Ship } from 'lucide-react';
import MiniCalendar from '@/components/MiniCalendar';
import CompanyLogo from '@/components/CompanyLogo';
import { COMPANIES, BOATS, euro } from '@/data/catalog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ESTADO_STYLE = {
  pendiente: 'bg-amber-400/15 text-amber-300 border-amber-400/40',
  contactada: 'bg-sky-400/15 text-sky-300 border-sky-400/40',
  confirmada: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40',
  rechazada: 'bg-red-400/15 text-red-300 border-red-400/40',
  cancelada: 'bg-gray-400/15 text-gray-400 border-gray-400/40',
};

const boatNameOf = (id) => BOATS.find((b) => b.id === id)?.name || id;

export default function Portal() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [boatTab, setBoatTab] = useState(null);
  const [importeInput, setImporteInput] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [senalInput, setSenalInput] = useState('');
  const [aceptaContrato, setAceptaContrato] = useState(false);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!token) { setError('Enlace no válido'); return; }
    axios.get(`${API}/portal/me`, { headers })
      .then((r) => {
        setData(r.data);
        setBoatTab(r.data.boats[0]);
        if (r.data.solicitudes.length) setSelectedId(r.data.solicitudes[0].id);
      })
      .catch(() => setError('Este enlace no es válido o ha sido revocado. Pide uno nuevo a KAEL.'));
  }, [token, headers]);

  const company = data?.company;
  const vip = company?.tier === 'premium';
  const selected = data?.solicitudes.find((s) => s.id === selectedId);

  const applyUpdate = (sid, estado, comision) => {
    setData((d) => {
      const solicitudes = d.solicitudes.map((s) => (s.id === sid ? { ...s, estado, comision: comision ?? s.comision } : s));
      const ocupadas = {};
      solicitudes.forEach((s) => { if (s.estado === 'confirmada') (ocupadas[s.boatId] = ocupadas[s.boatId] || []).push(s.fecha); });
      const total = solicitudes.filter((s) => s.estado === 'confirmada').reduce((a, s) => a + (s.comision || 0), 0);
      return { ...d, solicitudes, ocupadas, totales: { ...d.totales, confirmadas: solicitudes.filter((s) => s.estado === 'confirmada').length, comision_acumulada: Math.round(total * 100) / 100 } };
    });
  };

  const setEstado = async (sid, estado, importe) => {
    try {
      const r = await axios.patch(`${API}/portal/solicitudes/${sid}/estado`, { estado, importe }, { headers });
      applyUpdate(sid, estado, r.data.comision);
      setConfirmando(false);
      setImporteInput('');
      toast.success(
        estado === 'confirmada'
          ? `Reserva confirmada · comisión KAEL: ${euro(r.data.comision || 0)}`
          : estado === 'cancelada' ? 'Reserva cancelada: el día vuelve a estar disponible y la comisión queda anulada'
          : `Solicitud marcada como ${estado}`
      );
    } catch {
      toast.error('No se pudo actualizar');
    }
  };

  const marcarSenal = async (pagada) => {
    try {
      const importe = pagada && senalInput ? Number(senalInput) : null;
      await axios.patch(`${API}/portal/solicitudes/${selected.id}/senal`, { senal_pagada: pagada, importe_senal: importe }, { headers });
      setData((d) => ({ ...d, solicitudes: d.solicitudes.map((s) => (s.id === selected.id ? { ...s, senal_pagada: pagada, importe_senal: importe } : s)) }));
      setSenalInput('');
      toast.success(pagada ? 'Señal marcada como pagada' : 'Señal desmarcada');
    } catch {
      toast.error('No se pudo actualizar');
    }
  };

  const firmarContrato = async () => {
    try {
      const r = await axios.post(`${API}/portal/contrato`, {}, { headers });
      setData((d) => ({ ...d, config: { ...d.config, contrato_aceptado_at: r.data.aceptado_at, contrato_version: 'v1' } }));
      toast.success('Condiciones aceptadas y registradas con fecha y hora');
    } catch {
      toast.error('No se pudo registrar la aceptación');
    }
  };

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A1128] flex items-center justify-center p-6" data-testid="portal-error">
        <div className="text-center max-w-sm">
          <Lock size={32} className="mx-auto text-[#D4AF37]" />
          <p className="mt-5 text-[#C8D3E0]">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main className="min-h-screen bg-[#0A1128]" data-testid="portal-loading" />;
  }

  return (
    <main className="min-h-screen bg-[#0A1128] text-[#F7F5F0]" data-testid="portal-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <CompanyLogo company={COMPANIES[company.id]} size={52} />
            <div>
              <div className="text-[10px] uppercase tracking-[.25em] text-[#D4AF37] font-bold inline-flex items-center gap-1.5">
                <Lock size={11} /> Portal privado de reservas
              </div>
              <h1 className="font-display text-3xl tracking-tight mt-1 inline-flex items-center gap-2">
                {company.name}
                {vip && <Crown size={18} className="text-[#D4AF37]" data-testid="portal-vip-crown" />}
              </h1>
            </div>
          </div>
          <div className="text-[11px] text-[#8A9BAE] max-w-[30ch] text-right">
            Guarda este enlace: es la llave de tu portal. No lo compartas fuera de tu empresa.
          </div>
        </div>

        {/* comisión acordada */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4" data-testid="portal-commission-summary">
          <div className="rounded-2xl bg-[#0F1A3A] border border-[#D4AF37]/20 p-5">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold inline-flex items-center gap-1.5"><Percent size={11} /> Comisión acordada</div>
            <div className="font-mono2 text-3xl text-[#E5C158] mt-2 tabular">{data.config.commission_pct} %</div>
            <div className="text-[11px] text-[#8A9BAE] mt-1">KAEL te factura este % sobre cada reserva confirmada</div>
          </div>
          <div className="rounded-2xl bg-[#0F1A3A] border border-[#D4AF37]/20 p-5">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold">Reservas confirmadas</div>
            <div className="font-mono2 text-3xl text-[#F7F5F0] mt-2 tabular">{data.totales.confirmadas}</div>
            <div className="text-[11px] text-[#8A9BAE] mt-1">de {data.totales.solicitudes} solicitudes recibidas</div>
          </div>
          <div className="rounded-2xl bg-[#0F1A3A] border border-[#D4AF37]/20 p-5">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold">Comisión acumulada</div>
            <div className="font-mono2 text-3xl text-[#E5C158] mt-2 tabular" data-testid="portal-comision-total">{euro(data.totales.comision_acumulada)}</div>
            <div className="text-[11px] text-[#8A9BAE] mt-1">a facturar por KAEL (IVA según país)</div>
          </div>
        </div>

        {/* contrato digital de comisión */}
        {!data.config.contrato_aceptado_at ? (
          <div className="mt-8 rounded-[24px] border-2 border-[#D4AF37]/60 bg-[#D4AF37]/8 p-6 sm:p-8" data-testid="portal-contrato-banner">
            <h3 className="font-display text-xl text-[#E5C158]">Contrato de comisión KAEL (v1)</h3>
            <ul className="mt-4 text-sm text-[#C8D3E0] leading-relaxed list-disc pl-5 flex flex-col gap-1.5">
              <li>KAEL te factura el <b>{data.config.commission_pct} %</b> del importe de cada reserva confirmada (factura mensual).</li>
              <li>El cliente te paga a ti la señal y el resto del alquiler. KAEL no cobra nada al cliente ni gestiona su dinero.</li>
              <li>Si una reserva confirmada se cancela, su comisión queda anulada.</li>
              <li>Los datos del cliente solo se usan para gestionar su reserva (RGPD).</li>
            </ul>
            <label className="mt-5 flex items-start gap-3 text-sm text-[#F7F5F0] cursor-pointer">
              <input type="checkbox" checked={aceptaContrato} onChange={(e) => setAceptaContrato(e.target.checked)}
                data-testid="portal-contrato-check" className="mt-1 w-4 h-4 accent-[#D4AF37]" />
              <span>He leído y acepto las condiciones de comisión del {data.config.commission_pct} %, en nombre de {company.name}. Quedará registro de fecha, hora e IP.</span>
            </label>
            <button onClick={firmarContrato} disabled={!aceptaContrato} data-testid="portal-contrato-accept"
              className="mt-5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] text-[12px] font-bold uppercase tracking-[.12em] px-7 py-3 disabled:opacity-40 transition-all hover:shadow-[0_8px_30px_rgba(212,175,55,.4)]">
              Aceptar y firmar
            </button>
          </div>
        ) : (
          <div className="mt-8 text-[11px] text-[#8A9BAE]" data-testid="portal-contrato-firmado">
            Contrato de comisión (v1) aceptado el {new Date(data.config.contrato_aceptado_at).toLocaleString('es-ES')} · {data.config.contrato_pct ?? data.config.commission_pct} % pactado
          </div>
        )}

        <div className="mt-10 grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* inbox de reservas */}
          <div className="rounded-[24px] bg-[#0F1A3A] border border-[#D4AF37]/15 overflow-hidden" data-testid="portal-inbox">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 text-[11px] uppercase tracking-[.2em] font-bold text-[#D4AF37]">
              <Inbox size={14} /> Bandeja de reservas ({data.solicitudes.length})
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {data.solicitudes.length === 0 && (
                <p className="p-6 text-sm text-[#8A9BAE]">Aún no hay solicitudes para tus embarcaciones.</p>
              )}
              {data.solicitudes.map((s) => (
                <button key={s.id} onClick={() => { setSelectedId(s.id); setConfirmando(false); }} data-testid={`portal-item-${s.id}`}
                  className={`w-full text-left px-5 py-4 border-b border-white/5 transition-colors ${selectedId === s.id ? 'bg-[#D4AF37]/10' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono2 text-[11px] text-[#E5C158]">{s.referencia}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] ${ESTADO_STYLE[s.estado]}`} data-testid={`portal-badge-${s.id}`}>{s.estado}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-semibold">{s.boatName}</div>
                  <div className="text-xs text-[#8A9BAE] mt-0.5">{s.fecha} · {s.personas} personas · {s.nombre}</div>
                  {s.senal_pagada && <div className="mt-1 text-[10px] font-bold text-emerald-300 uppercase tracking-[.1em]">● Señal pagada</div>}
                </button>
              ))}
            </div>
          </div>

          {/* detalle */}
          {selected ? (
            <div className="flex flex-col gap-6" data-testid="portal-detail">
              <div className="rounded-[24px] bg-[#0F1A3A] border border-[#D4AF37]/15 p-7">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-mono2 text-xs text-[#E5C158]">{selected.referencia}</div>
                    <h2 className="font-display text-2xl mt-1">{selected.boatName}</h2>
                  </div>
                  <span className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] ${ESTADO_STYLE[selected.estado]}`}>{selected.estado}</span>
                </div>
                <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
                  <div><div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold">Cliente</div><div className="mt-1">{selected.nombre}</div></div>
                  <div><div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold">Contacto</div><div className="mt-1">{selected.email}<br />{selected.telefono}</div></div>
                  <div><div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold">Fecha</div><div className="mt-1 font-mono2">{selected.fecha}</div></div>
                  <div><div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold">Personas</div><div className="mt-1">{selected.personas}</div></div>
                </div>
                {selected.comentarios && (
                  <div className="mt-5 rounded-xl bg-white/5 px-4 py-3 text-sm italic text-[#C8D3E0]">“{selected.comentarios}”</div>
                )}
                {selected.importe != null && selected.estado === 'confirmada' && (
                  <div className="mt-5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-sm">
                    Importe de la reserva: <b className="font-mono2">{euro(selected.importe)}</b>
                    {' '}· Comisión KAEL ({data.config.commission_pct} %): <b className="font-mono2 text-[#E5C158]">{euro(selected.comision || 0)}</b>
                  </div>
                )}

                {/* señal del cliente */}
                <div className="mt-5 flex items-center gap-3 flex-wrap" data-testid="portal-senal-zone">
                  {selected.senal_pagada ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[.12em]" data-testid="portal-senal-badge">
                        <Check size={12} /> Señal pagada{selected.importe_senal ? ` · ${euro(selected.importe_senal)}` : ''}
                      </span>
                      <button onClick={() => marcarSenal(false)} data-testid="portal-senal-unmark"
                        className="text-[11px] text-[#8A9BAE] underline hover:text-red-300 transition-colors">Desmarcar</button>
                    </>
                  ) : (
                    <>
                      <input type="number" min="0" step="0.01" value={senalInput} onChange={(e) => setSenalInput(e.target.value)}
                        placeholder="Importe señal (opcional)" data-testid="portal-senal-input"
                        className="w-48 rounded-xl bg-[#0A1128] border border-white/15 px-4 py-2.5 text-sm text-[#F7F5F0] outline-none focus:border-[#D4AF37]" />
                      <button onClick={() => marcarSenal(true)} data-testid="portal-senal-btn"
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 text-emerald-300 text-[11px] font-bold uppercase tracking-[.12em] px-5 py-2.5 hover:bg-emerald-400/10 transition-all">
                        <Check size={13} /> Marcar señal pagada
                      </button>
                    </>
                  )}
                </div>

                {confirmando ? (
                  <div className="mt-7 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/8 p-5" data-testid="portal-confirm-panel">
                    <label className="block text-[10px] uppercase tracking-[.2em] text-[#D4AF37] font-bold">Importe total de la reserva (€)</label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <input type="number" min="0" step="0.01" value={importeInput} onChange={(e) => setImporteInput(e.target.value)}
                        placeholder="p. ej. 950" data-testid="portal-importe-input"
                        className="w-44 rounded-xl bg-[#0A1128] border border-[#D4AF37]/30 px-4 py-3 text-sm text-[#F7F5F0] outline-none focus:border-[#D4AF37]" />
                      {importeInput && (
                        <span className="text-xs text-[#8A9BAE]">Comisión KAEL: <b className="text-[#E5C158]">{euro(Math.round(Number(importeInput) * data.config.commission_pct) / 100)}</b></span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-[#8A9BAE]">El cliente te paga a ti la señal y el resto. KAEL solo te factura su comisión.</p>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => setEstado(selected.id, 'confirmada', Number(importeInput))} disabled={!importeInput} data-testid="portal-confirm-final-btn"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] text-[12px] font-bold uppercase tracking-[.12em] px-6 py-3 disabled:opacity-50 transition-all">
                        <Check size={15} /> Confirmar
                      </button>
                      <button onClick={() => { setConfirmando(false); setImporteInput(''); }} data-testid="portal-confirm-cancel-btn"
                        className="rounded-full border border-white/20 text-[#C8D3E0] text-[12px] font-bold uppercase tracking-[.12em] px-6 py-3 hover:bg-white/5 transition-all">
                        Atrás
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={() => setConfirmando(true)} data-testid="portal-confirm-btn"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] text-[12px] font-bold uppercase tracking-[.12em] px-6 py-3 hover:shadow-[0_8px_30px_rgba(212,175,55,.4)] transition-all">
                      <Check size={15} /> Confirmar reserva
                    </button>
                    <button onClick={() => setEstado(selected.id, 'contactada')} data-testid="portal-contact-btn"
                      className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 text-sky-300 text-[12px] font-bold uppercase tracking-[.12em] px-6 py-3 hover:bg-sky-400/10 transition-all">
                      <PhoneCall size={15} /> Contactada
                    </button>
                    <button onClick={() => setEstado(selected.id, 'cancelada')} data-testid="portal-cancel-btn"
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/40 text-red-300 text-[12px] font-bold uppercase tracking-[.12em] px-6 py-3 hover:bg-red-400/10 transition-all">
                      <X size={15} /> Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* calendario multi-barco */}
              <div>
                <div className="text-[10px] uppercase tracking-[.2em] text-[#8A9BAE] font-bold mb-3">Ocupación por embarcación (días confirmados en rojo)</div>
                {data.boats.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4" data-testid="portal-boat-tabs">
                    {data.boats.map((b) => (
                      <button key={b} onClick={() => setBoatTab(b)} data-testid={`portal-boat-tab-${b}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.1em] transition-all ${
                          boatTab === b ? 'bg-[#D4AF37] text-[#0A1128]' : 'bg-white/5 text-[#8A9BAE] border border-white/10 hover:border-[#D4AF37]/40'
                        }`}>
                        <Ship size={12} /> {boatNameOf(b)}
                      </button>
                    ))}
                  </div>
                )}
                <MiniCalendar ocupadas={data.ocupadas[boatTab] || []} vip />
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] bg-[#0F1A3A] border border-[#D4AF37]/15 p-10 text-center text-[#8A9BAE] text-sm" data-testid="portal-empty">
              Selecciona una reserva de la bandeja.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

