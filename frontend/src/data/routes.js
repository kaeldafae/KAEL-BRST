import { BOATS, MARKETS, COMPANIES_LIST, companyOf } from './catalog';

/* Coordenadas de cada destino y rutas náuticas sugeridas.
   Cada ruta tiene waypoints [lat, lng, etiqueta] para dibujarla en el mapa. */
export const MARKET_MAP = {
  ibiza: { center: [38.95, 1.35], zoom: 10 },
  canarias: { center: [28.1, -15.42], zoom: 10 },
  cancun: { center: [21.16, -86.82], zoom: 10 },
  phuket: { center: [7.9, 98.35], zoom: 9 },
  dubai: { center: [25.09, 55.15], zoom: 10 },
  bahamas: { center: [25.04, -77.35], zoom: 9 },
  maldivas: { center: [4.17, 73.51], zoom: 9 },
  bali: { center: [-8.68, 115.22], zoom: 9 },
  madeira: { center: [32.65, -16.95], zoom: 10 },
  croacia: { center: [43.45, 16.4], zoom: 9 },
  bahrein: { center: [26.2, 50.6], zoom: 10 },
  egipto: { center: [27.2, 33.83], zoom: 10 },
  polinesia: { center: [-16.5, -151.74], zoom: 10 },
};

export const ROUTES = [
  {
    id: 'ibiza-formentera', marketId: 'ibiza', name: 'Ibiza → Formentera clásica',
    duration: '8 h', distance: '22 millas', boatType: 'Yate o catamarán',
    description: 'La ruta estrella: salida de Marina Botafoch, baño en las aguas turquesas de Illetes y comida frente a Cala Saona antes de volver al atardecer.',
    waypoints: [[38.913, 1.449, 'Marina Botafoch (salida)'], [38.82, 1.41, 'Canal de Es Freus'], [38.758, 1.425, 'Illetes'], [38.69, 1.38, 'Cala Saona']],
  },
  {
    id: 'ibiza-calas-oeste', marketId: 'ibiza', name: 'Calas del oeste y Es Vedrà',
    duration: '6 h', distance: '18 millas', boatType: 'Lancha',
    description: 'Calas de agua cristalina del oeste ibicenco con el imponente islote de Es Vedrà como broche al atardecer.',
    waypoints: [[38.913, 1.449, 'Marina Botafoch (salida)'], [38.975, 1.245, 'Cala Bassa'], [38.965, 1.225, 'Cala Comte'], [38.872, 1.203, 'Es Vedrà (mirador)']],
  },
  {
    id: 'dubai-skyline', marketId: 'dubai', name: 'Skyline y Palm Jumeirah',
    duration: '4 h', distance: '15 millas', boatType: 'Yate',
    description: 'Dubai Marina, el anillo de Palm Jumeirah con el Atlantis y foto frente al Burj Al Arab. La postal de lujo por excelencia.',
    waypoints: [[25.077, 55.134, 'Dubai Marina (salida)'], [25.113, 55.138, 'Palm Jumeirah · Atlantis'], [25.141, 55.185, 'Burj Al Arab'], [25.22, 55.16, 'World Islands (vista)']],
  },
  {
    id: 'maldivas-atolon', marketId: 'maldivas', name: 'Bancos de arena del atolón norte',
    duration: '7 h', distance: '20 millas', boatType: 'Yate',
    description: 'Navegación entre bancos de arena vírgenes y arrecifes para esnórquel cerca de Himmafushi, con picnic en un banco desierto.',
    waypoints: [[4.175, 73.51, 'Malé (salida)'], [4.22, 73.45, 'Banco de arena'], [4.31, 73.57, 'Himmafushi']],
  },
  {
    id: 'cancun-isla-mujeres', marketId: 'cancun', name: 'Isla Mujeres y Playa Norte',
    duration: '6 h', distance: '14 millas', boatType: 'Lancha',
    description: 'Cruce del Caribe mexicano hasta Isla Mujeres, snorkel en arrecife y baño en la famosa Playa Norte.',
    waypoints: [[21.15, -86.81, 'Puerto Cancún (salida)'], [21.2, -86.77, 'Arrecife Manchones'], [21.26, -86.74, 'Playa Norte']],
  },
  {
    id: 'phuket-phi-phi', marketId: 'phuket', name: 'Phi Phi y bahías escondidas',
    duration: '9 h', distance: '46 millas', boatType: 'Lancha rápida',
    description: 'La gran jornada: Maya Bay al amanecer, lagunas de piedra caliza y snorkel con peces tropicales.',
    waypoints: [[7.82, 98.37, 'Chalong Pier (salida)'], [7.68, 98.77, 'Maya Bay'], [7.74, 98.76, 'Pileh Lagoon']],
  },
  {
    id: 'canarias-sur', marketId: 'canarias', name: 'Costa sur de Gran Canaria',
    duration: '5 h', distance: '16 millas', boatType: 'Catamarán',
    description: 'Salida de Las Palmas hacia el sur soleado, avistamiento de delfines frecuente y baño en playa de Amadores.',
    waypoints: [[28.13, -15.42, 'Las Palmas (salida)'], [27.95, -15.6, 'Avistamiento de delfines'], [27.79, -15.72, 'Playa de Amadores']],
  },
  {
    id: 'bahamas-rose', marketId: 'bahamas', name: 'Rose Island y bancos de Nassau',
    duration: '5 h', distance: '12 millas', boatType: 'Lancha',
    description: 'Aguas poco profundas color menta, iguanas en Rose Island y snorkel en arrecifes someros.',
    waypoints: [[25.078, -77.32, 'Nassau (salida)'], [25.09, -77.22, 'Rose Island'], [25.05, -77.28, 'Arrecife somero']],
  },
  {
    id: 'bali-nusa-penida', marketId: 'bali', name: 'Nusa Penida espectacular',
    duration: '8 h', distance: '25 millas', boatType: 'Lancha',
    description: 'Acantilados de Kelingking, mantas en Manta Bay y aguas turquesas de Crystal Bay.',
    waypoints: [[-8.72, 115.22, 'Benoa (salida)'], [-8.75, 115.48, 'Manta Bay'], [-8.77, 115.45, 'Kelingking'], [-8.71, 115.45, 'Crystal Bay']],
  },
  {
    id: 'madeira-costa', marketId: 'madeira', name: 'Acantilados del sur de Madeira',
    duration: '4 h', distance: '10 millas', boatType: 'Lancha',
    description: 'Cabo Girão, uno de los acantilados más altos de Europa, y calas volcánicas solo accesibles por mar.',
    waypoints: [[32.64, -16.91, 'Funchal (salida)'], [32.65, -16.98, 'Cabo Girão'], [32.67, -17.03, 'Fajã dos Padres']],
  },
  {
    id: 'croacia-hvar', marketId: 'croacia', name: 'Split → Hvar y Pakleni',
    duration: '8 h', distance: '24 millas', boatType: 'Catamarán',
    description: 'La Dálmata clásica: islas Pakleni para el baño y paseo por el puerto veneciano de Hvar.',
    waypoints: [[43.5, 16.43, 'Split (salida)'], [43.16, 16.4, 'Islas Pakleni'], [43.17, 16.44, 'Hvar']],
  },
  {
    id: 'bahrein-bahia', marketId: 'bahrein', name: 'Bahía de Manama al atardecer',
    duration: '3 h', distance: '8 millas', boatType: 'Lancha',
    description: 'Skyline de Manama desde el agua con la luz dorada del golfo Pérsico.',
    waypoints: [[26.24, 50.6, 'Manama (salida)'], [26.28, 50.63, 'Bahía norte'], [26.22, 50.58, 'Reef Island']],
  },
  {
    id: 'egipto-giftun', marketId: 'egipto', name: 'Isla Giftun y arrecifes del Mar Rojo',
    duration: '6 h', distance: '14 millas', boatType: 'Lancha',
    description: 'Esnórquel entre corales y peces payaso en los arrecifes protegidos de Giftun.',
    waypoints: [[27.23, 33.84, 'Hurghada (salida)'], [27.17, 33.95, 'Giftun'], [27.13, 33.9, 'Arrecife sur']],
  },
  {
    id: 'polinesia-laguna', marketId: 'polinesia', name: 'Laguna de Bora Bora completa',
    duration: '7 h', distance: '18 millas', boatType: 'Yate',
    description: 'Vuelta a la laguna más famosa del mundo: rayas, tiburones de punta negra y el monte Otemanu de fondo.',
    waypoints: [[-16.5, -151.74, 'Vaitape (salida)'], [-16.53, -151.7, 'Jardín de coral'], [-16.46, -151.72, 'Banco de rayas']],
  },
];

export const marketCoords = (marketId) => MARKET_MAP[marketId]?.center || [25, 10];
export const marketZoom = (marketId) => MARKET_MAP[marketId]?.zoom || 4;
export const routesByMarket = (marketId) => ROUTES.filter((r) => r.marketId === marketId);
export const boatsByMarket = (marketId) => BOATS.filter((b) => companyOf(b)?.marketId === marketId);
export const isVipMarket = (marketId) => COMPANIES_LIST.some((c) => c.marketId === marketId && c.tier === 'premium');
export const marketNameOf = (marketId) => MARKETS[marketId]?.name || marketId;
