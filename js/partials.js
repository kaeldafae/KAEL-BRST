/* KAEL AUT — header/footer/cookie-banner compartidos entre páginas.
   Se inyectan en tiempo de carga para evitar duplicar el marcado en cada HTML.
   `prefix` es '' para páginas en la raíz y '../' para páginas en subcarpetas
   (por ejemplo legal/), de modo que todos los enlaces e imágenes apunten al
   sitio correctamente sin depender de reescrituras posteriores del DOM. */

function renderHeader(el, active, prefix) {
  if (!el) return;
  prefix = prefix || '';
  var link = function (href, label, key) {
    var cls = 'nav-link' + (active === key ? ' active' : '');
    return '<a class="' + cls + '" href="' + prefix + href + '">' + label + '</a>';
  };
  el.innerHTML =
    '<div class="container">' +
      '<a class="brand" href="' + prefix + 'index.html">' +
        '<img src="' + prefix + 'img/logo.png" alt="KAEL AUT">' +
        '<span class="brand-tag"><strong>AUT</strong><span>' + Object.keys(MARKETS).length + ' destinos</span></span>' +
      '</a>' +
      '<button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="main-nav">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg> Menú' +
      '</button>' +
      '<nav class="main-nav" id="main-nav" data-main-nav>' +
        link('barcos.html', 'Barcos', 'barcos') +
        link('index.html#como-funciona', 'Cómo funciona', 'como-funciona') +
        link('empresas.html', 'Empresas náuticas', 'empresas') +
        link('asistente.html', 'No sé qué barco elegir', 'asistente') +
        '<span class="lang-switch"><span class="active">ES</span><span>EN</span></span>' +
        '<a class="btn btn-primary" href="' + prefix + 'barcos.html">Solicitar barco</a>' +
      '</nav>' +
    '</div>';
}

function renderFooter(el, prefix) {
  if (!el) return;
  prefix = prefix || '';
  el.innerHTML =
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<div class="footer-brand"><img src="' + prefix + 'img/logo.png" alt="KAEL AUT"><span style="font-weight:600;letter-spacing:.06em;font-size:14px;">AUT</span></div>' +
          '<p class="footer-note">KAEL AUT es una plataforma de intermediación. No presta el servicio náutico ni cobra el alquiler. Las embarcaciones son ofrecidas por empresas náuticas verificadas en varios destinos.</p>' +
        '</div>' +
        '<div class="footer-col">' +
          '<div class="ftitle">Destinos</div>' +
          Object.values(MARKETS).map(function (m) { return '<a href="' + prefix + 'barcos.html?market=' + m.id + '">' + m.name + '</a>'; }).join('') +
        '</div>' +
        '<div class="footer-col">' +
          '<div class="ftitle">Empresas</div>' +
          '<a href="' + prefix + 'empresas.html">Publicar tus embarcaciones</a>' +
          '<a href="' + prefix + 'legal/condiciones-intermediacion.html">Proceso de verificación</a>' +
          '<a href="' + prefix + 'admin.html">Acceso al panel</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<div class="ftitle">Legal</div>' +
          '<a href="' + prefix + 'legal/aviso-legal.html">Aviso legal</a>' +
          '<a href="' + prefix + 'legal/privacidad.html">Política de privacidad</a>' +
          '<a href="' + prefix + 'legal/cookies.html">Política de cookies</a>' +
          '<a href="' + prefix + 'legal/condiciones-intermediacion.html">Condiciones de intermediación</a>' +
          '<a href="' + prefix + 'legal/reclamaciones.html">Reclamaciones</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-legal-bar">' +
        '<span>© <span data-year></span> KAEL AUT. Todos los derechos reservados.</span>' +
        '<span>KAEL AUT no vende barcos ni presta servicios náuticos. Actúa como intermediario digital.</span>' +
      '</div>' +
    '</div>';
}

function renderCookieBanner(el, prefix) {
  if (!el) return;
  prefix = prefix || '';
  el.innerHTML =
    '<p>Usamos cookies técnicas necesarias para el funcionamiento de la web y, si lo aceptas, cookies analíticas para entender cómo se usa. Puedes cambiar tu decisión en cualquier momento desde la <a href="' + prefix + 'legal/cookies.html" style="color:#8FB39E;">política de cookies</a>.</p>' +
    '<div class="cookie-actions">' +
      '<button class="btn btn-primary" data-cookie-accept>Aceptar todas</button>' +
      '<button class="btn btn-outline" data-cookie-reject>Rechazar</button>' +
    '</div>';
}
