(function () {
  var Q = window.QUESTIONS, L = ['أ', 'ب', 'ج', 'د'];
  var COLORS = [['#1f6fd1', 'أزرق'], ['#14877a', 'أخضر مزرق'], ['#7a3fa0', 'بنفسجي'], ['#c23b3b', 'أحمر'], ['#d9731a', 'برتقالي']];
  var FRAMES = [['dashed', 'منقط'], ['solid', 'خط واحد'], ['double', 'خط مزدوج'], ['none', 'بدون إطار']];
  var D = { name: '', phone: '', series: '', color: COLORS[0][0], frame: 'dashed', mark: true, shape: 'a4', qbox: 'full', solve: 'lines', round: 14, fcol: '', qbg: '', qtc: '', occ: '', logo: '', font: 'Cairo' };
  try { Object.assign(D, JSON.parse(localStorage.getItem('masarak') || '{}')); } catch (e) {}
  var save = function () { try { localStorage.setItem('masarak', JSON.stringify(D)); } catch (e) {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

  function mx(s) {
    s = s.replace(/-/g, '\u2212');
    s = s.replace(/\^\(([^)]+)\)|\^(\u2212?[0-9a-z]+)/g, function (_, a, b) { return '<sup>' + (a || b) + '</sup>'; });
    s = s.replace(/\[([^|\]]+)\|([^\]]+)\]/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
    return s;
  }
  function txt(s) {
    if (s.indexOf('{{') < 0) return /[\u0600-\u06FF]/.test(s) ? esc(s) : '<span dir="ltr" class="m">' + mx(esc(s)) + '</span>';
    return esc(s).replace(/\{\{(.+?)\}\}/g, function (_, e) { return '<span dir="ltr" class="m">' + mx(e) + '</span>'; });
  }
  var LAWS = [
    ['ضرب قوتين لهما نفس الأساس', 'a^m × a^n = a^(m+n)', 'عند ضرب قوتين لهما نفس الأساس نجمع الأسس.', '5^2 × 5^3 = 5^(2+3) = 5^5'],
    ['قسمة قوتين لهما نفس الأساس', 'a^m ÷ a^n = a^(m-n)', 'عند القسمة نطرح الأسس. الأساس لا يساوي صفرًا.', '7^6 ÷ 7^2 = 7^(6-2) = 7^4'],
    ['قوة حاصل ضرب عددين', '(a × b)^m = a^m × b^m', 'الأس يوزّع على كل عامل في الضرب.', '(2 × 5)^3 = 2^3 × 5^3'],
    ['قوة خارج قسمة عددين', '([a|b])^m = [a^m|b^m]', 'الأس يوزّع على البسط والمقام. المقام لا يساوي صفرًا.', '([3|4])^2 = [3^2|4^2] = [9|16]'],
    ['قوة القوة', '(a^m)^n = a^(m×n)', 'لإيجاد قوة القوة نضرب الأسس.', '(3^2)^4 = 3^(2×4) = 3^8'],
    ['قوة حاصل ضرب قوتين', '(a^m × b)^k = a^(m×k) × b^k', 'نوزّع الأس الخارجي على كل عامل ثم نضرب الأسس.', '(2^3 × 3)^2 = 2^6 × 3^2']
  ];


  var PRODUCTS = [
    { id: 'sum', title: 'ملخص قوانين الأسس', grade: 'تالتة إعدادي', kind: 'ملخص', pages: '١ صفحة', price: 40, prev: 's', to: '#/editor' },
    { id: 'bank', title: 'بنك أسئلة الأسس والجذور', grade: 'تالتة إعدادي', kind: 'بنك أسئلة', pages: Q.length + ' سؤال، سؤال في كل صفحة، مع نموذج الإجابة', price: 120, prev: 'q', to: '#/bank' }
  ];
  var cart = []; try { cart = JSON.parse(localStorage.getItem('masarak_cart') || '[]'); } catch (e) {}
  var saveCart = function () { try { localStorage.setItem('masarak_cart', JSON.stringify(cart)); } catch (e) {} $('#cc').textContent = cart.length; };
  var BUNDLE = 130;
  function dims(kind, d) { return kind === 'q' && d.shape === 'slide' ? [1120, 630] : [800, 1131]; }
  function thumb(p) { var k = p.prev === 's' ? 's' : 'q', w = dims(k, D); return '<div class="fit crop" data-crop="' + (k === 's' ? 0.6 : (w[0] === 1120 ? 1 : 0.6)) + '" data-w="' + w[0] + '" data-h="' + w[1] + '"><div class="scale" style="width:' + w[0] + 'px">' + (k === 's' ? summaryPage(D) : questionPage(D, 0)) + '</div></div>'; }
  function card(p) {
    var inCart = cart.indexOf(p.id) >= 0;
    return '<div class="pc">' + thumb(p) + '<div class="tags"><span>' + p.grade + '</span><span>' + p.kind + '</span><span class="dk">نموذج</span></div><h4>' + p.title + '</h4><div class="meta">' + p.pages + '</div><div class="price">' + p.price + ' ج <small>سعر تجريبي</small></div><div class="pbtns"><button class="btn" data-add="' + p.id + '">' + (inCart ? 'في السلة' : 'أضف إلى السلة') + '</button><a class="btn y" href="' + p.to + '">صمّم نسختك</a></div></div>';
  }
  function top(d, sub) {
    return '<div class="top"><div class="grade">' + sub + '</div><div class="series">' + esc(d.series.trim() || 'سلسلة المراجعة') + '</div></div>';
  }
  function bottom(d, n) {
    return '<div class="bottom">' + (d.logo ? '<img class="logo" alt="" src="' + d.logo + '">' : '') + '<div class="phone" dir="ltr">' + esc(d.phone.trim() || '01000000000') + '</div><div class="pg">' + n + '</div><div class="nm">' + esc(d.name.trim() || 'اسم المدرس') + '</div></div>';
  }
  function wm(d) {
    if (!d.mark) return '';
    var n = esc(d.name.trim() || 'اسم المدرس');
    return '<div class="wm"><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span></div>';
  }
  function frame(d) { return 'f-' + d.frame; }
  function cv(n, v) { return v ? ';--' + n + ':' + v : ''; }
  function pageOpen(d, kind) {
    var cls = 'page' + (kind === 'q' && d.shape === 'slide' ? ' slide' : '') + ' qb-' + (d.qbox || 'full') + ' sv-' + (d.solve || 'lines');
    return '<div class="' + cls + '" style="--c:' + d.color + ';--ff:' + (d.font || 'Cairo') + ';--r:' + (+d.round >= 0 ? +d.round : 14) + 'px' + cv('fc', d.fcol) + cv('qb', d.qbg) + cv('qc', d.qtc) + cv('oc', d.occ) + '">';
  }

  function summaryPage(d) {
    var cards = LAWS.map(function (l, i) {
      return '<div class="card"><div class="tag"><span class="hex">' + (i + 1) + '</span>' + l[0] + '</div><div class="formula" dir="ltr">' + mx(l[1]) + '</div><div class="ctext">' + l[2] + '</div><div class="ex"><b>فمثلًا:</b><div dir="ltr">' + mx(l[3]) + '</div></div></div>';
    }).join('');
    return pageOpen(d) + top(d, 'الصف الثالث الإعدادي، الفصل الدراسي الأول') + '<div class="pbody"><div class="unit"><span>ملخص الوحدة الأولى</span></div><div class="wrap ' + frame(d) + '"><div class="h2">قوانين الأسس في الأعداد الحقيقية</div><div class="laws">' + cards + '</div><div class="note"><span class="note-t">لاحظ أن</span>الأساس لا يساوي صفرًا عند القسمة، وهذه القوانين تعمل لما يكون الأساس عددًا حقيقيًا غير صفري.</div></div></div>' + wm(d) + bottom(d, 1) + '</div>';
  }
  function questionPage(d, i, pgNum) {
    var q = Q[i];
    var opts = q.o.map(function (o, k) { return '<div class="opt"><span class="lt">' + L[k] + '</span><span class="ot">' + txt(o) + '</span></div>'; }).join('');
    return pageOpen(d, 'q') + top(d, 'الصف الثالث الإعدادي، بنك أسئلة الأسس') + '<div class="pbody"><div class="qwrap ' + frame(d) + '"><div class="qhead"><span class="hex big">' + (i + 1) + '</span><span class="qof">السؤال ' + (i + 1) + ' من ' + Q.length + '</span></div><div class="qtext">' + txt(q.t) + '</div><div class="opts">' + opts + '</div><div class="hint"><span class="note-t">فكّر</span>' + esc(q.h) + '</div>' + (d.solve === 'none' ? '' : '<div class="lines"><div class="lbl">اكتب خطوات الحل:</div>' + (d.solve === 'grid' ? '<div class="gridbox"></div>' : '<i></i><i></i><i></i><i></i>') + '</div>') + '</div></div>' + wm(d) + bottom(d, pgNum || i + 1) + '</div>';
  }
  function answersPage(d, from, to, pgNum) {
    var rows = '';
    for (var i = from; i < to; i++) rows += '<div class="ans"><b>' + (i + 1) + ') ' + L[Q[i].a] + '</b> ' + txt(Q[i].s) + '</div>';
    return pageOpen(d) + top(d, 'نموذج الإجابة') + '<div class="pbody"><div class="unit"><span>إجابات بنك الأسئلة</span></div><div class="wrap ' + frame(d) + '"><div class="anslist">' + rows + '</div></div></div>' + wm(d) + bottom(d, pgNum) + '</div>';
  }

  function fitAll() {
    document.querySelectorAll('.fit').forEach(function (el) {
      var W = +el.dataset.w || 800, H = +el.dataset.h || 1131, s = Math.min(1, el.clientWidth / W);
      el.style.height = (H * s * (parseFloat(el.dataset.crop) || 1)) + 'px';
      el.firstElementChild.style.transform = 'scale(' + s + ')';
    });
  }
  window.addEventListener('resize', fitAll);
  function fitBox(html, kind, d) { var w = dims(kind || 's', d || D); return '<div class="fit" data-w="' + w[0] + '" data-h="' + w[1] + '"><div class="scale" style="width:' + w[0] + 'px">' + html + '</div></div>'; }

  function printPages(html, slide) {
    var st = $('#pgsty'); if (!st) { st = document.createElement('style'); st.id = 'pgsty'; document.head.appendChild(st); }
    st.textContent = slide ? '@page{size:1120px 630px;margin:0}' : '@page{size:A4;margin:0}';
    $('#print-area').innerHTML = html;
    document.body.classList.add('printing');
    setTimeout(function () { window.print(); }, 50);
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing'); });

  var SW = ['#1f6fd1', '#14877a', '#7a3fa0', '#c23b3b', '#d9731a', '#14213d', '#ffffff', '#fff3b0', '#dfe9f9'];
  function swatchRow(k, label) {
    return '<div class="lab">' + label + '</div><div class="pick"><button type="button" class="chip" data-ck="' + k + '" data-v="" aria-pressed="' + !D[k] + '">تلقائي</button>' + SW.map(function (c) { return '<button type="button" class="sw sm" data-ck="' + k + '" data-v="' + c + '" aria-label="' + c + '" aria-pressed="' + (D[k] === c) + '" style="background:' + c + '"></button>'; }).join('') + '</div>';
  }
  function controls() {
    return '<div class="panel"><h3>بياناتك</h3>' +
      '<label>الاسم<input data-k="name" value="' + esc(D.name) + '" placeholder="مثلا: م/ أحمد علي"></label>' +
      '<label>الرقم<input data-k="phone" dir="ltr" inputmode="tel" value="' + esc(D.phone) + '" placeholder="01xxxxxxxxx"></label>' +
      '<label>اسم السلسلة<input data-k="series" value="' + esc(D.series) + '" placeholder="سلسلة المراجعة"></label>' +
      '<div class="lab">اللون</div><div class="pick">' + COLORS.map(function (c) { return '<button type="button" class="sw" data-color="' + c[0] + '" aria-label="' + c[1] + '" aria-pressed="' + (c[0] === D.color) + '" style="background:' + c[0] + '"></button>'; }).join('') + '<label class="custom">لون آخر<input type="color" data-k="color" value="' + D.color + '"></label></div>' +
      '<div class="lab">الإطار</div><div class="pick">' + FRAMES.map(function (f) { return '<button type="button" class="chip" data-frame="' + f[0] + '" aria-pressed="' + (f[0] === D.frame) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">نوع الخط</div><div class="pick">' + ['Cairo', 'Tajawal', 'Almarai', 'Amiri'].map(function (f) { return '<button type="button" class="chip" data-opt="font" data-v="' + f + '" style="font-family:' + f + '" aria-pressed="' + (D.font === f) + '">' + ({ Cairo: 'كايرو', Tajawal: 'تجوال', Almarai: 'المراعي', Amiri: 'أميري' })[f] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">شكل الملف</div><div class="pick"><button type="button" class="chip" data-opt="shape" data-v="a4" aria-pressed="' + (D.shape === 'a4') + '">بوكليت A4</button><button type="button" class="chip" data-opt="shape" data-v="slide" aria-pressed="' + (D.shape === 'slide') + '">سلايد (أسئلة)</button></div>' +
      '<div class="lab">شكل مربع السؤال</div><div class="pick">' + [['full', 'كامل'], ['dashed', 'منقط'], ['none', 'بدون']].map(function (o) { return '<button type="button" class="chip" data-opt="qbox" data-v="' + o[0] + '" aria-pressed="' + (D.qbox === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">مربع الحل</div><div class="pick">' + [['lines', 'سطور'], ['grid', 'مربعات'], ['none', 'بدون']].map(function (o) { return '<button type="button" class="chip" data-opt="solve" data-v="' + o[0] + '" aria-pressed="' + (D.solve === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<label>استدارة الأركان<input type="range" min="0" max="30" data-k="round" value="' + D.round + '"></label>' +
      swatchRow('fcol', 'لون الإطار') + swatchRow('qbg', 'لون مربع السؤال') + swatchRow('qtc', 'لون خط السؤال') + swatchRow('occ', 'لون الاختيارات') +
      '<div class="lab">اللوجو بتاعك</div><div class="pick"><label class="chip up">ارفع صورة<input type="file" accept="image/*" id="logoin" hidden></label>' + (D.logo ? '<button type="button" class="chip" id="logorm">شيل اللوجو</button>' : '') + '</div>' +
      '<div class="lab">علامة الاسم على الصفحة</div><div class="pick"><button type="button" class="chip" data-mark="1" aria-pressed="' + D.mark + '">ظاهرة</button><button type="button" class="chip" data-mark="0" aria-pressed="' + !D.mark + '">مخفية</button></div></div>';
  }
  function bindControls(root, redraw) {
    root.querySelectorAll('input[data-k]').forEach(function (i) { i.addEventListener('input', function () { D[i.dataset.k] = i.value; save(); redraw(false); }); });
    root.querySelectorAll('[data-color]').forEach(function (b) { b.onclick = function () { D.color = b.dataset.color; save(); redraw(true); }; });
    root.querySelectorAll('[data-frame]').forEach(function (b) { b.onclick = function () { D.frame = b.dataset.frame; save(); redraw(true); }; });
    root.querySelectorAll('[data-ck]').forEach(function (b) { b.onclick = function () { D[b.dataset.ck] = b.dataset.v; save(); redraw(true); }; });
    root.querySelectorAll('[data-opt]').forEach(function (b) { b.onclick = function () { D[b.dataset.opt] = b.dataset.v; save(); if (b.dataset.opt === 'shape') { var t = document.querySelector('[data-tab="q"]'); if (t) t.click(); } redraw(true); }; });
    var lg = root.querySelector('#logoin'); if (lg) lg.onchange = function () { var f = lg.files[0]; if (!f || f.size > 400000) { alert('الصورة لازم تكون أقل من 400 كيلوبايت'); return; } var r = new FileReader(); r.onload = function () { D.logo = r.result; save(); redraw(true); }; r.readAsDataURL(f); };
    var lr = root.querySelector('#logorm'); if (lr) lr.onclick = function () { D.logo = ''; save(); redraw(true); };
    root.querySelectorAll('[data-mark]').forEach(function (b) { b.onclick = function () { D.mark = b.dataset.mark === '1'; save(); redraw(true); }; });
  }

  var USER = {}; try { USER = JSON.parse(localStorage.getItem('masarak_user') || '{}'); } catch (e) {}
  var ORDERS = []; try { ORDERS = JSON.parse(localStorage.getItem('masarak_orders') || '[]'); } catch (e) {}
  function cartItems() { return cart.map(function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean); }
  function cartSum(items) { var t = items.reduce(function (a, p) { return a + p.price; }, 0); return items.length === PRODUCTS.length ? BUNDLE : t; }
  var views = {
    home: function () {
      return '<section class="hero"><div class="hero-t"><h1>مذكرتك <em>باسمك</em> وعلامتك</h1><p>أسئلة وملخصات جاهزة لكل مرحلة. اكتب اسمك ورقمك، اختار اللون والإطار، وشوف الصفحة بتتغير قدامك. بعدها اطبعها بالـ PDF جاهزة للطلاب.</p><div class="cta"><a class="btn y" href="#/editor">صمّم مذكرتك</a><a class="btn" href="#/s/1">جرّب ١٠ أسئلة مجانًا</a></div><div class="ver">النموذج الحالي: الصف الثالث الإعدادي، الترم الأول</div></div><div class="hero-p">' + fitBox(summaryPage(D)) + '</div></section>' +
        '<section class="steps"><div><b>١</b><h4>اكتب بياناتك</h4><p>الاسم والرقم واسم السلسلة.</p></div><div><b>٢</b><h4>اختار الشكل</h4><p>لون وإطار وعلامة اسم.</p></div><div><b>٣</b><h4>اطبع واستلم</h4><p>صفحات PDF باسمك.</p></div></section>' +
        '<section class="feat"><div class="fc"><h4>ملخصات منظمة</h4><p>قوانين وأمثلة في كروت ملونة مرتبة.</p></div><div class="fc"><h4>بنك أسئلة</h4><p>سؤال في كل صفحة، معه تلميح ومساحة للحل.</p></div><div class="fc"><h4>نموذج إجابة</h4><p>صفحة حل مرتبة لكل مجموعة أسئلة.</p></div><div class="fc"><h4>محتوى أصلي</h4><p>كل الأسئلة والشرح من تأليفنا.</p></div></section>';
    },
    store: function () {
      return '<section class="page-s"><div class="shero"><h2>المتجر</h2><p>اختار الملف وشوف عينة منه، وبعدين صمّم نسختك: اسمك ورقمك والإطار بتاعك وألوانك.</p><div class="yb"><b>جرّب قبل ما تدفع:</b> اختار أي ملف وصمّم نسختك، ودوس «جرّب عينة مجانًا». عينة من ١٠ أسئلة بتوصلك بالتصميم اللي اخترته.</div><div class="st4"><div class="on"><b>١</b>اختار الملف</div><div><b>٢</b>شوف العينة</div><div><b>٣</b>صمّم نسختك</div><div><b>٤</b>اطلب</div></div></div>' +
        '<div class="chips"><span class="chip on">كل الصفوف</span><span class="chip off">أولى إعدادي (قريبًا)</span><span class="chip off">تانية إعدادي (قريبًا)</span><span class="chip on">تالتة إعدادي</span></div>' +
        '<div class="bundle"><span class="bd">الأوفر</span><h3>الباقة الكاملة</h3><p>ملخص الأسس + بنك الأسئلة مع نموذج الإجابة</p><div class="bl"><div><b>ملخص</b> قوانين الأسس</div><div><b>بنك أسئلة</b> الأسس والجذور</div></div><div class="price">' + BUNDLE + ' ج <small>بدل ' + (PRODUCTS[0].price + PRODUCTS[1].price) + ' ج، سعر تجريبي</small></div><button class="btn y" data-bundle="1">أضف الباقة للسلة</button></div>' +
        '<h3 class="sec">تالتة إعدادي <small>' + (PRODUCTS.length + 1) + ' ملفات</small></h3><div class="pgrid">' + PRODUCTS.map(card).join('') +
        '<div class="pc"><div class="free"><b>١٠</b><span>أسئلة</span></div><div class="tags"><span>تالتة إعدادي</span><span>عينة</span><span class="gr">مجاني</span></div><h4>عينة ١٠ أسئلة</h4><div class="meta">تجربة الشكل قبل الملف الكامل</div><div class="price">٠ ج</div><div class="pbtns"><a class="btn y" href="#/s/1">جرّب عينة مجانًا</a></div></div></div>' +
        '<h3 class="sec">أولى وتانية إعدادي <small>قريبًا</small></h3><p class="sub">هنضيفهم بعد اعتماد نموذج تالتة إعدادي.</p></section>';
    },
    cart: function () {
      var items = cart.map(function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
      var sum = items.reduce(function (t, p) { return t + p.price; }, 0);
      if (items.length === PRODUCTS.length && items.length > 1) sum = BUNDLE;
      return '<section class="page-s"><h2>السلة</h2>' + (items.length ? '<div class="panelw">' + items.map(function (p) { return '<div class="ci"><span>' + p.title + '</span><span>' + p.price + ' ج</span><button class="chip" data-rm="' + p.id + '">حذف</button></div>'; }).join('') + '<div class="ci tot"><span>الإجمالي' + (sum === BUNDLE ? ' (سعر الباقة)' : '') + '</span><span>' + sum + ' ج</span><span></span></div><p class="sub">الأسعار تجريبية للشكل فقط.</p><a class="btn y" href="#/checkout">كمّل للطلب</a></div>' : '<p class="sub">السلة فاضية.</p><a class="btn y" href="#/store">روح للمتجر</a>') + '</section>';
    },
    checkout: function () {
      var items = cartItems(), sum = cartSum(items);
      if (!items.length) return '<section class="page-s"><h2>إتمام الطلب</h2><p class="sub">السلة فاضية.</p><a class="btn y" href="#/store">روح للمتجر</a></section>';
      var u = USER;
      return '<section class="page-s"><h2>إتمام الطلب</h2><div class="co"><form id="cof" class="panelw"><h3>بيانات الطلب</h3>' +
        '<label>الاسم<input name="n" required value="' + esc(u.name || D.name) + '"></label>' +
        '<label>رقم الموبايل<input name="p" required dir="ltr" inputmode="tel" value="' + esc(u.phone || D.phone) + '"></label>' +
        '<div class="lab">طريقة الدفع</div><div class="pick"><label class="chip"><input type="radio" name="m" value="محفظة إلكترونية" checked> محفظة إلكترونية</label><label class="chip"><input type="radio" name="m" value="تحويل بنكي أو إنستا"> تحويل بنكي أو إنستا</label></div>' +
        '<div class="yb2">رقم التحويل هيتحط هنا قبل الإطلاق الحقيقي. في النموذج التجريبي مفيش دفع فعلي.</div>' +
        '<label>الرقم اللي هتحوّل منه<input name="f" required dir="ltr" inputmode="tel"></label>' +
        '<label>طريقة استلام الملفات<select name="d"><option>رابط تحميل في صفحة الطلبات</option><option>على واتساب</option></select></label>' +
        '<label>ملاحظات<textarea name="t" rows="3"></textarea></label><button class="btn y" type="submit">ابعت الطلب</button></form>' +
        '<aside class="panelw"><h3>ملخص طلبك</h3>' + items.map(function (p) { return '<div class="ci"><span>' + p.title + '</span><span>' + p.price + ' ج</span></div>'; }).join('') + '<div class="ci tot"><span>الإجمالي</span><span>' + sum + ' ج</span></div><hr><div class="sm2"><div>الاسم على الملف: <b>' + esc(D.name || 'اسم المدرس') + '</b></div><div>الشكل: <b>' + (D.shape === 'slide' ? 'سلايد' : 'بوكليت A4') + '</b></div><div>مربع السؤال: <b>' + ({ full: 'كامل', dashed: 'منقط', none: 'بدون' })[D.qbox] + '</b></div><div>الاستدارة: <b>' + D.round + '</b></div><a href="#/editor">عدّل التصميم</a></div></aside></div></section>';
    },
    orders: function () {
      var os = ORDERS;
      if (!os.length) return '<section class="page-s"><h2>الطلبات والملفات</h2><div class="panelw"><p class="sub">مفيش طلبات لسه. هنا هتلاقي ملفاتك بعد ما تطلب.</p><a class="btn y" href="#/store">روح للمتجر</a></div></section>';
      var ST = ['تم استلام الطلب', 'مراجعة التحويل', 'الملف جاهز'];
      return '<section class="page-s"><h2>الطلبات والملفات</h2>' + os.map(function (o) {
        return '<div class="panelw ord"><div class="oh"><b>' + o.id + '</b><span class="badge s' + o.st + '">' + ST[o.st] + '</span><small>' + o.date + '</small></div><div class="steps3">' + ST.map(function (t, i) { return '<span class="' + (i <= o.st ? 'on' : '') + '">' + t + '</span>'; }).join('') + '</div>' +
          o.items.map(function (it) { return '<div class="ci"><span>' + it.t + '</span>' + (o.st === 2 ? '<button class="btn y" data-dl="' + o.id + '|' + it.id + '">حمّل PDF</button>' : '<span class="sub">بيتجهز بعد تأكيد التحويل</span>') + '</div>'; }).join('') +
          '<div class="ci tot"><span>الإجمالي · ' + esc(o.pay) + '</span><span>' + o.total + ' ج</span></div>' +
          (o.st < 2 ? '<button class="chip" data-adv="' + o.id + '">تجربة: خلّي الطلب جاهز</button>' : '') + '</div>';
      }).join('') + '<p class="sub">في النموذج التجريبي حالة الطلب بتتغير بزر التجربة. في النسخة الحقيقية بتتغير بعد تأكيد التحويل.</p></section>';
    },
    account: function () {
      if (USER.name) return '<section class="page-s"><h2>حسابك</h2><div class="panelw"><p>أهلًا <b>' + esc(USER.name) + '</b></p><p class="sub">' + esc(USER.phone || '') + ' ' + esc(USER.email || '') + '</p><a class="btn y" href="#/orders">طلباتك وملفاتك</a> <button class="btn" id="lo">تسجيل خروج</button></div></section>';
      return '<section class="page-s"><h2>إنشاء حساب</h2><form id="acf" class="panelw"><p class="sub">النموذج التجريبي بيحفظ بياناتك على جهازك بس. مفيش كلمة سر ولا سيرفر.</p><label>الاسم الكامل<input name="n" required></label><label>رقم الموبايل<input name="p" required dir="ltr" inputmode="tel"></label><label>الإيميل<input name="e" type="email" dir="ltr"></label><button class="btn y" type="submit">إنشاء الحساب</button></form></section>';
    },
    editor: function () {
      return '<section class="page-s"><h2>صمّم مذكرتك</h2><div class="ed"><div id="ctl"></div><div class="prev"><div class="tabs"><button class="chip" data-tab="s" aria-pressed="true">صفحة الملخص</button><button class="chip" data-tab="q" aria-pressed="false">صفحة سؤال</button></div><div id="pv"></div><div class="row"><button class="btn y" id="pr">اطبع أو احفظ PDF</button></div><p class="sub">الطباعة تفتح نافذة المتصفح. اختار "حفظ بصيغة PDF".</p></div></div></section>';
    },
    bank: function () {
      return '<section class="page-s"><h2>بنك الأسئلة</h2><p class="sub">أسئلة الأسس والجذور، الصف الثالث الإعدادي. سؤال في كل صفحة، مع تلميح ومساحة للحل.</p><div class="grid g2">' +
        '<a class="prod" href="#/s/1"><span class="badge g">مجاني</span><h4>عينة ١٠ أسئلة</h4><p>أول ١٠ أسئلة.</p><span class="go">ابدأ</span></a>' +
        '<a class="prod" href="#/q/1"><span class="badge">كامل</span><h4>كل الأسئلة (' + Q.length + ')</h4><p>مع نموذج الإجابة.</p><span class="go">ابدأ</span></a></div>' +
        '<div class="panelw"><h3>طباعة باسمك</h3><p class="sub">اكتب بياناتك في صفحة التصميم، ثم اطبع كل الأسئلة صفحة صفحة، تليها صفحات الإجابة.</p><div class="row"><a class="btn" href="#/editor">عدّل بياناتك</a><button class="btn y" id="prall">اطبع كل الأسئلة PDF</button></div></div></section>';
    }
  };

  function viewer(mode, n) {
    var max = mode === 's' ? 10 : Q.length;
    n = Math.max(1, Math.min(max, n));
    var p = n - 1, state = { shown: false };
    var html = '<section class="page-s"><div class="vh"><a href="#/bank">رجوع</a><span>' + (mode === 's' ? 'العينة المجانية' : 'بنك الأسئلة') + '</span></div><div id="vp"></div><div class="nav"><a class="btn' + (n <= 1 ? ' dis' : '') + '" href="#/' + mode + '/' + (n - 1) + '">السابق</a><button class="btn y" id="rv">أظهر الحل</button><a class="btn' + (n >= max ? ' dis' : '') + '" href="#/' + mode + '/' + (n + 1) + '">التالي</a></div><div id="sol" class="sol" hidden><b>الإجابة: ' + L[Q[p].a] + '</b><div>' + txt(Q[p].s) + '</div></div><div class="dots">' + Array.from({ length: max }, function (_, i) { return '<a class="' + (i === p ? 'on' : '') + '" href="#/' + mode + '/' + (i + 1) + '">' + (i + 1) + '</a>'; }).join('') + '</div></section>';
    return { html: html, after: function () {
      $('#vp').innerHTML = fitBox(questionPage(D, p), 'q'); fitAll();
      $('#rv').onclick = function () { var s = $('#sol'); s.hidden = !s.hidden; this.textContent = s.hidden ? 'أظهر الحل' : 'أخفِ الحل'; };
    } };
  }

  function allPrint(D) {
    var h = '';
    for (var i = 0; i < Q.length; i++) h += questionPage(D, i, i + 1);
    if (D.shape === 'slide') return h;
    for (var j = 0; j < Q.length; j += 10) h += answersPage(D, j, Math.min(Q.length, j + 10), Q.length + 1 + j / 10);
    return h;
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, '') || '', parts = h.split('/'), app = $('#app'), name = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === name || (name === 's' || name === 'q') && a.dataset.nav === 'bank'); });
    window.scrollTo(0, 0);
    if (name === 'print') { var st = $('#pgsty') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'pgsty' })); st.textContent = D.shape === 'slide' ? '@page{size:1120px 630px;margin:0}' : '@page{size:A4;margin:0}'; $('#print-area').innerHTML = allPrint(D); document.body.classList.add('printing'); return; }
    if (name === 'q' || name === 's') { var v = viewer(name, parseInt(parts[1], 10) || 1); app.innerHTML = v.html; v.after(); return; }
    if (!views[name]) name = 'home';
    app.innerHTML = views[name]();
    if (name === 'editor') {
      var tab = 's';
      var draw = function (full) {
        if (full) { $('#ctl').innerHTML = controls(); bindControls($('#ctl'), draw); }
        $('#pv').innerHTML = fitBox(tab === 's' ? summaryPage(D) : questionPage(D, 0), tab); fitAll();
      };
      $('#ctl').innerHTML = controls(); bindControls($('#ctl'), draw); draw(false);
      document.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); draw(false); }; });
      $('#pr').onclick = function () { if (tab === 's') printPages(summaryPage(D) + questionPage(D, 0, 2)); else printPages(questionPage(D, 0, 1), D.shape === 'slide'); };
    }
    if (name === 'bank') $('#prall').onclick = function () { printPages(allPrint(D), D.shape === 'slide'); };
    document.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function () { var id = b.dataset.add; if (cart.indexOf(id) < 0) cart.push(id); saveCart(); b.textContent = 'في السلة'; }; });
    document.querySelectorAll('[data-bundle]').forEach(function (b) { b.onclick = function () { PRODUCTS.forEach(function (p) { if (cart.indexOf(p.id) < 0) cart.push(p.id); }); saveCart(); location.hash = '#/cart'; }; });
    document.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { cart = cart.filter(function (x) { return x !== b.dataset.rm; }); saveCart(); route(); }; });
    var cf = $('#cof'); if (cf) cf.onsubmit = function (e) {
      e.preventDefault(); var f = new FormData(cf), items = cartItems();
      var o = { id: 'MS-' + (1000 + ORDERS.length + 1), date: new Date().toLocaleDateString('ar-EG'), st: 1, pay: f.get('m'), total: cartSum(items), items: items.map(function (p) { return { id: p.id, t: p.title }; }), design: JSON.parse(JSON.stringify(D)) };
      ORDERS.unshift(o); localStorage.setItem('masarak_orders', JSON.stringify(ORDERS)); cart = []; saveCart(); location.hash = '#/orders';
    };
    var af = $('#acf'); if (af) af.onsubmit = function (e) { e.preventDefault(); var f = new FormData(af); USER = { name: f.get('n'), phone: f.get('p'), email: f.get('e') }; localStorage.setItem('masarak_user', JSON.stringify(USER)); if (!D.name) { D.name = USER.name; D.phone = USER.phone; save(); } hdr(); route(); };
    var lo = $('#lo'); if (lo) lo.onclick = function () { USER = {}; localStorage.removeItem('masarak_user'); hdr(); route(); };
    document.querySelectorAll('[data-adv]').forEach(function (b) { b.onclick = function () { ORDERS.forEach(function (o) { if (o.id === b.dataset.adv) o.st = Math.min(2, o.st + 1); }); localStorage.setItem('masarak_orders', JSON.stringify(ORDERS)); route(); }; });
    document.querySelectorAll('[data-dl]').forEach(function (b) { b.onclick = function () { var a = b.dataset.dl.split('|'), o = ORDERS.filter(function (x) { return x.id === a[0]; })[0], d = o.design; if (a[1] === 'sum') printPages(summaryPage(d) + questionPage(d, 0, 2), false); else printPages(allPrint(d), d.shape === 'slide'); }; });
    fitAll();
  }
  function hdr() { var a = document.querySelector('.hbtns .acc'); if (a) a.textContent = USER.name ? USER.name.split(' ')[0] : 'إنشاء حساب'; }
  hdr();
  $('#dk').onclick = function () { document.body.classList.toggle('dark'); };
  saveCart();
  window.addEventListener('hashchange', route);
  route();
})();
