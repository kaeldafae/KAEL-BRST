/* KAEL BRST — envío de solicitudes de reserva.
   Intenta enviar al backend (server/); si no está desplegado, guarda la solicitud
   localmente (modo demo) para que el flujo siga siendo funcional en pruebas. */

const API_BASE = window.KAEL_API_BASE || '/api';

function localRef() {
  var year = new Date().getFullYear();
  var n = 100000 + Math.floor(Math.random() * 899999);
  return 'IBZ-' + year + '-' + n;
}

function saveLocalLead(payload, ref) {
  try {
    var key = 'kael-brst-leads';
    var list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(Object.assign({ ref: ref, createdAt: new Date().toISOString(), mode: 'local-demo' }, payload));
    localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
  } catch (e) { /* storage unavailable */ }
}

async function submitLead(payload) {
  try {
    var res = await fetch(API_BASE + '/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('bad status ' + res.status);
    var data = await res.json();
    return { ref: data.ref, mode: 'server' };
  } catch (err) {
    var ref = localRef();
    saveLocalLead(payload, ref);
    return { ref: ref, mode: 'local-demo', error: err };
  }
}

function wireSolicitudForm(formEl, opts) {
  if (!formEl) return;
  var statusEl = formEl.querySelector('[data-form-status]');
  var submitBtn = formEl.querySelector('[type="submit"]');

  formEl.addEventListener('submit', async function (e) {
    e.preventDefault();

    var fd = new FormData(formEl);
    if (fd.get('company_website')) return; // honeypot triggered, silently drop

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    var payload = {
      boatIds: opts.boatIds,
      companyIds: opts.companyIds,
      fecha: fd.get('fecha') || '',
      personas: fd.get('personas') || '',
      duracion: fd.get('duracion') || '',
      horario: fd.get('horario') || '',
      nombre: fd.get('nombre') || '',
      email: fd.get('email') || '',
      telefono: fd.get('telefono') || '',
      pais: fd.get('pais') || '',
      comentarios: fd.get('comentarios') || '',
      marketingOptIn: !!fd.get('marketing'),
      privacyAccepted: !!fd.get('privacidad_aceptada'),
      source: 'kael-brst-web'
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }

    var result = await submitLead(payload);

    var params = new URLSearchParams({
      ref: result.ref,
      fecha: payload.fecha,
      personas: payload.personas,
      nombre: payload.nombre,
      boat: (opts.boatIds && opts.boatIds[0]) || '',
      multi: opts.boatIds && opts.boatIds.length > 1 ? '1' : '0',
      mode: result.mode
    });
    window.location.href = 'confirmacion.html?' + params.toString();
  });
}
