/* KAEL BRST — comportamiento compartido: menú móvil, año de footer, cookies */
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
    var KEY = 'kael-brst-cookie-consent';
    var banner = document.querySelector('[data-cookie-banner]');
    if (!banner) return;

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }

    if (!saved) banner.hidden = false;

    var acceptBtn = banner.querySelector('[data-cookie-accept]');
    var rejectBtn = banner.querySelector('[data-cookie-reject]');

    function decide(value) {
      try { localStorage.setItem(KEY, value); } catch (e) { /* ignore */ }
      banner.hidden = true;
      document.dispatchEvent(new CustomEvent('cookie-consent', { detail: value }));
    }
    if (acceptBtn) acceptBtn.addEventListener('click', function () { decide('accepted'); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { decide('rejected'); });
  }
})();
