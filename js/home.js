/* KAEL AUT — lógica de la página de inicio */
(function () {
  // Etiqueta de mercados en la cabecera del hero
  document.getElementById('heroMarkets').textContent = Object.values(MARKETS).map(function (m) { return m.name; }).join(' · ');

  // Estadística "N destinos" (recuento animado por reveal.js)
  var statMarkets = document.getElementById('statMarkets');
  statMarkets.setAttribute('data-count', String(Object.keys(MARKETS).length));

  // Selector de destino en el buscador
  var searchMarket = document.getElementById('searchMarket');
  Object.values(MARKETS).forEach(function (m) {
    var opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
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
          '<p style="margin:0 0 6px; font-size:16px; font-weight:500;">Muy pronto</p>' +
          '<p style="margin:0; color:var(--ink-soft);">Estamos verificando empresas náuticas en ' + Object.values(MARKETS).map(function (m) { return m.name; }).join(', ') + '.</p>' +
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
      heroImg.alt = b.name + ' — ' + b.type + ' en ' + b.zone;
      heroName.textContent = b.name;
      heroMeta.textContent = b.type + ' · ' + b.pax + ' personas · ' + b.port;
      heroOpenBtn.href = 'barco.html?id=' + b.id;
      heroThumbs.innerHTML = '';
      BOATS.forEach(function (bb, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = i === idx ? 'active' : '';
        btn.setAttribute('aria-label', 'Ver ' + bb.name);
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
      '<div class="empty-state card">Todavía no hay embarcaciones publicadas. Estamos verificando empresas náuticas en ' + Object.values(MARKETS).map(function (m) { return m.name; }).join(', ') + '.</div>';
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
        var label = id === 'all' ? 'Todas las empresas' : COMPANIES[id].name;
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
    grid.outerHTML = '<div class="empty-state card">Todavía no hay embarcaciones publicadas. En cuanto una empresa confirme su colaboración, sus barcos aparecerán aquí.</div>';
  } else {
    BOATS.forEach(function (b) {
      var c = companyOf(b);
      var card = document.createElement('a');
      card.className = 'boat-card';
      card.href = 'barco.html?id=' + b.id;
      card.setAttribute('data-tier', c.tier || 'standard');
      card.innerHTML =
        '<div class="thumb"><img loading="lazy" src="' + b.images[0] + '" alt="' + b.name + '">' +
        (b.destacado ? '<div class="badge-featured">Destacado</div>' : '<div class="type-badge">' + b.type + '</div>') +
        '</div>' +
        '<div class="row"><div class="name">' + b.name + '</div><div class="price tabular">desde ' + euro(b.price) + '</div></div>' +
        '<div class="summary">' + b.pax + ' personas · ' + b.length + ' · ' + b.skipper.toLowerCase() + '</div>' +
        '<div class="company">' + c.name + '</div>';
      grid.appendChild(card);
    });
  }

  // Companies teaser
  var teaser = document.getElementById('companiesTeaser');
  if (!Object.keys(COMPANIES).length) {
    teaser.outerHTML = '<div class="empty-state card">Estamos verificando empresas náuticas en ' + Object.values(MARKETS).map(function (m) { return m.name; }).join(', ') + '. <a href="empresas.html">Consulta el estado por destino</a>.</div>';
  } else {
    Object.values(COMPANIES).forEach(function (c) {
      var n = boatsByCompany(c.id).length;
      var el = document.createElement('a');
      el.href = 'empresa.html?id=' + c.id;
      el.className = 'company-card';
      el.setAttribute('data-tier', c.tier || 'standard');
      el.innerHTML =
        '<div class="cname">' + c.name + '</div>' +
        '<div class="cmeta">' + c.base + ' · ' + n + ' embarcaci' + (n === 1 ? 'ón' : 'ones') + '</div>' +
        '<div class="csla">Responde en ' + c.sla + '</div>';
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
