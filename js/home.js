/* KAEL AUT — lógica de la página de inicio */
(function () {
  function marketList() { return Object.values(MARKETS).map(function (m) { return marketName(m.id); }).join(', '); }
  function marketListDot() { return Object.values(MARKETS).map(function (m) { return marketName(m.id); }).join(' · '); }

  // Etiqueta de mercados en la cabecera del hero
  document.getElementById('heroMarkets').textContent = marketListDot();

  // Estadística "N destinos" (recuento animado por reveal.js)
  var statMarkets = document.getElementById('statMarkets');
  statMarkets.setAttribute('data-count', String(Object.keys(MARKETS).length));

  // Selector de destino en el buscador
  var searchMarket = document.getElementById('searchMarket');
  Object.values(MARKETS).forEach(function (m) {
    var opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = marketName(m.id);
    searchMarket.appendChild(opt);
  });

  var idx = 0;
  var heroImg = document.getElementById('heroImg');
  var heroName = document.getElementById('heroName');
  var heroMeta = document.getElementById('heroMeta');
  var heroOpenBtn = document.getElementById('heroOpenBtn');
  var heroThumbs = document.getElementById('heroThumbs');

  if (!BOATS.length) {
    // Sin embarcaciones todavía: hero estático de "muy pronto" en vez del
    // rotador, que necesita al menos un barco real.
    document.getElementById('heroPhotoWrap').innerHTML =
      '<div class="empty-state card" style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding:32px;">' +
        '<div>' +
          '<p style="margin:0 0 6px; font-size:16px; font-weight:500;">' + t('home.heroCardTitle') + '</p>' +
          '<p style="margin:0; color:var(--ink-soft);">' + t('home.heroEmptyDesc').replace('{markets}', marketList()) + '</p>' +
        '</div>' +
      '</div>';
    document.getElementById('heroNavBtns').hidden = true;
    document.getElementById('heroThumbsRow').hidden = true;
    heroOpenBtn.hidden = true;
  } else {
    idx = BOATS.findIndex(function (b) { return b.id === 'sunseeker-55'; });
    if (idx < 0) idx = 0;

    var renderHero = function () {
      var b = BOATS[idx];
      heroImg.src = b.images[0];
      heroImg.alt = b.name + ' — ' + typeName(b.type);
      heroName.textContent = b.name;
      heroMeta.textContent = typeName(b.type) + ' · ' + b.pax + ' ' + t('common.personas') + ' · ' + b.port;
      heroOpenBtn.href = 'barco.html?id=' + b.id;
      heroThumbs.innerHTML = '';
      BOATS.forEach(function (bb, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = i === idx ? 'active' : '';
        btn.setAttribute('aria-label', bb.name);
        btn.innerHTML = '<img src="' + bb.images[0] + '" alt="">';
        btn.addEventListener('click', function () { idx = i; renderHero(); });
        heroThumbs.appendChild(btn);
      });
    };
    document.getElementById('heroPrev').addEventListener('click', function () {
      idx = (idx - 1 + BOATS.length) % BOATS.length; renderHero();
    });
    document.getElementById('heroNext').addEventListener('click', function () {
      idx = (idx + 1) % BOATS.length; renderHero();
    });
    renderHero();
  }

  // 3D character-select boat carousel, grouped by company
  var selector3dSection = document.querySelector('.selector3d');
  if (!BOATS.length) {
    selector3dSection.querySelector('.carousel3d-wrap').outerHTML =
      '<div class="empty-state card">' + t('home.selectorEmpty').replace('{markets}', marketList()) + '</div>';
  } else {
    var selector = createBoatSelector3D(document.querySelector('.carousel3d-wrap'), {
      panelEl: document.getElementById('selectedBoatPanel'),
      onOpen: function (boat) { window.location.href = 'barco.html?id=' + boat.id; }
    });

    var companyTabs = document.getElementById('companyTabs');
    var companyIds = ['all'].concat(Object.keys(COMPANIES));
    var activeCompany = 'all';

    var boatsForCompany = function (id) {
      return id === 'all' ? BOATS : boatsByCompany(id);
    };

    var renderCompanyTabs = function () {
      companyTabs.innerHTML = '';
      companyIds.forEach(function (id) {
        var label = id === 'all' ? t('common.todasLasEmpresas') : COMPANIES[id].name;
        var count = boatsForCompany(id).length;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'company-tab' + (id === activeCompany ? ' active' : '');
        btn.innerHTML = label + '<span class="count">' + count + '</span>';
        btn.addEventListener('click', function () {
          activeCompany = id;
          renderCompanyTabs();
          selector.setBoats(boatsForCompany(id));
        });
        companyTabs.appendChild(btn);
      });
    };
    renderCompanyTabs();
    selector.setBoats(boatsForCompany(activeCompany));
  }

  // Boats grid (featured)
  var grid = document.getElementById('boatsGrid');
  if (!BOATS.length) {
    grid.outerHTML = '<div class="empty-state card">' + t('home.boatsGridEmpty') + '</div>';
  } else {
    BOATS.forEach(function (b) {
      var c = companyOf(b);
      var card = document.createElement('a');
      card.className = 'boat-card';
      card.href = 'barco.html?id=' + b.id;
      card.setAttribute('data-tier', c.tier || 'standard');
      card.innerHTML =
        '<div class="thumb"><img loading="lazy" src="' + b.images[0] + '" alt="' + b.name + '">' +
        (b.destacado ? '<div class="badge-featured">' + t('common.destacado') + '</div>' : '<div class="type-badge">' + typeName(b.type) + '</div>') +
        '</div>' +
        '<div class="row"><div class="name">' + b.name + '</div><div class="price tabular">' + t('common.desde') + ' ' + euro(b.price) + '</div></div>' +
        '<div class="summary">' + b.pax + ' ' + t('common.personas') + ' · ' + b.length + ' · ' + skipperName(b.skipper).toLowerCase() + '</div>' +
        '<div class="company">' + c.name + '</div>';
      grid.appendChild(card);
    });
  }

  // Companies teaser
  var teaser = document.getElementById('companiesTeaser');
  if (!Object.keys(COMPANIES).length) {
    teaser.outerHTML = '<div class="empty-state card">' + t('common.empresasVerificandoPrefix') + marketList() + '. <a href="empresas.html">' + t('home.consultaEstado') + '</a>.</div>';
  } else {
    Object.values(COMPANIES).forEach(function (c) {
      var n = boatsByCompany(c.id).length;
      var el = document.createElement('a');
      el.href = 'empresa.html?id=' + c.id;
      el.className = 'company-card';
      el.setAttribute('data-tier', c.tier || 'standard');
      el.innerHTML =
        '<div class="cname">' + c.name + '</div>' +
        '<div class="cmeta">' + c.base + ' · ' + n + ' ' + (n === 1 ? t('common.embarcacion') : t('common.embarcaciones')) + '</div>' +
        '<div class="csla">' + t('common.respondeEn') + ' ' + c.sla + '</div>';
      teaser.appendChild(el);
    });
  }

  // Search box -> results page
  document.getElementById('homeSearchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var params = new URLSearchParams();
    ['market', 'fecha', 'personas', 'type', 'skipper'].forEach(function (k) {
      var v = fd.get(k);
      if (v) params.set(k, v);
    });
    window.location.href = 'barcos.html?' + params.toString();
  });
})();
