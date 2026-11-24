(function () {
  var Q = window.QUESTIONS, L = ['أ', 'ب', 'ج', 'د'];
  var COLORS = [['#1f6fd1', 'أزرق'], ['#14877a', 'أخضر مزرق'], ['#7a3fa0', 'بنفسجي'], ['#c23b3b', 'أحمر'], ['#d9731a', 'برتقالي']];
  var FRAMES = [['dashed', 'منقط'], ['solid', 'خط واحد'], ['double', 'خط مزدوج'], ['none', 'بدون إطار']];
  var D = { name: '', phone: '', series: '', color: COLORS[0][0], frame: 'dashed', mark: true };
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
  function thumb(p) { return '<div class="fit crop" data-crop="0.6">' + '<div class="scale">' + (p.prev === 's' ? summaryPage(D) : questionPage(D, 0)) + '</div></div>'; }
  function card(p) {
    var inCart = cart.indexOf(p.id) >= 0;
    return '<div class="pc">' + thumb(p) + '<div class="tags"><span>' + p.grade + '</span><span>' + p.kind + '</span><span class="dk">نموذج</span></div><h4>' + p.title + '</h4><div class="meta">' + p.pages + '</div><div class="price">' + p.price + ' ج <small>سعر تجريبي</small></div><div class="pbtns"><button class="btn" data-add="' + p.id + '">' + (inCart ? 'في السلة' : 'أضف إلى السلة') + '</button><a class="btn y" href="' + p.to + '">صمّم نسختك</a></div></div>';
  }
  function top(d, sub) {
    return '<div class="top"><div class="grade">' + sub + '</div><div class="series">' + esc(d.series.trim() || 'سلسلة المراجعة') + '</div></div>';
  }
  function bottom(d, n) {
    return '<div class="bottom"><div class="phone" dir="ltr">' + esc(d.phone.trim() || '01000000000') + '</div><div class="pg">' + n + '</div><div class="nm">' + esc(d.name.trim() || 'اسم المدرس') + '</div></div>';
  }
  function wm(d) {
    if (!d.mark) return '';
    var n = esc(d.name.trim() || 'اسم المدرس');
    return '<div class="wm"><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span></div>';
  }
  function frame(d) { return 'f-' + d.frame; }
  function pageOpen(d) { return '<div class="page" style="--c:' + d.color + '">'; }

  function summaryPage(d) {
    var cards = LAWS.map(function (l, i) {
      return '<div class="card"><div class="tag"><span class="hex">' + (i + 1) + '</span>' + l[0] + '</div><div class="formula" dir="ltr">' + mx(l[1]) + '</div><div class="ctext">' + l[2] + '</div><div class="ex"><b>فمثلًا:</b><div dir="ltr">' + mx(l[3]) + '</div></div></div>';
    }).join('');
    return pageOpen(d) + top(d, 'الصف الثالث الإعدادي، الفصل الدراسي الأول') + '<div class="pbody"><div class="unit"><span>ملخص الوحدة الأولى</span></div><div class="wrap ' + frame(d) + '"><div class="h2">قوانين الأسس في الأعداد الحقيقية</div><div class="laws">' + cards + '</div><div class="note"><span class="note-t">لاحظ أن</span>الأساس لا يساوي صفرًا عند القسمة، وهذه القوانين تعمل لما يكون الأساس عددًا حقيقيًا غير صفري.</div></div></div>' + wm(d) + bottom(d, 1) + '</div>';
  }
  function questionPage(d, i, pgNum) {
    var q = Q[i];
    var opts = q.o.map(function (o, k) { return '<div class="opt"><span class="lt">' + L[k] + '</span><span class="ot">' + txt(o) + '</span></div>'; }).join('');
    return pageOpen(d) + top(d, 'الصف الثالث الإعدادي، بنك أسئلة الأسس') + '<div class="pbody"><div class="qwrap ' + frame(d) + '"><div class="qhead"><span class="hex big">' + (i + 1) + '</span><span class="qof">السؤال ' + (i + 1) + ' من ' + Q.length + '</span></div><div class="qtext">' + txt(q.t) + '</div><div class="opts">' + opts + '</div><div class="hint"><span class="note-t">فكّر</span>' + esc(q.h) + '</div><div class="lines"><div class="lbl">اكتب خطوات الحل:</div><i></i><i></i><i></i><i></i></div></div></div>' + wm(d) + bottom(d, pgNum || i + 1) + '</div>';
  }
  function answersPage(d, from, to, pgNum) {
    var rows = '';
    for (var i = from; i < to; i++) rows += '<div class="ans"><b>' + (i + 1) + ') ' + L[Q[i].a] + '</b> ' + txt(Q[i].s) + '</div>';
    return pageOpen(d) + top(d, 'نموذج الإجابة') + '<div class="pbody"><div class="unit"><span>إجابات بنك الأسئلة</span></div><div class="wrap ' + frame(d) + '"><div class="anslist">' + rows + '</div></div></div>' + wm(d) + bottom(d, pgNum) + '</div>';
  }

  function fitAll() {
    document.querySelectorAll('.fit').forEach(function (el) {
      var s = Math.min(1, el.clientWidth / 800);
      el.style.height = (1131 * s * (parseFloat(el.dataset.crop) || 1)) + 'px';
      el.firstElementChild.style.transform = 'scale(' + s + ')';
    });
  }
  window.addEventListener('resize', fitAll);
  function fitBox(html) { return '<div class="fit"><div class="scale">' + html + '</div></div>'; }

  function printPages(html) {
    $('#print-area').innerHTML = html;
    document.body.classList.add('printing');
    setTimeout(function () { window.print(); }, 50);
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing'); });

  function controls() {
    return '<div class="panel"><h3>بياناتك</h3>' +
      '<label>الاسم<input data-k="name" value="' + esc(D.name) + '" placeholder="مثلا: م/ أحمد علي"></label>' +
      '<label>الرقم<input data-k="phone" dir="ltr" inputmode="tel" value="' + esc(D.phone) + '" placeholder="01xxxxxxxxx"></label>' +
      '<label>اسم السلسلة<input data-k="series" value="' + esc(D.series) + '" placeholder="سلسلة المراجعة"></label>' +
      '<div class="lab">اللون</div><div class="pick">' + COLORS.map(function (c) { return '<button type="button" class="sw" data-color="' + c[0] + '" aria-label="' + c[1] + '" aria-pressed="' + (c[0] === D.color) + '" style="background:' + c[0] + '"></button>'; }).join('') + '<label class="custom">لون آخر<input type="color" data-k="color" value="' + D.color + '"></label></div>' +
      '<div class="lab">الإطار</div><div class="pick">' + FRAMES.map(function (f) { return '<button type="button" class="chip" data-frame="' + f[0] + '" aria-pressed="' + (f[0] === D.frame) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">علامة الاسم على الصفحة</div><div class="pick"><button type="button" class="chip" data-mark="1" aria-pressed="' + D.mark + '">ظاهرة</button><button type="button" class="chip" data-mark="0" aria-pressed="' + !D.mark + '">مخفية</button></div></div>';
  }
  function bindControls(root, redraw) {
    root.querySelectorAll('input[data-k]').forEach(function (i) { i.addEventListener('input', function () { D[i.dataset.k] = i.value; save(); redraw(false); }); });
    root.querySelectorAll('[data-color]').forEach(function (b) { b.onclick = function () { D.color = b.dataset.color; save(); redraw(true); }; });
    root.querySelectorAll('[data-frame]').forEach(function (b) { b.onclick = function () { D.frame = b.dataset.frame; save(); redraw(true); }; });
    root.querySelectorAll('[data-mark]').forEach(function (b) { b.onclick = function () { D.mark = b.dataset.mark === '1'; save(); redraw(true); }; });
  }

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
      return '<section class="page-s"><h2>السلة</h2>' + (items.length ? '<div class="panelw">' + items.map(function (p) { return '<div class="ci"><span>' + p.title + '</span><span>' + p.price + ' ج</span><button class="chip" data-rm="' + p.id + '">حذف</button></div>'; }).join('') + '<div class="ci tot"><span>الإجمالي' + (sum === BUNDLE ? ' (سعر الباقة)' : '') + '</span><span>' + sum + ' ج</span><span></span></div><p class="sub">الطلب والدفع غير مفعّلين في النموذج التجريبي. الأسعار للشكل فقط.</p><button class="btn y dis">اطلب الآن</button></div>' : '<p class="sub">السلة فاضية.</p><a class="btn y" href="#/store">روح للمتجر</a>') + '</section>';
    },
    orders: function () {
      return '<section class="page-s"><h2>الطلبات والملفات</h2><div class="panelw"><p class="sub">مفيش طلبات لسه. هنا هتلاقي ملفاتك بعد ما تطلب.</p><a class="btn y" href="#/store">روح للمتجر</a></div></section>';
    },
    account: function () {
      return '<section class="page-s"><h2>حسابك</h2><div class="panelw"><p class="sub">الحسابات غير مفعّلة في النموذج التجريبي. بياناتك اللي بتكتبها في التصميم بتتحفظ على جهازك بس.</p><a class="btn y" href="#/editor">صمّم مذكرتك</a></div></section>';
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
      $('#vp').innerHTML = fitBox(questionPage(D, p)); fitAll();
      $('#rv').onclick = function () { var s = $('#sol'); s.hidden = !s.hidden; this.textContent = s.hidden ? 'أظهر الحل' : 'أخفِ الحل'; };
    } };
  }

  function allPrint() {
    var h = '';
    for (var i = 0; i < Q.length; i++) h += questionPage(D, i, i + 1);
    for (var j = 0; j < Q.length; j += 10) h += answersPage(D, j, Math.min(Q.length, j + 10), Q.length + 1 + j / 10);
    return h;
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, '') || '', parts = h.split('/'), app = $('#app'), name = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === name || (name === 's' || name === 'q') && a.dataset.nav === 'bank'); });
    window.scrollTo(0, 0);
    if (name === 'print') { $('#print-area').innerHTML = allPrint(); document.body.classList.add('printing'); return; }
    if (name === 'q' || name === 's') { var v = viewer(name, parseInt(parts[1], 10) || 1); app.innerHTML = v.html; v.after(); return; }
    if (!views[name]) name = 'home';
    app.innerHTML = views[name]();
    if (name === 'editor') {
      var tab = 's';
      var draw = function (full) {
        if (full) { $('#ctl').innerHTML = controls(); bindControls($('#ctl'), draw); }
        $('#pv').innerHTML = fitBox(tab === 's' ? summaryPage(D) : questionPage(D, 0)); fitAll();
      };
      $('#ctl').innerHTML = controls(); bindControls($('#ctl'), draw); draw(false);
      document.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); draw(false); }; });
      $('#pr').onclick = function () { printPages(summaryPage(D) + questionPage(D, 0, 2)); };
    }
    if (name === 'bank') $('#prall').onclick = function () { printPages(allPrint()); };
    document.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function () { var id = b.dataset.add; if (cart.indexOf(id) < 0) cart.push(id); saveCart(); b.textContent = 'في السلة'; }; });
    document.querySelectorAll('[data-bundle]').forEach(function (b) { b.onclick = function () { PRODUCTS.forEach(function (p) { if (cart.indexOf(p.id) < 0) cart.push(p.id); }); saveCart(); location.hash = '#/cart'; }; });
    document.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { cart = cart.filter(function (x) { return x !== b.dataset.rm; }); saveCart(); route(); }; });
    fitAll();
  }
  $('#dk').onclick = function () { document.body.classList.toggle('dark'); };
  saveCart();
  window.addEventListener('hashchange', route);
  route();
})();
