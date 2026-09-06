/* KAEL — pantalla de carga con velero animado, solo en la portada y una
   vez por sesión de navegador (sessionStorage). El barco navega despacio
   mientras el resto de la página sigue cargando de verdad detrás de este
   overlay; en cuanto la ventana termina de cargar (evento `load`) acelera,
   completa una vuelta rápida y desaparece, dejando ver la portada ya
   cargada. Si el usuario prefiere menos movimiento, no se muestra nada. */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'kael-intro-shown';
  var already = false;
  try { already = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* almacenamiento bloqueado: no pasa nada, se mostrará cada vez */ }
  if (reduceMotion || already) return;

  var markShown = function () {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
  };

  var WAVE1 = 'M0 17 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0 c15 -9 45 -9 60 0 c15 9 45 9 60 0';
  var WAVE2 = 'M0 17 c20 -8 60 -8 80 0 c20 8 60 8 80 0 c20 -8 60 -8 80 0 c20 8 60 8 80 0 c20 -8 60 -8 80 0 c20 8 60 8 80 0 c20 -8 60 -8 80 0 c20 8 60 8 80 0 c20 -8 60 -8 80 0 c20 8 60 8 80 0 c20 -8 60 -8 80 0 c20 8 60 8 80 0';

  document.body.insertAdjacentHTML('afterbegin',
    '<div class="kael-intro" id="kaelIntro" aria-hidden="true">' +
      '<div class="kael-intro-stage">' +
        '<div class="kael-intro-water">' +
          '<div class="kael-intro-wave kael-intro-wave-1"><svg viewBox="0 0 960 34" preserveAspectRatio="none" fill="none"><path d="' + WAVE1 + '" stroke="#366A8B" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/></svg></div>' +
          '<div class="kael-intro-wave kael-intro-wave-2"><svg viewBox="0 0 960 34" preserveAspectRatio="none" fill="none"><path d="' + WAVE2 + '" stroke="#366A8B" stroke-opacity=".28" stroke-width="5" stroke-linecap="round"/></svg></div>' +
        '</div>' +
        '<div class="kael-intro-breeze">' +
          '<span class="kael-intro-breeze-line kael-intro-breeze-a"></span>' +
          '<span class="kael-intro-breeze-line kael-intro-breeze-b"></span>' +
        '</div>' +
        '<div class="kael-intro-boat" id="kaelIntroBoat">' +
          '<div class="kael-intro-boat-bob">' +
            '<svg viewBox="0 0 260 215" fill="none" stroke="#366A8B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M34,154 L222,154 L198,186 L58,186 Z"/>' +
              '<path d="M130,22 L130,154"/>' +
              '<path d="M130,28 L214,47 L130,66 Z"/>' +
              '<path d="M130,66 C102,100 74,132 46,150 L130,150 Z"/>' +
              '<path d="M130,72 C156,104 176,132 200,150 L130,150 Z"/>' +
            '</svg>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="kael-intro-word">KAEL</div>' +
    '</div>'
  );

  var overlay = document.getElementById('kaelIntro');
  var boat = document.getElementById('kaelIntroBoat');

  var SLOW_MS = 4200, FAST_MS = 650;
  var dur = SLOW_MS;
  var t0 = performance.now();
  var speeding = false;
  var raf = null;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function fadeOpacity(x) { return Math.min(clamp01((100 - x) / 35), clamp01((x + 95) / 35)); }

  function loop(now) {
    var elapsed = now - t0;
    var p = (elapsed % dur) / dur;
    var x = 100 - 200 * p; // barre de +100% a -100% del escenario
    boat.style.transform = 'translateX(' + x.toFixed(2) + '%)';
    boat.style.opacity = fadeOpacity(x).toFixed(3);
    if (speeding && elapsed >= dur) { finish(); return; }
    raf = requestAnimationFrame(loop);
  }

  function speedUp() {
    if (speeding) return;
    speeding = true;
    dur = FAST_MS;
    t0 = performance.now(); // arranca una vuelta rápida "limpia" desde ahora
  }

  function finish() {
    if (raf) cancelAnimationFrame(raf);
    markShown();
    overlay.classList.add('is-leaving');
    setTimeout(function () { overlay.remove(); }, 450);
  }

  raf = requestAnimationFrame(loop);

  if (document.readyState === 'complete') {
    speedUp();
  } else {
    window.addEventListener('load', speedUp);
  }
  // Salvaguarda: nunca dejar la web tapada más de unos segundos aunque
  // `load` no llegara a disparar por lo que sea (recurso colgado, etc.).
  setTimeout(speedUp, 8000);
})();
