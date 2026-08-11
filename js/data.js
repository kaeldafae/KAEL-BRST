/* KAEL BRST — datos de embarcaciones y empresas colaboradoras.
   Sustituye estos datos por los reales de tus empresas náuticas antes de publicar. */

const IMG = 'img/boats/';

const COMPANIES = {
  'ibiza-charter': {
    id: 'ibiza-charter',
    name: 'Ibiza Charter S.L.',
    base: 'Marina Ibiza, Eivissa',
    cif: 'B-07XXXXXX (completar)',
    sla: '18 min',
    confirmRate: '82 %',
    rating: '4,8 / 5',
    about: 'Empresa de arrendamiento náutico con base en Marina Ibiza. Opera flota propia de embarcaciones a motor con y sin patrón. Verificada por KAEL BRST: identidad, habilitación para la actividad, documentación y seguros de cada embarcación.'
  },
  'formentera-nautica': {
    id: 'formentera-nautica',
    name: 'Formentera Nàutica S.L.',
    base: 'La Savina, Formentera',
    cif: 'B-07XXXXXX (completar)',
    sla: '1 h 10 min',
    confirmRate: '76 %',
    rating: '4,7 / 5',
    about: 'Empresa náutica con base en La Savina especializada en catamaranes y lanchas para grupos y familias. Verificada por KAEL BRST: identidad, habilitación para la actividad, documentación y seguros de cada embarcación.'
  },
  'blue-marlin': {
    id: 'blue-marlin',
    name: 'Blue Marlin Boats S.L.',
    base: 'Sant Antoni de Portmany',
    cif: 'B-07XXXXXX (completar)',
    sla: '45 min',
    confirmRate: '71 %',
    rating: '4,6 / 5',
    about: 'Empresa náutica con base en Sant Antoni, especializada en lanchas ligeras para las calas del oeste de Ibiza. Verificada por KAEL BRST: identidad, habilitación para la actividad, documentación y seguros de cada embarcación.'
  }
};

const BOATS = [
  {
    id: 'pershing-62',
    name: 'Pershing 62',
    type: 'Yate',
    pax: 12,
    length: '19,00 m',
    port: 'Marina Ibiza',
    zone: 'Ibiza',
    skipper: 'Con patrón',
    price: 3200,
    companyId: 'ibiza-charter',
    destacado: true,
    images: [IMG + 'yate-deportivo-gris.webp', IMG + 'yate-flybridge-fondeado.webp', IMG + 'lancha-negra-deportiva.webp'],
    description: 'Yate deportivo de líneas afiladas con base en Marina Ibiza. Salidas de día completo con patrón profesional y marinero, dos camarotes y una amplia zona de solárium en proa para grupos que buscan velocidad y presencia.',
    included: ['Patrón profesional y marinero', 'Toallas', 'Nevera y hielo', 'Equipo de snorkel', 'Seguro de la embarcación'],
    excluded: ['Combustible', 'Catering y bebidas', 'Transfer al puerto', 'Amarre en Formentera'],
    camarotes: 2, banos: 2
  },
  {
    id: 'sunseeker-55',
    name: 'Sunseeker Predator 55',
    type: 'Yate',
    pax: 12,
    length: '16,70 m',
    port: 'Marina Botafoch',
    zone: 'Ibiza',
    skipper: 'Con patrón',
    price: 2400,
    companyId: 'ibiza-charter',
    destacado: false,
    images: [IMG + 'yate-flybridge-fondeado.webp', IMG + 'yate-deportivo-gris.webp', IMG + 'lancha-negra-acantilado.webp'],
    description: 'Flybridge de 16,70 m para grupos de hasta 12 personas. Tres camarotes, dos baños y una segunda cubierta con zona de comedor exterior, ideal para pasar el día fondeados frente a una cala.',
    included: ['Patrón y marinero', 'Toallas', 'Equipo de snorkel', 'Paddle surf', 'Seguro de la embarcación'],
    excluded: ['Combustible', 'Catering', 'Amarre fuera de la base', 'Propina de tripulación'],
    camarotes: 3, banos: 2
  },
  {
    id: 'deantonio-d34',
    name: 'De Antonio D34',
    type: 'Lancha',
    pax: 10,
    length: '10,50 m',
    port: 'Marina Ibiza',
    zone: 'Ibiza',
    skipper: 'Con patrón',
    price: 980,
    companyId: 'ibiza-charter',
    destacado: false,
    images: [IMG + 'lancha-negra-acantilado.webp', IMG + 'lancha-perfil-blanca.webp', IMG + 'lancha-negra-deportiva.webp'],
    description: 'Day cruiser de diseño español con motores fueraborda ocultos. Rápida, cómoda y perfecta para la travesía Ibiza–Formentera en menos de 30 minutos, o para un día recorriendo la costa oeste.',
    included: ['Patrón', 'Nevera y hielo', 'Toallas', 'Equipo de snorkel'],
    excluded: ['Combustible', 'Catering', 'Amarre en Formentera', 'Fianza'],
    camarotes: 1, banos: 1
  },
  {
    id: 'lagoon-42',
    name: 'Lagoon 42',
    type: 'Catamarán',
    pax: 12,
    length: '12,80 m',
    port: 'La Savina',
    zone: 'Formentera',
    skipper: 'Con patrón',
    price: 1450,
    companyId: 'formentera-nautica',
    destacado: false,
    images: [IMG + 'catamaran-grupo.webp', IMG + 'aerial-cala.webp', IMG + 'proa-faro.webp'],
    description: 'Catamarán estable y amplio con salida desde La Savina. Trampolín de proa, cuatro camarotes y zona de sombra permanente: la mejor opción para grupos con niños o para pasar el día fondeado y bañándose.',
    included: ['Patrón', 'Trampolín y solárium', 'Toallas', 'Equipo de snorkel', 'Bebidas frías'],
    excluded: ['Combustible', 'Catering', 'Transfer', 'Actividades acuáticas motorizadas'],
    camarotes: 4, banos: 2
  },
  {
    id: 'jeanneau-cc85',
    name: 'Jeanneau Cap Camarat 8.5',
    type: 'Lancha',
    pax: 10,
    length: '8,50 m',
    port: 'La Savina',
    zone: 'Formentera',
    skipper: 'Con patrón',
    price: 890,
    companyId: 'formentera-nautica',
    destacado: false,
    images: [IMG + 'lancha-bimini-blanca.webp', IMG + 'aerial-lancha-blanca.webp', IMG + 'lancha-toldo-azul.webp'],
    description: 'Lancha francesa de casco profundo, cómoda incluso con algo de mar. Toldo bimini, baño de proa con ducha y una cubierta pensada para tomar el sol entre baño y baño en las calas de Formentera.',
    included: ['Patrón', 'Toallas', 'Nevera portátil', 'Equipo de snorkel', 'Chalecos salvavidas'],
    excluded: ['Combustible', 'Catering', 'Fianza (400 €)', 'Amarre fuera de la base'],
    camarotes: 1, banos: 1
  },
  {
    id: 'quicksilver-675',
    name: 'Quicksilver Activ 675',
    type: 'Lancha',
    pax: 8,
    length: '6,75 m',
    port: 'Sant Antoni',
    zone: 'Ibiza',
    skipper: 'Sin patrón',
    price: 480,
    companyId: 'blue-marlin',
    destacado: false,
    images: [IMG + 'lancha-toldo-azul.webp', IMG + 'lancha-bimini-blanca.webp', IMG + 'moto-agua.webp'],
    description: 'Lancha abierta manejable sin necesidad de patrón (según titulación), ideal para explorar por tu cuenta las calas del oeste de Ibiza. Toldo bimini, ducha de proa y nevera portátil incluidas.',
    included: ['Nevera portátil', 'Ducha de proa', 'Chalecos salvavidas', 'Seguro de la embarcación'],
    excluded: ['Combustible', 'Fianza (500 €)', 'Patrón opcional', 'Equipo de snorkel'],
    camarotes: 0, banos: 1
  }
];

function euro(n) {
  return new Intl.NumberFormat('es-ES', { useGrouping: true }).format(n) + ' €';
}

function boatById(id) { return BOATS.find(b => b.id === id); }
function companyOf(boat) { return COMPANIES[boat.companyId]; }
function boatsByCompany(companyId) { return BOATS.filter(b => b.companyId === companyId); }

function boatSpecs(b) {
  return [
    { k: 'Tipo', v: b.type },
    { k: 'Capacidad autorizada', v: b.pax + ' personas' },
    { k: 'Eslora', v: b.length },
    { k: 'Puerto base', v: b.port },
    { k: 'Patrón', v: b.skipper },
    { k: 'Camarotes', v: String(b.camarotes) },
    { k: 'Baños', v: String(b.banos) },
    { k: 'Combustible', v: 'No incluido, se liquida al regreso' }
  ];
}
