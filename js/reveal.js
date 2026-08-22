/* KAEL AUT — animaciones al hacer scroll (reveal-on-scroll) y contador de
 * estadísticas. Progressive enhancement: si JS falla o el usuario prefiere
 * menos movimiento, el contenido es visible igualmente (sin depender de la
 * animación para poder leerlo). */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SELECTORS = [
    '.section .eyebrow', '.section h1', '.section h2', '.section > .container > p.lede',
    '.stat', '.step', '.boat-card', '.company-card', '.compare-row',
    '.result-card', '.specs-row', '.list-dot', '.legal-doc h2', '.legal-doc > p',
    '.dark-panel', '.search-box', '.banner-warn', '.banner-info', '.hero-frame'
  ];

  function markElements() {
    var seen = new Set();
    SELECTORS.forEach(function (sel, groupIndex) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (seen.has(el)) return;
        seen.add(el);
        el.classList.add('reveal');
        var delay = Math.min((i % 6) * 70, 350);
        el.style.setProperty('--reveal-delay', delay + 'ms');
      });
    });
  }

  function initObserver() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      animateCounts();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    var counted = false;
    var statsIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counted) { counted = true; animateCounts(); statsIo.disconnect(); }
      });
    }, { threshold: 0.4 });
    var statGrid = document.querySelector('.stat-grid');
    if (statGrid) statsIo.observe(statGrid);
  }

  function animateCounts() {
    document.querySelectorAll('.stat .num[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = el.getAttribute('data-decimals') ? Number(el.getAttribute('data-decimals')) : 0;
      if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
      var start = null;
      var duration = 900;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    markElements();
    initObserver();
  });
})();
