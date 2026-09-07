# Genera el informe PDF del proyecto KAEL
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

OUT = '/app/PROYECTO-KAEL-informe.pdf'

INK = colors.HexColor('#1C2D37')
BLUE = colors.HexColor('#366A8B')
MID = colors.HexColor('#0A1128')
GOLD = colors.HexColor('#B8860B')
MUTE = colors.HexColor('#7A8F9E')
CREAM = colors.HexColor('#F7F5F0')

styles = getSampleStyleSheet()
H1 = ParagraphStyle('h1', parent=styles['Title'], fontSize=26, textColor=MID, alignment=0, spaceAfter=4)
H2 = ParagraphStyle('h2', parent=styles['Heading2'], fontSize=14, textColor=BLUE, spaceBefore=10, spaceAfter=4)
H3 = ParagraphStyle('h3', parent=styles['Heading3'], fontSize=11, textColor=INK, spaceBefore=6, spaceAfter=2)
BODY = ParagraphStyle('body', parent=styles['Normal'], fontSize=9.5, leading=14, textColor=INK)
SMALL = ParagraphStyle('small', parent=styles['Normal'], fontSize=8, leading=11, textColor=MUTE)
BULLET = ParagraphStyle('bullet', parent=BODY, leftIndent=10, bulletIndent=2)
MONO = ParagraphStyle('mono', parent=styles['Code'], fontSize=8, leading=11, backColor=CREAM, borderPadding=4)

def bullets(items):
    return [Paragraph(f'• {t}', BULLET) for t in items]

def table(headers, rows, widths):
    t = Table([headers] + rows, colWidths=widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), MID),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#E5C158')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#C8D3E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CREAM]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
    ]))
    return t

hoy = datetime.now(timezone.utc).strftime('%d/%m/%Y')
story = [
    Paragraph('KAEL', H1),
    Paragraph('Informe completo del proyecto — estado, funcionamiento y arquitectura', ParagraphStyle('sub', parent=BODY, fontSize=12, textColor=BLUE)),
    Paragraph(f'Generado el {hoy} · Documento interno del propietario', SMALL),
    Spacer(1, 8 * mm),

    Paragraph('1. Qué es KAEL (contexto y modelo de negocio)', H2),
    Paragraph('KAEL es una plataforma web de intermediación para el alquiler de barcos (lanchas, yates y catamaranes) en 13 destinos: Ibiza y Formentera, Canarias, Cancún, Phuket, Dubái, Bahamas, Maldivas, Bali, Madeira, Croacia, Baréin, Egipto y Polinesia Francesa.', BODY),
    Spacer(1, 2 * mm),
    Paragraph('Modelo de negocio acordado:', H3),
    *bullets([
        '<b>KAEL no cobra al cliente.</b> El cliente envía una solicitud de disponibilidad gratuita; la empresa náutica confirma y cobra directamente (señal habitual del 20-30 % y resto según sus condiciones).',
        '<b>KAEL factura a la empresa</b> una comisión pactada (habitualmente 10-20 %) sobre cada reserva confirmada. Operación B2B: +21 % IVA en España, inversión del sujeto pasivo en la UE, no sujeta fuera de la UE.',
        '<b>Portal privado de empresa (producto de pago mensual)</b>: cada empresa recibe un enlace secreto para gestionar sus reservas, calendarios y señales.',
        'KAEL actúa como mero intermediario (comisión mercantil), sin gestionar fondos de clientes: evita la regulación de entidades de pago.',
    ]),
    Spacer(1, 4 * mm),

    Paragraph('2. Lo conseguido (funcionalidades entregadas)', H2),
    Paragraph('Web pública:', H3),
    *bullets([
        'Pantalla de carga cinematográfica: velero dorado flotando sobre olas (colores de marca azul/crema; versión medianoche+dorado al entrar a un barco VIP). El barco flota lento mientras carga y sale disparado al terminar. Una vez por sesión. Mini-cargador con velero rápido al cambiar de página.',
        'Home editorial: héroe con titular cinético y carrusel fotográfico, marquee, sección "Cómo funciona" con timeline de iconos, buscador con filtros y estadísticas.',
        '"La rueda": carrusel 3D giratorio de barcos con arrastre, flechas y auto-giro. Desplegable de empresas con miniatura, nombre y nº de barcos. Cuando el barco frontal es de empresa premium, el escenario cambia a modo VIP (azul medianoche + dorado, partículas).',
        'Sistema VIP por tier de empresa: tarjetas y fichas en medianoche+dorado con borde shimmer, corona "VIP Partner" y filtro "Solo empresas VIP" en el catálogo.',
        'Mapa interactivo (/rutas): OpenStreetMap + capa náutica OpenSeaMap, 13 destinos con marcador (dorado si hay empresa premium), rutas sugeridas dibujadas con paradas numeradas, duración, distancia y barco recomendado. Alta de rutas reales desde la propia página (se guardan en base de datos).',
        'Ficha de barco: galería, especificaciones, incluido/no incluido, precio, calendario de ocupación (días confirmados en rojo, clic para elegir fecha) y formulario de solicitud con aviso de disponibilidad en tiempo real.',
        'Chat con IA (GPT 5.4 Mini): widget abajo a la derecha, responde con el catálogo real y detecta quejas, generando notas internas con nivel de importancia (alta/media/baja) y empresa afectada.',
        'Disponibilidad real: al confirmarse una reserva, ese día queda bloqueado en la web; al cancelarse o rechazarse, se libera automáticamente.',
        'Página /legal con el modelo de intermediación y comisiones explicado (base para el contrato mercantil).',
    ]),
    Paragraph('Panel interno (/admin, con contraseña):', H3),
    *bullets([
        'Login con JWT (12 h), contraseña cifrada con bcrypt y bloqueo de 15 minutos tras 5 intentos fallidos.',
        'Lista de solicitudes con cambio de estado (pendiente/contactada/confirmada/rechazada/cancelada), importe y comisión por reserva, y aviso de "señal cobrada sin confirmar".',
        'Pestaña de quejas registradas por la IA con su importancia.',
        'Por empresa: % de comisión editable, activación y precio del portal (suscripción mensual), generación del enlace secreto del portal (tokens de 256 bits, guardados como hash, revocables), estado de firma del contrato y comisiones acumuladas.',
        'Factura mensual en PDF por empresa (líneas de reservas, base imponible, IVA según país y total) y exportación CSV mensual de todas las comisiones para el gestor.',
    ]),
    Paragraph('Portal privado de empresa (/portal/&lt;token&gt;, sin enlace público):', H3),
    *bullets([
        'Bandeja de reservas estilo email con detalle del cliente y acciones: confirmar (con importe → calcula la comisión al momento), marcar contactada y cancelar.',
        'Tarjetas con su comisión acordada, reservas confirmadas y comisión acumulada a facturar.',
        'Calendario de ocupación por embarcación con pestañas multi-barco.',
        'Firma digital del contrato de comisión (checkbox + registro de fecha, hora, IP y versión).',
        'Marcado de señal pagada con importe opcional.',
    ]),
    Spacer(1, 4 * mm),

    Paragraph('3. Cómo está ahora mismo (estado actual)', H2),
    *bullets([
        '<b>Funciona y verificado</b>: intro, rueda 3D, VIP, mapa y rutas, chat IA, disponibilidad, panel con login, portal de empresa, comisiones, facturas PDF y CSV.',
        '<b>DEMOSTRACIÓN</b>: todas las empresas y barcos son de ejemplo ("Ejemplo..."), ninguno real. Hay datos de prueba cargados (una reserva confirmada el 10/09/2026 del catamarán de Canarias, con señal y comisión de 142,50 €).',
        '<b>Pendiente</b>: emails automáticos (solicitud → empresa, confirmación → propietario), empresas y logos reales, contratos mercantiles firmados en papel/digital con cada empresa real.',
        'Credenciales: panel /admin → admin@kael.com / Kael#Admin2026 (cambiable en backend/.env). Los enlaces de portal se generan desde /admin.',
    ]),
    Spacer(1, 4 * mm),
    PageBreak(),

    Paragraph('4. Cómo va técnicamente (arquitectura)', H2),
    Paragraph('Stack:', H3),
    *bullets([
        'Frontend: React 19 + Tailwind CSS + framer-motion + lenis (scroll suave) + react-leaflet (mapas) + axios + sonner. Tipografías Fraunces, Hanken Grotesk y JetBrains Mono.',
        'Backend: FastAPI (Python) + Motor (MongoDB async) + reportlab (PDF) + PyJWT + bcrypt + SDK oficial de OpenAI (chat con clave propia).',
        'Base de datos: MongoDB. Colecciones: solicitudes, notas_internas, chat_messages, rutas, portales (tokens hasheados), empresa_config, users, login_attempts.',
    ]),
    Paragraph('Endpoints de la API (prefijo /api):', H3),
    table(
        ['Endpoint', 'Acceso', 'Qué hace'],
        [
            ['POST /solicitudes · GET /disponibilidad · GET /fechas-ocupadas', 'público', 'Solicitar barco y consultar disponibilidad'],
            ['POST /chat', 'público', 'Chat IA con streaming; detecta y guarda quejas'],
            ['GET /rutas · POST /rutas', 'público', 'Rutas náuticas del mapa (alta desde la web)'],
            ['POST /admin/login', 'público', 'Login del panel (JWT 12 h, anti fuerza bruta)'],
            ['GET /solicitudes · GET /notas-internas · PATCH /solicitudes/{id}/estado', 'admin', 'Gestión de solicitudes y quejas'],
            ['GET/POST /portal-tokens · PATCH /empresas/{id}/config', 'admin', 'Enlaces de portal y condiciones (comisión, plan, precio)'],
            ['GET /empresas/{id}/factura?mes=AAAA-MM', 'admin', 'Factura PDF mensual de comisiones'],
            ['GET /contabilidad/comisiones.csv?mes=AAAA-MM', 'admin', 'CSV mensual de comisiones para el gestor'],
            ['GET /portal/me · PATCH /portal/solicitudes/{id}/estado|senal · POST /portal/contrato', 'empresa (token)', 'Portal privado: reservas, confirmación con importe, señal y firma del contrato'],
        ],
        [62 * mm, 28 * mm, 80 * mm],
    ),
    Spacer(1, 4 * mm),
    Paragraph('Estructura del código:', H3),
    Paragraph('backend/server.py (toda la API) · backend/seed_routes.json (rutas base) · frontend/src/pages (Home, Catalog, BoatDetail, Routes, AdminPanel, Portal, Legal) · frontend/src/components (LoadingIntro, BoatWheel3D, ChatWidget, MiniCalendar, RequestForm, CompanyLogo, Header, Footer, MiniLoader, Reveal) · frontend/src/data (catalog.js: empresas/barcos demo · routes.js: coordenadas y rutas de respaldo)', MONO),
    Spacer(1, 4 * mm),
    Paragraph('Cómo ejecutarlo:', H3),
    *bullets([
        'Variables de entorno: frontend/.env (REACT_APP_BACKEND_URL) y backend/.env (MONGO_URL, DB_NAME, CORS_ORIGINS, OPENAI_API_KEY, OPENAI_CHAT_MODEL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD).',
        'En local: pip install -r backend/requirements.txt && uvicorn server:app --port 8001 · cd frontend && yarn install && yarn start. Se necesita MongoDB local.',
    ]),
    Spacer(1, 4 * mm),
    Paragraph('5. Siguientes pasos sugeridos', H2),
    *bullets([
        'Emails automáticos: aviso a la empresa cuando llega una solicitud y aviso al propietario cuando se confirma (integración Resend gestionada).',
        'Enviar la factura PDF por email desde el panel con un botón.',
        'Sustituir el catálogo de ejemplo por empresas y barcos reales verificados, con sus logos.',
        'Panel de empresas real con métricas (respuesta media, ratio de confirmación) y multi-idioma ES/EN.',
    ]),
    Spacer(1, 6 * mm),
    Paragraph('Documento generado automáticamente a partir del estado real del proyecto.', SMALL),
]

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=20 * mm, bottomMargin=18 * mm,
                        title='KAEL — Informe del proyecto', author='KAEL')
doc.build(story)
print('PDF generado:', OUT)
