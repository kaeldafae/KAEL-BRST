import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import MiniCalendar from '@/components/MiniCalendar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RequestForm({ boat, vip }) {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', fecha: '', personas: boat.pax, comentarios: '' });
  const [ocupadas, setOcupadas] = useState([]);
  const [disponible, setDisponible] = useState(null);

  useEffect(() => {
    setOcupadas([]);
    setDisponible(null);
    axios.get(`${API}/fechas-ocupadas`, { params: { boatId: boat.id } })
      .then((r) => setOcupadas(r.data.fechas))
      .catch(() => {});
  }, [boat.id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFecha = (e) => {
    const f = e.target.value;
    setForm({ ...form, fecha: f });
    setDisponible(f ? !ocupadas.includes(f) : null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (disponible === false) return;
    setSending(true);
    try {
      const res = await axios.post(`${API}/solicitudes`, {
        boatId: boat.id,
        boatName: boat.name,
        ...form,
        personas: Number(form.personas),
      });
      toast.success(`Solicitud enviada · Ref. ${res.data.referencia}`, {
        description: 'La empresa náutica te contactará para confirmar disponibilidad y precio. Sin pagos por adelantado.',
      });
      setForm({ nombre: '', email: '', telefono: '', fecha: '', personas: boat.pax, comentarios: '' });
      setDisponible(null);
    } catch {
      toast.error('No se pudo enviar la solicitud', { description: 'Inténtalo de nuevo en unos segundos.' });
    } finally {
      setSending(false);
    }
  };

  const inputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border ${
    vip
      ? 'bg-[#0F1A3A] border-[#D4AF37]/25 text-[#F7F5F0] placeholder-[#8A9BAE] focus:border-[#D4AF37]'
      : 'bg-white border-[#366A8B]/20 text-[#1C2D37] placeholder-[#7A8F9E] focus:border-[#366A8B]'
  }`;
  const labelCls = `block text-[11px] uppercase tracking-[.18em] font-semibold mb-2 ${vip ? 'text-[#D4AF37]' : 'text-[#4B6170]'}`;

  return (
    <form onSubmit={submit} data-testid="availability-request-form" id="solicitar"
      className={`rounded-[28px] p-7 sm:p-9 ${vip ? 'bg-[#0A1128] text-[#F7F5F0] vip-glow relative overflow-hidden' : 'bg-white shadow-[0_2px_30px_rgba(28,45,55,.10)]'}`}>
      {vip && <div className="gold-shimmer absolute inset-x-0 top-0 h-[3px]" />}
      <h3 className="font-display text-2xl">Solicitar disponibilidad</h3>
      <p className={`mt-2 text-sm ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
        KAEL no cobra nada al cliente. Para confirmar la reserva, la empresa te pedirá una señal (normalmente 20–30 %) que le pagas directamente a ella; el resto se abona según sus condiciones.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Nombre y apellidos</label>
          <input required className={inputCls} value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" data-testid="request-form-name-input" />
        </div>
        <div>
          <label className={labelCls}>Correo electrónico</label>
          <input required type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="tu@email.com" data-testid="request-form-email-input" />
        </div>
        <div>
          <label className={labelCls}>Teléfono / WhatsApp</label>
          <input required className={inputCls} value={form.telefono} onChange={set('telefono')} placeholder="+34 ..." data-testid="request-form-phone-input" />
        </div>
        <div>
          <label className={labelCls}>Fecha</label>
          <input required type="date" className={inputCls} value={form.fecha} onChange={onFecha} data-testid="request-form-date-input" />
          {disponible === true && (
            <div data-testid="availability-ok" className="mt-2 text-xs font-semibold text-emerald-500">Disponible: no hay reserva confirmada ese día</div>
          )}
          {disponible === false && (
            <div data-testid="availability-unavailable" className="mt-2 text-xs font-semibold text-red-500">No disponible: ese día ya tiene una reserva confirmada</div>
          )}
        </div>
        <div>
          <label className={labelCls}>Personas</label>
          <input required type="number" min="1" max={boat.pax} className={inputCls} value={form.personas} onChange={set('personas')} data-testid="request-form-pax-input" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Comentarios / peticiones especiales</label>
          <textarea rows="3" className={inputCls} value={form.comentarios} onChange={set('comentarios')} placeholder="Ruta, horario, cumpleaños..." data-testid="request-form-comments-input" />
        </div>
      </div>
      {ocupadas.length > 0 && (
        <div data-testid="occupied-dates" className={`mt-4 text-[11px] ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
          Días no disponibles: {ocupadas.map((f) => new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })).join(' · ')}
        </div>
      )}
      <div className="mt-5">
        <MiniCalendar ocupadas={ocupadas} vip={vip} value={form.fecha}
          onPick={(f) => { setForm({ ...form, fecha: f }); setDisponible(!ocupadas.includes(f)); }} />
      </div>
      <button type="submit" disabled={sending || disponible === false} data-testid="request-form-submit-btn"
        className={`mt-7 w-full rounded-full text-[13px] uppercase tracking-[.15em] font-bold px-6 py-4 transition-all disabled:opacity-60 ${
          vip ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] hover:shadow-[0_8px_30px_rgba(212,175,55,.4)]' : 'bg-[#1C2D37] text-white hover:bg-[#366A8B]'
        }`}>
        {sending ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
