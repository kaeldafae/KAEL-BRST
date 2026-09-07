# PRD — KAEL (plataforma de intermediación de alquiler de barcos)

## Problem statement original
Continuar la app KAEL: diseño pobre → rediseño premium. Theming VIP (azul medianoche + dorado) según tier de empresa para distinguir barcos promocionados. Pantalla de carga cinematográfica: velero dorado flota mientras carga (lento) y acelera/desaparece al terminar (rápido). Mantener y mejorar "la rueda" (carrusel 3D de la home). Selector de empresa en la rueda como lista desplegable (no todas las pestañas).

## Personas
- Visitante que quiere alquilar un barco y comparar empresas verificadas.
- Empresas náuticas (standard/premium) que quieren promocionar su flota.

## Arquitectura
- Frontend: React 19 + Tailwind + framer-motion + lenis (SPA, rutas /, /barcos, /barco/:id). Datos de catálogo en src/data/catalog.js (DEMO).
- Backend: FastAPI + MongoDB. POST /api/solicitudes (crea solicitud con referencia KAEL-XXXXXX), GET /api/solicitudes.
- Assets: imágenes locales en frontend/public/img/boats.

## Implementado (2026-09-07)
- Rebuild completo con dirección editorial (Fraunces + Hanken Grotesk + JetBrains Mono, crema/tinta/azul marca).
- Loading intro: velero dorado SVG flotando en azul medianoche, olas animadas, fase lenta mientras carga y salida rápida al completar; una vez por sesión; respeta prefers-reduced-motion.
- Hero cinético con revelado de líneas enmascaradas, carrusel fotográfico con crossfade y parallax al scroll.
- Marquee editorial lento.
- "La rueda" 3D mejorada: anillo CSS 3D con arrastre/flechas/auto-giro, panel lateral, y aura VIP (fondo midnight + partículas doradas + brillo) cuando el barco frontal es de empresa premium. Selector de empresa como lista desplegable con chip VIP.
- Sistema VIP por tier de empresa: tarjetas midnight+dorado con borde shimmer, badge corona "VIP Partner", pill de precio dorada; ficha de barco cambia toda la página a midnight cuando es VIP; toggle "Solo empresas VIP" en catálogo.
- Catálogo con filtros (destino, tipo, patrón, VIP) y query params desde el buscador de la home.
- Ficha de barco: galería, specs, incluido/no incluido, precio, formulario de solicitud → POST /api/solicitudes con toast de confirmación con referencia.

## Implementado (2026-09-07, fase 2)
- Chat IA (GPT 5.4 Mini, Emergent LLM key): widget flotante abajo-derecha con streaming SSE; responde con el catálogo real; detecta quejas y genera notas internas con importancia (alta/media/baja) y empresa en Mongo (`notas_internas`); GET /api/notas-internas. Historial en `chat_messages`.
- Selector de empresa de la rueda: lista desplegable personalizada con miniatura, nombre, nº de embarcaciones y corona VIP (estilo captura del usuario).
- Logos de empresa: hueco preparado (campo `logo` en datos); mientras no haya logos reales, monograma con iniciales (dorado VIP / azul estándar) en tarjetas, rueda y ficha.
- "Cómo funciona" rediseñado: timeline con iconos en círculos y línea discontinua (sin 01-04).
- Pantalla de carga: panel centrado (no pantalla completa) con colores del logo (azul KAEL/crema); versión VIP medianoche+dorado al aterrizar en ficha de barco premium. Mini-cargador con velero rápido al cambiar de página (dorado si el destino es VIP).

## Implementado (2026-09-07, fase 3)
- Página /rutas: mapa interactivo (react-leaflet + OpenStreetMap + capa náutica OpenSeaMap, sin API keys) con los 13 destinos marcados (punto dorado si el destino tiene empresa premium). Selector de destino con flyTo animado; rutas sugeridas por destino con paradas numeradas, duración, distancia, barco recomendado y enlace a las embarcaciones del destino. Theming VIP en paneles y ruta cuando el destino es premium. Inspirado en Click&Boat (experiencias con itinerario) y SamBoat (búsqueda por mapa).

## Implementado (2026-09-07, fase 4)
- Rutas en base de datos: colección `rutas` en Mongo con seed inicial (14 rutas base), GET /api/rutas y POST /api/rutas. La página /rutas lee de la API (fallback local). Formulario "Añadir ruta real de una empresa" en /rutas: nombre, duración, distancia, barco recomendado, descripción y paradas en formato "lat, lng, nombre" por línea; se dibuja en el mapa al guardar.

## Implementado (2026-09-07, fase 5)
- Disponibilidad por reservas: solicitud con estado "confirmada" bloquea ese día para ese barco (GET /api/disponibilidad, /api/fechas-ocupadas). El formulario de la ficha muestra disponible/no disponible al elegir fecha, lista los días ocupados y bloquea el envío si está ocupada. Cancelar/rechazar libera el día. PATCH /api/solicitudes/{id}/estado.
- Panel interno /admin: lista de solicitudes con cambio de estado (pendiente/contactada/confirmada/rechazada/cancelada) y pestaña de quejas IA con importancia.
- Rutas con empresa: el alta de rutas permite elegir la empresa del destino; la tarjeta de ruta muestra logo/monograma y "Opera: …".

## Implementado (2026-09-07, fase 6)
- Calendario de ocupación (MiniCalendar) en la ficha de cada barco y en el portal: días confirmados en rojo, selección de fecha tocando el calendario, leyenda.
- Portal privado de empresa (producto de pago): ruta oculta /portal/<token> sin enlace desde la web, sin header/footer (parece app externa). Token aleatorio de 256 bits, SHA-256 en Mongo, Bearer en cada llamada, revocable al regenerar. Bandeja de reservas estilo email + detalle con acciones (confirmar/contactada/cancelar) que bloquean/liberan el día en la web. Admin (/admin) genera y copia enlaces por empresa.

## Implementado (2026-09-07, fase 7)
- Login del panel /admin: JWT (12 h) + bcrypt, usuario admin sembrado desde .env, bloqueo 15 min tras 5 fallos. Endpoints de gestión protegidos (solicitudes, notas, portal-tokens, config de empresa).
- Modelo de comisiones B2B: comisión pactada por empresa (por defecto 15 %, editable 10–20 %) en `empresa_config`. Al confirmar una reserva (portal o admin) se introduce el importe total y se calcula la comisión KAEL; cancelar/rechazar la anula. Portal muestra comisión acordada, confirmadas y acumulada. La señal y el pago los cobra la empresa al cliente (KAEL no toca dinero del cliente).
- Portal multi-barco: pestañas por embarcación con calendario de ocupación propio. Badge de suscripción del portal (activo €/mes / inactivo) editable en /admin por empresa.
- Página /legal con el modelo de intermediación (comisión mercantil, IVA 21 % ES / inversión UE / no sujeto extra-UE, RGPD, cancelaciones). Nota de señal en el formulario de solicitud.

## Implementado (2026-09-07, fase 8)
- Factura mensual PDF por empresa (GET /api/empresas/{cid}/factura?mes=AAAA-MM, solo admin): líneas por reserva confirmada (ref, fecha, barco, importe, comisión), base imponible, IVA según fiscalidad (21 % ES, inversión sujeto pasivo UE, no sujeta extra-UE) y total. Descarga desde /admin con selector de mes.
- Contrato digital: banner en el portal de empresa con las condiciones de comisión; la empresa marca el checkbox y firma con registro de fecha/hora/IP/versión/% pactado (empresa_config). Estado visible en /admin.
- Señal pagada: la empresa marca la señal cobrada (con importe opcional) desde su portal; badge en bandeja y detalle; en /admin se distingue "señal pagada" de "señal cobrada sin confirmar" (aviso ámbar).

## Backlog priorizado
- P0: Panel admin de solicitudes (estado, importe) — existe GET /api/solicitudes, falta UI.
- P1: Página de empresas y asistente de selección (existían en la web original).
- P1: Notificación por email a empresa/cliente al crear solicitud (Resend).
- P2: Multi-idioma ES/EN, páginas legales, cookie banner.
- P2: Sustituir catálogo DEMO por empresas reales verificadas.

## Credenciales
Sin auth. Ver /app/memory/test_credentials.md.
