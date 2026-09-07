from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Autenticación del panel interno (JWT) ----------
import bcrypt
import jwt as _jwt
from datetime import timedelta
from fastapi import Depends, Request, Header, HTTPException, Response

JWT_ALGORITHM = 'HS256'


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_admin_token(user_id: str, email: str) -> str:
    payload = {
        'sub': user_id, 'email': email, 'type': 'access', 'role': 'admin',
        'exp': datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return _jwt.encode(payload, os.environ['JWT_SECRET'], algorithm=JWT_ALGORITHM)


async def _admin_auth(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'No autenticado')
    try:
        payload = _jwt.decode(authorization[7:].strip(), os.environ['JWT_SECRET'], algorithms=[JWT_ALGORITHM])
        if payload.get('type') != 'access' or payload.get('role') != 'admin':
            raise HTTPException(401, 'Token inválido')
        return payload
    except _jwt.ExpiredSignatureError:
        raise HTTPException(401, 'Sesión caducada')
    except _jwt.InvalidTokenError:
        raise HTTPException(401, 'Token inválido')


class AdminLogin(BaseModel):
    email: str
    password: str


@api_router.post("/admin/login")
async def admin_login(input: AdminLogin, request: Request):
    email = input.email.strip().lower()
    key = f'{request.client.host}:{email}'
    att = await db.login_attempts.find_one({'identifier': key})
    now_iso = datetime.now(timezone.utc).isoformat()
    if att and att.get('count', 0) >= 5 and att.get('locked_until', '') > now_iso:
        raise HTTPException(429, 'Demasiados intentos. Prueba de nuevo en 15 minutos.')
    user = await db.users.find_one({'email': email, 'role': 'admin'})
    if not user or not verify_password(input.password, user['password_hash']):
        await db.login_attempts.update_one(
            {'identifier': key},
            {'$inc': {'count': 1}, '$set': {'locked_until': (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(401, 'Credenciales incorrectas')
    await db.login_attempts.delete_one({'identifier': key})
    return {'token': create_admin_token(str(user['_id']), email), 'email': email}


async def seed_admin():
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com').lower()
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    existing = await db.users.find_one({'email': admin_email})
    if existing is None:
        await db.users.insert_one({
            'email': admin_email, 'password_hash': hash_password(admin_password),
            'name': 'Admin', 'role': 'admin', 'created_at': datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing['password_hash']):
        await db.users.update_one({'email': admin_email}, {'$set': {'password_hash': hash_password(admin_password)}})


# ---------- Empresas: catálogo de acceso y comisiones ----------
PORTAL_COMPANIES = {
    'demo-ibiza-charter': {'name': 'Ejemplo Charter Ibiza', 'tier': 'premium', 'boatIds': ['demo-boat-ibiza-yate', 'demo-boat-ibiza-lancha']},
    'demo-canarias-nautica': {'name': 'Ejemplo Náutica Canarias', 'tier': 'standard', 'boatIds': ['demo-boat-canarias-cata']},
    'demo-cancun-boats': {'name': 'Ejemplo Cancún Boats', 'tier': 'standard', 'boatIds': ['demo-boat-cancun-lancha']},
    'demo-phuket-marine': {'name': 'Ejemplo Phuket Marine', 'tier': 'standard', 'boatIds': ['demo-boat-phuket-lancha']},
    'demo-dubai-yachts': {'name': 'Ejemplo Dubai Yachts', 'tier': 'premium', 'boatIds': ['demo-boat-dubai-yate']},
    'demo-bahamas-charter': {'name': 'Ejemplo Bahamas Charter', 'tier': 'standard', 'boatIds': ['demo-boat-bahamas-lancha']},
    'demo-maldivas-yachts': {'name': 'Ejemplo Maldivas Yachts', 'tier': 'premium', 'boatIds': ['demo-boat-maldivas-yate']},
    'demo-bali-nautica': {'name': 'Ejemplo Bali Náutica', 'tier': 'standard', 'boatIds': ['demo-boat-bali-cata']},
    'demo-madeira-boats': {'name': 'Ejemplo Madeira Boats', 'tier': 'standard', 'boatIds': ['demo-boat-madeira-lancha']},
    'demo-croacia-sailing': {'name': 'Ejemplo Croacia Sailing', 'tier': 'standard', 'boatIds': ['demo-boat-croacia-vela']},
    'demo-bahrein-marine': {'name': 'Ejemplo Baréin Marine', 'tier': 'standard', 'boatIds': ['demo-boat-bahrein-lancha']},
    'demo-egipto-redsea': {'name': 'Ejemplo Egipto Red Sea', 'tier': 'standard', 'boatIds': ['demo-boat-egipto-lancha']},
    'demo-polinesia-yachts': {'name': 'Ejemplo Polinesia Yachts', 'tier': 'premium', 'boatIds': ['demo-boat-polinesia-yate']},
}

EMPRESA_DEFAULTS = {'commission_pct': 15.0, 'portal_plan': 'inactivo', 'portal_price': 29.0}


async def _empresa_config(cid: str):
    ov = await db.empresa_config.find_one({'company_id': cid}, {'_id': 0}) or {}
    merged = dict(EMPRESA_DEFAULTS)
    merged.update({k: v for k, v in ov.items() if k != 'company_id' and v is not None})
    return merged


class EmpresaConfig(BaseModel):
    commission_pct: Optional[float] = None
    portal_plan: Optional[str] = None
    portal_price: Optional[float] = None


@api_router.patch("/empresas/{cid}/config", dependencies=[Depends(_admin_auth)])
async def guardar_config(cid: str, input: EmpresaConfig):
    if cid not in PORTAL_COMPANIES:
        raise HTTPException(404, 'Empresa desconocida')
    data = {k: v for k, v in input.model_dump().items() if v is not None}
    if data:
        await db.empresa_config.update_one({'company_id': cid}, {'$set': {**data, 'company_id': cid}}, upsert=True)
    return await _empresa_config(cid)


class Solicitud(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    referencia: str
    boatId: str
    boatName: str
    nombre: str
    email: str
    telefono: str
    fecha: str
    personas: int
    comentarios: Optional[str] = ""
    importe: Optional[float] = None
    comision: Optional[float] = None
    senal_pagada: Optional[bool] = False
    importe_senal: Optional[float] = None
    estado: str = "pendiente"
    creado: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SolicitudCreate(BaseModel):
    boatId: str
    boatName: str
    nombre: str
    email: str
    telefono: str
    fecha: str
    personas: int
    comentarios: Optional[str] = ""


@api_router.get("/")
async def root():
    return {"message": "KAEL API"}


@api_router.post("/solicitudes", response_model=Solicitud)
async def crear_solicitud(input: SolicitudCreate):
    ref = 'KAEL-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    sol = Solicitud(referencia=ref, **input.model_dump())
    await db.solicitudes.insert_one(sol.model_dump())
    return sol


@api_router.get("/solicitudes", response_model=List[Solicitud], dependencies=[Depends(_admin_auth)])
async def listar_solicitudes():
    docs = await db.solicitudes.find({}, {"_id": 0}).sort("creado", -1).to_list(500)
    return docs


# ---------- Chat IA (asistente + gestión de quejas) ----------
import json as _json
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI

OPENAI_CHAT_MODEL = os.environ.get('OPENAI_CHAT_MODEL', 'gpt-4o-mini')
_openai_client = None


def _get_openai_client():
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=os.environ['OPENAI_API_KEY'])
    return _openai_client

CATALOGO_RESUMEN = (
    "Destinos: Ibiza y Formentera, Canarias, Cancún, Phuket, Dubái, Bahamas, Maldivas, Bali, Madeira, Croacia, Baréin, Egipto y Polinesia Francesa. "
    "Empresas colaboradoras (de ejemplo): Ejemplo Charter Ibiza (premium; yate Flybridge 48 desde 1.200 €/día y lancha Speedster 30 desde 450 €), "
    "Ejemplo Dubai Yachts (premium; Majestic 60 desde 2.200 €), Ejemplo Maldivas Yachts (premium; Atoll Explorer 55 desde 1.900 €), "
    "Ejemplo Polinesia Yachts (premium; Lagoon Majesty 58 desde 2.100 €), Ejemplo Náutica Canarias (Catamarán 42, 950 €), "
    "Ejemplo Cancún Boats (Bahía 26, 380 €), Ejemplo Phuket Marine (Islander 34, 520 €), Ejemplo Bahamas Charter (Island Runner 32, 480 €), "
    "Ejemplo Bali Náutica (Benoa 40, 780 €), Ejemplo Madeira Boats (Atlântico 28, 420 €), Ejemplo Croacia Sailing (Dalmacia 38, 690 €), "
    "Ejemplo Baréin Marine (Gulf Cruiser 30, 460 €) y Ejemplo Egipto Red Sea (Red Sea Diver 34, 540 €)."
)

SYSTEM_PROMPT = (
    "Eres el asistente virtual de KAEL, una plataforma de intermediación de alquiler de barcos. "
    "KAEL no cobra nada al usuario: cada solicitud la confirma y la cobra directamente la empresa náutica. "
    "Responde siempre en español, con tono cercano y profesional, en frases cortas. "
    "Si el usuario plantea una queja o reclamación sobre una empresa náutica o el servicio, escúchala, discúlpate por la molestia, "
    "recoge los detalles (empresa, fecha, qué ocurrió) y dile que el equipo de KAEL la revisará y hablará con la empresa si procede. "
    "No inventes precios ni disponibilidad: usa solo el catálogo. Catálogo actual: " + CATALOGO_RESUMEN
)


class ChatRequest(BaseModel):
    session_id: str
    mensaje: str


async def _clasificar_queja(mensaje: str, respuesta: str):
    try:
        completion = await _get_openai_client().chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            messages=[
                {'role': 'system', 'content': (
                    'Analiza si el mensaje del usuario es una queja o reclamación sobre una empresa náutica o el servicio de KAEL. '
                    'Responde SOLO con JSON válido: {"es_queja": true/false, "importancia": "alta"|"media"|"baja", "empresa": string o null, "resumen": string corto}. '
                    'Importancia alta: seguridad, cobros indebidos o cancelaciones sin aviso. Media: mala comunicación o mal estado del barco. Baja: sugerencias o dudas menores.'
                )},
                {'role': 'user', 'content': f'Mensaje del usuario: {mensaje}\nRespuesta del asistente: {respuesta}'},
            ],
        )
        out = completion.choices[0].message.content or ''
        data = _json.loads(out.strip().removeprefix('```json').removeprefix('```').removesuffix('```').strip())
        if data.get('es_queja'):
            return data
    except Exception as e:
        logger.warning('clasificación de queja falló: %s', e)
    return None


@api_router.post("/chat")
async def chat_ia(input: ChatRequest):
    ts = datetime.now(timezone.utc).isoformat()
    await db.chat_messages.insert_one({'session_id': input.session_id, 'role': 'user', 'text': input.mensaje, 'ts': ts})
    history = await db.chat_messages.find({'session_id': input.session_id}, {'_id': 0}).sort('ts', 1).to_list(30)
    prev = history[:-1][-8:]
    contexto = '\n'.join(('Usuario: ' if m['role'] == 'user' else 'Asistente: ') + m['text'] for m in prev)
    texto = input.mensaje if not contexto else f'Historial reciente de la conversación:\n{contexto}\n\nMensaje actual del usuario: {input.mensaje}'

    async def gen():
        full = ''
        try:
            stream = await _get_openai_client().chat.completions.create(
                model=OPENAI_CHAT_MODEL,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': texto},
                ],
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    full += delta
                    yield 'data: ' + _json.dumps({'t': delta}) + '\n\n'
        except Exception as e:
            logger.warning('chat falló: %s', e)
            if not full:
                full = 'Lo siento, ahora mismo no puedo responder. Inténtalo de nuevo en unos segundos.'
                yield 'data: ' + _json.dumps({'t': full}) + '\n\n'
        await db.chat_messages.insert_one({'session_id': input.session_id, 'role': 'assistant', 'text': full, 'ts': datetime.now(timezone.utc).isoformat()})
        nota = await _clasificar_queja(input.mensaje, full)
        if nota:
            doc = {
                'id': str(uuid.uuid4()), 'session_id': input.session_id, 'mensaje': input.mensaje,
                'resumen': nota.get('resumen', ''), 'importancia': nota.get('importancia', 'media'),
                'empresa': nota.get('empresa'), 'estado': 'pendiente',
                'creado': datetime.now(timezone.utc).isoformat(),
            }
            await db.notas_internas.insert_one(doc)
            yield 'data: ' + _json.dumps({'nota': {'resumen': doc['resumen'], 'importancia': doc['importancia']}}) + '\n\n'
        yield 'data: [DONE]\n\n'

    return StreamingResponse(gen(), media_type='text/event-stream', headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})


class NotaInterna(BaseModel):
    id: str
    session_id: str
    mensaje: str
    resumen: str
    importancia: str
    empresa: Optional[str] = None
    estado: str
    creado: str


@api_router.get("/notas-internas", response_model=List[NotaInterna], dependencies=[Depends(_admin_auth)])
async def listar_notas():
    return await db.notas_internas.find({}, {'_id': 0}).sort('creado', -1).to_list(200)


# ---------- Rutas náuticas (editables desde la web) ----------
class RutaCreate(BaseModel):
    marketId: str
    name: str
    duration: str
    distance: str
    boatType: str
    description: str
    waypoints: List[list]
    companyId: Optional[str] = None


@api_router.get("/rutas")
async def listar_rutas():
    return await db.rutas.find({}, {'_id': 0}).to_list(500)


@api_router.post("/rutas")
async def crear_ruta(input: RutaCreate):
    doc = input.model_dump()
    doc['id'] = 'ruta-' + uuid.uuid4().hex[:8]
    await db.rutas.insert_one(doc)
    doc.pop('_id', None)
    return doc


class EstadoUpdate(BaseModel):
    estado: str
    importe: Optional[float] = None


@api_router.patch("/solicitudes/{sid}/estado", response_model=Solicitud, dependencies=[Depends(_admin_auth)])
async def cambiar_estado(sid: str, input: EstadoUpdate):
    update = {'estado': input.estado}
    if input.estado == 'confirmada' and input.importe:
        update['importe'] = input.importe
        sol = await db.solicitudes.find_one({'id': sid}, {'_id': 0, 'boatId': 1})
        cid = next((k for k, v in PORTAL_COMPANIES.items() if sol and sol.get('boatId') in v['boatIds']), None)
        pct = (await _empresa_config(cid))['commission_pct'] if cid else 15.0
        update['comision'] = round(input.importe * pct / 100, 2)
    if input.estado in ('cancelada', 'rechazada'):
        update['comision'] = 0
    await db.solicitudes.update_one({'id': sid}, {'$set': update})
    return await db.solicitudes.find_one({'id': sid}, {'_id': 0})


@api_router.get("/disponibilidad")
async def disponibilidad(boatId: str, fecha: str):
    ocupada = await db.solicitudes.find_one({'boatId': boatId, 'fecha': fecha, 'estado': 'confirmada'}, {'_id': 0})
    return {'disponible': ocupada is None}


@api_router.get("/fechas-ocupadas")
async def fechas_ocupadas(boatId: str):
    docs = await db.solicitudes.find({'boatId': boatId, 'estado': 'confirmada'}, {'_id': 0, 'fecha': 1}).to_list(500)
    return {'fechas': [d['fecha'] for d in docs]}


# ---------- Portal privado de empresa (enlace secreto, sin registro) ----------
import secrets as _secrets
from hashlib import sha256 as _sha256


def _hash_token(t: str) -> str:
    return _sha256(t.encode('utf-8')).hexdigest()


async def _portal_auth(authorization):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Token ausente')
    raw = authorization[7:].strip()
    if len(raw) < 30 or len(raw) > 512:
        raise HTTPException(401, 'Token inválido')
    rec = await db.portales.find_one({'token_hash': _hash_token(raw), 'active': True})
    if not rec:
        raise HTTPException(401, 'Token inválido o revocado')
    await db.portales.update_one({'_id': rec['_id']}, {'$set': {'last_used_at': datetime.now(timezone.utc).isoformat()}})
    return rec['company_id']


@api_router.get("/portal/me")
async def portal_me(authorization: str = Header(None)):
    cid = await _portal_auth(authorization)
    comp = PORTAL_COMPANIES.get(cid)
    if not comp:
        raise HTTPException(404, 'Empresa no encontrada')
    cfg = await _empresa_config(cid)
    sols = await db.solicitudes.find({'boatId': {'$in': comp['boatIds']}}, {'_id': 0}).sort('creado', -1).to_list(500)
    ocupadas = {}
    for s in sols:
        if s['estado'] == 'confirmada':
            ocupadas.setdefault(s['boatId'], []).append(s['fecha'])
    total_comision = sum(s.get('comision') or 0 for s in sols if s['estado'] == 'confirmada')
    return {
        'company': {'id': cid, 'name': comp['name'], 'tier': comp['tier']},
        'boats': comp['boatIds'],
        'config': cfg,
        'totales': {
            'solicitudes': len(sols),
            'confirmadas': sum(1 for s in sols if s['estado'] == 'confirmada'),
            'comision_acumulada': round(total_comision, 2),
        },
        'solicitudes': sols,
        'ocupadas': ocupadas,
    }


@api_router.patch("/portal/solicitudes/{sid}/estado")
async def portal_estado(sid: str, input: EstadoUpdate, authorization: str = Header(None)):
    cid = await _portal_auth(authorization)
    comp = PORTAL_COMPANIES.get(cid)
    sol = await db.solicitudes.find_one({'id': sid}, {'_id': 0})
    if not sol or sol['boatId'] not in comp['boatIds']:
        raise HTTPException(404, 'Solicitud no encontrada')
    update = {'estado': input.estado}
    if input.estado == 'confirmada' and input.importe:
        cfg = await _empresa_config(cid)
        update['importe'] = input.importe
        update['comision'] = round(input.importe * cfg['commission_pct'] / 100, 2)
    if input.estado in ('cancelada', 'rechazada'):
        update['comision'] = 0
    await db.solicitudes.update_one({'id': sid}, {'$set': update})
    return {'ok': True, 'estado': input.estado, 'comision': update.get('comision')}


class SenalUpdate(BaseModel):
    senal_pagada: bool
    importe_senal: Optional[float] = None


@api_router.patch("/portal/solicitudes/{sid}/senal")
async def marcar_senal(sid: str, input: SenalUpdate, authorization: str = Header(None)):
    cid = await _portal_auth(authorization)
    comp = PORTAL_COMPANIES.get(cid)
    sol = await db.solicitudes.find_one({'id': sid}, {'_id': 0})
    if not sol or sol['boatId'] not in comp['boatIds']:
        raise HTTPException(404, 'Solicitud no encontrada')
    await db.solicitudes.update_one({'id': sid}, {'$set': {'senal_pagada': input.senal_pagada, 'importe_senal': input.importe_senal}})
    return {'ok': True, 'senal_pagada': input.senal_pagada}


@api_router.post("/portal/contrato")
async def aceptar_contrato(request: Request, authorization: str = Header(None)):
    cid = await _portal_auth(authorization)
    cfg = await _empresa_config(cid)
    ahora = datetime.now(timezone.utc).isoformat()
    await db.empresa_config.update_one({'company_id': cid}, {'$set': {
        'company_id': cid,
        'contrato_aceptado_at': ahora,
        'contrato_ip': request.client.host if request.client else None,
        'contrato_version': 'v1',
        'contrato_pct': cfg['commission_pct'],
    }}, upsert=True)
    return {'ok': True, 'aceptado_at': ahora, 'version': 'v1', 'commission_pct': cfg['commission_pct']}


@api_router.get("/portal-tokens", dependencies=[Depends(_admin_auth)])
async def listar_tokens():
    docs = await db.portales.find({}, {'_id': 0, 'token_hash': 0}).to_list(100)
    activos = {}
    for d in docs:
        if d.get('active'):
            activos[d['company_id']] = d.get('last_used_at')
    out = []
    for cid, c in PORTAL_COMPANIES.items():
        cfg = await _empresa_config(cid)
        out.append({'company_id': cid, 'name': c['name'], 'tier': c['tier'], 'active': cid in activos, 'last_used_at': activos.get(cid), **cfg})
    return out


@api_router.post("/portal-tokens/{company_id}", dependencies=[Depends(_admin_auth)])
async def crear_token(company_id: str):
    if company_id not in PORTAL_COMPANIES:
        raise HTTPException(404, 'Empresa desconocida')
    raw = _secrets.token_urlsafe(32)
    await db.portales.update_many({'company_id': company_id}, {'$set': {'active': False}})
    await db.portales.insert_one({
        'company_id': company_id, 'token_hash': _hash_token(raw), 'active': True,
        'created_at': datetime.now(timezone.utc).isoformat(), 'last_used_at': None,
    })
    return {'token': raw, 'path': f'/portal/{raw}'}


# ---------- Factura mensual PDF de comisiones ----------
COMPANY_FISCAL = {
    'demo-ibiza-charter': 'ES', 'demo-canarias-nautica': 'ES',
    'demo-madeira-boats': 'UE', 'demo-croacia-sailing': 'UE',
}
FISCAL_NOTA = {
    'ES': 'IVA 21 % — servicio de intermediación prestado en territorio español.',
    'UE': 'Operación B2B intracomunitaria — inversión del sujeto pasivo (IVA 0 %).',
    'EXTRA': 'Exportación de servicios — operación no sujeta a IVA español.',
}


@api_router.get("/empresas/{cid}/factura", dependencies=[Depends(_admin_auth)])
async def factura_mensual(cid: str, mes: str):
    import re as _re
    if cid not in PORTAL_COMPANIES:
        raise HTTPException(404, 'Empresa desconocida')
    if not _re.match(r'^\d{4}-\d{2}$', mes):
        raise HTTPException(400, 'Formato de mes inválido (AAAA-MM)')

    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

    comp = PORTAL_COMPANIES[cid]
    cfg = await _empresa_config(cid)
    sols = await db.solicitudes.find(
        {'estado': 'confirmada', 'boatId': {'$in': comp['boatIds']}, 'fecha': {'$regex': f'^{mes}'}},
        {'_id': 0},
    ).sort('fecha', 1).to_list(500)

    fiscal = COMPANY_FISCAL.get(cid, 'EXTRA')
    iva_pct = 21.0 if fiscal == 'ES' else 0.0
    base = round(sum(s.get('comision') or 0 for s in sols), 2)
    iva = round(base * iva_pct / 100, 2)
    total = round(base + iva, 2)

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=22 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle('h1', parent=styles['Title'], fontSize=20, textColor=colors.HexColor('#0A1128'), alignment=0)
    small = ParagraphStyle('small', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#7A8F9E'))
    normal = styles['Normal']

    story = [
        Paragraph('KAEL', h1),
        Paragraph('Factura de comisiones por intermediación', ParagraphStyle('sub', parent=normal, fontSize=12, textColor=colors.HexColor('#366A8B'))),
        Spacer(1, 8 * mm),
        Paragraph(f'<b>Nº:</b> KAEL-F-{mes}-{cid}<br/><b>Fecha de emisión:</b> {datetime.now(timezone.utc).date().isoformat()}<br/><b>Periodo:</b> {mes}', normal),
        Spacer(1, 4 * mm),
        Paragraph(f'<b>Emisor:</b> KAEL (plataforma de intermediación náutica)<br/><b>Cliente:</b> {comp["name"]} (empresa náutica)<br/><b>Comisión pactada:</b> {cfg["commission_pct"]} % del importe de cada reserva confirmada', normal),
        Spacer(1, 8 * mm),
    ]

    rows = [['Referencia', 'Fecha salida', 'Embarcación', 'Importe reserva', 'Comisión']]
    for s in sols:
        rows.append([s['referencia'], s['fecha'], s['boatName'], f"{s.get('importe') or 0:.2f} €", f"{s.get('comision') or 0:.2f} €"])
    if len(rows) == 1:
        rows.append(['—', '—', 'Sin reservas confirmadas en este periodo', '0.00 €', '0.00 €'])
    rows.append(['', '', '', 'Base imponible', f'{base:.2f} €'])
    rows.append(['', '', '', f'IVA ({iva_pct:.0f} %)', f'{iva:.2f} €'])
    rows.append(['', '', '', 'TOTAL', f'{total:.2f} €'])

    tabla = Table(rows, colWidths=[30 * mm, 28 * mm, 62 * mm, 28 * mm, 24 * mm])
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A1128')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#E5C158')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -4), [colors.white, colors.HexColor('#F7F5F0')]),
        ('FONTNAME', (3, -3), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (3, -1), (-1, -1), colors.HexColor('#D4AF37')),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#C8D3E0')),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
    ]))
    story += [
        tabla,
        Spacer(1, 6 * mm),
        Paragraph(FISCAL_NOTA[fiscal], small),
        Paragraph('KAEL actúa como mero intermediario (comisión mercantil). El alquiler lo formaliza y lo cobra la empresa náutica al cliente final.', small),
    ]
    doc.build(story)
    buf.seek(0)
    return StreamingResponse(buf, media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename="factura-kael-{cid}-{mes}.pdf"'})


# ---------- Exportación contable CSV (gestor) ----------
def _fiscal_de(cid: str) -> str:
    return COMPANY_FISCAL.get(cid, 'EXTRA')


@api_router.get("/contabilidad/comisiones.csv", dependencies=[Depends(_admin_auth)])
async def exportar_comisiones(mes: str):
    import re as _re
    import csv as _csv
    from io import StringIO
    if not _re.match(r'^\d{4}-\d{2}$', mes):
        raise HTTPException(400, 'Formato de mes inválido (AAAA-MM)')

    sols = await db.solicitudes.find({'estado': 'confirmada', 'fecha': {'$regex': f'^{mes}'}}, {'_id': 0}).sort('fecha', 1).to_list(2000)
    boat_company = {b: cid for cid, c in PORTAL_COMPANIES.items() for b in c['boatIds']}

    out = StringIO()
    w = _csv.writer(out, delimiter=';')
    w.writerow(['empresa', 'referencia', 'embarcacion', 'fecha_salida', 'importe_reserva_eur', 'comision_pct', 'comision_eur', 'iva_pct', 'iva_eur', 'total_eur', 'senal_pagada', 'senal_eur'])
    tot_base = 0.0
    tot_iva = 0.0
    for s in sols:
        cid = boat_company.get(s['boatId'], '')
        iva_pct = 21.0 if _fiscal_de(cid) == 'ES' else 0.0
        comision = s.get('comision') or 0
        iva = round(comision * iva_pct / 100, 2)
        tot_base += comision
        tot_iva += iva
        w.writerow([
            PORTAL_COMPANIES.get(cid, {}).get('name', cid), s['referencia'], s['boatName'], s['fecha'],
            f"{s.get('importe') or 0:.2f}", '', f"{comision:.2f}", f"{iva_pct:.0f}", f"{iva:.2f}", f"{comision + iva:.2f}",
            'si' if s.get('senal_pagada') else 'no', f"{s.get('importe_senal') or 0:.2f}",
        ])
    w.writerow([])
    w.writerow(['TOTALES', '', '', '', '', '', f'{tot_base:.2f}', '', f'{tot_iva:.2f}', f'{tot_base + tot_iva:.2f}', '', ''])
    content = '﻿' + out.getvalue()
    return Response(content=content, media_type='text/csv; charset=utf-8', headers={'Content-Disposition': f'attachment; filename="kael-comisiones-{mes}.csv"'})


@app.on_event("startup")
async def seed_rutas():
    seed_path = ROOT_DIR / 'seed_routes.json'
    if await db.rutas.count_documents({}) == 0 and seed_path.exists():
        data = _json.loads(seed_path.read_text())
        await db.rutas.insert_many(data)
        logger.info('Rutas base cargadas: %s', len(data))
    await db.users.create_index('email', unique=True)
    await db.login_attempts.create_index('identifier')
    await seed_admin()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
