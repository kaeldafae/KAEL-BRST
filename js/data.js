/* KAEL AUT — datos de mercados, empresas y embarcaciones.
   Este fichero define la estructura de datos del portal. No contiene
   empresas de ejemplo: se van añadiendo aquí a medida que confirman la
   colaboración, agrupadas por mercado (MARKETS). Para dar de alta una
   empresa nueva, añade una entrada en COMPANIES con su marketId y su tier
   ('premium' o 'standard'), y sus embarcaciones en BOATS. */

const IMG = 'img/boats/';

/* Mercados en los que opera o va a operar KAEL AUT. Añadir un mercado aquí
   lo hace aparecer automáticamente en los selectores de destino, aunque
   todavía no tenga ninguna empresa cargada. */
const MARKETS = {
  'ibiza': { id: 'ibiza', name: 'Ibiza y Formentera', country: 'España' },
  'canarias': { id: 'canarias', name: 'Canarias', country: 'España' },
  'cancun': { id: 'cancun', name: 'Cancún', country: 'México' },
  'phuket': { id: 'phuket', name: 'Phuket', country: 'Tailandia' },
  'dubai': { id: 'dubai', name: 'Dubái', country: 'EAU' }
};

/* Empresas náuticas colaboradoras verificadas. Vacío a propósito: se
   completa a medida que cada empresa confirma la colaboración. Cada
   empresa debe indicar marketId (uno de MARKETS) y tier ('premium' para
   una oferta de lujo — theming oscuro/dorado — o 'standard' para una
   oferta más asequible — theming claro/desenfadado). Ver css/styles.css,
   sección "Theming por tier". */
const COMPANIES = {};

/* Embarcaciones de las empresas colaboradoras. Vacío por el mismo motivo. */
const BOATS = [];

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
