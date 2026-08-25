/* KAEL — header/footer/cookie-banner compartidos entre páginas.
   Se inyectan en tiempo de carga para evitar duplicar el marcado en cada HTML.
   `prefix` es '' para páginas en la raíz y '../' para páginas en subcarpetas
   (por ejemplo legal/), de modo que todos los enlaces e imágenes apunten al
   sitio correctamente sin depender de reescrituras posteriores del DOM. */

function renderHeader(el, active, prefix) {
  if (!el) return;
  prefix = prefix || '';
  var lang = getLang();
  var link = function (href, label, key) {
    var cls = 'nav-link' + (active === key ? ' active' : '');
    return '<a class="' + cls + '" href="' + prefix + href + '">' + label + '</a>';
  };
  el.innerHTML =
    '<div class="container">' +
      '<a class="brand" href="' + prefix + 'index.html">' +
        '<img src="' + prefix + 'img/logo.png" alt="KAEL">' +
        '<span class="brand-tag"><span>' + Object.keys(MARKETS).length + t('header.destinosSuffix') + '</span></span>' +
      '</a>' +
      '<button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="main-nav">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg> ' + t('nav.menu') +
      '</button>' +
      '<nav class="main-nav" id="main-nav" data-main-nav>' +
        link('barcos.html', t('nav.barcos'), 'barcos') +
        link('index.html#como-funciona', t('nav.comoFunciona'), 'como-funciona') +
        link('empresas.html', t('nav.empresas'), 'empresas') +
        link('asistente.html', t('nav.asistente'), 'asistente') +
        '<span class="lang-switch" data-lang-switch>' +
          '<span class="' + (lang === 'es' ? 'active' : '') + '" data-lang-opt="es">ES</span>' +
          '<span class="' + (lang === 'en' ? 'active' : '') + '" data-lang-opt="en">EN</span>' +
        '</span>' +
        '<a class="btn btn-primary" href="' + prefix + 'barcos.html">' + t('nav.solicitarBarco') + '</a>' +
      '</nav>' +
    '</div>';

  el.querySelectorAll('[data-lang-opt]').forEach(function (opt) {
    opt.addEventListener('click', function () {
      var chosen = opt.getAttribute('data-lang-opt');
      if (chosen !== getLang()) setLang(chosen);
    });
  });
}

function renderFooter(el, prefix) {
  if (!el) return;
  prefix = prefix || '';
  el.innerHTML =
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<div class="footer-brand"><img src="' + prefix + 'img/logo.png" alt="KAEL"><span style="font-weight:600;letter-spacing:.06em;font-size:14px;">KAEL</span></div>' +
          '<p class="footer-note">' + t('footer.note') + '</p>' +
        '</div>' +
        '<div class="footer-col">' +
          '<div class="ftitle">' + t('footer.destinosTitle') + '</div>' +
          Object.values(MARKETS).map(function (m) { return '<a href="' + prefix + 'barcos.html?market=' + m.id + '">' + marketName(m.id) + '</a>'; }).join('') +
        '</div>' +
        '<div class="footer-col">' +
          '<div class="ftitle">' + t('footer.empresasTitle') + '</div>' +
          '<a href="' + prefix + 'empresas.html">' + t('footer.publicarFlota') + '</a>' +
          '<a href="' + prefix + 'legal/condiciones-intermediacion.html">' + t('footer.procesoVerificacion') + '</a>' +
          '<a href="' + prefix + 'admin.html">' + t('footer.accesoPanel') + '</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<div class="ftitle">' + t('footer.legalTitle') + '</div>' +
          '<a href="' + prefix + 'legal/aviso-legal.html">' + t('legalNav.aviso') + '</a>' +
          '<a href="' + prefix + 'legal/privacidad.html">' + t('legalNav.privacidad') + '</a>' +
          '<a href="' + prefix + 'legal/cookies.html">' + t('legalNav.cookies') + '</a>' +
          '<a href="' + prefix + 'legal/condiciones-intermediacion.html">' + t('legalNav.condiciones') + '</a>' +
          '<a href="' + prefix + 'legal/reclamaciones.html">' + t('legalNav.reclamaciones') + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-legal-bar">' +
        '<span>© <span data-year></span> ' + t('footer.rightsReserved') + '</span>' +
        '<span>' + t('footer.disclaimer') + '</span>' +
      '</div>' +
    '</div>';
}

function renderCookieBanner(el, prefix) {
  if (!el) return;
  prefix = prefix || '';
  el.innerHTML =
    '<p>' + t('cookie.pre') + '<a href="' + prefix + 'legal/cookies.html" style="color:#8FB39E;">' + t('cookie.linkLabel') + '</a>' + t('cookie.post') + '</p>' +
    '<div class="cookie-actions">' +
      '<button class="btn btn-primary" data-cookie-accept>' + t('cookie.accept') + '</button>' +
      '<button class="btn btn-outline" data-cookie-reject>' + t('cookie.reject') + '</button>' +
    '</div>';
}
