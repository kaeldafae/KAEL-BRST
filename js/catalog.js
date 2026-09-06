/* KAEL — catálogo con filtros y solicitud múltiple */
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
      btn.textContent = t('catalog.continuarCon') + ' ' + state.multi.length + ' ' + (state.multi.length > 1 ? t('catalog.barcos') : t('catalog.barco'));
      btn.className = 'btn btn-dark btn-block';
    } else {
      btn.textContent = t('catalog.selectBoatsBelow');
      btn.className = 'btn btn-outline btn-block';
    }
  }

  function marketList() { return marketSummary(', ', 5, 'common.yMasDestinos'); }

  function renderResults() {
    var list = filtered();

    if (!BOATS.length) {
      document.getElementById('resultCount').textContent = t('catalog.muyPronto');
      document.getElementById('resultsList').innerHTML =
        '<div class="empty-state card">' +
          '<p style="margin:0 0 6px; font-size:16px; font-weight:500;">' + t('catalog.emptyAllTitle') + '</p>' +
          '<p style="margin:0; color:var(--ink-soft);">' + t('catalog.emptyAllDesc').replace('{markets}', marketList()) + '</p>' +
        '</div>';
      return;
    }

    var label = list.length === 1 ? t('common.embarcacion') : t('common.embarcaciones');
    document.getElementById('resultCount').textContent = t('catalog.resultCount').replace('{n}', list.length).replace('{label}', label);
    var container = document.getElementById('resultsList');
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = '<div class="empty-state card">' + t('catalog.emptyFiltered') + '<a href="asistente.html">' + t('catalog.usaElAsistente') + '</a>.</div>';
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
          (b.destacado ? '<div class="badge-featured" style="position:absolute;left:12px;top:12px;">' + t('common.destacado') + '</div>' : '') +
        '</a>' +
        '<div class="result-body">' +
          '<a class="rname" href="barco.html?id=' + b.id + '">' + b.name + '</a>' +
          '<div class="rtype">' + typeName(b.type) + ' · ' + b.port + '</div>' +
          '<div class="result-specs">' +
            '<div><div class="k">' + t('catalog.capacidad') + '</div><div class="v tabular">' + b.pax + ' ' + t('common.personas') + '</div></div>' +
            '<div><div class="k">' + t('catalog.eslora') + '</div><div class="v tabular">' + b.length + '</div></div>' +
            '<div><div class="k">' + t('catalog.patron') + '</div><div class="v">' + skipperName(b.skipper) + '</div></div>' +
          '</div>' +
          '<div class="result-trust"><span class="dot"' + (c.demo ? ' style="background:var(--warn-text);"' : '') + '></span><span>' + c.name + (c.demo ? t('common.demoTrustSuffix') : t('catalog.empresaVerificadaTrust')) + c.sla + '</span></div>' +
        '</div>' +
        '<div class="result-price">' +
          '<div><div class="plabel">' + t('common.precioOrientativo') + '</div><div class="pval tabular">' + t('common.desde') + ' ' + euro(b.price) + '</div><div class="pnote">' + t('catalog.precioFinalNota') + '</div></div>' +
          '<div class="result-actions">' +
            '<a class="btn btn-primary" href="solicitud.html?id=' + b.id + '">' + t('common.solicitarReserva') + '</a>' +
            '<button class="btn btn-ghost" type="button" data-multi-toggle="' + b.id + '">' + (selected ? t('catalog.anadidoSolicitudMultiple') : t('catalog.anadirSolicitudMultiple')) + '</button>' +
          '</div>' +
        '</div>';
      container.appendChild(card);
    });

    container.querySelectorAll('[data-multi-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-multi-toggle');
        if (!state.multi.includes(id) && state.multi.length >= 3) {
          alert(t('catalog.maxTresAlert'));
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

    renderChips('typeFilters', 'types', ['Lancha', 'Yate', 'Catamarán'].map(function (v) { return { value: v, label: typeName(v) }; }));
    renderChips('marketFilters', 'markets', Object.values(MARKETS).map(function (m) { return { value: m.id, label: marketName(m.id) }; }));
    renderChips('skipperFilters', 'skippers', ['Con patrón', 'Sin patrón'].map(function (v) { return { value: v, label: skipperName(v) }; }));
    renderResults();
    renderMultiBtn();
  }

  document.getElementById('multiBtn').addEventListener('click', function () {
    if (!state.multi.length) return;
    window.location.href = 'solicitud-multiple.html';
  });

  renderAll();
})();
