import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crown, Clock, Navigation, Anchor, ChevronRight, Plus } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { MARKETS_LIST, COMPANIES_LIST, COMPANIES, euro } from '@/data/catalog';
import CompanyLogo from '@/components/CompanyLogo';
import { ROUTES, marketCoords, marketZoom, boatsByMarket, isVipMarket, marketNameOf } from '@/data/routes';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const dotIcon = (vip, active) => L.divIcon({
  className: '',
  html: `<div style="width:${active ? 20 : 14}px;height:${active ? 20 : 14}px;border-radius:50%;background:${vip ? '#D4AF37' : '#366A8B'};border:3px solid ${vip ? '#F7F5F0' : '#fff'};box-shadow:0 0 0 ${active ? 8 : 4}px ${vip ? 'rgba(212,175,55,.25)' : 'rgba(54,106,139,.22)'};transition:all .3s"></div>`,
  iconSize: [active ? 20 : 14, active ? 20 : 14],
  iconAnchor: [active ? 10 : 7, active ? 10 : 7],
});

const stopIcon = (n, vip) => L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:${vip ? '#0A1128' : '#fff'};color:${vip ? '#E5C158' : '#366A8B'};border:2px solid ${vip ? '#D4AF37' : '#366A8B'};display:flex;align-items:center;justify-content:center;font:700 11px 'JetBrains Mono',monospace">${n}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.4 }); }, [center, zoom, map]);
  return null;
}

export default function Routes() {
  const [marketId, setMarketId] = useState('ibiza');
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [routesAll, setRoutesAll] = useState(ROUTES);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', duration: '', distance: '', boatType: '', companyId: '', description: '', waypointsText: '' });

  useEffect(() => {
    axios.get(`${API}/rutas`)
      .then((res) => { if (Array.isArray(res.data) && res.data.length) setRoutesAll(res.data); })
      .catch(() => { /* fallback a rutas locales */ });
  }, []);

  const routesOf = (id) => routesAll.filter((r) => r.marketId === id);
  const routes = useMemo(() => routesAll.filter((r) => r.marketId === marketId), [routesAll, marketId]);
  const route = useMemo(() => routesAll.find((r) => r.id === routeId) || routes[0], [routesAll, routeId, routes]);
  const boats = useMemo(() => boatsByMarket(marketId), [marketId]);
  const vip = isVipMarket(marketId);

  const chooseMarket = (id) => {
    setMarketId(id);
    const r = routesOf(id);
    if (r.length) setRouteId(r[0].id);
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submitRoute = async (e) => {
    e.preventDefault();
    const waypoints = form.waypointsText.split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [lat, lng, ...label] = l.split(',');
        return [parseFloat(lat), parseFloat(lng), label.join(',').trim() || 'Parada'];
      });
    if (waypoints.length < 2 || waypoints.some((w) => Number.isNaN(w[0]) || Number.isNaN(w[1]))) {
      toast.error('Revisa las paradas: una por línea, formato "lat, lng, nombre"');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/rutas`, {
        marketId, name: form.name, duration: form.duration, distance: form.distance,
        boatType: form.boatType, companyId: form.companyId || null, description: form.description, waypoints,
      });
      setRoutesAll((prev) => [...prev, res.data]);
      setRouteId(res.data.id);
      setFormOpen(false);
      setForm({ name: '', duration: '', distance: '', boatType: '', companyId: '', description: '', waypointsText: '' });
      toast.success('Ruta guardada', { description: 'Ya aparece en el mapa del destino.' });
    } catch {
      toast.error('No se pudo guardar la ruta');
    } finally {
      setSaving(false);
    }
  };

  const routeColor = vip ? '#D4AF37' : '#366A8B';

  return (
    <main className="pt-32 sm:pt-40 pb-16" data-testid="routes-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Mapa interactivo</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">Destinos y rutas</h1>
          <p className="mt-4 text-base text-[#4B6170] max-w-[56ch]">
            Explora cada destino en el mapa y elige la ruta sugerida. Como en las grandes plataformas, cada ruta tiene paradas, duración y el barco recomendado.
          </p>
        </Reveal>

        <div className="mt-10 grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* sidebar */}
          <div className="flex flex-col gap-6">
            <Reveal>
              <div className="rounded-[24px] bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)] p-4" data-testid="routes-market-list">
                <div className="text-[10px] uppercase tracking-[.22em] font-bold text-[#7A8F9E] px-2 pb-2">Destino</div>
                <div className="max-h-[300px] overflow-y-auto flex flex-col">
                  {MARKETS_LIST.map((m) => {
                    const v = isVipMarket(m.id);
                    const active = m.id === marketId;
                    return (
                      <button key={m.id} onClick={() => chooseMarket(m.id)} data-testid={`route-market-${m.id}`}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                          active ? (v ? 'bg-[#0A1128] text-[#F7F5F0]' : 'bg-[#EAF2F7]') : 'hover:bg-[#F7F5F0]'
                        }`}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v ? '#D4AF37' : '#366A8B' }} />
                        <span className="flex-1">
                          <span className={`block text-sm font-semibold inline-flex items-center gap-1.5 ${active && v ? 'text-[#E5C158]' : 'text-[#1C2D37]'}`}>
                            {v && <Crown size={11} className="text-[#D4AF37]" />}
                            {m.name}
                          </span>
                          <span className={`block text-[11px] ${active && v ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>{m.country}</span>
                        </span>
                        <span className={`text-[11px] tabular ${active && v ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
                          {boatsByMarket(m.id).length} barco{boatsByMarket(m.id).length === 1 ? '' : 's'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* routes of the market */}
            <Reveal delay={0.08}>
              <div className={`rounded-[24px] p-4 transition-all duration-700 ${vip ? 'bg-[#0A1128] vip-glow relative overflow-hidden' : 'bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)]'}`} data-testid="routes-list">
                {vip && <div className="gold-shimmer absolute inset-x-0 top-0 h-[3px]" />}
                <div className={`text-[10px] uppercase tracking-[.22em] font-bold px-2 pb-2 ${vip ? 'text-[#D4AF37]' : 'text-[#7A8F9E]'}`}>
                  Rutas en {marketNameOf(marketId)}
                </div>
                <div className="flex flex-col gap-2">
                  {routes.map((r) => {
                    const active = route?.id === r.id;
                    return (
                      <button key={r.id} onClick={() => setRouteId(r.id)} data-testid={`route-card-${r.id}`}
                        className={`rounded-2xl px-4 py-3.5 text-left transition-all border ${
                          active
                            ? vip ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10' : 'border-[#366A8B]/50 bg-[#EAF2F7]'
                            : vip ? 'border-white/10 hover:border-[#D4AF37]/40' : 'border-[#366A8B]/10 hover:border-[#366A8B]/40'
                        }`}>
                        <div className={`text-sm font-bold flex items-center justify-between ${vip ? 'text-[#F7F5F0]' : 'text-[#1C2D37]'}`}>
                          {r.name}
                          <ChevronRight size={14} className={active ? routeColor : 'opacity-30'} style={{ color: active ? routeColor : undefined }} />
                        </div>
                        <div className={`mt-1.5 flex gap-4 text-[11px] ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
                          <span className="inline-flex items-center gap-1"><Clock size={11} /> {r.duration}</span>
                          <span className="inline-flex items-center gap-1"><Navigation size={11} /> {r.distance}</span>
                          <span className="inline-flex items-center gap-1"><Anchor size={11} /> {r.waypoints.length} paradas</span>
                        </div>
                        {r.companyId && COMPANIES[r.companyId] && (
                          <div className={`mt-2 flex items-center gap-2 text-[11px] font-semibold ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`} data-testid={`route-company-${r.id}`}>
                            <CompanyLogo company={COMPANIES[r.companyId]} size={18} />
                            Opera: {COMPANIES[r.companyId].name}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* route detail */}
            {route && (
              <Reveal delay={0.14}>
                <div className={`rounded-[24px] p-6 ${vip ? 'bg-[#0A1128] text-[#F7F5F0] vip-glow' : 'bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)]'}`} data-testid="route-detail">
                  <div className={`text-[10px] uppercase tracking-[.22em] font-bold ${vip ? 'text-[#D4AF37]' : 'text-[#366A8B]'}`}>Barco recomendado: {route.boatType}</div>
                  <p className={`mt-3 text-sm leading-relaxed ${vip ? 'text-[#C8D3E0]' : 'text-[#4B6170]'}`}>{route.description}</p>
                  <div className="mt-4 flex flex-col gap-1.5">
                    {route.waypoints.map((w, i) => (
                      <div key={i} className={`flex items-center gap-2.5 text-xs ${vip ? 'text-[#8A9BAE]' : 'text-[#7A8F9E]'}`}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono2 text-[10px] font-bold"
                          style={{ background: vip ? '#0F1A3A' : '#EAF2F7', color: routeColor, border: `1px solid ${routeColor}` }}>
                          {i + 1}
                        </span>
                        {w[2]}
                      </div>
                    ))}
                  </div>
                  {boats.length > 0 && (
                    <div className="mt-5" data-testid="route-boats">
                      {boats.map((b) => (
                        <Link key={b.id} to={`/barco/${b.id}`} data-testid={`route-boat-${b.id}`}
                          className={`mt-2 flex items-center justify-between rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-[.12em] transition-all ${
                            vip ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A1128] hover:shadow-[0_8px_30px_rgba(212,175,55,.4)]' : 'bg-[#1C2D37] text-white hover:bg-[#366A8B]'
                          }`}>
                          {b.name} · desde {euro(b.price)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            )}
            {/* añadir ruta real */}
            <Reveal delay={0.2}>
              <div className="rounded-[24px] bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)] p-5" data-testid="route-add-panel">
                <button type="button" onClick={() => setFormOpen(!formOpen)} data-testid="route-add-toggle"
                  className="flex w-full items-center justify-between text-sm font-bold text-[#1C2D37]">
                  <span className="inline-flex items-center gap-2"><Plus size={15} className="text-[#366A8B]" /> Añadir ruta real de una empresa</span>
                  <ChevronRight size={15} className={`text-[#7A8F9E] transition-transform ${formOpen ? 'rotate-90' : ''}`} />
                </button>
                {formOpen && (
                  <form onSubmit={submitRoute} className="mt-4 flex flex-col gap-3" data-testid="route-add-form">
                    <input required value={form.name} onChange={setF('name')} placeholder="Nombre de la ruta" data-testid="route-add-name"
                      className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    <div className="grid grid-cols-2 gap-3">
                      <input required value={form.duration} onChange={setF('duration')} placeholder="Duración (p. ej. 6 h)" data-testid="route-add-duration"
                        className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                      <input required value={form.distance} onChange={setF('distance')} placeholder="Distancia (p. ej. 14 millas)" data-testid="route-add-distance"
                        className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    </div>
                    <input required value={form.boatType} onChange={setF('boatType')} placeholder="Barco recomendado" data-testid="route-add-boattype"
                      className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    <select value={form.companyId} onChange={setF('companyId')} data-testid="route-add-company"
                      className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30">
                      <option value="">Ruta editorial de KAEL (sin empresa)</option>
                      {COMPANIES_LIST.filter((c) => c.marketId === marketId).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <textarea required rows="2" value={form.description} onChange={setF('description')} placeholder="Descripción de la ruta" data-testid="route-add-description"
                      className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#366A8B]/30" />
                    <textarea required rows="4" value={form.waypointsText} onChange={setF('waypointsText')} data-testid="route-add-waypoints"
                      placeholder={'Una parada por línea: lat, lng, nombre\n38.913, 1.449, Marina Botafoch (salida)\n38.758, 1.425, Illetes'}
                      className="rounded-xl bg-[#F7F5F0] px-4 py-2.5 text-sm font-mono2 outline-none focus:ring-2 ring-[#366A8B]/30" />
                    <button type="submit" disabled={saving} data-testid="route-add-submit"
                      className="rounded-full bg-[#1C2D37] text-white text-[12px] font-bold uppercase tracking-[.14em] px-6 py-3 hover:bg-[#366A8B] transition-all disabled:opacity-60">
                      {saving ? 'Guardando…' : `Guardar ruta en ${marketNameOf(marketId)}`}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.05}>
            <div className={`rounded-[28px] overflow-hidden h-[480px] lg:h-[640px] transition-shadow duration-700 ${vip ? 'vip-glow ring-1 ring-[#D4AF37]/40' : 'shadow-[0_20px_60px_rgba(28,45,55,.14)]'}`} data-testid="routes-map">
              <MapContainer center={[28, -10]} zoom={2.4} scrollWheelZoom style={{ height: '100%', width: '100%', background: '#EAF2F7' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.openseamap.org/">OpenSeaMap</a>'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <TileLayer url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png" opacity={0.85} />
                <FlyTo center={marketCoords(marketId)} zoom={marketZoom(marketId)} />
                {MARKETS_LIST.map((m) => (
                  <Marker key={m.id} position={marketCoords(m.id)} icon={dotIcon(isVipMarket(m.id), m.id === marketId)}
                    eventHandlers={{ click: () => chooseMarket(m.id) }}>
                    <Popup>
                      <b>{m.name}</b><br />{routesOf(m.id).length} ruta{routesOf(m.id).length === 1 ? '' : 's'} sugerida{routesOf(m.id).length === 1 ? '' : 's'}
                    </Popup>
                  </Marker>
                ))}
                {route && (
                  <>
                    <Polyline positions={route.waypoints.map((w) => [w[0], w[1]])}
                      pathOptions={{ color: routeColor, weight: 4, opacity: 0.9, lineCap: 'round', dashArray: '2 10' }} />
                    {route.waypoints.map((w, i) => (
                      <Marker key={i} position={[w[0], w[1]]} icon={stopIcon(i + 1, vip)}>
                        <Popup><b>{i + 1}. {w[2]}</b></Popup>
                      </Marker>
                    ))}
                  </>
                )}
              </MapContainer>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
