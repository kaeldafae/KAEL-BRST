/* KAEL AUT — asistente de selección de barco (4 preguntas) */
(function () {
  var step = 0;
  var answers = {};

  function QUESTIONS_LIST() {
    return [
      {
        title: t('wizard.q1'),
        key: 'pax',
        layout: 'row',
        options: [
          { label: t('wizard.q1o1'), value: 4 },
          { label: t('wizard.q1o2'), value: 8 },
          { label: t('wizard.q1o3'), value: 12 }
        ]
      },
      {
        title: t('wizard.q2'),
        key: 'mood',
        layout: 'grid',
        options: [
          { label: t('wizard.q2o1l'), hint: t('wizard.q2o1h'), value: 'formentera' },
          { label: t('wizard.q2o2l'), hint: t('wizard.q2o2h'), value: 'ibiza' },
          { label: t('wizard.q2o3l'), hint: t('wizard.q2o3h'), value: 'premium' },
          { label: t('wizard.q2o4l'), hint: t('wizard.q2o4h'), value: 'catamaran' }
        ]
      },
      {
        title: t('wizard.q3'),
        key: 'budget',
        layout: 'row',
        options: [
          { label: t('wizard.q3o1'), value: 700 },
          { label: t('wizard.q3o2'), value: 1200 },
          { label: t('wizard.q3o3'), value: 2000 },
          { label: t('wizard.q3o4'), value: 2600 }
        ]
      },
      {
        title: t('wizard.q4'),
        key: 'market',
        layout: 'row',
        options: Object.values(MARKETS).map(function (m) { return { label: marketName(m.id), value: m.id }; }).concat([{ label: t('wizard.indiferente'), value: '' }])
      }
    ];
  }

  function rank() {
    var list = BOATS.slice();
    if (answers.pax) list = list.filter(function (b) { return b.pax >= answers.pax; });
    if (answers.mood === 'premium') list = list.filter(function (b) { return b.type === 'Yate'; });
    if (answers.mood === 'catamaran') list = list.filter(function (b) { return b.type === 'Catamarán'; });
    if (answers.market) list = list.filter(function (b) { var c = companyOf(b); return c && c.marketId === answers.market; });
    if (!list.length) list = BOATS.slice();
    if (answers.budget) {
      list.sort(function (a, b) { return Math.abs(a.price - answers.budget) - Math.abs(b.price - answers.budget); });
    }
    return list.slice(0, 3);
  }

  function renderBars() {
    var el = document.getElementById('wizardBars');
    el.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      var b = document.createElement('div');
      b.className = 'bar' + (i <= step - 1 ? ' filled' : '');
      el.appendChild(b);
    }
  }

  function renderQuestion() {
    var q = QUESTIONS_LIST()[step];
    var card = document.getElementById('wizardCard');
    var wrap = document.createElement('div');
    var html = '<div class="eyebrow">' + t('wizard.preguntaDe').replace('{n}', step + 1) + '</div><h2 style="font-size:26px; font-weight:500; margin:8px 0 24px;">' + q.title + '</h2>';
    html += '<div class="' + (q.layout === 'grid' ? 'opt-grid' : 'opt-row') + '">';
    q.options.forEach(function (o, i) {
      html += '<button type="button" class="opt" data-opt="' + i + '"><div>' + o.label + '</div>' + (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + '</button>';
    });
    html += '</div>';
    wrap.innerHTML = html;
    card.innerHTML = '';
    card.appendChild(wrap);

    wrap.querySelectorAll('[data-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var opt = q.options[Number(btn.getAttribute('data-opt'))];
        answers[q.key] = opt.value;
        step++;
        render();
      });
    });
  }

  function renderResult() {
    var card = document.getElementById('wizardCard');

    if (!BOATS.length) {
      card.innerHTML =
        '<div class="eyebrow">' + t('wizard.resultado') + '</div>' +
        '<h2 style="font-size:26px; font-weight:500; margin:8px 0 6px;">' + t('wizard.emptyTitle') + '</h2>' +
        '<p style="font-size:15px; color:var(--ink-soft); margin:0 0 24px;">' + t('wizard.emptyDesc') + '</p>' +
        '<button class="btn btn-outline" id="wizReset">' + t('wizard.volverAEmpezar') + '</button>';
      document.getElementById('wizReset').addEventListener('click', function () { step = 0; answers = {}; render(); });
      return;
    }

    var results = rank();
    var html = '<div class="eyebrow">' + t('wizard.resultado') + '</div>' +
      '<h2 style="font-size:26px; font-weight:500; margin:8px 0 6px;">' + t('wizard.hemosEncontrado').replace('{n}', results.length) + '</h2>' +
      '<p style="font-size:15px; color:var(--ink-soft); margin:0 0 24px;">' + t('wizard.puedesSolicitar') + '</p>' +
      '<div style="display:grid; gap:12px;">';
    results.forEach(function (b) {
      var c = companyOf(b);
      html += '<a class="result-mini" data-tier="' + (c.tier || 'standard') + '" href="barco.html?id=' + b.id + '">' +
        '<div class="thumb-sm"><img loading="lazy" src="' + b.images[0] + '" alt="' + b.name + '"></div>' +
        '<div><div style="font-size:17px; font-weight:500;">' + b.name + '</div><div style="font-size:14px; color:var(--ink-soft); margin-top:2px;">' + b.pax + ' ' + t('common.personas') + ' · ' + b.length + ' · ' + skipperName(b.skipper).toLowerCase() + '</div><div style="font-size:13px; color:var(--muted); margin-top:6px;">' + c.name + '</div></div>' +
        '<div style="text-align:right; padding-right:8px;"><div style="font-size:18px; font-weight:500;" class="tabular">' + euro(b.price) + '</div><div style="font-size:13px; color:var(--muted);">' + t('wizard.orientativo') + '</div></div>' +
      '</a>';
    });
    html += '</div><div style="display:flex; gap:12px; margin-top:28px; flex-wrap:wrap;">' +
      '<button class="btn btn-primary" id="wizGoMulti">' + t('wizard.solicitarATres') + '</button>' +
      '<button class="btn btn-outline" id="wizReset">' + t('wizard.volverAEmpezar') + '</button>' +
      '</div>';
    card.innerHTML = html;

    document.getElementById('wizGoMulti').addEventListener('click', function () {
      try { sessionStorage.setItem('kael-aut-multi', JSON.stringify(results.map(function (b) { return b.id; }))); } catch (e) {}
      window.location.href = 'solicitud-multiple.html';
    });
    document.getElementById('wizReset').addEventListener('click', function () {
      step = 0; answers = {}; render();
    });
  }

  function render() {
    renderBars();
    if (step >= 4) renderResult();
    else renderQuestion();
  }

  render();
})();
