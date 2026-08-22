/* KAEL AUT — comportamiento compartido: menú móvil, año de footer, cookies */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    initCookieBanner();
  });

  function initCookieBanner() {
    var KEY = 'kael-aut-cookie-consent';
    var banner = document.querySelector('[data-cookie-banner]');
    if (!banner) return;

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }

    // El banner es position:fixed y puede tapar el contenido final en páginas
    // cortas (p.ej. textos legales) que no llegan a tener scroll suficiente
    // para dejarlo despejado. Reservamos espacio real al final del documento
    // mientras el banner esté visible, para que siempre se pueda hacer scroll
    // más allá de él y leer todo el texto.
    function updateSpacer() {
      var h = banner.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--cookie-banner-space', (h + 32) + 'px');
    }
    function onResize() { if (!banner.hidden) updateSpacer(); }

    if (!saved) {
      banner.hidden = false;
      document.body.classList.add('has-cookie-banner');
      updateSpacer();
      window.addEventListener('resize', onResize);
    }

    var acceptBtn = banner.querySelector('[data-cookie-accept]');
    var rejectBtn = banner.querySelector('[data-cookie-reject]');

    function decide(value) {
      try { localStorage.setItem(KEY, value); } catch (e) { /* ignore */ }
      banner.hidden = true;
      document.body.classList.remove('has-cookie-banner');
      window.removeEventListener('resize', onResize);
      document.dispatchEvent(new CustomEvent('cookie-consent', { detail: value }));
    }
    if (acceptBtn) acceptBtn.addEventListener('click', function () { decide('accepted'); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { decide('rejected'); });
  }
})();
