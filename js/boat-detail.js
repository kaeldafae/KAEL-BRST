/* KAEL AUT — ficha de embarcación */
(function () {
  var qs = new URLSearchParams(window.location.search);
  var boat = boatById(qs.get('id')) || BOATS[0];

  if (!boat) {
    document.title = 'KAEL AUT';
    document.getElementById('boatContent').innerHTML =
      '<div class="empty-state card" style="grid-column:1/-1;">' +
        '<p style="margin:0 0 6px; font-size:16px; font-weight:500;">' + t('boat.emptyTitle') + '</p>' +
        '<p style="margin:0 0 16px; color:var(--ink-soft);">' + t('boat.emptyDesc').replace('{link}', '<a href="barcos.html">' + t('boat.volverAlListado') + '</a>') + '</p>' +
      '</div>';
    return;
  }

  var company = companyOf(boat);
  document.getElementById('boatContent').setAttribute('data-tier', company.tier || 'standard');

  document.title = boat.name + ' — ' + typeName(boat.type) + ' — KAEL AUT';
  var pageDesc = boat.name + ': ' + boat.pax + ' ' + t('common.personas') + ', ' + boat.length + ', ' + t('boat.gestionadoPor').toLowerCase() + ' ' + company.name + '. ' + t('common.precioOrientativo') + ' ' + t('common.desde') + ' ' + euro(boat.price) + '.';
  var descEl = document.getElementById('pageDesc');
  if (descEl) descEl.setAttribute('content', pageDesc);
  var ogTitleEl = document.getElementById('pageOgTitle');
  if (ogTitleEl) ogTitleEl.setAttribute('content', boat.name + ' — ' + typeName(boat.type) + ' — KAEL AUT');
  var ogDescEl = document.getElementById('pageOgDesc');
  if (ogDescEl) ogDescEl.setAttribute('content', pageDesc);
  var ogImageEl = document.getElementById('pageOgImage');
  if (ogImageEl && boat.images && boat.images[0]) ogImageEl.setAttribute('content', boat.images[0]);

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
          '<div><img loading="lazy" src="' + boat.images[1] + '" alt=""></div>' +
          '<div><img loading="lazy" src="' + boat.images[2] + '" alt=""></div>' +
        '</div>' +
      '</div>' +
      '<div class="eyebrow">' + typeName(boat.type) + ' · ' + boat.port + '</div>' +
      '<h1 style="font-size:38px; font-weight:500; letter-spacing:-0.02em; margin:6px 0 0;">' + boat.name + '</h1>' +
      '<p class="lede" style="margin-top:16px; max-width:62ch;">' + boat.description + '</p>' +

      '<h3 style="font-size:22px; font-weight:500; margin:40px 0 16px;">' + t('boat.caracteristicas') + '</h3>' +
      '<div class="specs-table">' + specs + '</div>' +

      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:40px;">' +
        '<div><h3 style="font-size:22px; font-weight:500; margin:0 0 14px;">' + t('boat.incluido') + '</h3>' + included + '</div>' +
        '<div><h3 style="font-size:22px; font-weight:500; margin:0 0 14px;">' + t('boat.noIncluido') + '</h3>' + excluded + '</div>' +
      '</div>' +

      '<div class="managed-by">' +
        '<div class="eyebrow" style="margin-bottom:12px;">' + t('boat.gestionadoPor') + '</div>' +
        '<div class="top">' +
          '<div><div class="cname">' + company.name + '</div><div class="cnote">' + t('boat.tiempoRespuestaPrefix') + company.sla + '</div></div>' +
          '<a class="btn btn-ghost" href="empresa.html?id=' + company.id + '">' + t('common.verEmpresa') + '</a>' +
        '</div>' +
        '<p class="legal">' + t('boat.legalParagraphPrefix') + company.name + t('boat.legalParagraphSuffix') + '</p>' +
      '</div>' +

      '<div class="managed-by" style="margin-bottom:64px;">' +
        '<h3 style="font-size:22px; font-weight:500; margin:0 0 12px;">' + t('boat.condicionesCancelacion') + '</h3>' +
        '<p class="legal" style="margin-top:0;">' + t('boat.cancelacionPrefix') + company.name + t('boat.cancelacionSuffix') + '</p>' +
      '</div>' +
    '</div>' +

    '<aside class="booking-card">' +
      '<div class="eyebrow">' + t('common.precioOrientativo') + '</div>' +
      '<div class="price-lg tabular">' + t('common.desde') + ' ' + euro(boat.price) + '</div>' +
      '<p style="font-size:13px; line-height:1.45; color:var(--muted); margin-top:8px;">' + t('boat.precioNota') + '</p>' +
      '<div class="hr"></div>' +
      '<div style="display:grid; gap:14px;">' +
        '<label class="field"><span class="flabel">' + t('boat.labelFecha') + '</span><input type="date" id="dFecha" value="2026-08-20"></label>' +
        '<div class="field-row">' +
          '<label class="field"><span class="flabel">' + t('boat.labelPersonas') + '</span><input type="number" id="dPersonas" min="1" value="8"></label>' +
          '<label class="field"><span class="flabel">' + t('boat.labelDuracion') + '</span><select id="dDuracion"><option>' + t('solicitud.diaCompleto') + '</option><option>' + t('solicitud.medioManana') + '</option><option>' + t('solicitud.medioTarde') + '</option></select></label>' +
        '</div>' +
      '</div>' +
      '<a class="btn btn-primary btn-block" id="dGoSolicitud" style="margin-top:20px;" href="solicitud.html?id=' + boat.id + '">' + t('common.solicitarReserva') + '</a>' +
      '<p style="font-size:13px; color:var(--ink-soft); text-align:center; margin-top:12px;">' + t('boat.consultamosNota') + '</p>' +
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
