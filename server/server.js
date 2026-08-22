/**
 * KAEL AUT — backend mínimo.
 *
 * Qué hace:
 *  1. Sirve la web estática (todo lo que hay en la raíz del repo).
 *  2. Recibe solicitudes de reserva en POST /api/solicitudes, las guarda en
 *     server/data/leads.json con un identificador único (IBZ-YYYY-XXXXXX) y
 *     un historial de eventos, y envía un email a la empresa náutica y otro
 *     de confirmación al cliente.
 *  3. Expone un backoffice muy simple en GET /api/admin/solicitudes (y en el
 *     navegador vía admin.html) protegido con autenticación básica.
 *
 * Cómo arrancarlo:
 *   cd server
 *   cp .env.example .env   (y rellena tus datos)
 *   npm install
 *   npm start
 *
 * Ver server/README.md para instrucciones de despliegue (Render, Railway, VPS…).
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]', 'utf8');

// ---------------------------------------------------------------------------
// Datos de empresas (deben coincidir con los ids usados en js/data.js).
// Vacío a propósito: no hay empresas colaboradoras confirmadas todavía. Al
// añadir una empresa real en js/data.js (COMPANIES), añade aquí su id con
// el email al que debe notificarse cada solicitud, p. ej.:
//   'nombre-empresa': { name: 'Nombre Empresa S.L.', email: process.env.COMPANY_EMAIL_NOMBRE_EMPRESA }
// ---------------------------------------------------------------------------
const COMPANIES = {};

// ---------------------------------------------------------------------------
// Email (nodemailer). Si no hay SMTP configurado, se registra en consola en
// lugar de fallar, para que el servidor sea usable en local sin credenciales.
// ---------------------------------------------------------------------------
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendMail({ to, subject, text }) {
  if (!to) { console.warn('[mail] destinatario vacío, no se envía:', subject); return; }
  if (!transporter) {
    console.log('--- [modo sin SMTP configurado] Email que se habría enviado ---');
    console.log('Para:', to);
    console.log('Asunto:', subject);
    console.log(text);
    console.log('-----------------------------------------------------------------');
    return;
  }
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM || 'KAEL AUT <no-reply@kaelaut.com>', to, subject, text });
  } catch (err) {
    console.error('[mail] error al enviar a', to, err.message);
  }
}

// ---------------------------------------------------------------------------
// Almacenamiento de leads (JSON de archivo — suficiente para un MVP;
// migrar a una base de datos real antes de escalar a mucho volumen).
// ---------------------------------------------------------------------------
function readLeads() {
  try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (e) { return []; }
}
function writeLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

function generateRef() {
  const year = new Date().getFullYear();
  const n = crypto.randomInt(100000, 999999);
  return `IBZ-${year}-${n}`;
}

// ---------------------------------------------------------------------------
// Rate limiting muy simple en memoria (protección básica anti-spam).
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX = 8;
const hits = new Map();

function rateLimited(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_LIMIT_WINDOW_MS; }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.' });
  }
  next();
}

// ---------------------------------------------------------------------------
// Validación básica del payload de solicitud.
// ---------------------------------------------------------------------------
function validateLeadPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['payload inválido'];
  if (!body.nombre || String(body.nombre).trim().length < 2) errors.push('nombre requerido');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('email inválido');
  if (!body.telefono || String(body.telefono).trim().length < 5) errors.push('teléfono requerido');
  if (!body.fecha) errors.push('fecha requerida');
  if (!body.personas || Number(body.personas) < 1) errors.push('número de personas inválido');
  if (!Array.isArray(body.boatIds) || !body.boatIds.length) errors.push('debe indicarse al menos una embarcación');
  if (!body.privacyAccepted) errors.push('debe aceptarse la política de privacidad');
  if (body.company_website) errors.push('spam detectado'); // honeypot
  return errors;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

app.post('/api/solicitudes', rateLimited, async (req, res) => {
  const errors = validateLeadPayload(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const ref = generateRef();
  const now = new Date().toISOString();
  const companyIds = Array.isArray(req.body.companyIds) && req.body.companyIds.length
    ? req.body.companyIds
    : Array.from(new Set(req.body.boatIds));

  const lead = {
    ref,
    createdAt: now,
    status: 'pendiente_de_empresa',
    boatIds: req.body.boatIds,
    companyIds,
    fecha: req.body.fecha,
    personas: req.body.personas,
    duracion: req.body.duracion || '',
    horario: req.body.horario || '',
    nombre: req.body.nombre,
    email: req.body.email,
    telefono: req.body.telefono,
    pais: req.body.pais || '',
    comentarios: req.body.comentarios || '',
    marketingOptIn: !!req.body.marketingOptIn,
    privacyAccepted: !!req.body.privacyAccepted,
    privacyAcceptedAt: req.body.privacyAccepted ? now : null,
    events: [{ at: now, what: 'solicitud_creada' }]
  };

  const leads = readLeads();
  leads.unshift(lead);
  writeLeads(leads);

  const companyNames = companyIds.map((id) => (COMPANIES[id] ? COMPANIES[id].name : id)).join(', ');

  await Promise.all(
    companyIds.map((id) => {
      const company = COMPANIES[id];
      if (!company) return Promise.resolve();
      return sendMail({
        to: company.email,
        subject: `Nueva solicitud de reserva — KAEL AUT — Ref. ${ref}`,
        text: [
          `Has recibido una nueva solicitud de alquiler generada a través de KAEL AUT.`,
          ``,
          `Referencia: ${ref}`,
          `Embarcación(es): ${req.body.boatIds.join(', ')}`,
          `Fecha solicitada: ${req.body.fecha}`,
          `Personas: ${req.body.personas}`,
          `Duración: ${req.body.duracion || '—'}`,
          `Horario preferido: ${req.body.horario || '—'}`,
          ``,
          `Cliente: ${req.body.nombre}`,
          `Email: ${req.body.email}`,
          `Teléfono: ${req.body.telefono}`,
          `País: ${req.body.pais || '—'}`,
          `Comentarios: ${req.body.comentarios || '—'}`,
          ``,
          `Importante: contacta directamente con el cliente para confirmar disponibilidad, horario, precio y condiciones del alquiler.`,
          `La reserva no se considerará confirmada hasta que vosotros la confirméis directamente con el cliente.`,
          `Referencia de atribución: ${ref}`
        ].join('\n')
      });
    })
  );

  await sendMail({
    to: req.body.email,
    subject: `Hemos recibido tu solicitud — KAEL AUT — Ref. ${ref}`,
    text: [
      `Gracias por solicitar tu barco a través de KAEL AUT.`,
      ``,
      `Hemos enviado tu solicitud a: ${companyNames}`,
      `Referencia: ${ref}`,
      `Fecha: ${req.body.fecha}`,
      `Personas: ${req.body.personas}`,
      ``,
      `La empresa náutica se pondrá en contacto contigo para confirmar disponibilidad, horario, precio y condiciones del alquiler.`,
      `No se ha realizado ningún cobro por parte de KAEL AUT. La contratación y el pago del alquiler se realizarán directamente con la empresa náutica.`
    ].join('\n')
  });

  res.status(201).json({ ref, status: lead.status });
});

// ---------------------------------------------------------------------------
// Backoffice mínimo (autenticación básica)
// ---------------------------------------------------------------------------
function requireAdminAuth(req, res, next) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) return res.status(503).json({ error: 'Panel de administración no configurado (ADMIN_USER/ADMIN_PASS).' });

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.set('WWW-Authenticate', 'Basic realm="KAEL AUT admin"');
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  const [u, p] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
  if (u !== user || p !== pass) {
    res.set('WWW-Authenticate', 'Basic realm="KAEL AUT admin"');
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  next();
}

app.get('/api/admin/solicitudes', requireAdminAuth, (req, res) => {
  res.json(readLeads());
});

app.patch('/api/admin/solicitudes/:ref', requireAdminAuth, (req, res) => {
  const leads = readLeads();
  const lead = leads.find((l) => l.ref === req.params.ref);
  if (!lead) return res.status(404).json({ error: 'No encontrado' });
  const allowed = ['pendiente_de_empresa', 'contactado', 'confirmada', 'rechazada', 'cancelada'];
  if (req.body.status && allowed.includes(req.body.status)) {
    lead.status = req.body.status;
    lead.events.push({ at: new Date().toISOString(), what: 'status_actualizado', status: req.body.status });
  }
  if (req.body.importeFinal) lead.importeFinal = req.body.importeFinal;
  writeLeads(leads);
  res.json(lead);
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

// ---------------------------------------------------------------------------
// Frontend estático
// ---------------------------------------------------------------------------
// Bloquea el acceso público a la carpeta server/ ANTES del middleware estático:
// contiene leads.json (datos personales de clientes — nombre, email, teléfono),
// las credenciales de administrador y el propio código del backend. Sin este
// bloqueo, express.static serviría cualquier archivo del repo, incluido ese.
app.use((req, res, next) => {
  if (/^\/server(\/|$)/i.test(req.path)) return res.status(404).sendFile(path.join(ROOT_DIR, '404.html'));
  next();
});
app.use(express.static(ROOT_DIR, { extensions: ['html'] }));
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(ROOT_DIR, '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KAEL AUT server escuchando en http://localhost:${PORT}`);
  if (!transporter) console.warn('[mail] SMTP no configurado: los emails se mostrarán solo en consola. Configura server/.env');
});
