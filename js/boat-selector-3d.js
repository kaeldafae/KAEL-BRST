/* KAEL BRST — selector 3D de embarcaciones estilo "selección de personaje".
 * CSS 3D real (perspective + rotateY/translateZ en un anillo), sin librería
 * externa: cada tarjeta es una fotografía real de barco montada en el
 * espacio 3D, no un modelo 3D fotorrealista (no es algo que podamos generar
 * de forma fiable). Se anima automáticamente y responde a clic/arrastre.
 */
function createBoatSelector3D(root, opts) {
  const stage = root.querySelector('[data-c3d-stage]');
  const ring = root.querySelector('[data-c3d-ring]');
  const prevBtn = root.querySelector('[data-c3d-prev]');
  const nextBtn = root.querySelector('[data-c3d-next]');
  const panel = opts.panelEl;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let boats = [];
  let index = 0;
  let radius = 340;
  let autoTimer = null;
  let dragging = false;
  let dragStartX = 0;
  let dragBaseAngle = 0;
  let currentAngle = 0;

  function angleStep() {
    return 360 / Math.max(boats.length, 1);
  }

  function computeRadius() {
    const cardWidth = 240;
    const n = Math.max(boats.length, 1);
    if (n < 2) return 0;
    radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / n)) + 60;
  }

  function buildCards() {
    ring.innerHTML = '';
    computeRadius();
    boats.forEach((b, i) => {
      const angle = i * angleStep();
      const card = document.createElement('div');
      card.className = 'carousel3d-card';
      card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
      card.setAttribute('data-index', String(i));
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '-1');
      card.setAttribute('aria-label', 'Seleccionar ' + b.name);
      const company = companyOf(b);
      card.innerHTML =
        '<img src="' + b.images[0] + '" alt="' + b.name + '" loading="lazy">' +
        '<div class="c3d-label"><div class="cname">' + b.name + '</div><div class="cmeta">' + b.type + ' · ' + company.name + '</div></div>';
      card.addEventListener('click', () => {
        if (Number(card.getAttribute('data-index')) === index) {
          if (opts.onOpen) opts.onOpen(boats[index]);
        } else {
          goTo(i);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          if (Number(card.getAttribute('data-index')) === index) {
            if (opts.onOpen) opts.onOpen(boats[index]);
          } else {
            goTo(i);
          }
        }
      });
      ring.appendChild(card);
    });
  }

  function applyRotation(animate) {
    ring.style.transition = animate && !reduceMotion ? '' : 'none';
    ring.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;
    if (!animate) {
      // force reflow so the next transform change animates again
      void ring.offsetHeight;
      ring.style.transition = '';
    }
    updateFrontState();
  }

  function updateFrontState() {
    const cards = ring.querySelectorAll('.carousel3d-card');
    cards.forEach((card, i) => {
      const isFront = i === index;
      card.classList.toggle('is-front', isFront);
      card.setAttribute('tabindex', isFront ? '0' : '-1');
    });
    if (panel && boats[index]) renderPanel(boats[index]);
  }

  function renderPanel(boat) {
    const company = companyOf(boat);
    panel.innerHTML =
      '<div class="sbp-company">' + company.name + '</div>' +
      '<div class="sbp-name">' + boat.name + '</div>' +
      '<div class="sbp-meta">' + boat.type + ' · ' + boat.pax + ' personas · ' + boat.port + '</div>' +
      '<div class="sbp-price tabular">desde ' + euro(boat.price) + '</div>' +
      '<div class="sbp-actions">' +
        '<a class="btn btn-primary btn-block" href="barco.html?id=' + boat.id + '">Ver esta embarcación</a>' +
        '<a class="btn btn-outline btn-block" href="solicitud.html?id=' + boat.id + '">Solicitar reserva</a>' +
      '</div>';
  }

  function goTo(i, animate = true) {
    index = ((i % boats.length) + boats.length) % boats.length;
    currentAngle = -index * angleStep();
    applyRotation(animate);
  }

  function next() { stopAuto(); goTo(index + 1); scheduleAuto(); }
  function prev() { stopAuto(); goTo(index - 1); scheduleAuto(); }

  function scheduleAuto() {
    if (reduceMotion || boats.length < 2) return;
    stopAuto();
    autoTimer = setInterval(() => goTo(index + 1), 4200);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function onPointerDown(e) {
    dragging = true;
    dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
    dragBaseAngle = currentAngle;
    stopAuto();
    ring.style.transition = 'none';
  }
  function onPointerMove(e) {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const delta = x - dragStartX;
    currentAngle = dragBaseAngle + delta * 0.35;
    applyRotation(false);
  }
  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    const nearest = Math.round(-currentAngle / angleStep());
    goTo(nearest);
    scheduleAuto();
  }

  function setBoats(list) {
    boats = list;
    index = 0;
    currentAngle = 0;
    buildCards();
    applyRotation(false);
    scheduleAuto();
  }

  function onStageKeydown(e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  stage.addEventListener('keydown', onStageKeydown);
  stage.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  stage.addEventListener('touchstart', onPointerDown, { passive: true });
  stage.addEventListener('touchmove', onPointerMove, { passive: true });
  stage.addEventListener('touchend', onPointerUp);
  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', scheduleAuto);

  function destroy() {
    stopAuto();
    prevBtn.removeEventListener('click', prev);
    nextBtn.removeEventListener('click', next);
    stage.removeEventListener('keydown', onStageKeydown);
    stage.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    stage.removeEventListener('touchstart', onPointerDown);
    stage.removeEventListener('touchmove', onPointerMove);
    stage.removeEventListener('touchend', onPointerUp);
    stage.removeEventListener('mouseenter', stopAuto);
    stage.removeEventListener('mouseleave', scheduleAuto);
  }

  return { setBoats, goTo, destroy };
}
