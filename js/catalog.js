/* KAEL AUT — catálogo con filtros y solicitud múltiple */
(function () {
  var qs = new URLSearchParams(window.location.search);
  var state = {
    types: qs.get('type') ? [qs.get('type')] : [],
    markets: qs.get('market') ? [qs.get('market')] : [],
    skippers: qs.get('skipper') ? [qs.get('skipper')] : [],
    multi: []
  };

  try {
    var savedMulti = JSON.parse(sessionStorage.getItem('kael-aut-multi') || '[]');
    if (Array.isArray(savedMulti)) state.multi = savedMulti;
  } catch (e) { /* ignore */ }

  function toggle(list, value) {
    var i = list.indexOf(value);
    if (i >= 0) list.splice(i, 1); else list.push(value);
  }

  function renderChips(containerId, key, options) {
    var el = document.getElementById(containerId);
    el.innerHTML = '';
    options.forEach(function (opt) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (state[key].includes(opt.value) ? ' active' : '');
      chip.textContent = opt.label;
      chip.addEventListener('click', function () {
        toggle(state[key], opt.value);
        renderAll();
      });
      el.appendChild(chip);
    });
  }

  function filtered() {
    return BOATS.filter(function (b) {
      var market = companyOf(b) && companyOf(b).marketId;
      return (!state.types.length || state.types.includes(b.type)) &&
             (!state.markets.length || state.markets.includes(market)) &&
             (!state.skippers.length || state.skippers.includes(b.skipper));
    });
  }

  function persistMulti() {
    try { sessionStorage.setItem('kael-aut-multi', JSON.stringify(state.multi)); } catch (e) { /* ignore */ }
  }

  function renderMultiBtn() {
    var btn = document.getElementById('multiBtn');
    if (state.multi.length) {
      btn.textContent = 'Continuar con ' + state.multi.length + ' barco' + (state.multi.length > 1 ? 's' : '');
      btn.className = 'btn btn-dark btn-block';
    } else {
      btn.textContent = 'Selecciona barcos abajo';
      btn.className = 'btn btn-outline btn-block';
    }
  }

  function renderResults() {
    var list = filtered();

    if (!BOATS.length) {
      document.getElementById('resultCount').textContent = 'Muy pronto';
      document.getElementById('resultsList').innerHTML =
        '<div class="empty-state card">' +
          '<p style="margin:0 0 6px; font-size:16px; font-weight:500;">Todavía no hay embarcaciones publicadas.</p>' +
          '<p style="margin:0; color:var(--ink-soft);">Estamos verificando empresas náuticas en ' + Object.values(MARKETS).map(function (m) { return m.name; }).join(', ') + '. En cuanto una empresa confirme su colaboración, sus barcos aparecerán aquí.</p>' +
        '</div>';
      return;
    }

    document.getElementById('resultCount').textContent = list.length + ' embarcaci' + (list.length === 1 ? 'ón' : 'ones') + ' disponibles para solicitud';
    var container = document.getElementById('resultsList');
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = '<div class="empty-state card">No hay embarcaciones con esos filtros. Prueba a quitar alguno o <a href="asistente.html">usa el asistente</a>.</div>';
      return;
    }

    list.forEach(function (b) {
      var c = companyOf(b);
      var selected = state.multi.includes(b.id);
      var card = document.createElement('div');
      card.className = 'result-card' + (selected ? ' selected' : '');
      card.setAttribute('data-tier', c.tier || 'standard');
      card.innerHTML =
        '<a class="result-photo" href="barco.html?id=' + b.id + '">' +
          '<img loading="lazy" src="' + b.images[0] + '" alt="' + b.name + '">' +
          (b.destacado ? '<div class="badge-featured" style="position:absolute;left:12px;top:12px;">Destacado</div>' : '') +
        '</a>' +
        '<div class="result-body">' +
          '<a class="rname" href="barco.html?id=' + b.id + '">' + b.name + '</a>' +
          '<div class="rtype">' + b.type + ' · ' + b.port + '</div>' +
          '<div class="result-specs">' +
            '<div><div class="k">Capacidad</div><div class="v tabular">' + b.pax + ' personas</div></div>' +
            '<div><div class="k">Eslora</div><div class="v tabular">' + b.length + '</div></div>' +
            '<div><div class="k">Patrón</div><div class="v">' + b.skipper + '</div></div>' +
          '</div>' +
          '<div class="result-trust"><span class="dot"></span><span>' + c.name + ' · empresa verificada · responde en ' + c.sla + '</span></div>' +
        '</div>' +
        '<div class="result-price">' +
          '<div><div class="plabel">Precio orientativo</div><div class="pval tabular">desde ' + euro(b.price) + '</div><div class="pnote">Precio final sujeto a disponibilidad, temporada y condiciones de la empresa.</div></div>' +
          '<div class="result-actions">' +
            '<a class="btn btn-primary" href="solicitud.html?id=' + b.id + '">Solicitar reserva</a>' +
            '<button class="btn btn-ghost" type="button" data-multi-toggle="' + b.id + '">' + (selected ? 'Añadido a la solicitud múltiple' : 'Añadir a solicitud múltiple') + '</button>' +
          '</div>' +
        '</div>';
      container.appendChild(card);
    });

    container.querySelectorAll('[data-multi-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-multi-toggle');
        if (!state.multi.includes(id) && state.multi.length >= 3) {
          alert('Puedes seleccionar hasta 3 embarcaciones para una solicitud múltiple.');
          return;
        }
        toggle(state.multi, id);
        persistMulti();
        renderAll();
      });
    });
  }

  function renderAll() {
    var filtersPanel = document.querySelector('.filters-panel');
    if (filtersPanel) filtersPanel.hidden = !BOATS.length;
    if (!BOATS.length) { renderResults(); return; }

    renderChips('typeFilters', 'types', ['Lancha', 'Yate', 'Catamarán'].map(function (v) { return { value: v, label: v }; }));
    renderChips('marketFilters', 'markets', Object.values(MARKETS).map(function (m) { return { value: m.id, label: m.name }; }));
    renderChips('skipperFilters', 'skippers', ['Con patrón', 'Sin patrón'].map(function (v) { return { value: v, label: v }; }));
    renderResults();
    renderMultiBtn();
  }

  document.getElementById('multiBtn').addEventListener('click', function () {
    if (!state.multi.length) return;
    window.location.href = 'solicitud-multiple.html';
  });

  renderAll();
})();
