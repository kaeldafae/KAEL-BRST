/* KAEL BRST — ficha de embarcación */
(function () {
  var qs = new URLSearchParams(window.location.search);
  var boat = boatById(qs.get('id')) || BOATS[0];
  var company = companyOf(boat);

  document.title = boat.name + ' — ' + boat.type + ' en ' + boat.zone + ' — KAEL BRST';
  var descEl = document.getElementById('pageDesc');
  if (descEl) descEl.setAttribute('content', boat.name + ': ' + boat.pax + ' personas, ' + boat.length + ', gestionado por ' + company.name + '. Precio orientativo desde ' + euro(boat.price) + '.');

  var included = boat.included.map(function (i) {
    return '<div class="list-dot"><span class="dot"></span><span>' + i + '</span></div>';
  }).join('');
  var excluded = boat.excluded.map(function (i) {
    return '<div class="list-dot"><span class="dot muted"></span><span style="color:var(--ink-soft);">' + i + '</span></div>';
  }).join('');
  var specs = boatSpecs(boat).map(function (s) {
    return '<div class="specs-row"><div class="k">' + s.k + '</div><div>' + s.v + '</div></div>';
  }).join('');

  document.getElementById('boatContent').innerHTML =
    '<div>' +
      '<div class="gallery">' +
        '<div class="g-main"><img src="' + boat.images[0] + '" alt="' + boat.name + '"></div>' +
        '<div class="g-side">' +
          '<div><img src="' + boat.images[1] + '" alt=""></div>' +
          '<div><img src="' + boat.images[2] + '" alt=""></div>' +
        '</div>' +
      '</div>' +
      '<div class="eyebrow">' + boat.type + ' · ' + boat.port + '</div>' +
      '<h1 style="font-size:38px; font-weight:500; letter-spacing:-0.02em; margin:6px 0 0;">' + boat.name + '</h1>' +
      '<p class="lede" style="margin-top:16px; max-width:62ch;">' + boat.description + '</p>' +

      '<h3 style="font-size:22px; font-weight:500; margin:40px 0 16px;">Características</h3>' +
      '<div class="specs-table">' + specs + '</div>' +

      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:40px;">' +
        '<div><h3 style="font-size:22px; font-weight:500; margin:0 0 14px;">Incluido</h3>' + included + '</div>' +
        '<div><h3 style="font-size:22px; font-weight:500; margin:0 0 14px;">No incluido</h3>' + excluded + '</div>' +
      '</div>' +

      '<div class="managed-by">' +
        '<div class="eyebrow" style="margin-bottom:12px;">Gestionado por</div>' +
        '<div class="top">' +
          '<div><div class="cname">' + company.name + '</div><div class="cnote">Empresa verificada · tiempo medio de respuesta ' + company.sla + '</div></div>' +
          '<a class="btn btn-ghost" href="empresa.html?id=' + company.id + '">Ver empresa</a>' +
        '</div>' +
        '<p class="legal">Esta embarcación es ofrecida por ' + company.name + '. Las solicitudes realizadas desde KAEL BRST se remiten a la empresa para confirmar disponibilidad, horario, precio y condiciones. El contrato de alquiler y el pago del servicio se realizan directamente con la empresa náutica.</p>' +
      '</div>' +

      '<div class="managed-by" style="margin-bottom:64px;">' +
        '<h3 style="font-size:22px; font-weight:500; margin:0 0 12px;">Condiciones de cancelación</h3>' +
        '<p class="legal" style="margin-top:0;">Definidas por ' + company.name + ' y comunicadas antes de formalizar el contrato. Las decisiones sobre navegación y meteorología corresponden a la empresa responsable de la embarcación y al patrón, conforme a la normativa aplicable.</p>' +
      '</div>' +
    '</div>' +

    '<aside class="booking-card">' +
      '<div class="eyebrow">Precio orientativo</div>' +
      '<div class="price-lg tabular">desde ' + euro(boat.price) + '</div>' +
      '<p style="font-size:13px; line-height:1.45; color:var(--muted); margin-top:8px;">Precio final sujeto a disponibilidad, horario, temporada, duración y condiciones de la empresa. Consulta qué incluye el precio.</p>' +
      '<div class="hr"></div>' +
      '<div style="display:grid; gap:14px;">' +
        '<label class="field"><span class="flabel">Fecha</span><input type="date" id="dFecha" value="2026-08-20"></label>' +
        '<div class="field-row">' +
          '<label class="field"><span class="flabel">Personas</span><input type="number" id="dPersonas" min="1" value="8"></label>' +
          '<label class="field"><span class="flabel">Duración</span><select id="dDuracion"><option>Día completo</option><option>Medio día — mañana</option><option>Medio día — tarde</option></select></label>' +
        '</div>' +
      '</div>' +
      '<a class="btn btn-primary btn-block" id="dGoSolicitud" style="margin-top:20px;" href="solicitud.html?id=' + boat.id + '">Solicitar reserva</a>' +
      '<p style="font-size:13px; color:var(--ink-soft); text-align:center; margin-top:12px;">Consultamos disponibilidad. No se realiza ningún pago ahora.</p>' +
    '</aside>';

  var goBtn = document.getElementById('dGoSolicitud');
  var updateLink = function () {
    var p = new URLSearchParams({
      id: boat.id,
      fecha: document.getElementById('dFecha').value,
      personas: document.getElementById('dPersonas').value,
      duracion: document.getElementById('dDuracion').value
    });
    goBtn.href = 'solicitud.html?' + p.toString();
  };
  ['dFecha', 'dPersonas', 'dDuracion'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', updateLink);
  });
  updateLink();
})();
