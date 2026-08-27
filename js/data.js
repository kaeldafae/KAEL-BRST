/* KAEL — datos de mercados, empresas y embarcaciones.
   Este fichero define la estructura de datos del portal. No contiene
   empresas de ejemplo: se van añadiendo aquí a medida que confirman la
   colaboración, agrupadas por mercado (MARKETS). Para dar de alta una
   empresa nueva, añade una entrada en COMPANIES con su marketId y su tier
   ('premium' o 'standard'), y sus embarcaciones en BOATS. */

const IMG = 'img/boats/';

/* Mercados en los que opera o va a operar KAEL. Añadir un mercado aquí
   lo hace aparecer automáticamente en los selectores de destino, aunque
   todavía no tenga ninguna empresa cargada. */
const MARKETS = {
  'ibiza': { id: 'ibiza', name: 'Ibiza y Formentera', country: 'España' },
  'canarias': { id: 'canarias', name: 'Canarias', country: 'España' },
  'cancun': { id: 'cancun', name: 'Cancún', country: 'México' },
  'phuket': { id: 'phuket', name: 'Phuket', country: 'Tailandia' },
  'dubai': { id: 'dubai', name: 'Dubái', country: 'EAU' }
};

/* Empresas náuticas colaboradoras verificadas reales. Vacío a propósito:
   se completa a medida que cada empresa confirma la colaboración. Cada
   empresa debe indicar marketId (uno de MARKETS) y tier ('premium' para
   una oferta de lujo — theming oscuro/dorado — o 'standard' para una
   oferta más asequible — theming claro/desenfadado). Ver css/styles.css,
   sección "Theming por tier". */
const REAL_COMPANIES = {};

/* Embarcaciones de las empresas colaboradoras reales. Vacío por el mismo motivo. */
const REAL_BOATS = [];

/* ---------------------------------------------------------------------
   Catálogo de EJEMPLO (DEMO_MODE). Ninguna empresa ni embarcación de aquí
   abajo es real: son datos ficticios para poder enseñar/probar la web
   mientras se confirman las primeras empresas náuticas aliadas. Todas
   llevan `demo: true`, lo que hace que la interfaz NUNCA les muestre la
   insignia de "Empresa verificada" (se sustituye por una de "Ejemplo" —
   ver catalog.js, empresas.html y empresa.html) y que aparezca un aviso
   fijo en todas las páginas (ver partials.js, renderDemoBanner).

   Para desactivar el catálogo de ejemplo en cuanto haya empresas reales,
   basta con poner DEMO_MODE en false: no hace falta borrar nada de aquí
   abajo, y REAL_COMPANIES/REAL_BOATS quedan intactas para ir rellenándose
   con las empresas reales según se vayan confirmando.
   --------------------------------------------------------------------- */
const DEMO_MODE = true;

const DEMO_COMPANIES = {
  'demo-ibiza-charter': {
    id: 'demo-ibiza-charter', demo: true, marketId: 'ibiza', tier: 'premium',
    name: 'Ejemplo Charter Ibiza', base: 'Ibiza, Marina Botafoch', cif: 'DEMO-00000001',
    sla: '1 h', confirmRate: '96%', rating: '4.8/5',
    about: 'Empresa de ejemplo para mostrar cómo se vería una ficha de empresa premium en la plataforma. No es una empresa real ni presta ningún servicio.'
  },
  'demo-canarias-nautica': {
    id: 'demo-canarias-nautica', demo: true, marketId: 'canarias', tier: 'standard',
    name: 'Ejemplo Náutica Canarias', base: 'Las Palmas de Gran Canaria', cif: 'DEMO-00000002',
    sla: '3 h', confirmRate: '90%', rating: '4.5/5',
    about: 'Empresa de ejemplo para mostrar cómo se vería una ficha de empresa estándar en la plataforma. No es una empresa real ni presta ningún servicio.'
  },
  'demo-cancun-boats': {
    id: 'demo-cancun-boats', demo: true, marketId: 'cancun', tier: 'standard',
    name: 'Ejemplo Cancún Boats', base: 'Puerto Cancún', cif: 'DEMO-00000003',
    sla: '2 h', confirmRate: '93%', rating: '4.6/5',
    about: 'Empresa de ejemplo para mostrar cómo se vería una ficha de empresa estándar en la plataforma. No es una empresa real ni presta ningún servicio.'
  },
  'demo-phuket-marine': {
    id: 'demo-phuket-marine', demo: true, marketId: 'phuket', tier: 'standard',
    name: 'Ejemplo Phuket Marine', base: 'Chalong Pier, Phuket', cif: 'DEMO-00000004',
    sla: '4 h', confirmRate: '88%', rating: '4.4/5',
    about: 'Empresa de ejemplo para mostrar cómo se vería una ficha de empresa estándar en la plataforma. No es una empresa real ni presta ningún servicio.'
  },
  'demo-dubai-yachts': {
    id: 'demo-dubai-yachts', demo: true, marketId: 'dubai', tier: 'premium',
    name: 'Ejemplo Dubai Yachts', base: 'Dubai Marina', cif: 'DEMO-00000005',
    sla: '1 h', confirmRate: '97%', rating: '4.9/5',
    about: 'Empresa de ejemplo para mostrar cómo se vería una ficha de empresa premium en la plataforma. No es una empresa real ni presta ningún servicio.'
  }
};

const DEMO_BOATS = [
  {
    id: 'demo-boat-ibiza-yate', demo: true, companyId: 'demo-ibiza-charter',
    name: 'Ejemplo Flybridge 48 (ficha de ejemplo)', type: 'Yate', pax: 10, length: '15 m', port: 'Ibiza',
    skipper: 'Con patrón', camarotes: 3, banos: 2, price: 1200,
    images: [IMG + 'yate-flybridge-fondeado.webp', IMG + 'proa-faro.webp', IMG + 'aerial-cala.webp'],
    description: 'Ficha de ejemplo para enseñar cómo se vería un yate premium en el catálogo. Ni el barco ni la empresa son reales.',
    included: ['Ejemplo: combustible para ruta estándar', 'Ejemplo: patrón profesional', 'Ejemplo: seguro de responsabilidad civil'],
    excluded: ['Ejemplo: catering a bordo', 'Ejemplo: extras de combustible por exceso de millas']
  },
  {
    id: 'demo-boat-ibiza-lancha', demo: true, companyId: 'demo-ibiza-charter',
    name: 'Ejemplo Speedster 30 (ficha de ejemplo)', type: 'Lancha', pax: 8, length: '9 m', port: 'Ibiza',
    skipper: 'Sin patrón', camarotes: 1, banos: 1, price: 450,
    images: [IMG + 'lancha-negra-deportiva.webp', IMG + 'lancha-perfil-blanca.webp', IMG + 'aerial-lancha-blanca.webp'],
    description: 'Ficha de ejemplo para enseñar cómo se vería una lancha estándar en el catálogo. Ni el barco ni la empresa son reales.',
    included: ['Ejemplo: combustible para ruta estándar', 'Ejemplo: chalecos salvavidas'],
    excluded: ['Ejemplo: patrón (embarcación sin patrón)', 'Ejemplo: extras de combustible por exceso de millas']
  },
  {
    id: 'demo-boat-canarias-cata', demo: true, companyId: 'demo-canarias-nautica',
    name: 'Ejemplo Catamarán 42 (ficha de ejemplo)', type: 'Catamarán', pax: 12, length: '13 m', port: 'Las Palmas',
    skipper: 'Con patrón', camarotes: 4, banos: 2, price: 950,
    images: [IMG + 'catamaran-grupo.webp', IMG + 'aerial-cala.webp', IMG + 'proa-faro.webp'],
    description: 'Ficha de ejemplo para enseñar cómo se vería un catamarán en el catálogo. Ni el barco ni la empresa son reales.',
    included: ['Ejemplo: combustible para ruta estándar', 'Ejemplo: patrón profesional'],
    excluded: ['Ejemplo: catering a bordo']
  },
  {
    id: 'demo-boat-cancun-lancha', demo: true, companyId: 'demo-cancun-boats',
    name: 'Ejemplo Bahía 26 (ficha de ejemplo)', type: 'Lancha', pax: 6, length: '8 m', port: 'Cancún',
    skipper: 'Con patrón', camarotes: 1, banos: 1, price: 380,
    images: [IMG + 'lancha-bimini-blanca.webp', IMG + 'lancha-toldo-azul.webp', IMG + 'aerial-lancha-blanca.webp'],
    description: 'Ficha de ejemplo para enseñar cómo se vería una lancha en el catálogo. Ni el barco ni la empresa son reales.',
    included: ['Ejemplo: combustible para ruta estándar', 'Ejemplo: patrón profesional'],
    excluded: ['Ejemplo: bebidas a bordo']
  },
  {
    id: 'demo-boat-phuket-lancha', demo: true, companyId: 'demo-phuket-marine',
    name: 'Ejemplo Islander 34 (ficha de ejemplo)', type: 'Lancha', pax: 10, length: '10 m', port: 'Phuket',
    skipper: 'Con patrón', camarotes: 2, banos: 1, price: 520,
    images: [IMG + 'lancha-negra-acantilado.webp', IMG + 'lancha-perfil-blanca.webp', IMG + 'proa-faro.webp'],
    description: 'Ficha de ejemplo para enseñar cómo se vería una lancha en el catálogo. Ni el barco ni la empresa son reales.',
    included: ['Ejemplo: combustible para ruta estándar', 'Ejemplo: patrón profesional'],
    excluded: ['Ejemplo: catering a bordo']
  },
  {
    id: 'demo-boat-dubai-yate', demo: true, companyId: 'demo-dubai-yachts',
    name: 'Ejemplo Majestic 60 (ficha de ejemplo)', type: 'Yate', pax: 14, length: '18 m', port: 'Dubai Marina',
    skipper: 'Con patrón', camarotes: 4, banos: 3, price: 2200,
    images: [IMG + 'yate-deportivo-gris.webp', IMG + 'aerial-cala.webp', IMG + 'proa-faro.webp'],
    description: 'Ficha de ejemplo para enseñar cómo se vería un yate premium en el catálogo. Ni el barco ni la empresa son reales.',
    included: ['Ejemplo: combustible para ruta estándar', 'Ejemplo: patrón profesional', 'Ejemplo: seguro de responsabilidad civil'],
    excluded: ['Ejemplo: catering a bordo', 'Ejemplo: extras de combustible por exceso de millas']
  }
];

const COMPANIES = DEMO_MODE ? Object.assign({}, REAL_COMPANIES, DEMO_COMPANIES) : REAL_COMPANIES;
const BOATS = DEMO_MODE ? REAL_BOATS.concat(DEMO_BOATS) : REAL_BOATS;

function euro(n) {
  return new Intl.NumberFormat('es-ES', { useGrouping: true }).format(n) + ' €';
}

function boatById(id) { return BOATS.find(b => b.id === id); }
function companyOf(boat) { return boat ? COMPANIES[boat.companyId] : undefined; }
function boatsByCompany(companyId) { return BOATS.filter(b => b.companyId === companyId); }
function marketOf(company) { return company ? MARKETS[company.marketId] : undefined; }
function companiesByMarket(marketId) { return Object.values(COMPANIES).filter(c => c.marketId === marketId); }
function boatsByMarket(marketId) { return BOATS.filter(b => { var c = companyOf(b); return c && c.marketId === marketId; }); }

function boatSpecs(b) {
  return [
    { k: t('boat.specs.tipo'), v: typeName(b.type) },
    { k: t('boat.specs.capacidad'), v: b.pax + ' ' + t('common.personas') },
    { k: t('boat.specs.eslora'), v: b.length },
    { k: t('boat.specs.puertoBase'), v: b.port },
    { k: t('boat.specs.patron'), v: skipperName(b.skipper) },
    { k: t('boat.specs.camarotes'), v: String(b.camarotes) },
    { k: t('boat.specs.banos'), v: String(b.banos) },
    { k: t('boat.specs.combustible'), v: t('boat.specs.combustibleValor') }
  ];
}

function typeName(type) { return t('common.types.' + type) || type; }
function skipperName(skipper) { return t('catalog.skippers.' + skipper) || skipper; }
