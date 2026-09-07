# KAEL — plataforma de intermediación de alquiler de barcos (varios destinos)

Plataforma completa: catálogo con carrusel 3D "elige tu barco", tema visual VIP
(azul medianoche + dorado) para empresas premium, mapa de rutas náuticas,
calendario de disponibilidad, asistente de chat con IA, panel interno con
login, portal privado por empresa (reservas, señal, firma de contrato digital)
y facturación mensual de comisiones en PDF.

**Importante — modelo de negocio:** KAEL es un *intermediario*. Nunca cobra el
alquiler ni gestiona pagos de clientes: el cliente paga la señal y el resto
directamente a la empresa náutica, y KAEL factura su comisión pactada a cada
empresa por cada reserva confirmada (comisión mercantil B2B). Esto está descrito
en la página `/legal` de la propia app — revísalo con un abogado y un gestor
antes de operar con empresas reales.

## Stack

- **Frontend**: React 19 + React Router + Tailwind CSS + shadcn/ui (Radix) +
  framer-motion + Lenis (scroll suave) + react-leaflet (mapa de rutas) + axios.
  Tipografías Fraunces (display), Hanken Grotesk (texto) y JetBrains Mono (cifras).
- **Backend**: FastAPI (Python) + Motor/PyMongo (MongoDB async) + PyJWT + bcrypt
  (auth del panel y de los portales de empresa) + reportlab (facturas PDF) +
  SDK oficial de OpenAI (chat del asistente).
- **Base de datos**: MongoDB. Colecciones: `solicitudes`, `notas_internas`,
  `chat_messages`, `rutas`, `portales` (tokens hasheados), `empresa_config`,
  `users`, `login_attempts`.

## Estructura

```
frontend/            — SPA React (create-react-app + craco)
  src/pages/          — Home, Catalog, BoatDetail, Routes, AdminPanel, Portal, Legal
  src/components/     — LoadingIntro, BoatWheel3D, ChatWidget, MiniCalendar,
                        RequestForm, CompanyLogo, Header, Footer, Reveal...
  src/data/           — catalog.js (empresas/barcos DEMO) y routes.js (rutas de respaldo)
  public/img/          — fotografías de las embarcaciones de ejemplo
backend/
  server.py            — toda la API (prefijo /api)
  seed_routes.json      — rutas náuticas base que se cargan en el primer arranque
memory/PRD.md            — documento de producto original
scripts/generar_informe.py — genera un PDF con el estado del proyecto
design_guidelines.json      — paleta, tipografía y tokens de diseño
docs/empresas-prospectos-ibiza.md — investigación de empresas reales para outreach
```

El catálogo (`frontend/src/data/catalog.js`) es de **EJEMPLO** — ninguna
empresa ni barco es real todavía. Las rutas en `backend/seed_routes.json` son
sugerencias editoriales hasta que las empresas confirmen las suyas.

## Poner en marcha en local

Necesitas Node.js 18+, Python 3.11+ y una instancia de MongoDB (local o
[Atlas](https://www.mongodb.com/atlas), capa gratuita de sobra para empezar).

```bash
# Backend
cd backend
cp .env.example .env      # rellena MONGO_URL, JWT_SECRET, ADMIN_EMAIL/PASSWORD, OPENAI_API_KEY
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Frontend (otra terminal)
cd frontend
cp .env.example .env      # REACT_APP_BACKEND_URL=http://localhost:8000
yarn install
yarn start
```

La web queda en `http://localhost:3000` y la API en `http://localhost:8000/api`.

### Variables de entorno

**`backend/.env`** (nunca lo subas al repo — ya está en `.gitignore`):

| Variable | Para qué |
|---|---|
| `MONGO_URL`, `DB_NAME` | Conexión a MongoDB |
| `CORS_ORIGINS` | Dominios permitidos a llamar a la API |
| `OPENAI_API_KEY` | Clave de OpenAI para el chat del asistente (déjala vacía para desactivarlo sin que falle el resto de la app) |
| `OPENAI_CHAT_MODEL` | Modelo a usar (por defecto `gpt-4o-mini`) |
| `JWT_SECRET` | Firma de los tokens del panel `/admin` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Login del panel interno |

**`frontend/.env`**: `REACT_APP_BACKEND_URL` apuntando a tu backend desplegado.

## ⚠️ Antes de publicar: rota las credenciales de prueba

Este proyecto se generó inicialmente en Emergent (otra plataforma de IA) y su
`.env` de pruebas traía una `EMERGENT_LLM_KEY`, un `JWT_SECRET` y un
`ADMIN_PASSWORD` ya usados en una demo pública. Esos archivos **no se han
subido a este repositorio** (están en `.gitignore`), pero como han pasado por
varias herramientas, genera credenciales nuevas antes de operar en real:

1. Nuevo `JWT_SECRET` (una cadena aleatoria larga, p. ej. `openssl rand -hex 32`).
2. Nuevo `ADMIN_PASSWORD` para el panel `/admin`.
3. Una `OPENAI_API_KEY` propia (el chat usaba la "clave universal" de Emergent,
   que ya no existe en este proyecto — ver siguiente sección).

## El chat con IA ya no depende de Emergent

El asistente de chat (`backend/server.py`, sección "Chat IA") usaba
`emergentintegrations`, un paquete privado de la plataforma Emergent que **no
está disponible fuera de ahí** — por eso `pip install` fallaba al mover el
proyecto. Se ha sustituido por el SDK oficial de `openai`, manteniendo el mismo
comportamiento (streaming, detección de quejas). Solo necesitas tu propia
`OPENAI_API_KEY` en `backend/.env`. Si prefieres otro proveedor (Anthropic,
etc.), el cambio está aislado en las dos funciones que usan `_get_openai_client()`.

También se ha quitado `@emergentbase/visual-edits` del frontend (herramienta de
edición visual solo disponible dentro de Emergent; `craco.config.js` ya la
trataba como opcional).

## Desplegar en producción

Frontend y backend son servicios independientes:

1. **Backend**: [Render](https://render.com) o [Railway](https://railway.app) —
   Build command `pip install -r backend/requirements.txt`, start command
   `uvicorn server:app --host 0.0.0.0 --port $PORT` (ejecutado dentro de `backend/`),
   variables de entorno como en `backend/.env.example`.
2. **Base de datos**: [MongoDB Atlas](https://www.mongodb.com/atlas) (capa
   gratuita) — usa esa URL como `MONGO_URL`.
3. **Frontend**: [Vercel](https://vercel.com) o [Netlify](https://netlify.com) —
   root `frontend/`, build command `yarn build`, publish directory `frontend/build`,
   variable `REACT_APP_BACKEND_URL` apuntando a la URL del backend.
4. Apunta tu dominio propio al servicio del frontend.

## Antes de vender: checklist

1. **Datos reales de tu empresa** en la página `/legal` (razón social, NIF,
   dirección, email, teléfono).
2. **Tu flota real**: sustituye `frontend/src/data/catalog.js` por tus empresas
   colaboradoras verificadas y sus barcos, con precios y fotos propias. Empieza
   contactando a las empresas de `docs/empresas-prospectos-ibiza.md`.
3. **Revisión legal**: haz revisar el aviso legal, la política de privacidad,
   cookies y las condiciones de intermediación/comisión con un abogado y un
   gestor antes de publicar y de firmar contratos con empresas náuticas.
4. **Contrato de comisión** firmado con cada empresa (el portal ya tiene un
   flujo de firma digital con checkbox + timestamp + IP).
5. **Credenciales**: rota `JWT_SECRET`/`ADMIN_PASSWORD` y usa una `OPENAI_API_KEY`
   propia (ver sección de arriba).
6. **Emails automáticos**: la app aún no envía emails al recibir una solicitud
   o factura; es el próximo paso natural (ver `memory/PRD.md`).

## Panel interno y portal de empresa

- `/admin` (usuario/contraseña) — solicitudes, quejas del chat, comisiones por
  empresa, enlaces de portal, facturas PDF mensuales y export CSV de contabilidad.
- `/portal/<token>` — acceso privado por empresa (enlace de un solo uso por
  empresa, generado desde `/admin`): bandeja de reservas, calendario de
  ocupación, marcar señal pagada y firmar el contrato de comisión.

`memory/PRD.md` recoge el documento de producto original con el histórico de
funcionalidades añadidas.
