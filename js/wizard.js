/* KAEL BRST — asistente de selección de barco (4 preguntas) */
(function () {
  var step = 0;
  var answers = {};

  var QUESTIONS = [
    {
      title: '¿Cuántos sois?',
      key: 'pax',
      layout: 'row',
      options: [
        { label: '2 – 4 personas', value: 4 },
        { label: '5 – 8 personas', value: 8 },
        { label: '9 – 12 personas', value: 12 }
      ]
    },
    {
      title: '¿Qué tipo de día quieres?',
      key: 'mood',
      layout: 'grid',
      options: [
        { label: 'Día en Formentera', hint: 'Travesía y calas de aguas claras', value: 'formentera' },
        { label: 'Calas de Ibiza', hint: 'Costa oeste, salidas cortas', value: 'ibiza' },
        { label: 'Algo premium', hint: 'Yate con tripulación', value: 'premium' },
        { label: 'En catamarán', hint: 'Grupo grande, familias', value: 'catamaran' }
      ]
    },
    {
      title: '¿Presupuesto orientativo por día?',
      key: 'budget',
      layout: 'row',
      options: [
        { label: 'Hasta 800 €', value: 700 },
        { label: '800 – 1.500 €', value: 1200 },
        { label: '1.500 – 2.500 €', value: 2000 },
        { label: 'Sin límite claro', value: 2600 }
      ]
    },
    {
      title: '¿Desde dónde quieres salir?',
      key: 'zone',
      layout: 'row',
      options: [
        { label: 'Ibiza', value: 'Ibiza' },
        { label: 'Formentera', value: 'Formentera' },
        { label: 'Indiferente', value: '' }
      ]
    }
  ];

  function rank() {
    var list = BOATS.slice();
    if (answers.pax) list = list.filter(function (b) { return b.pax >= answers.pax; });
    if (answers.mood === 'premium') list = list.filter(function (b) { return b.type === 'Yate'; });
    if (answers.mood === 'catamaran') list = list.filter(function (b) { return b.type === 'Catamarán'; });
    if (answers.zone) list = list.filter(function (b) { return b.zone === answers.zone || !answers.zone; });
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
    var q = QUESTIONS[step];
    var card = document.getElementById('wizardCard');
    var wrap = document.createElement('div');
    var html = '<div class="eyebrow">Pregunta ' + (step + 1) + ' de 4</div><h2 style="font-size:26px; font-weight:500; margin:8px 0 24px;">' + q.title + '</h2>';
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
    var results = rank();
    var html = '<div class="eyebrow">Resultado</div>' +
      '<h2 style="font-size:26px; font-weight:500; margin:8px 0 6px;">Hemos encontrado ' + results.length + ' opciones que podrían encajar contigo</h2>' +
      '<p style="font-size:15px; color:var(--ink-soft); margin:0 0 24px;">Puedes solicitar disponibilidad a una empresa o a las tres a la vez.</p>' +
      '<div style="display:grid; gap:12px;">';
    results.forEach(function (b) {
      var c = companyOf(b);
      html += '<a class="result-mini" href="barco.html?id=' + b.id + '">' +
        '<div class="thumb-sm"><img src="' + b.images[0] + '" alt="' + b.name + '"></div>' +
        '<div><div style="font-size:17px; font-weight:500;">' + b.name + '</div><div style="font-size:14px; color:var(--ink-soft); margin-top:2px;">' + b.pax + ' personas · ' + b.length + ' · ' + b.skipper.toLowerCase() + '</div><div style="font-size:13px; color:var(--muted); margin-top:6px;">' + c.name + '</div></div>' +
        '<div style="text-align:right; padding-right:8px;"><div style="font-size:18px; font-weight:500;" class="tabular">' + euro(b.price) + '</div><div style="font-size:13px; color:var(--muted);">orientativo</div></div>' +
      '</a>';
    });
    html += '</div><div style="display:flex; gap:12px; margin-top:28px; flex-wrap:wrap;">' +
      '<button class="btn btn-primary" id="wizGoMulti">Solicitar disponibilidad a las tres</button>' +
      '<button class="btn btn-outline" id="wizReset">Volver a empezar</button>' +
      '</div>';
    card.innerHTML = html;

    document.getElementById('wizGoMulti').addEventListener('click', function () {
      try { sessionStorage.setItem('kael-brst-multi', JSON.stringify(results.map(function (b) { return b.id; }))); } catch (e) {}
      window.location.href = 'solicitud-multiple.html';
    });
    document.getElementById('wizReset').addEventListener('click', function () {
      step = 0; answers = {}; render();
    });
  }

  function render() {
    renderBars();
    if (step >= QUESTIONS.length) renderResult();
    else renderQuestion();
  }

  render();
})();
