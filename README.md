# KAEL BRST — plataforma de intermediación de alquiler de barcos (Ibiza y Formentera)

Sitio funcional listo para desplegar: catálogo de embarcaciones, ficha de cada barco,
formulario de solicitud (individual y a varias empresas a la vez), asistente de
selección, páginas de empresas náuticas, legales, y un backend mínimo que guarda
las solicitudes y las notifica por email.

**Importante — modelo de negocio:** esta web es un *intermediario*. Nunca cobra el
alquiler ni gestiona pagos de clientes; solo genera y transmite solicitudes a las
empresas náuticas, que confirman y cobran directamente. Eso es intencional (ver
`legal/condiciones-intermediacion.html`) y reduce muchísimo la complejidad legal y
técnica para lanzar ya.

## Qué se ha corregido/reconstruido respecto a la versión anterior

- El archivo `KAEL BRST.dc.html` original dependía de un runtime propietario de
  editor (`support.js`, etiquetas `x-dc`/`sc-if`/`sc-for`) que **no funciona como
  página web normal** una vez publicada — de ahí los errores. Se ha reescrito todo
  como HTML/CSS/JS estándar, sin dependencias externas de frameworks, para que
  funcione en cualquier hosting.
- Las "imágenes 3D" del hero eran un canvas WebGL abstracto. Se han sustituido por
  las **fotografías reales** de barcos que ya tenías subidas (no animadas, resolución
  nativa cuidada para que no se vean pixeladas), tal y como pediste si el 3D
  fotorrealista no es viable.
- El formulario de solicitud ahora **funciona de verdad**: valida datos, genera una
  referencia única, y si el backend está desplegado, envía email a la empresa y al
  cliente. Si el backend no está desplegado todavía, el sitio sigue siendo usable en
  "modo demo" (guarda la solicitud en el navegador) para que puedas probarlo ya.

## Estructura

```
index.html, barcos.html, barco.html, solicitud.html, solicitud-multiple.html,
confirmacion.html, asistente.html, empresas.html, empresa.html, admin.html
css/styles.css        — sistema de diseño
js/data.js             — datos de barcos y empresas (edítalo con tu flota real)
js/*.js                 — lógica de cada página (sin frameworks)
img/boats/               — fotografías reales
legal/                    — aviso legal, privacidad, cookies, condiciones, reclamaciones
server/                    — backend Node/Express opcional pero recomendado
```

## Poner en marcha en local

Puedes abrir `index.html` directamente en el navegador para ver el diseño, pero
para que el formulario envíe emails de verdad necesitas el backend:

```bash
cd server
cp .env.example .env
# Edita .env: SMTP, ADMIN_USER/ADMIN_PASS y el email de cada empresa náutica
npm install
npm start
```

Esto sirve la web completa **y** la API en `http://localhost:3000`. El formulario
detecta automáticamente `/api/solicitudes` en el mismo dominio.

## Antes de vender: checklist

1. **Datos reales de tu empresa** en `legal/aviso-legal.html` y `legal/privacidad.html`
   (busca las marcas `[COMPLETAR]`) — razón social, NIF, dirección, email, teléfono.
2. **Tu flota real** en `js/data.js`: sustituye barcos, empresas, precios y fotos por
   los tuyos (o de tus empresas colaboradoras verificadas).
3. **Revisión legal**: haz revisar el aviso legal, la política de privacidad, cookies
   y las condiciones de intermediación con un abogado en Baleares antes de publicar
   (ver la nota al final de cada documento legal).
4. **Contrato de colaboración** firmado con cada empresa náutica antes de publicar
   sus embarcaciones (identidad, CIF, seguros, comisión, cuándo nace la comisión).
5. **Dominio y hosting**: ver siguiente sección.
6. **Email**: configura un proveedor SMTP real (Gmail con contraseña de aplicación,
   o mejor un transaccional como Brevo/Resend/SendGrid — todos tienen plan gratuito).

## Desplegar en producción

### Opción sencilla — todo en un mismo servicio (recomendado para empezar)

El backend (`server/server.js`) ya sirve la web estática, así que un único
servicio Node.js sirve todo el sitio + el formulario funcional.

1. Crea una cuenta en [Render](https://render.com) o [Railway](https://railway.app).
2. Nuevo "Web Service" apuntando a este repositorio, con:
   - Build command: `cd server && npm install`
   - Start command: `cd server && npm start`
   - Variables de entorno: las mismas que `server/.env.example`.
3. Cuando tengas la URL (p. ej. `https://kael-brst.onrender.com`), apunta tu dominio
   propio (`kaelbrst.com`) a ese servicio desde tu registrador de dominios (CNAME).

### Opción alternativa — frontend y backend en sitios distintos

Si prefieres alojar el HTML/CSS/JS en Netlify/Vercel/GitHub Pages (gratis y muy
rápido) y el backend en Render/Railway por separado:

1. Despliega `server/` en Render/Railway como arriba.
2. Despliega el resto de la carpeta (todo salvo `server/`) en Netlify/Vercel.
3. Antes de `</body>` en cada página, añade:
   ```html
   <script>window.KAEL_API_BASE = 'https://tu-backend.onrender.com/api';</script>
   ```
   (o edita `js/forms.js` y `admin.html`, cambiando `API_BASE`/`base` por la URL fija).
4. En `server/.env`, pon `ALLOWED_ORIGIN=https://tu-dominio-frontend.com`.

## Panel interno (backoffice)

`admin.html` (protegido con usuario/contraseña — `ADMIN_USER`/`ADMIN_PASS` en
`server/.env`) muestra todas las solicitudes recibidas, su estado y el importe
final cuando lo registres. Es intencionalmente sencillo (MVP): para cambiar el
estado de una solicitud usa por ahora la API directamente:

```bash
curl -X PATCH https://tu-dominio/api/admin/solicitudes/IBZ-2026-123456 \
  -u admin:tu-contrasena \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmada","importeFinal":"1450 €"}'
```

## Próximos pasos sugeridos (fase 2, según el documento base del proyecto)

- Panel propio para que cada empresa náutica gestione sus solicitudes sin depender
  solo del email.
- Migrar `leads.json` a una base de datos real (PostgreSQL) cuando crezca el volumen.
- Pasarela de pago solo si decides cobrar una señal directamente (no es necesario
  para lanzar: el modelo actual de comisión sobre reservas confirmadas es más simple).
