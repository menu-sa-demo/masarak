(function () {
  var Q = window.QUESTIONS, L = ['أ', 'ب', 'ج', 'د'];
  var COLORS = [['#1f6fd1', 'أزرق'], ['#14877a', 'أخضر مزرق'], ['#7a3fa0', 'بنفسجي'], ['#c23b3b', 'أحمر'], ['#d9731a', 'برتقالي']];
  var FRAMES = [['dashed', 'منقط'], ['solid', 'خط واحد'], ['double', 'خط مزدوج'], ['none', 'بدون إطار']];
  var D = { name: '', phone: '', series: '', color: COLORS[0][0], frame: 'dashed', mark: true, shape: 'a4', qbox: 'full', solve: 'lines', round: 14, fcol: '', qbg: '', qtc: '', occ: '', logo: '', font: 'Cairo', theme: 'classic' };
  try { Object.assign(D, JSON.parse(localStorage.getItem('masarak') || '{}')); } catch (e) {}
  var tm = /[?&]theme=(\w+)/.exec(location.search); if (tm) D.theme = tm[1];
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
    var n = esc(d.name.trim() || 'اسم المدرس');
    return '<div class="wm"><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span><span>' + n + '</span></div>';
  }
  function frame(d) { return 'f-' + d.frame; }
  function cv(n, v) { return v ? ';--' + n + ':' + v : ''; }
  function pageOpen(d, kind) {
    var cls = 'page th-' + (d.theme || 'classic') + (kind === 'q' && d.shape === 'slide' ? ' slide' : '') + ' qb-' + (d.qbox || 'full') + ' sv-' + (d.solve || 'lines');
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
  var EXS = [
    ['اختصر لأبسط صورة: {{2^3 × 2^4}}', ['{{2^3 × 2^4 = 2^(3+4) = 2^7 = 128}}'], 'اختصر لأبسط صورة: {{5^2 × 5^3}}'],
    ['اختصر: {{(3^2)^3 ÷ 3^4}}', ['{{(3^2)^3 ÷ 3^4 = 3^6 ÷ 3^4}}', '{{= 3^(6-4) = 3^2 = 9}}'], 'اختصر: {{(2^3)^2 ÷ 2^4}}'],
    ['أوجد قيمة x: {{2^(x+1) = 16}}', ['{{2^(x+1) = 2^4}}', 'الأساسات متساوية، إذن الأسس متساوية:', '{{x + 1 = 4}}', '{{x = 3}}'], 'أوجد قيمة x: {{3^(x-1) = 27}}']
  ];
  function examplePage(d, pgNum) {
    var blocks = EXS.map(function (e, i) {
      return '<div class="exb"><div class="exh"><span class="exbadge">مثال ' + (i + 1) + '</span><div class="exq">' + txt(e[0]) + '</div></div><div class="exs"><span class="sol">الحل</span>' + e[1].map(function (l) { return '<div class="sl' + (/^\{\{.*\}\}$/.test(l) ? ' sm' : '') + '">' + txt(l) + '</div>'; }).join('') + '</div><div class="try"><span class="trytag">جرّب بنفسك</span><div class="exq">' + txt(e[2]) + '</div><div class="lines"><i></i><i></i></div></div></div>';
    }).join('');
    return pageOpen(d) + top(d, 'الصف الثالث الإعدادي، أمثلة محلولة') + '<div class="pbody"><div class="unit"><span>أمثلة وتدريب</span></div><div class="wrap ' + frame(d) + '">' + blocks + '</div></div>' + wm(d) + bottom(d, pgNum || 1) + '</div>';
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

  function live(p, u) { return p === 'paid' && (!u || new Date(u).getTime() > Date.now()); }
  function isPaid(k) { return !!(USER && USER.name && live(USER.plan, USER.until)); }
  function daysLeft(u) { return Math.max(0, Math.ceil((new Date(u).getTime() - Date.now()) / 86400000)); }
  function active() { return live(USER.plan, USER.until); }
  function forceOut() { ACCERR = 'انتهى اشتراكك وتم تسجيل خروجك. جدّد الاشتراك وادخل تاني.'; ACCMODE = 'in'; SESS = null; localStorage.removeItem('masarak_sess'); USER = {}; hdr(); location.hash = '#/account'; route(); }
  function checkExpiry() {
    if (!USER || !USER.name || !SESS) return;
    var act = active();
    if (SESS.act && !act) { forceOut(); return; }
    if (!!SESS.act !== act) { SESS.act = act; localStorage.setItem('masarak_sess', JSON.stringify(SESS)); }
    hdr();
  }
  setInterval(function () { if (SESS && USER.name) loadProfile().then(function () { if (/account/.test(location.hash) || !USER.name) route(); }); }, 60000);
  function paywall(k) {
    var old = document.getElementById('pw'); if (old) old.remove();
    var li = !!(USER && USER.name), d = document.createElement('div'); d.id = 'pw';
    d.innerHTML = '<div class="pwb" role="dialog" aria-modal="true"><div class="pwi">🔒</div><h3>' + (k === 'x' ? 'الاختبارات باشتراك منفصل' : 'الميزة دي للمشتركين') + '</h3><p>' + (li ? 'تصفّح واعمل اللي تحبه، لكن التحميل والطباعة بيتفتحوا بعد الاشتراك. اطلب الاشتراك من حسابك وبعد تأكيد التحويل بيتفعّل.' : 'تصفّح واعمل اللي تحبه، لكن التحميل والطباعة للمشتركين بس. سجّل حساب واطلب الاشتراك عشان تفتحهم.') + '</p><div class="pwr"><a class="btn y" href="#/account" id="pwgo">' + (li ? 'شوف الاشتراك' : 'إنشاء حساب') + '</a><button class="btn" id="pwx">مش دلوقتي</button></div></div>';
    document.body.appendChild(d);
    d.onclick = function (e) { if (e.target === d || e.target.id === 'pwx' || e.target.id === 'pwgo') d.remove(); };
  }
  function loadH2C() {
    return new Promise(function (ok, no) {
      if (window.html2canvas) return ok();
      var sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      sc.onload = function () { ok(); }; sc.onerror = function () { no(new Error('load')); }; document.head.appendChild(sc);
    });
  }
  function b64bytes(u) { var b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function makePdf(pages) {
    var enc = new TextEncoder(), parts = [], off = [], len = 0;
    function put(x) { var u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); len += u.length; }
    function obj(n, body) { off[n] = len; put(n + ' 0 obj\n'); put(body); put('\nendobj\n'); }
    put('%PDF-1.4\n');
    var n = pages.length, kids = [];
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    for (var i = 0; i < n; i++) kids.push((3 + i * 3) + ' 0 R');
    obj(2, '<< /Type /Pages /Count ' + n + ' /Kids [' + kids.join(' ') + '] >>');
    pages.forEach(function (p, i) {
      var pg = 3 + i * 3, im = pg + 1, ct = pg + 2, w = (p.w * 0.75).toFixed(2), h = (p.h * 0.75).toFixed(2);
      obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + w + ' ' + h + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
      off[im] = len; put(im + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + p.cw + ' /Height ' + p.ch + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + p.jpg.length + ' >>\nstream\n'); put(p.jpg); put('\nendstream\nendobj\n');
      var c = 'q ' + w + ' 0 0 ' + h + ' 0 0 cm /Im0 Do Q';
      obj(ct, '<< /Length ' + c.length + ' >>\nstream\n' + c + '\nendstream');
    });
    var total = 3 + n * 3, xr = len;
    put('xref\n0 ' + total + '\n0000000000 65535 f \n');
    for (var k = 1; k < total; k++) put(('0000000000' + off[k]).slice(-10) + ' 00000 n \n');
    put('trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }
  function burn(cv, nm) {
    var g = cv.getContext('2d'); g.save(); g.globalAlpha = 0.07; g.fillStyle = '#000'; g.font = 'bold ' + Math.round(cv.width / 22) + 'px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.rotate(-0.5);
    var t = nm + '  ·  مسارك', st = Math.round(cv.height / 7);
    for (var y = -cv.width; y < cv.height * 1.6; y += st) for (var x = -cv.width * 0.2; x < cv.width * 1.8; x += cv.width * 0.6) g.fillText(t, x + (Math.round(y / st) % 2) * cv.width * 0.3, y);
    g.restore();
  }
  function toast(m) { var t = $('#pdfmsg'); if (!t) { t = document.createElement('div'); t.id = 'pdfmsg'; t.style.cssText = 'position:fixed;inset:auto 0 24px 0;margin:auto;width:max-content;max-width:90vw;background:#12307a;color:#fff;padding:12px 22px;border-radius:14px;z-index:99999;font:700 15px Cairo,sans-serif;box-shadow:0 8px 30px #0006'; document.body.appendChild(t); } t.textContent = m; t.style.display = m ? 'block' : 'none'; }
  function fixColors(doc) {
    var re = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/g, gs = doc.defaultView.getComputedStyle.bind(doc.defaultView);
    var props = ['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'box-shadow', 'text-shadow', 'outline-color'];
    function cv(m, r, g, b, a) { return 'rgba(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
    doc.querySelectorAll('*').forEach(function (e) {
      var c = gs(e);
      props.forEach(function (p) { var v = c.getPropertyValue(p); if (v && v.indexOf('color(') > -1) e.style.setProperty(p, v.replace(re, cv), 'important'); });
    });
  }
  function printPages(html, slide, free, kind) {
    if (!free && !isPaid(kind)) { paywall(kind); return; }
    var pa = $('#print-area'); pa.innerHTML = html; pa.style.cssText = 'display:block;position:fixed;left:-20000px;top:0;background:#fff';
    toast('جاري تجهيز الـPDF بعلامتك المدمجة…');
    var nm = (D.name || '').trim() || 'اسم المدرس';
    loadH2C().then(function () {
      var els = Array.prototype.slice.call(pa.querySelectorAll('.page,.xp')); if (!els.length) els = [pa];
      var out = [], i = 0;
      function next() {
        if (i >= els.length) return Promise.resolve();
        var el = els[i++]; toast('جاري تجهيز الصفحة ' + i + ' من ' + els.length);
        return html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, onclone: fixColors }).then(function (cv) {
          burn(cv, nm); out.push({ w: el.offsetWidth, h: el.offsetHeight, cw: cv.width, ch: cv.height, jpg: b64bytes(cv.toDataURL('image/jpeg', 0.92)) });
          return new Promise(function (r) { setTimeout(r, 20); }).then(next);
        });
      }
      return next().then(function () {
        var bl = makePdf(out), a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'masarak.pdf'; document.body.appendChild(a); a.click();
        setTimeout(function () { a.remove(); URL.revokeObjectURL(a.href); }, 4000); toast('✔ تم تحميل الملف'); setTimeout(function () { toast(''); }, 2500);
      });
    }).catch(function () { toast('تعذّر تجهيز الملف. تأكد من الاتصال بالإنترنت وجرّب تاني.'); setTimeout(function () { toast(''); }, 4000); }).then(function () { pa.style.cssText = ''; pa.innerHTML = ''; });
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing'); });

  var SW = ['#1f6fd1', '#14877a', '#7a3fa0', '#c23b3b', '#d9731a', '#14213d', '#ffffff', '#fff3b0', '#dfe9f9'];
  function swatchRow(k, label) {
    return '<div class="lab">' + label + '</div><div class="pick"><button type="button" class="chip" data-ck="' + k + '" data-v="" aria-pressed="' + !D[k] + '">تلقائي</button>' + SW.map(function (c) { return '<button type="button" class="sw sm" data-ck="' + k + '" data-v="' + c + '" aria-label="' + c + '" aria-pressed="' + (D[k] === c) + '" style="background:' + c + '"></button>'; }).join('') + '</div>';
  }
  function controls() {
    return '<div class="panel"><h3>بياناتك</h3>' +
      '<label>الاسم<input data-k="name" value="' + esc(D.name) + '" placeholder="مثلا: مستر ........"></label>' +
      '<label>الرقم<input data-k="phone" dir="ltr" inputmode="tel" value="' + esc(D.phone) + '" placeholder="01xxxxxxxxx"></label>' +
      '<label>اسم السلسلة<input data-k="series" value="' + esc(D.series) + '" placeholder="سلسلة المراجعة"></label>' +
      '<div class="lab">اللون</div><div class="pick">' + COLORS.map(function (c) { return '<button type="button" class="sw" data-color="' + c[0] + '" aria-label="' + c[1] + '" aria-pressed="' + (c[0] === D.color) + '" style="background:' + c[0] + '"></button>'; }).join('') + '<label class="custom">لون آخر<input type="color" data-k="color" value="' + D.color + '"></label></div>' +
      '<div class="lab">الإطار</div><div class="pick">' + FRAMES.map(function (f) { return '<button type="button" class="chip" data-frame="' + f[0] + '" aria-pressed="' + (f[0] === D.frame) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">تصميم الصفحة (١١ تصميم)</div><div class="thgrid">' + [['classic','كلاسيك'],['modern','شريط جانبي'],['royal','شهادة ملكية'],['playful','فقاعات مرحة'],['minimal','صفوف منظمة'],['grid','مخطط هندسي'],['night','بنتو ليلي'],['gradient','غلاف متدرج'],['notebook','كراسة بسلك'],['bold','بوستر جريء'],['book','كتاب الشرح']].map(function (o) { return '<button type="button" class="thc" data-opt="theme" data-v="' + o[0] + '" aria-pressed="' + ((D.theme || 'classic') === o[0]) + '"><span class="thp th-' + o[0] + '"><i class="a"></i><i class="b"></i><i class="b s"></i><i class="c"></i></span><span>' + o[1] + '</span></button>'; }).join('') + '</div>' +
      '<div class="lab">نوع الخط</div><div class="pick">' + ['Cairo', 'Tajawal', 'Almarai', 'Amiri'].map(function (f) { return '<button type="button" class="chip" data-opt="font" data-v="' + f + '" style="font-family:' + f + '" aria-pressed="' + (D.font === f) + '">' + ({ Cairo: 'كايرو', Tajawal: 'تجوال', Almarai: 'المراعي', Amiri: 'أميري' })[f] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">شكل الملف</div><div class="pick"><button type="button" class="chip" data-opt="shape" data-v="a4" aria-pressed="' + (D.shape === 'a4') + '">بوكليت A4</button><button type="button" class="chip" data-opt="shape" data-v="slide" aria-pressed="' + (D.shape === 'slide') + '">سلايد (أسئلة)</button></div>' +
      '<div class="lab">شكل مربع السؤال</div><div class="pick">' + [['full', 'كامل'], ['dashed', 'منقط'], ['none', 'بدون']].map(function (o) { return '<button type="button" class="chip" data-opt="qbox" data-v="' + o[0] + '" aria-pressed="' + (D.qbox === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lab">مربع الحل</div><div class="pick">' + [['lines', 'سطور'], ['grid', 'مربعات'], ['none', 'بدون']].map(function (o) { return '<button type="button" class="chip" data-opt="solve" data-v="' + o[0] + '" aria-pressed="' + (D.solve === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<label>استدارة الأركان<input type="range" min="0" max="30" data-k="round" value="' + D.round + '"></label>' +
      swatchRow('fcol', 'لون الإطار') + swatchRow('qbg', 'لون مربع السؤال') + swatchRow('qtc', 'لون خط السؤال') + swatchRow('occ', 'لون الاختيارات') +
      '<div class="lab">اللوجو بتاعك</div><div class="pick"><label class="chip up">ارفع صورة<input type="file" accept="image/*" id="logoin" hidden></label>' + (D.logo ? '<button type="button" class="chip" id="logorm">شيل اللوجو</button>' : '') + '</div>' +
      '</div>';
  }
  function bindControls(root, redraw) {
    root.querySelectorAll('input[data-k]').forEach(function (i) { i.addEventListener('input', function () { D[i.dataset.k] = i.value; save(); redraw(false); }); });
    root.querySelectorAll('[data-color]').forEach(function (b) { b.onclick = function () { D.color = b.dataset.color; save(); redraw(true); }; });
    root.querySelectorAll('[data-frame]').forEach(function (b) { b.onclick = function () { D.frame = b.dataset.frame; save(); redraw(true); }; });
    root.querySelectorAll('[data-ck]').forEach(function (b) { b.onclick = function () { D[b.dataset.ck] = b.dataset.v; save(); redraw(true); }; });
    root.querySelectorAll('[data-opt]').forEach(function (b) { b.onclick = function () { D[b.dataset.opt] = b.dataset.v; save(); if (b.dataset.opt === 'shape') { var t = document.querySelector('[data-tab="q"]'); if (t) t.click(); } redraw(true); }; });
    var lg = root.querySelector('#logoin'); if (lg) lg.onchange = function () { var f = lg.files[0]; if (!f || f.size > 400000) { alert('الصورة لازم تكون أقل من 400 كيلوبايت'); return; } var r = new FileReader(); r.onload = function () { D.logo = r.result; save(); redraw(true); }; r.readAsDataURL(f); };
    var lr = root.querySelector('#logorm'); if (lr) lr.onclick = function () { D.logo = ''; save(); redraw(true); };
  }

  var USER = {};
  var SB = 'https://htkwymimktphqmpbqffq.supabase.co', KEY = 'sb_publishable_5_2_u26FlS42PuADpaoF4Q_ImVst9P1', ADMIN = 'elkazazmahmoud304@gmail.com';
  var SESS = null; try { SESS = JSON.parse(localStorage.getItem('masarak_sess') || 'null'); } catch (e) {}
  function sbf(path, o, tok) {
    o = o || {}; var h = { apikey: KEY, 'Content-Type': 'application/json' }; if (tok) h.Authorization = 'Bearer ' + tok; if (o.prefer) h.Prefer = o.prefer;
    return fetch(SB + path, { method: o.method || 'GET', headers: h, body: o.body ? JSON.stringify(o.body) : undefined }).then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} if (!r.ok) throw new Error((j && (j.msg || j.message || j.error_description || j.error)) || 'error'); return j; }); });
  }
  function setSess(j) { SESS = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 - 60000, email: (j.user && j.user.email) || (SESS && SESS.email), act: !!(SESS && SESS.act) }; localStorage.setItem('masarak_sess', JSON.stringify(SESS)); }
  function token() {
    if (!SESS) return Promise.reject(new Error('no'));
    if (Date.now() < SESS.exp) return Promise.resolve(SESS.at);
    return sbf('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: SESS.rt } }).then(function (j) { setSess(j); return SESS.at; });
  }
  function loadProfile() {
    return token().then(function (t) { return sbf('/rest/v1/my_profile?select=*&limit=1', {}, t); }).then(function (r) {
      var p = r && r[0]; if (!p) throw new Error('noprofile');
      USER = { name: p.name || 'حساب', phone: p.phone || '', email: p.email || SESS.email, plan: p.plan || 'free', xplan: p.exams_plan || 'free', until: p.plan_until, xuntil: p.exams_until, grades: p.grades || [], id: p.id, admin: (p.email || '').toLowerCase() === ADMIN };
      hdr(); checkExpiry();
    }).catch(function (e) { if (/failed to fetch|network|load failed/i.test(String(e && e.message))) return; SESS = null; localStorage.removeItem('masarak_sess'); USER = {}; hdr(); });
  }
  function signOut() { SESS = null; localStorage.removeItem('masarak_sess'); USER = {}; hdr(); route(); }
  function setPlan(plan, k) { return token().then(function (t) { return sbf('/rest/v1/profiles?id=eq.' + USER.id, { method: 'PATCH', body: k === 'x' ? { exams_plan: plan } : { plan: plan }, prefer: 'return=minimal' }, t); }); }
  var ACCMODE = 'up', ACCERR = '', PICK = [];
  var STG = [['p', 'ابتدائي', '🎒', ['الأول', 'التاني', 'التالت', 'الرابع', 'الخامس', 'السادس']], ['m', 'إعدادي', '📘', ['الأول', 'التاني', 'التالت']], ['h', 'ثانوي', '🎓', ['الأول', 'التاني', 'التالت']]];
  function gname(c) { var s = STG.filter(function (x) { return x[0] === c[0]; })[0]; return s ? s[1] + ' ' + s[3][+c.slice(1) - 1] : c; }
  function picker() {
    return '<div class="stg"><b>اختار المرحلة والصف (تقدر تختار أكتر من واحد)</b>' + STG.map(function (s) { return '<div class="stgr"><span class="stgi">' + s[2] + ' ' + s[1] + '</span>' + s[3].map(function (g, i) { var c = s[0] + (i + 1); return '<button type="button" class="chip" data-pk="' + c + '" aria-pressed="' + (PICK.indexOf(c) > -1) + '">' + g + '</button>'; }).join('') + '</div>'; }).join('') + '<p class="sub">المتاح دلوقتي: إعدادي - التالت. باقي الصفوف بنضيفها قريبًا وبتتسجل في حسابك.</p></div>';
  }
  var ORDERS = []; try { ORDERS = JSON.parse(localStorage.getItem('masarak_orders') || '[]'); } catch (e) {}
  function cartItems() { return cart.map(function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean); }
  function cartSum(items) { var t = items.reduce(function (a, p) { return a + p.price; }, 0); return items.length === PRODUCTS.length ? BUNDLE : t; }
  var DEMO = Object.assign({}, D, { name: 'مستر ........', phone: '01012345678', series: 'سلسلة النخبة', shape: 'a4', logo: '' });
  var timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NAMES = ['مستر ........', 'أ/ سارة محمود', 'د/ كريم حسن', 'م/ منى عادل'];
  var PAL = [['#1f6fd1', 'dashed'], ['#14877a', 'solid'], ['#7a3fa0', 'double'], ['#c23b3b', 'dashed'], ['#d9731a', 'solid']];
  function demoLoop(root) {
    var i = 0;
    function setName(v) { root.querySelectorAll('.nm').forEach(function (e) { e.textContent = v; }); root.querySelectorAll('.wm span').forEach(function (e) { e.textContent = v; }); }
    function run() {
      var nm = NAMES[i % NAMES.length], pal = PAL[i % PAL.length], pg = root.querySelector('.page'), k = 0;
      if (!pg) return;
      pg.style.setProperty('--c', pal[0]);
      var w = pg.querySelector('.wrap'); if (w) w.className = 'wrap f-' + pal[1];
      setName('');
      var t = every(function () { k++; setName(nm.slice(0, k)); if (k >= nm.length) clearInterval(t); }, 90);
      i++;
    }
    run(); every(run, 4200);
  }
  function tiltInit() {
    var t = $('#tilt'), h = $('.hero'); if (!t || !h) return;
    h.addEventListener('mousemove', function (e) { var r = h.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; t.style.animation = 'none'; t.style.transform = 'rotateY(' + (-x * 24) + 'deg) rotateX(' + (y * 18) + 'deg)'; });
    h.addEventListener('mouseleave', function () { t.style.transform = ''; t.style.animation = ''; });
  }
  var GSTEPS = [
    ['١', 'اختار ملفك من المتجر', 'ادخل على «المذكرات» وشوف الملخصات وبنك الأسئلة. كل ملف عليه معاينة وسعره.'],
    ['٢', 'جرّب عينة مجانية', 'افتح ٤ صفحات من المذكرة مجانًا وشوف الشكل باسمك قبل ما تدفع حاجة.'],
    ['٣', 'صمّم نسختك', 'اكتب اسمك ورقمك، واختار اللون والإطار وشكل الملف وألوان السؤال، والمعاينة بتتغير قدامك.'],
    ['٤', 'كمّل الطلب', 'ضيف الملفات للسلة، واكتب بياناتك وطريقة الدفع والرقم اللي هتحوّل منه.'],
    ['٥', 'تابع حالة الطلب', 'من «الطلبات والملفات» هتشوف الطلب: تم الاستلام، مراجعة التحويل، الملف جاهز.'],
    ['٦', 'حمّل ملفك واطبعه', 'لما الملف يجهز دوس «حمّل PDF» واطبع نسخك باسمك وعلامتك.']
  ];
  function gStage(i) {
    if (i === 0) return '<div class="gs g0"><div class="gc"><span>ملخص قوانين الأسس</span><b>٤٠ ج</b><button class="gbtn">أضف إلى السلة</button></div><div class="gc"><span>بنك أسئلة الأسس</span><b>١٢٠ ج</b><button class="gbtn">أضف إلى السلة</button></div><div class="cur"></div></div>';
    if (i === 1) return '<div class="gs g1"><div class="gq">ناتج <span dir="ltr">5<sup>6</sup> ÷ 5<sup>2</sup></span> يساوي:</div><div class="go"><div>أ  5<sup>8</sup></div><div>ب  5<sup>3</sup></div><div class="rt">ج  5<sup>4</sup></div><div>د  5<sup>12</sup></div></div><div class="gsol">✔ نطرح الأسس: 6 − 2 = 4</div></div>';
    if (i === 2) return '<div class="gs g2" id="gdemo">' + summaryPage(DEMO) + '</div>';
    if (i === 3) return '<div class="gs g3"><div class="gf"><i></i><i class="t1"></i><i class="t2"></i></div><div class="gbtn big">ابعت الطلب</div></div>';
    if (i === 4) return '<div class="gs g4"><div class="steps3"><span class="on">تم استلام الطلب</span><span class="s2">مراجعة التحويل</span><span class="s3">الملف جاهز</span></div></div>';
    return '<div class="gs g5"><div class="file">PDF</div><div class="gbtn big pulse">حمّل PDF</div><div class="done">✔ ملفك جاهز</div></div>';
  }
  function startGuide() {
    var i = 0, play = true, bar = $('#gbar'), box = $('#gst'), cap = $('#gcap'), voice = false;
    function show(n) {
      i = (n + GSTEPS.length) % GSTEPS.length;
      box.className = 'gstage'; void box.offsetWidth; box.className = 'gstage in s' + i;
      box.innerHTML = gStage(i);
      if (i === 2) { var d = $('#gdemo'); demoLoop(d); }
      cap.innerHTML = '<span class="gn">' + GSTEPS[i][0] + '</span><h3>' + GSTEPS[i][1] + '</h3><p>' + GSTEPS[i][2] + '</p>';
      document.querySelectorAll('.gdots button').forEach(function (b, k) { b.className = k === i ? 'on' : ''; });
      bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
      if (play) { bar.style.transition = 'width 6s linear'; bar.style.width = '100%'; }
      if (voice && window.speechSynthesis) { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(GSTEPS[i][1] + '. ' + GSTEPS[i][2]); u.lang = 'ar-EG'; speechSynthesis.speak(u); }
    }
    function tick() { if (play) { clearTimers(); show(i + 1); arm(); } }
    function arm() { later(tick, 6000); }
    $('#gprev').onclick = function () { clearTimers(); show(i - 1); if (play) arm(); };
    $('#gnext').onclick = function () { clearTimers(); show(i + 1); if (play) arm(); };
    $('#gplay').onclick = function () { play = !play; this.textContent = play ? '❚❚ إيقاف' : '▶ تشغيل'; clearTimers(); show(i); if (play) arm(); };
    $('#gvoice').onclick = function () { voice = !voice; this.setAttribute('aria-pressed', voice); if (voice) show(i); else if (window.speechSynthesis) speechSynthesis.cancel(); };
    document.querySelectorAll('.gdots button').forEach(function (b, k) { b.onclick = function () { clearTimers(); show(k); if (play) arm(); }; });
    show(0); arm();
  }
  var views = {
    games: function () {
      return '<section class="page-s games"><h2>ألعاب تعليمية</h2><p class="sub">العب وراجع قوانين الأسس. مجانية ومفتوحة للكل، وفي سباق مع زمايلك.</p><div class="gtabs"><button class="chip" data-g="quiz" aria-pressed="true">⚡ تحدي السرعة</button><button class="chip" data-g="mem" aria-pressed="false">🧠 لعبة الذاكرة</button><button class="chip" data-g="race" aria-pressed="false">🏁 سباق</button><button class="chip" data-g="team" aria-pressed="false">🏎️ سباق الفرق</button><button class="chip" data-g="tug" aria-pressed="false">🪢 شد الحبل</button><button class="chip" data-g="pen" aria-pressed="false">⚽ ضربات الجزاء</button><button class="chip" data-g="bsk" aria-pressed="false">🏀 كرة السلة</button></div><div id="gbox" class="panelw"></div></section>';
    },
    guide: function () {
      return '<section class="page-s guide"><h2>شرح استخدام المنصة</h2><div class="vidbox"><video controls preload="metadata" playsinline src="https://htkwymimktphqmpbqffq.supabase.co/storage/v1/object/public/media/1-explainer2.mp4"></video></div><p class="sub">وبعده شرح تفاعلي قصير بيوريك الخطوات من الاختيار لحد استلام الملف.</p><div class="gwrap"><div class="gstage" id="gst"></div><div class="gcap" id="gcap"></div></div><div class="gbar"><div id="gbar"></div></div><div class="gctl"><button class="btn" id="gprev">السابق</button><button class="btn y" id="gplay">❚❚ إيقاف</button><button class="btn" id="gnext">التالي</button><button class="btn" id="gvoice" aria-pressed="false">🔊 قراءة صوتية</button></div><div class="gdots">' + GSTEPS.map(function (g, k) { return '<button type="button" aria-label="' + g[1] + '">' + g[0] + '</button>'; }).join('') + '</div><div class="row"><a class="btn y" href="#/editor">ابدأ صمّم مذكرتك</a></div></section>';
    },
    home: function () {
      return '<section class="hero"><div class="syms" aria-hidden="true"><i>x²</i><i>√</i><i>÷</i><i>π</i><i>∑</i><i>%</i><i>a⁵</i></div><div class="hero-t"><h1>مذكرتك <em>باسمك</em> وعلامتك</h1><p>أسئلة وملخصات جاهزة لكل مرحلة. اكتب اسمك ورقمك، اختار اللون والإطار، وشوف الصفحة بتتغير قدامك. بعدها اطبعها بالـ PDF جاهزة للطلاب.</p><div class="cta"><a class="btn y" href="#/editor">صمّم مذكرتك</a><a class="btn" href="#/s/1">جرّب ٤ صفحات مجانًا</a><a class="btn ghost" href="#/guide">▶ شاهد الشرح</a></div><div class="panelw tryc" id="tryc"><h4>جرّب بنفسك</h4><div class="trr"><input id="tn" placeholder="اسمك" maxlength="30"><input id="tp" dir="ltr" inputmode="tel" placeholder="01xxxxxxxxx" maxlength="14"></div><div class="pick">' + COLORS.map(function (c) { return '<button type="button" class="sw" data-tc="' + c[0] + '" aria-label="' + c[1] + '" style="background:' + c[0] + '"></button>'; }).join('') + '</div></div><div class="ver">النموذج الحالي: الصف الثالث الإعدادي، الترم الأول</div></div><div class="hero-p"><div class="tilt" id="tilt">' + fitBox(summaryPage(DEMO)) + '</div></div></section>' +
        '<section class="steps"><div><b>١</b><h4>اكتب بياناتك</h4><p>الاسم والرقم واسم السلسلة.</p></div><div><b>٢</b><h4>اختار الشكل</h4><p>لون وإطار وعلامة اسم.</p></div><div><b>٣</b><h4>اطبع واستلم</h4><p>صفحات PDF باسمك.</p></div></section>' +
        '<section class="feat"><div class="fc"><h4>ملخصات منظمة</h4><p>قوانين وأمثلة في كروت ملونة مرتبة.</p></div><div class="fc"><h4>بنك أسئلة</h4><p>سؤال في كل صفحة، معه تلميح ومساحة للحل.</p></div><div class="fc"><h4>نموذج إجابة</h4><p>صفحة حل مرتبة لكل مجموعة أسئلة.</p></div><div class="fc"><h4>محتوى أصلي</h4><p>كل الأسئلة والشرح من تأليفنا.</p></div></section>';
    },
    store: function () {
      return '<section class="page-s"><div class="shero"><h2>المتجر</h2><p>اختار الملف وشوف عينة منه، وبعدين صمّم نسختك: اسمك ورقمك والإطار بتاعك وألوانك.</p><div class="yb"><b>جرّب قبل ما تدفع:</b> اختار أي ملف وصمّم نسختك، ودوس «جرّب عينة مجانًا». عينة من ٤ صفحات من المذكرة بتوصلك بالتصميم اللي اخترته.</div><div class="st4"><div class="on"><b>١</b>اختار الملف</div><div><b>٢</b>شوف العينة</div><div><b>٣</b>صمّم نسختك</div><div><b>٤</b>اطلب</div></div></div>' +
        '<div class="chips"><span class="chip on">كل الصفوف</span><span class="chip off">أولى إعدادي (قريبًا)</span><span class="chip off">تانية إعدادي (قريبًا)</span><span class="chip on">تالتة إعدادي</span></div>' +
        '<div class="bundle"><span class="bd">الأوفر</span><h3>الباقة الكاملة</h3><p>ملخص الأسس + بنك الأسئلة مع نموذج الإجابة</p><div class="bl"><div><b>ملخص</b> قوانين الأسس</div><div><b>بنك أسئلة</b> الأسس والجذور</div></div><div class="price">' + BUNDLE + ' ج <small>بدل ' + (PRODUCTS[0].price + PRODUCTS[1].price) + ' ج، سعر تجريبي</small></div><button class="btn y" data-bundle="1">أضف الباقة للسلة</button></div>' +
        '<h3 class="sec">تالتة إعدادي <small>' + (PRODUCTS.length + 1) + ' ملفات</small></h3><div class="pgrid">' + PRODUCTS.map(card).join('') +
        '<div class="pc"><div class="free"><b>٤</b><span>صفحات</span></div><div class="tags"><span>تالتة إعدادي</span><span>عينة</span><span class="gr">مجاني</span></div><h4>عينة ٤ صفحات</h4><div class="meta">تجربة الشكل قبل الملف الكامل</div><div class="price">٠ ج</div><div class="pbtns"><a class="btn y" href="#/s/1">جرّب عينة مجانًا</a></div></div></div>' +
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
        '<label>ملاحظات<textarea name="t" rows="3"></textarea></label><button class="btn y" type="submit">ابعت الطلب</button><p class="sub">بعد التحويل، من صفحة الطلبات دوس "ابعت صورة التحويل على واتساب" وابعت الصورة ورقم الطلب.</p></form>' +
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
          (o.st < 2 ? '<a class="btn y" target="_blank" rel="noopener" href="https://wa.me/201147795940?text=' + encodeURIComponent('أنا حوّلت مبلغ طلب رقم ' + o.id + ' (' + o.total + ' ج). دي صورة التحويل:') + '">ابعت صورة التحويل على واتساب</a> ' : '') + (o.st < 2 ? '<button class="chip" data-adv="' + o.id + '">تجربة: خلّي الطلب جاهز</button>' : '') + '</div>';
      }).join('') + '<p class="sub">في النموذج التجريبي حالة الطلب بتتغير بزر التجربة. في النسخة الحقيقية بتتغير بعد تأكيد التحويل.</p></section>';
    },
    account: function () {
      if (USER.name) return '<section class="page-s"><h2>حسابك</h2><div class="panelw"><p>أهلًا <b>' + esc(USER.name) + '</b></p><p class="sub">' + esc(USER.phone || '') + ' ' + esc(USER.email || '') + '</p>' + (USER.grades && USER.grades.length ? '<p>صفوفك: ' + USER.grades.map(function (c) { return '<span class="gb">' + esc(gname(c)) + '</span>'; }).join(' ') + '</p>' : '') + '<a class="btn y" href="#/orders">طلباتك وملفاتك</a> ' + (USER.admin ? '<a class="btn" href="#/admin">صفحة الإدارة</a> ' : '') + '<button class="btn" id="lo">تسجيل خروج</button></div>' + planPanel() + '</section>';
      var up = ACCMODE === 'up';
      return '<section class="page-s"><h2>' + (up ? 'إنشاء حساب' : 'تسجيل الدخول') + '</h2><form id="acf" class="panelw"><div class="tabs"><button type="button" class="chip" data-am="up" aria-pressed="' + up + '">حساب جديد</button><button type="button" class="chip" data-am="in" aria-pressed="' + !up + '">عندي حساب</button></div>' +
        (up ? '<label>الاسم الكامل<input name="n" required></label><label>رقم الموبايل<input name="p" required dir="ltr" inputmode="tel"></label>' : '') +
        (up ? picker() : '') + '<label>الإيميل<input name="e" type="email" dir="ltr" required autocomplete="email"></label><label>كلمة السر<input name="w" type="password" dir="ltr" required minlength="6" autocomplete="' + (up ? 'new-password' : 'current-password') + '"></label>' +
        (up ? '<label>تأكيد كلمة السر<input name="w2" type="password" dir="ltr" required minlength="6" autocomplete="new-password"></label>' : '') +
        '<p class="sub" id="acerr" style="color:#c0392b">' + esc(ACCERR) + '</p><button class="btn y" type="submit">' + (up ? 'إنشاء الحساب' : 'دخول') + '</button></form></section>';
    },
    admin: function () {
      if (!USER.admin) return '<section class="page-s"><h2>صفحة الإدارة</h2><div class="panelw"><p>الصفحة دي لصاحب الموقع بس.</p></div></section>';
      return '<section class="page-s"><h2>صفحة الإدارة</h2><div class="panelw"><p class="sub">المشتركين وطلبات الاشتراك. فعّل بعد ما تتأكد من التحويل.</p><div id="adl">جاري التحميل...</div></div></section>';
    },
    editor: function () {
      return '<section class="page-s"><h2>صمّم مذكرتك</h2><div class="ed"><div id="ctl"></div><div class="prev"><div class="tabs"><button class="chip" data-tab="s" aria-pressed="true">صفحة الملخص</button><button class="chip" data-tab="q" aria-pressed="false">صفحة سؤال</button><button class="chip" data-tab="e" aria-pressed="false">صفحة مثال</button></div><div id="pv"></div><div class="row"><button class="btn y" id="pr">اطبع أو احفظ PDF</button></div><p class="sub">الطباعة تفتح نافذة المتصفح. اختار "حفظ بصيغة PDF".</p></div></div></section>';
    },
    bank: function () {
      return '<section class="page-s"><h2>بنك الأسئلة</h2><p class="sub">أسئلة الأسس والجذور، الصف الثالث الإعدادي. سؤال في كل صفحة، مع تلميح ومساحة للحل.</p><div class="grid g2">' +
        '<a class="prod" href="#/s/1"><span class="badge g">مجاني</span><h4>عينة ٤ صفحات</h4><p>أول ٤ صفحات من المذكرة.</p><span class="go">ابدأ</span></a>' +
        '<a class="prod" href="#/q/1"><span class="badge">كامل</span><h4>كل الأسئلة (' + Q.length + ')</h4><p>' + 'تصفّح كل الأسئلة مع نموذج الإجابة.' + '</p><span class="go">ابدأ</span></a></div>' +
        '<div class="panelw"><h3>طباعة باسمك</h3><p class="sub">اكتب بياناتك في صفحة التصميم، ثم اطبع كل الأسئلة صفحة صفحة، تليها صفحات الإجابة.</p><div class="row"><a class="btn" href="#/editor">عدّل بياناتك</a><button class="btn y" id="prall">اطبع كل الأسئلة PDF</button></div></div></section>';
    }
  };

  function planCard(k, title, desc, p, u) {
    var h = '<div class="plc"><h4>' + title + '</h4><p class="sub">' + desc + '</p><p>السعر: <b>سعر تجريبي</b></p>';
    if (p === 'paid') return h + '<p><span class="badge g">مفعّل</span>' + (u ? ' متبقي ' + daysLeft(u) + ' يوم' : '') + '</p></div>';
    if (p === 'pending') return h + '<p><span class="badge">في الانتظار</span> بنأكد التحويل وبعدها بيتفعّل.</p></div>';
    return h + '<button class="btn y" data-rq="' + k + '">اطلب الاشتراك</button></div>';
  }
  function planPanel() {
    var t = '<div class="panelw plan"><h3>اشتراكك</h3><p class="sub">التصفح والتصميم والمعاينة وكل بنك الأسئلة مفتوحين للكل. المقفول لحد الاشتراك: تحميل وطباعة PDF.</p><div class="plcs">' +
      planCard('n', 'الاشتراك الشهري', 'يفتح تحميل وطباعة المذكرات وبنك الأسئلة والاختبارات للصف اللي اشتركت فيه.', USER.plan || 'free', USER.until) + '</div>';
    if (!live(USER.plan, USER.until)) t += '<div class="payl"><b>طرق الدفع</b><ul><li>إنستا باي: <b dir="ltr">01147795940</b></li><li>تحويل بنكي: هيتضاف قريبًا</li><li>فودافون كاش: هيتضاف قريبًا</li></ul><p class="sub">حوّل، وابعت الإيصال، واضغط "اطلب الاشتراك". بيتفعّل بعد التأكيد.</p></div>';
    return t + '</div>';
  }
  function viewer(mode, n) {
    var max = mode === 's' ? 4 : Q.length;
    n = Math.max(1, Math.min(max, n));
    var p = n - 1, state = { shown: false };
    var html = '<section class="page-s"><div class="vh"><a href="#/bank">رجوع</a><span>' + (mode === 's' ? 'عينة مجانية: ٤ صفحات من المذكرة' : 'بنك الأسئلة') + '</span></div><div id="vp"></div><div class="nav"><a class="btn' + (n <= 1 ? ' dis' : '') + '" href="#/' + mode + '/' + (n - 1) + '">السابق</a><button class="btn y" id="rv">أظهر الحل</button><a class="btn' + (n >= max ? ' dis' : '') + '" href="#/' + mode + '/' + (n + 1) + '">التالي</a></div><div id="sol" class="sol" hidden><b>الإجابة: ' + L[Q[p % Q.length].a] + '</b><div>' + txt(Q[p % Q.length].s) + '</div></div><div class="dots">' + Array.from({ length: max }, function (_, i) { return '<a class="' + (i === p ? 'on' : '') + '" href="#/' + mode + '/' + (i + 1) + '">' + (i + 1) + '</a>'; }).join('') + '</div></section>';
    return { html: html, after: function () {
      var sp = [function () { return summaryPage(D); }, function () { return examplePage(D, 2); }, function () { return questionPage(D, 0, 3); }, function () { return questionPage(D, 1, 4); }]; $('#vp').innerHTML = mode === 's' ? fitBox(sp[p](), 's') : fitBox(questionPage(D, p), 'q'); if (mode === 's') { var rb = $('#rv'); if (rb) rb.style.display = 'none'; } fitAll();
      $('#rv').onclick = function () { var s = $('#sol'); s.hidden = !s.hidden; this.textContent = s.hidden ? 'أظهر الحل' : 'أخفِ الحل'; };
    } };
  }

  function gamesInit() {
    var box = $('#gbox');
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function quiz() {
      var qs = shuffle(Q).slice(0, 10), i = 0, score = 0, streak = 0, left = 20, tm;
      function end() {
        clearTimers(); var best = +localStorage.getItem('masarak_best') || 0; if (score > best) { best = score; try { localStorage.setItem('masarak_best', best); } catch (e) {} }
        box.innerHTML = '<div class="gres"><h3>خلصت التحدي</h3><div class="gscore">' + score + '</div><p class="sub">أعلى نتيجة ليك: ' + best + '</p><button class="btn y" id="gagain">العب تاني</button></div>';
        $('#gagain').onclick = quiz;
      }
      function show() {
        if (i >= qs.length) return end();
        var q = qs[i]; left = 20;
        box.innerHTML = '<div class="gh"><span>سؤال ' + (i + 1) + ' من ' + qs.length + '</span><span>النقاط: <b>' + score + '</b></span><span>تتابع: <b>' + streak + '</b></span></div><div class="gtime"><i id="gtb"></i></div><div class="qtext gq">' + txt(q.t) + '</div><div class="gopts">' + q.o.map(function (o, k) { return '<button class="gopt" data-k="' + k + '"><span class="lt">' + L[k] + '</span><span>' + txt(o) + '</span></button>'; }).join('') + '</div><div id="gfb" class="gfb"></div>';
        clearTimers(); tm = every(function () { left -= 0.1; var b = $('#gtb'); if (b) b.style.width = Math.max(0, left / 20 * 100) + '%'; if (left <= 0) pick(-1); }, 100);
        box.querySelectorAll('.gopt').forEach(function (b) { b.onclick = function () { pick(+b.dataset.k); }; });
        function pick(k) {
          clearTimers(); var ok = k === q.a;
          if (ok) { streak++; score += 10 + Math.round(left / 4) + Math.min(streak - 1, 5); } else streak = 0;
          box.querySelectorAll('.gopt').forEach(function (b) { b.disabled = true; var bk = +b.dataset.k; if (bk === q.a) b.classList.add('ok'); else if (bk === k) b.classList.add('no'); });
          $('#gfb').innerHTML = (ok ? '<b class="gy">صح!</b> ' : (k < 0 ? '<b class="gn">الوقت خلص.</b> ' : '<b class="gn">غلط.</b> ')) + '<span>' + txt(q.s) + '</span><div><button class="btn y" id="gnx">' + (i + 1 >= qs.length ? 'النتيجة' : 'التالي') + '</button></div>';
          $('#gnx').onclick = function () { i++; show(); };
        }
      }
      show();
    }
    function mem() {
      var P = [['2^3 × 2^2', '2^5'], ['(3^2)^2', '3^4'], ['5^0', '1'], ['2^(-1)', '0.5'], ['7^3 ÷ 7^1', '7^2'], ['4^2', '16']];
      var cards = []; P.forEach(function (p, i) { cards.push({ p: i, t: p[0] }); cards.push({ p: i, t: p[1] }); });
      cards = shuffle(cards); var open = [], moves = 0, found = 0, lock = false;
      box.innerHTML = '<div class="gh"><span>اقلب الكروت ووصّل كل عملية بنتيجتها</span><span>المحاولات: <b id="gmv">0</b></span></div><div class="mgrid">' + cards.map(function (c, i) { return '<button class="mc" data-i="' + i + '"><span class="mf">؟</span><span class="mb" dir="ltr">' + txt('{{' + c.t + '}}') + '</span></button>'; }).join('') + '</div><div id="gfb" class="gfb"></div>';
      box.querySelectorAll('.mc').forEach(function (b) {
        b.onclick = function () {
          if (lock || b.classList.contains('open') || b.classList.contains('done')) return;
          b.classList.add('open'); open.push(b);
          if (open.length === 2) {
            moves++; $('#gmv').textContent = moves; var x = open[0], y = open[1];
            if (cards[+x.dataset.i].p === cards[+y.dataset.i].p) { x.classList.add('done'); y.classList.add('done'); open = []; found++; if (found === P.length) $('#gfb').innerHTML = '<b class="gy">برافو! خلصتها في ' + moves + ' محاولة.</b> <button class="btn y" id="gagain">العب تاني</button>', $('#gagain').onclick = mem; }
            else { lock = true; later(function () { x.classList.remove('open'); y.classList.remove('open'); open = []; lock = false; }, 900); }
          }
        };
      });
    }

    function raceLeave() { if (window.__rc) { try { window.__rc.unsubscribe(); } catch (e) {} window.__rc = null; } }
    function loadSB(cb) { if (window.supabase) return cb(); var sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'; sc.onload = cb; sc.onerror = function () { box.innerHTML = '<p class="gn">تعذر الاتصال. جرّب تاني.</p>'; }; document.head.appendChild(sc); }
    function race() {
      raceLeave();
      var nick = localStorage.getItem('masarak_nick') || '';
      box.innerHTML = '<div class="gh"><span>سباق مع زمايلك: كلكم بتجاوبوا نفس الأسئلة والترتيب بيتحدث لحظيًا</span></div><div class="rform"><input id="rnick" maxlength="12" placeholder="اسمك المستعار" value="' + esc(nick) + '"><button class="btn y" id="rmk">أنشئ غرفة</button></div><div class="rform"><input id="rcode" inputmode="numeric" maxlength="4" placeholder="كود الغرفة (٤ أرقام)"><button class="btn" id="rjn">ادخل الغرفة</button></div><p class="sub">لحد ٨ لاعبين في الغرفة. مفيش تسجيل مطلوب.</p><div id="gfb" class="gfb"></div>';
      function nm() { var v = $('#rnick').value.trim(); if (!v) { $('#gfb').innerHTML = '<b class="gn">اكتب اسم مستعار الأول.</b>'; return null; } try { localStorage.setItem('masarak_nick', v); } catch (e) {} return v; }
      $('#rmk').onclick = function () { var v = nm(); if (v) enter(v, String(1000 + Math.floor(Math.random() * 9000)), true); };
      $('#rjn').onclick = function () { var v = nm(), c = $('#rcode').value.trim(); if (!v) return; if (!/^\d{4}$/.test(c)) { $('#gfb').innerHTML = '<b class="gn">الكود لازم ٤ أرقام.</b>'; return; } enter(v, c, false); };
    }
    function enter(name, code, host) {
      box.innerHTML = '<p class="sub">بيتم الاتصال...</p>';
      loadSB(function () {
        var uid = Math.random().toString(36).slice(2, 8), cl = window.supabase.createClient(SB, KEY, { realtime: { params: { eventsPerSecond: 10 } } });
        var ch = cl.channel('race:' + code, { config: { broadcast: { self: true }, presence: { key: uid } } }); window.__rc = ch;
        var sidx = null, qs = null, i = 0, score = 0, streak = 0, left = 20, scores = {}, started = false, over = false, joinedAt = Date.now(), tm;
        function players() { var st = ch.presenceState(), a = []; Object.keys(st).forEach(function (k) { var m = st[k][0]; a.push({ id: k, name: m.name, host: m.host, at: m.at }); }); a.sort(function (x, y) { return x.at - y.at; }); return a; }
        function board() { var pres = ch.presenceState(), a = Object.keys(scores).map(function (k) { return scores[k]; }).filter(function (p) { return p.done || pres[p.id]; }); a.sort(function (x, y) { return y.score - x.score; }); return '<ol class="rb">' + a.map(function (p) { return '<li class="lane' + (p.id === uid ? ' me' : '') + '"><span class="ln">' + esc(p.name) + '</span><span class="trk"><i style="inset-inline-start:' + Math.round(p.n * 9) + '%">🏎️</i><em>🏁</em></span><span>' + (p.done ? '✔ ' : '') + '<b>' + p.score + '</b></span></li>'; }).join('') + '</ol>'; }
        function lobby() {
          if (started) { if (qs && i >= qs.length && !over) finish(); return; } var pl = players();
          if (!host && pl.length && pl.length > 8 && pl.findIndex(function (p) { return p.id === uid; }) >= 8) { box.innerHTML = '<p class="gn">الغرفة مليانة (٨ لاعبين).</p><button class="btn" id="rb">رجوع</button>'; $('#rb').onclick = race; raceLeave(); return; }
          var hasHost = pl.some(function (p) { return p.host; });
          box.innerHTML = '<div class="gh"><span>كود الغرفة: <b class="rcode">' + code + '</b></span><span>' + pl.length + ' / 8 لاعبين</span></div><ol class="rb">' + pl.map(function (p) { return '<li><span>' + esc(p.name) + (p.host ? ' 👑' : '') + '</span></li>'; }).join('') + '</ol>' + (host ? '<button class="btn y" id="rgo"' + (pl.length < 2 ? ' disabled' : '') + '>ابدأ السباق</button><p class="sub">ابعت الكود لزمايلك. تقدر تبدأ لما يبقوا لاعبين على الأقل.</p>' : (hasHost ? '<p class="sub">مستني صاحب الغرفة يبدأ السباق...</p>' : '<p class="gn">الغرفة غير موجودة. اتأكد من الكود.</p>')) + '<button class="btn" id="rlv">خروج</button>';
          $('#rlv').onclick = function () { raceLeave(); race(); };
          if (host && pl.length >= 2) $('#rgo').onclick = function () { var idx = shuffle(Q.map(function (_, k) { return k; })).slice(0, 10); ch.send({ type: 'broadcast', event: 'start', payload: { idx: idx } }); };
        }
        function begin(idx) {
          if (started) return; started = true; sidx = idx; qs = idx.map(function (k) { return Q[k]; }); scores = {}; players().forEach(function (p) { scores[p.id] = { id: p.id, name: p.name, score: 0, n: 0, done: false }; }); show();
        }
        function push(done) { ch.send({ type: 'broadcast', event: 'score', payload: { id: uid, name: name, score: score, n: i, done: !!done } }); }
        function show() {
          if (i >= qs.length) { push(true); clearTimers(); return finish(); }
          var q = qs[i]; left = 20;
          box.innerHTML = '<div class="gh"><span>سؤال ' + (i + 1) + ' من ' + qs.length + '</span><span>النقاط: <b>' + score + '</b></span></div><div class="gtime"><i id="gtb"></i></div><div class="qtext gq">' + txt(q.t) + '</div><div class="gopts">' + q.o.map(function (o, k) { return '<button class="gopt" data-k="' + k + '"><span class="lt">' + L[k] + '</span><span>' + txt(o) + '</span></button>'; }).join('') + '</div><div id="gfb" class="gfb"></div><div id="rlive">' + board() + '</div>';
          clearTimers(); tm = every(function () { left -= 0.1; var b = $('#gtb'); if (b) b.style.width = Math.max(0, left / 20 * 100) + '%'; if (left <= 0) pick(-1); }, 100);
          box.querySelectorAll('.gopt').forEach(function (b) { b.onclick = function () { pick(+b.dataset.k); }; });
          function pick(k) {
            clearTimers(); var ok = k === q.a; if (ok) { streak++; score += 10 + Math.round(left / 4) + Math.min(streak - 1, 5); } else streak = 0;
            box.querySelectorAll('.gopt').forEach(function (b) { b.disabled = true; var bk = +b.dataset.k; if (bk === q.a) b.classList.add('ok'); else if (bk === k) b.classList.add('no'); });
            i++; push(false); $('#gfb').innerHTML = (ok ? '<b class="gy">صح!</b>' : '<b class="gn">' + (k < 0 ? 'الوقت خلص.' : 'غلط.') + '</b>');
            later(show, 1200);
          }
        }
        function finish() {
          var a = Object.keys(scores).map(function (k) { return scores[k]; }), pres = ch.presenceState(), all = a.every(function (p) { return p.done || !pres[p.id]; });
          box.innerHTML = '<div class="gres"><h3>' + (all ? 'النتيجة النهائية' : 'خلصت أسئلتك. مستني الباقي...') + '</h3>' + board() + '<button class="btn y" id="rend">سباق جديد</button></div>';
          $('#rend').onclick = function () { raceLeave(); race(); };
        }
        ch.on('presence', { event: 'join' }, function () { if (started && sidx) { var pl = players(); if (pl[0] && pl[0].id === uid) ch.send({ type: 'broadcast', event: 'start', payload: { idx: sidx } }); } })
          .on('presence', { event: 'sync' }, lobby)
          .on('broadcast', { event: 'start' }, function (m) { begin(m.payload.idx); })
          .on('broadcast', { event: 'score' }, function (m) { var p = m.payload; scores[p.id] = p; if (over) return; var l = $('#rlive'); if (l) l.innerHTML = board(); else if (qs && i >= qs.length) finish(); })
          .subscribe(function (st) { if (st === 'SUBSCRIBED') ch.track({ name: name, host: host, at: Date.now() }); else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') box.innerHTML = '<p class="gn">تعذر الاتصال بالغرفة. جرّب تاني.</p><button class="btn" id="rb">رجوع</button>', $('#rb').onclick = race; });
      });
    }

    function teamsGame(mode) {
      var NM = ['الفريق الأحمر', 'الفريق الأزرق', 'الفريق الأخضر', 'الفريق الأصفر'], CL = ['#c23b3b', '#1f6fd1', '#14877a', '#d9a21a'], tug = mode === 'tug';
      box.innerHTML = '<div class="gh"><span>' + (tug ? 'شد الحبل: فريقين بيتبادلوا الأسئلة، كل إجابة صح بتشد الحبل ناحيتكم' : 'سباق الفرق: الفرق بتتبادل الأسئلة على نفس الشاشة، كل إجابة صح بتقدّم عربيتكم') + '</span></div>' + (tug ? '' : '<div class="rform"><span class="sub">عدد الفرق:</span><button class="chip" data-n="2" aria-pressed="true">٢</button><button class="chip" data-n="3" aria-pressed="false">٣</button><button class="chip" data-n="4" aria-pressed="false">٤</button></div>') + '<button class="btn y" id="tgo">ابدأ</button>';
      var N = 2; box.querySelectorAll('[data-n]').forEach(function (b) { b.onclick = function () { N = +b.dataset.n; box.querySelectorAll('[data-n]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }; });
      $('#tgo').onclick = function () {
        var t3 = null; if (tug && !window.__tl) { return load3d(function (m) { window.__m3 = m; window.__tl = 1; $('#tgo').onclick(); }); } if (tug && window.__m3) t3 = tug3d(window.__m3);
        var qs = shuffle(Q), qi = 0, pos = [], t = 0, goal = tug ? 4 : 8, done = false; for (var k = 0; k < N; k++) pos.push(0);
        function view() {
          if (tug && t3) return '<div class="tug"><span style="color:' + CL[0] + '">' + NM[0] + '</span><span style="color:' + CL[1] + '">' + NM[1] + '</span></div><div class="scn tug3"></div>';
          if (tug) { var d = pos[1] - pos[0]; return '<div class="tug"><span style="color:' + CL[0] + '">' + NM[0] + '</span><div class="tbar"><i style="inset-inline-start:' + (50 + d * 11) + '%">🪢</i></div><span style="color:' + CL[1] + '">' + NM[1] + '</span></div>'; }
          return '<ol class="rb">' + pos.map(function (p, k) { return '<li class="lane' + (k === t ? ' me' : '') + '"><span class="ln" style="color:' + CL[k] + '">' + NM[k] + '</span><span class="trk"><i style="inset-inline-start:' + Math.round(p / goal * 88) + '%">🏎️</i><em>🏁</em></span><span><b>' + p + '</b></span></li>'; }).join('') + '</ol>';
        }
        function ask() {
          var q = qs[qi % qs.length]; qi++; window.__q = q;
          box.innerHTML = view() + '<div class="gh"><span>الدور على: <b style="color:' + CL[t] + '">' + NM[t] + '</b></span></div><div class="qtext gq">' + txt(q.t) + '</div><div class="gopts">' + q.o.map(function (o, k) { return '<button class="gopt" data-k="' + k + '"><span class="lt">' + L[k] + '</span><span>' + txt(o) + '</span></button>'; }).join('') + '</div><div id="gfb" class="gfb"></div>'; if (t3) { $('.tug3').appendChild(t3.el); t3.set(pos[0] - pos[1]); }
          box.querySelectorAll('.gopt').forEach(function (b) { b.onclick = function () {
            var k = +b.dataset.k, ok = k === q.a; box.querySelectorAll('.gopt').forEach(function (x) { x.disabled = true; var xk = +x.dataset.k; if (xk === q.a) x.classList.add('ok'); else if (xk === k) x.classList.add('no'); });
            if (ok) pos[t]++; if (t3) t3.set(pos[0] - pos[1]); $('#gfb').innerHTML = ok ? '<b class="gy">صح! الفريق اتقدم.</b>' : '<b class="gn">غلط.</b> <span>' + txt(q.s) + '</span>';
            var win = tug ? (pos[0] - pos[1] >= goal ? 0 : pos[1] - pos[0] >= goal ? 1 : -1) : (pos[t] >= goal ? t : -1);
            later(function () { if (win >= 0) return fin(win); t = (t + 1) % N; ask(); }, ok ? 1100 : 2200);
          }; });
        }
        function fin(w) { box.innerHTML = view() + '<div class="gres"><h3>🏆 ' + NM[w] + ' كسب!</h3><button class="btn y" id="tag">العب تاني</button></div>'; if (t3) { $('.tug3').appendChild(t3.el); t3.set(pos[0] - pos[1]); t3.win(w); } $('#tag').onclick = function () { teamsGame(mode); }; }
        ask();
      };
    }


    function load3d(cb) {
      if (window.__3d !== undefined) return cb(window.__3d);
      var C = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
      Promise.all([import(C + '+esm'), import(C + 'examples/jsm/loaders/GLTFLoader.js/+esm'), import(C + 'examples/jsm/libs/meshopt_decoder.module.js/+esm'), new Promise(function (ok, no) { if (window.MODELS) return ok(); var sc = document.createElement('script'); sc.src = 'models.js?v=47'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); }), new Promise(function (ok) { if (window.HUMAN) return ok(); var s2 = document.createElement('script'); s2.src = 'models2.js?v=48'; s2.onload = ok; s2.onerror = ok; document.head.appendChild(s2); })]).then(function (x) {
        var T = x[0], ld = new x[1].GLTFLoader(); ld.setMeshoptDecoder(x[2].MeshoptDecoder); var models = {}, keys = Object.keys(window.MODELS);
        return Promise.all(keys.map(function (k) { var bin = atob(window.MODELS[k]), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Promise(function (ok, no) { ld.parse(u.buffer, '', function (g) { models[k] = g; ok(); }, no); }); })).then(function () { if (!window.HUMAN) return; var hb = atob(window.HUMAN), hu = new Uint8Array(hb.length); for (var i = 0; i < hb.length; i++) hu[i] = hb.charCodeAt(i); return Promise.all(['ha', 'hb'].map(function (k) { return new Promise(function (ok) { ld.parse(hu.buffer.slice(0), '', function (g) { models[k] = g; ok(); }, function () { ok(); }); }); })); }).then(function () { window.__3d = { T: T, models: models }; cb(window.__3d); });
      }).catch(function () { window.__3d = null; cb(null); });
    }
    function scene3(m, W, H, sky) {
      var T = m.T, r = new T.WebGLRenderer({ antialias: true }); r.setSize(W, H, false); r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.shadowMap.enabled = true; r.domElement.style.cssText = 'width:100%;height:auto;aspect-ratio:' + W + '/' + H + ';display:block;border-radius:14px';
      var sc = new T.Scene(); sc.background = new T.Color(sky); sc.fog = new T.Fog(sky, 22, 55); var cam = new T.PerspectiveCamera(48, W / H, 0.1, 100);
      sc.add(new T.HemisphereLight(0xffffff, 0x557744, 1.6)); var dl = new T.DirectionalLight(0xffffff, 2.4); dl.position.set(4, 10, 6); dl.castShadow = true; dl.shadow.camera.left = -14; dl.shadow.camera.right = 14; dl.shadow.camera.top = 14; dl.shadow.camera.bottom = -16; dl.shadow.mapSize.set(1024, 1024); sc.add(dl);
      var mixers = [], clock = new T.Clock(), S = { T: T, r: r, sc: sc, cam: cam, ups: [], el: r.domElement, seen: false };
      S.actor = function (key, scale) {
        var md = m.models[key], o = md.scene; o.scale.setScalar(scale); o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.traverse(function (n) { if (n.isMesh) n.castShadow = true; });
        var mx = new T.AnimationMixer(o); mixers.push(mx); var a = { obj: o, cur: null, play: function (name, once) { var clip = T.AnimationClip.findByName(md.animations, name); if (!clip) return; var act = mx.clipAction(clip); act.reset(); act.setLoop(once ? T.LoopOnce : T.LoopRepeat, once ? 1 : Infinity); act.clampWhenFinished = !!once; if (a.cur && a.cur !== act) act.crossFadeFrom(a.cur, 0.15, false); act.play(); a.cur = act; } };
        sc.add(o); return a;
      };

      S.human = function (key, shirt, shorts, scale, idleSeq) {
        try {
          var md = m.models[key]; if (!md) return null; var o = md.scene, bn = {}, skins = [];
          o.traverse(function (n) { if (n.isBone) bn[n.name] = n; if (n.isSkinnedMesh) skins.push(n); });
          var need = ['upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r', 'hand_l', 'hand_r', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r', 'foot_l', 'foot_r']; for (var q = 0; q < need.length; q++) if (!bn[need[q]]) return null;
          if (!md.rest) { md.rest = {}; Object.keys(bn).forEach(function (k) { md.rest[k] = bn[k].quaternion.clone(); }); }
          var body = skins[0]; skins.forEach(function (s) { if (s.geometry.attributes.position.count > body.geometry.attributes.position.count) body = s; });
          var geo = body.geometry, p = geo.attributes.position, miny = 1e9, maxy = -1e9, i; for (i = 0; i < p.count; i++) { var yy = p.getY(i); if (yy < miny) miny = yy; if (yy > maxy) maxy = yy; }
          var h = maxy - miny, col = new Float32Array(p.count * 3), cs = new T.Color(shirt), cr = new T.Color(0xffffff), cb = new T.Color(shorts), sk = new T.Color(0xc98f6a), hr = new T.Color(0x2a1d14), sh = new T.Color(0x151515), c;
          for (i = 0; i < p.count; i++) { var t = (p.getY(i) - miny) / h, ax = Math.abs(p.getX(i)) / h; c = sk; if (t < 0.04) c = sh; else if (t < 0.12) c = cr; else if (t < 0.27) c = sk; else if (t < 0.5 && ax < 0.2) c = cb; else if (t >= 0.5 && t < 0.84 && ax < 0.2) c = cs; else if (ax >= 0.2 && ax < 0.3 && t > 0.6) c = cs; else if (t > 0.93) c = hr; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
          geo.setAttribute('color', new T.BufferAttribute(col, 3));
          if (!md.mat) { md.mat = 1; o.traverse(function (n) { if (n.isMesh) { n.material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }); n.castShadow = true; n.frustumCulled = false; } }); }
          var g = new T.Group(); g.add(o); g.scale.setScalar(scale); o.position.set(0, 0, 0); o.rotation.set(0, 0, 0);
          function wp(x) { var v = new T.Vector3(); x.getWorldPosition(v); return v; }
          Object.keys(bn).forEach(function (k) { bn[k].quaternion.copy(md.rest[k]); }); g.updateMatrixWorld(true);
          var sx = Math.sign(o.worldToLocal(wp(bn.upperarm_l)).x - o.worldToLocal(wp(bn.upperarm_r)).x) || 1;
          var KM = { ua: ['upperarm', 'lowerarm'], la: ['lowerarm', 'hand'], th: ['thigh', 'calf'], ca: ['calf', 'foot'] };
          function apply(pp) {
            Object.keys(bn).forEach(function (k) { bn[k].quaternion.copy(md.rest[k]); });
            var fq = new T.Quaternion();
            ['ua', 'th', 'la', 'ca'].forEach(function (part) { ['l', 'r'].forEach(function (s) {
              var d = pp[part + '_' + s]; if (!d) return; var b = bn[KM[part][0] + '_' + s], ch = bn[KM[part][1] + '_' + s];
              g.updateMatrixWorld(true); o.getWorldQuaternion(fq);
              var cur = wp(ch).sub(wp(b)).normalize(), side = (s === 'l' ? sx : -sx);
              var D = new T.Vector3(d[0] * side, d[1], d[2]).normalize().applyQuaternion(fq);
              var qq = new T.Quaternion().setFromUnitVectors(cur, D), bq = new T.Quaternion(), pq = new T.Quaternion(); b.getWorldQuaternion(bq); b.parent.getWorldQuaternion(pq);
              b.quaternion.copy(pq.invert().multiply(qq).multiply(bq));
            }); });
          }
          function sym(ua, la, th, ca) { return { ua_l: ua, ua_r: ua, la_l: la, la_r: la, th_l: th, th_r: th, ca_l: ca, ca_r: ca }; }
          function PP(base, ov) { var r = {}, k; for (k in base) r[k] = base[k]; for (k in ov) r[k] = ov[k]; return r; }
          function K(t, pose, lean, y) { return { t: t, p: pose, lean: lean || 0, y: y || 0 }; }
          var IDLE = sym([.12, -1, 0], [.1, -1, .25], [.05, -1, 0], [0, -1, -.05]), IDLE2 = PP(IDLE, { ua_l: [.2, -1, .06], ua_r: [.2, -1, .06] });
          var READY = sym([.8, -.55, .3], [.45, -.3, 1], [.42, -1, .1], [.25, -1, -.25]);
          var JUMP = sym([.4, 1, .1], [.25, 1, .1], [.35, -1, 0], [.2, -.8, -.5]);
          var PL1 = PP(sym([.25, -.2, 1], [.15, -.15, 1], [0, -1, 0], [0, -1, 0]), { th_l: [.3, -1, .6], ca_l: [.1, -1, -.15], th_r: [.3, -1, -.5], ca_r: [.1, -.7, -1] });
          var PL2 = PP(PL1, { ua_l: [.25, -.4, 1], ua_r: [.25, -.4, 1], la_l: [.15, -.4, 1], la_r: [.15, -.4, 1] });
          var SEQ = {
            idle: [K(0, IDLE, 0, 0), K(1.2, IDLE2, 0, .01), K(2.4, IDLE, 0, 0)],
            ready: [K(0, READY, .1, -.08), K(.8, PP(READY, { ua_l: [.9, -.5, .35], ua_r: [.9, -.5, .35] }), .12, -.1), K(1.6, READY, .1, -.08)],
            'holding-both': [K(0, PL1, -.32, -.1), K(.5, PL2, -.5, -.14), K(1, PL1, -.32, -.1)],
            'attack-kick-right': [K(0, PP(IDLE, { ua_l: [1, -.2, .2], ua_r: [1, -.2, -.2] }), 0, 0), K(.22, PP(IDLE, { th_r: [.05, -.8, -.7], ca_r: [0, -.35, -1], ua_l: [1, -.2, .4], ua_r: [1, -.3, -.3] }), -.15, 0), K(.38, PP(IDLE, { th_r: [.05, -.35, 1], ca_r: [0, -1, .7], ua_l: [1, -.2, -.3], ua_r: [1, -.2, .4] }), .2, 0), K(.8, PP(IDLE, { th_r: [.05, -.1, 1], ca_r: [0, -1, .3], ua_l: [1, -.2, -.3], ua_r: [1, -.2, .4] }), .15, 0)],
            jump: [K(0, READY, .1, -.08), K(.35, JUMP, 0, .15)],
            'emote-yes': [K(0, sym([.35, 1, 0], [.25, 1, 0], [.15, -1, 0], [0, -1, 0]), 0, 0), K(.25, sym([.5, .9, .1], [.3, 1, .1], [.15, -1, 0], [0, -.8, -.4]), 0, .2), K(.5, sym([.35, 1, 0], [.25, 1, 0], [.15, -1, 0], [0, -1, 0]), 0, 0)],
            fall: [K(0, PL1, -.3, -.1), K(.7, sym([1, .3, 0], [1, .3, 0], [.1, -1, .2], [0, -1, -.3]), -1.45, 0)]
          };
          var cur = { p: PP(IDLE, {}), lean: 0, y: 0 }, seq = SEQ.idle, tt = 0, loop = true, from = null, bl = 1;
          function lerpSt(a, b, f) { var r = { p: {}, lean: a.lean + (b.lean - a.lean) * f, y: a.y + (b.y - a.y) * f }; Object.keys(b.p).forEach(function (k) { var u = a.p[k] || b.p[k], v = b.p[k]; r.p[k] = [u[0] + (v[0] - u[0]) * f, u[1] + (v[1] - u[1]) * f, u[2] + (v[2] - u[2]) * f]; }); return r; }
          function sample() { var ks = seq, T0 = ks[ks.length - 1].t, t = loop ? tt % T0 : Math.min(tt, T0), j = 0; while (j < ks.length - 2 && ks[j + 1].t <= t) j++; var a = ks[j], b = ks[j + 1], f = b.t > a.t ? Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))) : 1; f = f * f * (3 - 2 * f); return lerpSt(a, b, f); }
          function step(dt) { tt += dt; var tg = sample(); if (bl < 1) { bl = Math.min(1, bl + dt / 0.16); tg = lerpSt(from, tg, bl); } cur = tg; apply(cur.p); o.rotation.x = cur.lean; o.position.y = cur.y; }
          var act = { obj: g, cur: null, play: function (name, once) { var nm = name === 'idle' ? (idleSeq || 'idle') : name; var ns = SEQ[nm] || SEQ.idle; if (ns === seq && loop && !once) return; seq = ns; tt = 0; loop = !once || nm === 'emote-yes'; from = cur; bl = 0; } };
          sc.add(g); S.ups.push(step); step(0.001); return act;
        } catch (e) { return null; }
      };
      (function lp() { if (!r.domElement.isConnected && S.seen) { r.dispose(); return; } if (r.domElement.isConnected) S.seen = true; var dt = Math.min(clock.getDelta(), 0.05); mixers.forEach(function (x) { x.update(dt); }); S.ups.forEach(function (f) { f(dt); }); r.render(sc, cam); requestAnimationFrame(lp); })();
      return S;
    }
    function ground3(S, c1, c2, z) { var T = S.T, cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; var cx = cv.getContext('2d'); for (var i = 0; i < 8; i++) { cx.fillStyle = i % 2 ? c1 : c2; cx.fillRect(0, i * 32, 256, 32); } var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(1, 3); var g = new T.Mesh(new T.PlaneGeometry(90, 70), new T.MeshStandardMaterial({ map: tx })); g.rotation.x = -Math.PI / 2; g.position.z = z || 0; g.receiveShadow = true; S.sc.add(g); }
    function pen3d(m) {
      var S = scene3(m, 900, 300, 0x8ecbff), T = S.T, sc = S.sc; S.cam.position.set(0, 1.5, 5); S.cam.lookAt(0, 1.2, -7.5); ground3(S, '#3f9d4a', '#368c41', -14);
      var wh = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }), GZ = -7.5, GW = 8, GH = 2.6;
      function post(x, y, len, rot) { var p = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, len, 12), wh); p.position.set(x, y, GZ); if (rot) p.rotation.z = Math.PI / 2; p.castShadow = true; sc.add(p); }
      post(-GW / 2, GH / 2, GH); post(GW / 2, GH / 2, GH); post(0, GH, GW, true);
      var nm = new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.4 }); var net = new T.Mesh(new T.PlaneGeometry(GW, GH, 28, 9), nm); net.position.set(0, GH / 2, GZ - 1.2); sc.add(net);
      [-1, 1].forEach(function (sd) { var sn = new T.Mesh(new T.PlaneGeometry(1.2, GH, 4, 9), nm); sn.rotation.y = Math.PI / 2; sn.position.set(sd * GW / 2, GH / 2, GZ - 0.6); sc.add(sn); });
      var top = new T.Mesh(new T.PlaneGeometry(GW, 1.2, 28, 4), nm); top.rotation.x = Math.PI / 2; top.position.set(0, GH, GZ - 0.6); sc.add(top);
      var stand = new T.Mesh(new T.BoxGeometry(70, 7, 2), new T.MeshStandardMaterial({ color: 0x35456b })); stand.position.set(0, 3.5, -27); sc.add(stand);
      for (var k = 0; k < 90; k++) { var d = new T.Mesh(new T.BoxGeometry(0.5, 0.55, 0.2), new T.MeshBasicMaterial({ color: [0xffc928, 0xc23b3b, 0x1f6fd1, 0xffffff, 0x2fb36b][(k * 7) % 5] })); d.position.set(-27 + (k % 30) * 1.85, 1.4 + Math.floor(k / 30) * 1.7, -25.9); sc.add(d); }
      var kp = S.human('hb', 0xffc928, 0x222222, 1.15, 'ready') || S.actor('male', 2.4), kk = S.human('ha', 0xd23b3b, 0x1b2a55, 1.1) || S.actor('female', 2.2); kp.obj.position.set(0, 0, GZ + 0.5); kp.play('idle'); kk.obj.position.set(1.9, 0, 0.9); kk.obj.rotation.y = Math.PI; kk.play('idle');
      var ball = new T.Group(), bm = new T.Mesh(new T.SphereGeometry(0.23, 28, 20), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 })); bm.castShadow = true; ball.add(bm);
      [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [.7, .7, .7], [-.7, .7, -.7], [.7, -.7, -.7], [-.7, -.7, .7]].forEach(function (v) { var l = Math.hypot(v[0], v[1], v[2]), p = new T.Mesh(new T.SphereGeometry(0.08, 10, 8), new T.MeshStandardMaterial({ color: 0x151515 })); p.position.set(v[0] / l * 0.22, v[1] / l * 0.22, v[2] / l * 0.22); p.scale.set(1, 1, 0.4); p.lookAt(0, 0, 0); ball.add(p); }); sc.add(ball);
      var fly = null;
      S.ups.push(function () { if (!fly) return; var t = Math.min(1, (performance.now() - fly.t0) / fly.D); if (t < 0) return; var e = t * (2 - t); ball.position.x = fly.tx * e; ball.position.z = (GZ - 0.4) * e; ball.position.y = 0.23 + (fly.ty - 0.23) * e + Math.sin(Math.PI * t) * 0.7; ball.rotation.x -= 0.3; ball.rotation.z += 0.15; var kt = Math.min(1, t * 1.2), ke = kt * (2 - kt); kp.obj.position.x = fly.kx * ke; kp.obj.rotation.z = -Math.sign(fly.kx || 1) * 0.5 * ke; if (t >= 1) { var dn = fly.done; fly = null; if (dn) dn(); } });
      function reset() { fly = null; ball.position.set(0, 0.23, 0); ball.rotation.set(0, 0, 0); kp.obj.position.x = 0; kp.obj.rotation.z = 0; kp.play('idle'); kk.play('idle'); }
      function shoot(ok, side, done) { var tx = [-3, 0, 3][side], ty = [1.9, 0.8, 1.7][side], kx = ok ? (tx > 0 ? -2.2 : tx < 0 ? 2.2 : 3) : tx; kk.play('attack-kick-right', true); setTimeout(function () { kp.play('jump', true); fly = { t0: performance.now(), D: 800, tx: tx, ty: ty, kx: kx, done: done }; }, 350); }
      reset(); return { el: S.el, reset: reset, shoot: shoot };
    }
    function tug3d(m) {
      var S = scene3(m, 900, 300, 0xcfe8ff), T = S.T, sc = S.sc; S.cam.position.set(0, 1.5, 4.4); S.cam.lookAt(0, 0.85, 0); ground3(S, '#7fae4d', '#76a548', 0);
      var mud = new T.Mesh(new T.CircleGeometry(1.5, 32), new T.MeshStandardMaterial({ color: 0x6b4a2b })); mud.rotation.x = -Math.PI / 2; mud.position.y = 0.01; mud.scale.set(1.5, 0.6, 1); sc.add(mud);
      var asm = new T.Group(); sc.add(asm); var A = S.human('ha', 0xd23b3b, 0x1b2a55, 1.1) || S.actor('female', 1.9), B = S.human('hb', 0x1f6fd1, 0x1b2a55, 1.1) || S.actor('male', 1.9); asm.add(A.obj); asm.add(B.obj); A.obj.position.set(-2.6, 0, 0); A.obj.rotation.y = Math.PI / 2; B.obj.position.set(2.6, 0, 0); B.obj.rotation.y = -Math.PI / 2; A.play('holding-both'); B.play('holding-both');
      var rope = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 4.6, 10), new T.MeshStandardMaterial({ color: 0xb98a4a })); rope.rotation.z = Math.PI / 2; rope.position.set(0, 1.38, 0.12); rope.castShadow = true; asm.add(rope);
      var flag = new T.Mesh(new T.BoxGeometry(0.1, 0.5, 0.5), new T.MeshStandardMaterial({ color: 0xc23b3b })); flag.position.set(0, 0.8, 0.12); asm.add(flag);
      [-1.8, 1.8].forEach(function (x, i) { var st = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1.4, 8), new T.MeshStandardMaterial({ color: i ? 0x1f6fd1 : 0xc23b3b })); st.position.set(x * 1.0, 0.7, -1.2); sc.add(st); });
      var mid = new T.Mesh(new T.BoxGeometry(0.06, 0.02, 3), new T.MeshBasicMaterial({ color: 0xffffff })); mid.position.set(0, 0.02, 0); sc.add(mid);
      var tgt = 0; S.ups.push(function (dt) { asm.position.x += (tgt - asm.position.x) * Math.min(1, dt * 5); });
      return { el: S.el, set: function (d) { tgt = -d * 0.5; }, win: function (w) { (w === 0 ? A : B).play('emote-yes', true); (w === 0 ? B : A).play('fall', true); } };
    }
    function shootGame(kind, _l) {
      var pen = kind === 'pen', qs = shuffle(Q).slice(0, 10), i = 0, goals = 0, streak = 0, pts = 0, g3 = null;
      if (pen && !_l) return load3d(function (m) { window.__m3 = m; shootGame(kind, 1); });
      if (pen && window.__m3) g3 = pen3d(window.__m3);
      function scene(res, side) {
        var bx = res === 'goal' ? [20, 50, 80][side] : (res === 'miss' ? [8, 50, 92][side] : 50), by = pen ? (res === 'goal' || res === 'save' ? 24 : 12) : (res === 'goal' ? 22 : 8);
        if (pen && g3) return '<div class="scn pen3"></div>';
        if (pen) return '<div class="scn pen"><div class="goalf"><span class="kp" id="kp" style="left:' + (res === 'save' ? [20, 50, 80][side] : [80, 20, 50][side]) + '%">🧤</span></div><span class="ball" id="ball" style="left:50%;top:78%">⚽</span></div>';
        return '<div class="scn bsk"><div class="bboard"><div class="ring"></div></div><span class="ball" id="ball" style="left:50%;top:78%">🏀</span></div>';
      }
      function show() {
        if (i >= qs.length) return end();
        var q = qs[i]; window.__q = q;
        box.innerHTML = '<div class="gh"><span>' + (pen ? 'ضربة ' : 'رمية ') + (i + 1) + ' من ' + qs.length + '</span><span>' + (pen ? 'أهداف' : 'نقاط') + ': <b id="gsc">' + (pen ? goals : pts) + '</b></span></div>' + scene('idle', 1) + '<div class="qtext gq">' + txt(q.t) + '</div><div class="gopts">' + q.o.map(function (o, k) { return '<button class="gopt" data-k="' + k + '"><span class="lt">' + L[k] + '</span><span>' + txt(o) + '</span></button>'; }).join('') + '</div><div id="gfb" class="gfb"></div>';
        if (g3) { $('.scn').appendChild(g3.el); g3.reset(); }
        box.querySelectorAll('.gopt').forEach(function (b) { b.onclick = function () {
          var k = +b.dataset.k, ok = k === q.a, side = Math.floor(Math.random() * 3); box.querySelectorAll('.gopt').forEach(function (x) { x.disabled = true; var xk = +x.dataset.k; if (xk === q.a) x.classList.add('ok'); else if (xk === k) x.classList.add('no'); });
          var ball = $('#ball'), kp = $('#kp'); if (g3) { g3.shoot(ok, side); }
          if (ok) { streak++; if (pen) goals++; else pts += streak >= 3 ? 3 : 2; } else streak = 0;
          if (pen && !g3) { var tx = [20, 50, 80][side]; ball.style.left = tx + '%'; ball.style.top = '26%'; if (kp) kp.style.left = (ok ? [80, 20, 50][side] : tx) + '%'; }
          else if (!pen) { ball.style.left = ok ? '50%' : ['25%', '75%', '90%'][side]; ball.style.top = ok ? '26%' : '14%'; if (!ok) later(function () { ball.style.top = '78%'; }, 450); }
          $('#gsc').textContent = pen ? goals : pts;
          $('#gfb').innerHTML = (ok ? '<b class="gy">' + (pen ? 'جووول! ⚽' : 'سلة! 🏀' + (streak >= 3 ? ' ثلاثية' : '')) + '</b>' : '<b class="gn">' + (pen ? 'الحارس صدّها.' : 'ضاعت.') + '</b> <span>' + txt(q.s) + '</span>');
          later(function () { i++; show(); }, ok ? 1300 : 2400);
        }; });
      }
      function end() {
        var key = 'masarak_best_' + kind, best = +localStorage.getItem(key) || 0, sc = pen ? goals : pts; if (sc > best) { best = sc; try { localStorage.setItem(key, best); } catch (e) {} }
        box.innerHTML = '<div class="gres"><h3>' + (pen ? '⚽ سجّلت ' + goals + ' أهداف من ١٠' : '🏀 جمعت ' + pts + ' نقطة') + '</h3><p class="sub">أعلى نتيجة ليك: ' + best + '</p><button class="btn y" id="gagain">العب تاني</button></div>';
        $('#gagain').onclick = function () { shootGame(kind); };
      }
      show();
    }
    var cur = { pen: function () { shootGame('pen'); }, bsk: function () { shootGame('bsk'); }, quiz: quiz, mem: mem, race: race, team: function () { teamsGame('race'); }, tug: function () { teamsGame('tug'); } };
    document.querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function () { clearTimers(); document.querySelectorAll('[data-g]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); raceLeave(); cur[b.dataset.g](); }; });
    quiz();
  }
  function allPrint(D) {
    var h = '';
    for (var i = 0; i < Q.length; i++) h += questionPage(D, i, i + 1);
    if (D.shape === 'slide') return h;
    for (var j = 0; j < Q.length; j += 10) h += answersPage(D, j, Math.min(Q.length, j + 10), Q.length + 1 + j / 10);
    return h;
  }

  function loadAdmin() {
    var box = $('#adl'); if (!box) return;
    token().then(function (t) { return sbf('/rest/v1/profiles?select=id,name,phone,email,plan,exams_plan,plan_until,exams_until,grades,created_at&order=created_at.desc', {}, t); }).then(function (r) {
      var lb = { free: 'مجاني', pending: 'طلب اشتراك', paid: 'مشترك' };
      var pd = function (a) { return a.plan === 'pending' || a.exams_plan === 'pending' ? 0 : 1; }; r.sort(function (a, b) { return pd(a) - pd(b); });
      var btn = function (u, col, lbl) { var v = u[col], un = u[col === 'plan' ? 'plan_until' : 'exams_until'], left = v === 'paid' && un ? ' (' + daysLeft(un) + ' يوم)' : ''; return '<span class="sub">' + lbl + ': ' + lb[v] + left + '</span> ' + (v === 'paid' ? '<button class="btn y" data-ap="' + u.id + '|' + col + '|renew|' + (un || '') + '">+٣٠ يوم</button> <button class="btn" data-ap="' + u.id + '|' + col + '|free">إلغاء</button>' : '<button class="btn y" data-ap="' + u.id + '|' + col + '|renew|">فعّل ٣٠ يوم</button>'); };
      box.innerHTML = '<p class="sub">' + r.length + ' حساب</p>' + r.map(function (u) { return '<div class="ci adr"><span><b>' + esc(u.name || 'بدون اسم') + '</b> <span class="sub" dir="ltr">' + esc(u.phone || '') + ' ' + esc(u.email) + '</span>' + ((u.grades || []).length ? '<br><span class="sub">' + u.grades.map(gname).map(esc).join('، ') + '</span>' : '') + '</span><span>' + btn(u, 'plan', 'الاشتراك') + '</span></div>'; }).join('');
      box.querySelectorAll('[data-ap]').forEach(function (b) { b.onclick = function () { var x = b.dataset.ap.split('|'), bd = {}, uc = x[1] === 'plan' ? 'plan_until' : 'exams_until'; if (x[2] === 'renew') { var base = Math.max(Date.now(), x[3] ? new Date(x[3]).getTime() : 0); bd[x[1]] = 'paid'; bd[uc] = new Date(base + 30 * 86400000).toISOString(); } else { bd[x[1]] = x[2]; bd[uc] = null; } b.disabled = true; token().then(function (t) { return sbf('/rest/v1/profiles?id=eq.' + x[0], { method: 'PATCH', body: bd, prefer: 'return=minimal' }, t); }).then(loadAdmin).catch(function () { b.textContent = 'فشل'; }); }; });
    }).catch(function () { box.textContent = 'مشكلة في التحميل.'; });
  }
  var TOUR = [['#/editor', '✏️', 'صمّم مذكرتك', 'اكتب اسمك ورقمك واختار اللون والإطار، وشوف المذكرة بتتغير قدامك.', '[data-nav=editor]'], ['#/bank', '📚', 'بنك الأسئلة', 'أسئلة مرتبة بالحل والتلميح. التصفح مفتوح للكل.', '[data-nav=bank]'], ['#/exams', '📝', 'الاختبارات', 'ركّب اختبار بالأسئلة اللي تختارها واطبعه بورقة أو ورقتين.', '[data-nav=exams]'], ['#/account', '🔓', 'الاشتراك', 'سجّل حساب واختار صفك. التحميل والطباعة بيتفتحوا بعد تفعيل اشتراكك.', '.hbtns .acc']];
  function sheet(html, id) { var o = document.getElementById('wl'); if (o) o.remove(); var d = document.createElement('div'); d.id = 'wl'; d.innerHTML = '<div class="wlb" role="dialog" aria-modal="true">' + html + '</div>'; document.body.appendChild(d); return d; }
  var SPSEL = null;
  function spotPlace() {
    var sp = document.getElementById('spl'); if (!sp || !SPSEL) return;
    var el = document.querySelector(SPSEL); if (!el) return; var r = el.getBoundingClientRect(), p = 6;
    sp.style.cssText = 'left:' + (r.left - p) + 'px;top:' + (r.top - p) + 'px;width:' + (r.width + 2 * p) + 'px;height:' + (r.height + 2 * p) + 'px';
  }
  function spot(sel) {
    SPSEL = sel; var sp = document.getElementById('spl');
    if (!sp) { sp = document.createElement('div'); sp.id = 'spl'; document.body.appendChild(sp); }
    var el = document.querySelector(sel); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'center' });
    setTimeout(spotPlace, 60); spotPlace();
  }
  function spotOff() { SPSEL = null; var sp = document.getElementById('spl'); if (sp) sp.remove(); }
  window.addEventListener('resize', spotPlace); window.addEventListener('scroll', spotPlace, true);
  function tourEnd() { var o = document.getElementById('wl'); if (o) o.remove(); spotOff(); }
  function tourStep(i) {
    if (i >= TOUR.length) { tourEnd(); return; }
    var t = TOUR[i]; location.hash = t[0]; spot(t[4]);
    var d = sheet('<div class="wlt"><span class="wli">' + t[1] + '</span><span class="sub">' + (i + 1) + ' / ' + TOUR.length + '</span></div><h3>' + t[2] + '</h3><p>' + t[3] + '</p><div class="wlr"><button class="btn y" id="wn">' + (i === TOUR.length - 1 ? 'خلصنا' : 'التالي') + '</button><button class="btn" id="ws">تخطّي</button></div>');
    d.querySelector('#wn').onclick = function () { tourStep(i + 1); }; d.querySelector('#ws').onclick = tourEnd;
  }
  function welcome() {
    try { if (localStorage.getItem('masarak_seen')) return; localStorage.setItem('masarak_seen', '1'); } catch (e) {}
    setTimeout(function () {
      var d = sheet('<h3>نورت مسارك 👋</h3><p>عاوز جولة سريعة تعرّفك على الموقع في نص دقيقة؟</p><div class="wlr"><button class="btn y" id="wg">يلا نبدأ</button><button class="btn" id="wx">لاحقًا</button></div>');
      d.querySelector('#wg').onclick = function () { tourStep(0); }; d.querySelector('#wx').onclick = function () { d.remove(); };
    }, 900);
  }
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || '', parts = h.split('/'), app = $('#app'), name = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === name || (name === 's' || name === 'q') && a.dataset.nav === 'bank'); });
    window.scrollTo(0, 0); clearTimers(); if (window.speechSynthesis) speechSynthesis.cancel();
    if (name === 'print') { var st = $('#pgsty') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'pgsty' })); st.textContent = D.shape === 'slide' ? '@page{size:1120px 630px;margin:0}' : '@page{size:A4;margin:0}'; $('#print-area').innerHTML = allPrint(D); document.body.classList.add('printing'); return; }
    if (name === 'q' || name === 's') { var v = viewer(name, parseInt(parts[1], 10) || 1); app.innerHTML = v.html; v.after(); return; }
    if (!views[name]) name = 'home';
    app.innerHTML = views[name]();
    if (name === 'games') gamesInit();
    if (name === 'editor') {
      var tab = 's';
      var draw = function (full) {
        if (full) { $('#ctl').innerHTML = controls(); bindControls($('#ctl'), draw); }
        $('#pv').innerHTML = fitBox(tab === 's' ? summaryPage(D) : tab === 'e' ? examplePage(D, 1) : questionPage(D, 0), tab); fitAll();
      };
      $('#ctl').innerHTML = controls(); bindControls($('#ctl'), draw); draw(false);
      document.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); draw(false); }; });
      $('#pr').onclick = function () { if (tab === 'e') printPages(examplePage(D, 1)); else if (tab === 's') printPages(summaryPage(D) + questionPage(D, 0, 2)); else printPages(questionPage(D, 0, 1), D.shape === 'slide'); };
    }
    if (name === 'exams') examInit();
    if (name === 'bank') $('#prall').onclick = function () { printPages(allPrint(D), D.shape === 'slide'); };
    document.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function () { var id = b.dataset.add; if (cart.indexOf(id) < 0) cart.push(id); saveCart(); b.textContent = 'في السلة'; }; });
    document.querySelectorAll('[data-bundle]').forEach(function (b) { b.onclick = function () { PRODUCTS.forEach(function (p) { if (cart.indexOf(p.id) < 0) cart.push(p.id); }); saveCart(); location.hash = '#/cart'; }; });
    document.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { cart = cart.filter(function (x) { return x !== b.dataset.rm; }); saveCart(); route(); }; });
    if (name === 'home') { demoLoop($('.hero-p')); tiltInit(); var tc = $('#tryc'); if (tc) { var hp = $('.hero-p'), stop = function () { clearTimers(); }, setN = function (v) { hp.querySelectorAll('.nm').forEach(function (e) { e.textContent = v || 'اسم المدرس'; }); hp.querySelectorAll('.wm span').forEach(function (e) { e.textContent = v || 'اسم المدرس'; }); };
      $('#tn').addEventListener('input', function () { stop(); setN(this.value.trim()); });
      $('#tp').addEventListener('input', function () { stop(); hp.querySelectorAll('.phone').forEach(function (e) { e.textContent = $('#tp').value.trim() || '01000000000'; }); });
      tc.querySelectorAll('[data-tc]').forEach(function (b) { b.onclick = function () { stop(); var pg = hp.querySelector('.page'); if (pg) pg.style.setProperty('--c', b.dataset.tc); tc.querySelectorAll('[data-tc]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }; }); } }
    if (name === 'guide') startGuide();
    revealInit();
    var cf = $('#cof'); if (cf) cf.onsubmit = function (e) {
      e.preventDefault(); var f = new FormData(cf), items = cartItems();
      var o = { id: 'MS-' + (1000 + ORDERS.length + 1), date: new Date().toLocaleDateString('ar-EG'), st: 1, pay: f.get('m'), total: cartSum(items), items: items.map(function (p) { return { id: p.id, t: p.title }; }), design: JSON.parse(JSON.stringify(D)) };
      ORDERS.unshift(o); localStorage.setItem('masarak_orders', JSON.stringify(ORDERS)); cart = []; saveCart(); location.hash = '#/orders';
    };
    document.querySelectorAll('[data-pk]').forEach(function (b) { b.onclick = function () { var c = b.dataset.pk, i = PICK.indexOf(c); if (i > -1) PICK.splice(i, 1); else PICK.push(c); b.setAttribute('aria-pressed', i === -1); }; });
    document.querySelectorAll('[data-am]').forEach(function (b) { b.onclick = function () { ACCMODE = b.dataset.am; ACCERR = ''; route(); }; });
    var af = $('#acf'); if (af) af.onsubmit = function (e) {
      e.preventDefault(); var f = new FormData(af), em = String(f.get('e')).trim().toLowerCase(), pw = f.get('w'), btn = af.querySelector('button[type=submit]'), er = $('#acerr'); if (ACCMODE === 'up' && f.get('w2') !== pw) { er.textContent = 'كلمتا السر مش متطابقتين.'; return; } btn.disabled = true; er.textContent = '';
      var go = ACCMODE === 'up' ? sbf('/auth/v1/signup', { method: 'POST', body: { email: em, password: pw, data: { name: String(f.get('n')).trim(), phone: String(f.get('p')).trim(), grades: PICK } } }).then(function (j) { if (!j.access_token) throw new Error('confirm'); setSess(j); }) : sbf('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: em, password: pw } }).then(setSess);
      go.then(loadProfile).then(function () { if (USER.name && !D.name) { D.name = USER.name; D.phone = USER.phone; save(); } route(); }).catch(function (x) {
        var m = String(x.message); btn.disabled = false;
        er.textContent = /already|registered/i.test(m) ? 'الإيميل ده متسجل قبل كده. جرّب "عندي حساب".' : /invalid login/i.test(m) ? 'الإيميل أو كلمة السر غلط.' : /password/i.test(m) ? 'كلمة السر لازم ٦ حروف على الأقل.' : /rate|limit/i.test(m) ? 'محاولات كتير، جرّب بعد شوية.' : 'حصلت مشكلة، جرّب تاني.';
      });
    };
    document.querySelectorAll('[data-rq]').forEach(function (pq) { pq.onclick = function () { var k = pq.dataset.rq; pq.disabled = true; setPlan('pending', k).then(function () { if (k === 'x') USER.xplan = 'pending'; else USER.plan = 'pending'; route(); }).catch(function () { pq.disabled = false; pq.textContent = 'حصلت مشكلة، جرّب تاني'; }); }; });
    if (name === 'admin' && USER.admin) loadAdmin();
    var lo = $('#lo'); if (lo) lo.onclick = signOut;
    document.querySelectorAll('[data-adv]').forEach(function (b) { b.onclick = function () { ORDERS.forEach(function (o) { if (o.id === b.dataset.adv) o.st = Math.min(2, o.st + 1); }); localStorage.setItem('masarak_orders', JSON.stringify(ORDERS)); route(); }; });
    document.querySelectorAll('[data-dl]').forEach(function (b) { b.onclick = function () { var a = b.dataset.dl.split('|'), o = ORDERS.filter(function (x) { return x.id === a[0]; })[0], d = o.design; if (a[1] === 'sum') printPages(summaryPage(d) + questionPage(d, 0, 2), false, true); else printPages(allPrint(d), d.shape === 'slide', true); }; });
    fitAll();
  }
  function revealInit() {
    var els = document.querySelectorAll('.steps > div, .feat .fc, .pc, .bundle, .panelw'); if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    els.forEach(function (e, k) { e.classList.add('rv'); e.style.transitionDelay = (k % 4) * 80 + 'ms'; io.observe(e); });
  }
  function intro() {
    if (REDUCE || sessionStorage.getItem('ms_intro') || location.hash.length > 2 && location.hash !== '#/') return;
    try { sessionStorage.setItem('ms_intro', '1'); } catch (e) {}
    var d = document.createElement('div'); d.id = 'intro';
    d.innerHTML = '<div class="isy"><i>x²</i><i>√</i><i>÷</i><i>π</i><i>∑</i><i>%</i><i>a⁵</i><i>∞</i></div><div class="ilogo"><span class="ik">\u265E\uFE0E</span><span class="it">كن <b>فارس</b> حلمك</span></div><div class="scene"><div class="book"><div class="bk back"></div><div class="bk pl p3"></div><div class="bk pl p2"></div><div class="bk pl p1"><div class="mini"><b>الوحدة الأولى</b><u></u><u></u><u></u><span id="itype"></span></div></div><div class="bk cover"><div class="cf"><div class="cb1">مسارك</div><div class="cb2">مذكرات باسمك</div><div class="cb3"></div></div><div class="cr"></div></div></div></div><div class="itag">مذكرتك <em>باسمك</em> وعلامتك</div><button id="iskip" type="button">تخطي</button>';
    document.body.appendChild(d);
    var nm = 'مستر ........', k = 0, ty = setInterval(function () { k++; var e = $('#itype'); if (e) e.textContent = nm.slice(0, k); if (k >= nm.length) clearInterval(ty); }, 120);
    var done = false;
    function end() { if (done) return; done = true; clearInterval(ty); d.classList.add('out'); setTimeout(function () { d.remove(); }, 900); }
    $('#iskip').onclick = end; d.onclick = end; setTimeout(end, 4600);
  }
  function hdr() {
    var a = document.querySelector('.hbtns .acc'); if (a) a.textContent = USER.name ? USER.name.split(' ')[0] : 'إنشاء حساب';
    var d = document.getElementById('dl'), best = 0;
    [[USER.plan, USER.until]].forEach(function (e) { if (e[0] === 'paid' && e[1] && new Date(e[1]).getTime() > Date.now()) best = Math.max(best, daysLeft(e[1])); });
    if (!best) { if (d) d.remove(); return; }
    if (!d) { d = document.createElement('a'); d.id = 'dl'; d.href = '#/account'; var hb = document.querySelector('.hbtns'); hb.insertBefore(d, hb.firstChild); }
    d.className = 'dl' + (best <= 3 ? ' low' : ''); d.title = 'الأيام المتبقية في اشتراكك'; d.innerHTML = '⏳ <b>' + best + '</b> يوم';
  }
  hdr(); intro();
  $('#dk').onclick = function () { document.body.classList.toggle('dark'); };
  saveCart();

  /* ===== exams ===== */
  var TOPICS = [['t1', 'قوانين الأسس (ضرب وقسمة وقوة القوة)', [0, 1, 2, 7, 14, 16]], ['t2', 'القوى الخاصة والإشارات', [3, 4, 6, 8, 9]], ['t3', 'توزيع الأس على الضرب والكسور', [5, 13, 19]], ['t4', 'الجذور التربيعية والتكعيبية', [10, 11, 12, 17]], ['t5', 'المعادلات الأسية والأعداد غير النسبية', [15, 18]]];
  var XESSAY = { t1: [{ t: 'أثبت بمثال عددي أن {{(a^m)^n = a^(m×n)}} ثم احسب {{(2^2)^3}}.', s: '{{(2^2)^3 = 2^(2×3) = 2^6 = 64}}' }], t2: [{ t: 'اشرح بكلماتك لماذا أي عدد لا يساوي صفرًا مرفوع للأس صفر يساوي 1، مع مثال.', s: '{{a^3 ÷ a^3 = a^(3-3) = a^0}} ومن جهة أخرى {{a^3 ÷ a^3 = 1}}، إذن {{a^0 = 1}}. مثال: {{7^0 = 1}}.' }], t3: [{ t: 'اكتب {{2^3 × 5^3}} على صورة قوة واحدة ثم احسب قيمتها، موضحًا خطوات الحل.', s: '{{2^3 × 5^3 = (2 × 5)^3 = 10^3 = 1000}}' }], t4: [{ t: 'احسب {{√[16|25] + ∛27}} موضحًا خطوات الحل.', s: '{{√[16|25] = [4|5]}} و {{∛27 = 3}}، فالناتج {{[4|5] + 3 = 3[4|5]}}.' }], t5: [{ t: 'وضّح الفرق بين العدد النسبي والعدد غير النسبي مع مثال لكل منهما.', s: 'العدد النسبي يمكن كتابته على صورة كسر مثل {{[1|2]}}، وغير النسبي لا يمكن مثل {{√2}}.' }] };
  var XSEC = { mcq: 'اختر الإجابة الصحيحة', tf: 'ظلل (صح) أو (خطأ)', match: 'صل بين العمودين', fill: 'أكمل ما يأتي', essay: 'أجب عن الأسئلة الآتية موضحًا خطوات الحل' };
  var ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع'];
  var MONTHS = ['أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];
  var EXAMS = []; try { EXAMS = JSON.parse(localStorage.getItem('masarak_exams') || '[]'); } catch (e) {}
  var saveExams = function () { try { localStorage.setItem('masarak_exams', JSON.stringify(EXAMS)); } catch (e) {} };
  var X = null, XV = 'A';
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuf(arr, r) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  var ARB = /[\u0600-\u06FF]/;
  function derOk(i) { var q = Q[i], o = q.o[q.a]; return /:$/.test(q.t) && o.indexOf('{{') < 0 && !ARB.test(o); }
  function stemOf(i) { return Q[i].t.replace(/:$/, ''); }
  function newExam() { return { id: 'x' + Date.now(), type: 'monthly', month: 'نوفمبر', title: '', topics: ['t1', 't2'], n: 6, nt: 3, nf: 3, ne: 2, time: 45, per: 1, pe: 3, models: 2, key: true, custom: [], gen: [], nm: 1, total: 20, ans: 'paper', seed: Date.now() % 100000 }; }
  function xpool(x) { var ids = []; TOPICS.forEach(function (t) { if (x.topics.indexOf(t[0]) >= 0) ids = ids.concat(t[2]); }); return ids; }
  function xcaps(x) { var p = xpool(x), d = p.filter(derOk), ess = d.length; TOPICS.forEach(function (t) { if (x.topics.indexOf(t[0]) >= 0) ess += (XESSAY[t[0]] || []).length; }); return { mcq: p.length, tf: d.length, fill: d.length, essay: ess, match: Math.floor(d.length / 4) }; }
  function xgen(x) {
    var r = rng(x.seed), p = xpool(x), cap = xcaps(x), d = p.filter(derOk), out = [];
    x.n = Math.min(x.n, cap.mcq); x.nt = Math.min(x.nt, cap.tf); x.nf = Math.min(x.nf, cap.fill); x.ne = Math.min(x.ne, cap.essay); x.nm = Math.min(x.nm || 0, cap.match);
    shuf(p.slice(), r).slice(0, x.n).sort(function (a, b) { return a - b; }).forEach(function (i) { out.push({ k: 'mcq', t: Q[i].t, o: Q[i].o.slice(), a: Q[i].a, s: Q[i].s }); });
    shuf(d.slice(), r).slice(0, x.nt).forEach(function (i) {
      var q = Q[i], truth = r() < 0.5, wr = q.o.filter(function (o, k) { return k !== q.a && o.indexOf('{{') < 0 && !ARB.test(o); });
      if (!wr.length) truth = true;
      var o = truth ? q.o[q.a] : wr[Math.floor(r() * wr.length)];
      out.push({ k: 'tf', t: stemOf(i) + ' {{' + o + '}}', a: truth ? 0 : 1, s: truth ? 'صح' : 'خطأ، والصواب {{' + q.o[q.a] + '}}.' });
    });
    shuf(d.slice(), r).slice(0, x.nf).forEach(function (i) { out.push({ k: 'fill', t: stemOf(i).replace(/\s*(يساوي|تساوي)$/, '') + ' = ........', ans: q_ans(i), s: Q[i].s }); });
    var pool = shuf(d.slice(), r), used = {}, mg = 0;
    for (var gi = 0; gi < x.nm; gi++) {
      var grp = [], seen = {};
      pool.forEach(function (i) { if (grp.length < 4 && !used[i] && !seen[q_ans(i)]) { grp.push(i); seen[q_ans(i)] = 1; } });
      if (grp.length < 4) break;
      grp.forEach(function (i) { used[i] = 1; });
      var rr = shuf(grp.slice(), r);
      out.push({ k: 'match', t: 'صل كل عبارة من العمود الأول بما يناسبها من العمود الثاني', l: grp.map(function (i) { return stemOf(i).replace(/\s*(يساوي|تساوي)$/, ''); }), r: rr.map(q_ans), a: grp.map(function (i) { return rr.indexOf(i); }), s: '' });
    }
    var ec = []; d.forEach(function (i) { var m = /\{\{(.+?)\}\}/.exec(Q[i].t); if (m && m[1].indexOf('=') < 0) ec.push({ t: 'أوجد قيمة {{' + m[1] + '}} موضحًا خطوات الحل.', s: Q[i].s }); });
    TOPICS.forEach(function (t) { if (x.topics.indexOf(t[0]) >= 0) ec = ec.concat(XESSAY[t[0]] || []); });
    shuf(ec, r).slice(0, x.ne).forEach(function (c) { out.push({ k: 'essay', t: c.t, s: c.s }); });
    x.gen = out;
  }
  function q_ans(i) { return Q[i].o[Q[i].a]; }
  function xtitle(x) { return x.title.trim() || (x.type === 'monthly' ? 'اختبار شهر ' + x.month : 'اختبار شامل على المنهج'); }
  function xitems(x, model) {
    var items = (x.gen || []).concat(x.custom.map(function (c) { return JSON.parse(JSON.stringify(c)); })).map(function (it) { return JSON.parse(JSON.stringify(it)); });
    if (model === 'B') {
      var r = rng(x.seed + 77);
      items.forEach(function (it) { if (it.k === 'mcq') { var idx = [0, 1, 2, 3]; shuf(idx, r); it.a = idx.indexOf(it.a); it.o = idx.map(function (k) { return it.o[k]; }); } });
      items.forEach(function (it) { if (it.k === 'match') { var ix = [0, 1, 2, 3]; shuf(ix, r); it.r = ix.map(function (k) { return it.r[k]; }); it.a = it.a.map(function (o) { return ix.indexOf(o); }); } });
      ['mcq', 'tf', 'match', 'fill', 'essay'].forEach(function (k) { var pos = [], its = []; items.forEach(function (it, i) { if (it.k === k) { pos.push(i); its.push(it); } }); shuf(its, r); pos.forEach(function (p, j) { items[p] = its[j]; }); });
    }
    assignMarks(x, items);
    return items;
  }
  var XW = { mcq: 1, tf: 1, fill: 1, essay: 3 };
  function assignMarks(x, items) {
    if (!x.total) { items.forEach(function (it) { it.m = it.k === 'essay' ? x.pe : it.k === 'match' ? x.per * it.l.length : x.per; }); return; }
    var w = items.map(function (it) { return it.k === 'match' ? it.l.length : XW[it.k]; }), W = w.reduce(function (a, b) { return a + b; }, 0), U = Math.round(x.total * 2), raw = w.map(function (v) { return U * v / W; }), fl = raw.map(Math.floor), left = U - fl.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (v, i) { return [v - fl[i], i]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, Math.max(0, left)).forEach(function (p) { fl[p[1]]++; });
    items.forEach(function (it, i) { it.m = fl[i] / 2; });
  }
  function fm(n) { return String(Math.round(n * 100) / 100); }
  function xsections(x, model) {
    var items = xitems(x, model), out = [], qi = 0;
    ['mcq', 'tf', 'match', 'fill', 'essay'].forEach(function (k) { var its = items.filter(function (it) { return it.k === k; }); its.forEach(function (it) { it.qi = qi++; }); if (its.length) out.push({ k: k, items: its }); });
    return out;
  }
  function xmarks(x) { var t = 0; xitems(x, 'A').forEach(function (it) { t += it.m; }); return t; }
  function xhead(x, d, model, sub) {
    return '<div class="xh"><div class="xh1"><b>' + esc(d.name.trim() || 'اسم المدرس') + '</b><span>' + esc(d.series.trim() || 'سلسلة المراجعة') + '</span></div><div class="xh2"><div class="xt">' + esc(xtitle(x)) + '</div><div class="xs">الصف الثالث الإعدادي، الفصل الدراسي الأول' + (sub ? '، ' + sub : (x.models > 1 ? '، نموذج (' + (model === 'B' ? 'ب' : 'أ') + ')' : '')) + '</div></div><div class="xh3">' + (d.logo ? '<img alt="" src="' + d.logo + '">' : '<span dir="ltr">' + esc(d.phone.trim() || '01000000000') + '</span>') + '</div></div>';
  }
  function xfoot(d, n, m) { return '<div class="xf"><span>' + esc(d.name.trim() || 'اسم المدرس') + '</span><span dir="ltr">' + esc(d.phone.trim() || '01000000000') + '</span><span>صفحة ' + n + ' من ' + m + '</span></div>'; }
  function xopen(d, nb) { return '<div class="xp"' + (nb ? ' data-nb="1"' : '') + ' style="--c:' + d.color + ';--ff:' + (d.font || 'Cairo') + '">'; }
  function xbub(q, sb, o) { return '<i class="xl" data-q="' + q + '" data-s="' + sb + '" data-o="' + o + '"></i>'; }
  function xblock(x, it, n) {
    var m = it.m, q = it.qi, h = '<div class="xq" data-q="' + q + '"><div class="xqh"><span class="xn">' + n + '</span><div class="xqt">' + txt(it.t) + '</div><span class="xm">(' + fm(m) + ' ' + (m > 2 && m < 11 ? 'درجات' : 'درجة') + ')</span></div>';
    if (it.k === 'mcq') h += '<div class="xo">' + it.o.map(function (o, k) { return '<span>' + xbub(q, 0, k) + '<b class="xlt">' + L[k] + '</b>' + txt(o) + '</span>'; }).join('') + '</div>';
    else if (it.k === 'tf') h += '<div class="xtf"><span>' + xbub(q, 0, 0) + 'صح</span><span>' + xbub(q, 0, 1) + 'خطأ</span></div>';
    else if (it.k === 'match') {
      h += '<div class="xmt"><div class="xmr">' + it.r.map(function (o, k) { return '<span><b class="xlt">' + L[k] + '</b> ' + txt(o) + '</span>'; }).join('') + '</div>' +
        it.l.map(function (l, i) { return '<div class="xml"><span class="xn s">' + (i + 1) + '</span><div class="xmq">' + txt(l) + '</div><div class="xmb">' + [0, 1, 2, 3].map(function (k) { return '<span>' + xbub(q, i, k) + '<b class="xlt">' + L[k] + '</b></span>'; }).join('') + '</div></div>'; }).join('') + '</div>';
    }
    else if (it.k === 'essay') h += '<div class="xlines"><i></i><i></i><i></i></div>';
    return h + '</div>';
  }
  var XH = { mcq: 108, tf: 84, match: 250, fill: 70, essay: 200 };
  function examPages(x, d, model) {
    var secs = xsections(x, model), N = +x.sheets || 0, tot = 0;
    secs.forEach(function (sec) { tot += 50 + sec.items.length * XH[sec.k]; });
    var s = 1; if (N > 0) { s = Math.max(0.6, Math.min(1, (700 + (N - 1) * 900) * 0.88 / tot)); }
    x.warn = N > 0 && tot * 0.6 > 0.88 * (700 + (N - 1) * 900);
    var pages = [[]], used = 0, cap = 610;
    secs.forEach(function (sec, si) {
      var total = sec.items.reduce(function (t, it) { return t + it.m; }, 0), hh = XH[sec.k] * s, sh = 50 * s;
      var hd = '<div class="xsec"><b>السؤال ' + ORD[si] + ':</b> ' + XSEC[sec.k] + '<span>(' + fm(total) + ' درجات)</span></div>';
      if (used + sh + hh > cap) { pages.push([]); used = 0; cap = 770; }
      pages[pages.length - 1].push(hd); used += sh;
      sec.items.forEach(function (it, i) {
        if (used + hh > cap) { pages.push([]); used = 0; cap = 770; }
        pages[pages.length - 1].push(xblock(x, it, i + 1)); used += hh;
      });
    });
    var wn = x.warn ? '<div class="xwarn">عدد الأسئلة كبير على ' + (N === 1 ? 'ورقة واحدة' : 'ورقتين') + '، قلل الأسئلة أو اختار ورقتين عشان الخط يفضل مقروء.</div>' : '', out = '', count = xitems(x, 'A').length;
    pages.forEach(function (pg, pi) {
      out += xopen(d, x.ans === 'sheet') + '%%MK%%' + xhead(x, d, model);
      if (pi === 0) out += '<div class="xinfo"><span>اسم الطالب: ................................</span><span>الفصل: ..........</span><span>التاريخ: ....../....../......</span></div><div class="xmeta"><span>الزمن: ' + (+x.time || 30) + ' دقيقة</span><span>عدد الأسئلة: ' + count + '</span><span>الدرجة الكلية: ' + xmarks(x) + '</span></div><div class="xins">أجب عن جميع الأسئلة الآتية.</div>';
      out += (pi === 0 ? wn : '') + '<div class="xqs" style="zoom:' + s + '">' + pg.join('') + '</div>' + xfoot(d, pi + 1, pages.length) + '</div>';
    });
    return out;
  }
  function examKey(x, d) {
    var out = xopen(d) + xhead(x, d, 'A', 'نموذج الإجابة (للمدرس)') + '<div class="xkey">';
    ['A', 'B'].slice(0, x.models > 1 ? 2 : 1).forEach(function (m) {
      out += '<div class="xkb"><h4>' + (x.models > 1 ? 'نموذج (' + (m === 'B' ? 'ب' : 'أ') + ')' : 'الإجابات') + '</h4>';
      xsections(x, m).forEach(function (sec, si) {
        out += '<div class="xks">السؤال ' + ORD[si] + '</div>';
        if (sec.k === 'essay') out += '<div class="xke">' + sec.items.map(function (it, i) { return '<div><b>' + (i + 1) + '</b> ' + txt(it.s || '') + '</div>'; }).join('') + '</div>';
        else out += '<div class="xkg">' + sec.items.map(function (it, i) { var v = sec.k === 'match' ? it.a.map(function (p, j) { return (j + 1) + '←' + L[p]; }).join('، ') : sec.k === 'mcq' ? L[it.a] : sec.k === 'tf' ? (it.a === 0 ? 'صح' : 'خطأ') : txt(it.ans || it.s || ''); return '<span><b>' + (i + 1) + '</b> ' + v + '</span>'; }).join('') + '</div>';
      });
      out += '</div>';
    });
    return out + '</div>' + xfoot(d, 1, 1) + '</div>';
  }
  function mk(model, i) {
    var bits = [1, model === 'B' ? 1 : 0, (i >> 2) & 1, (i >> 1) & 1, i & 1], par = bits.reduce(function (a, b) { return a + b; }, 0) % 2; bits.push(par);
    return '<i class="xmk" data-m="tl"></i><i class="xmk" data-m="tr"></i><i class="xmk" data-m="bl"></i><i class="xmk big" data-m="br"></i><div class="xcd">' + bits.map(function (b, k) { return '<u data-b="' + k + '" class="' + (b ? 'on' : '') + '"></u>'; }).join('') + '</div>';
  }
  function sheetPages(x, d, model) {
    var secs = xsections(x, model), rows = [];
    secs.forEach(function (sec) { sec.items.forEach(function (it) {
      if (it.k === 'mcq') rows.push({ lab: it.qi + 1, q: it.qi, s: 0, n: 4 });
      else if (it.k === 'tf') rows.push({ lab: it.qi + 1, q: it.qi, s: 0, n: 2, tf: 1 });
      else if (it.k === 'match') for (var j = 0; j < it.l.length; j++) rows.push({ lab: (it.qi + 1) + '-' + (j + 1), q: it.qi, s: j, n: 4 });
    }); });
    var per = 21 * 3, out = '', np = Math.max(1, Math.ceil(rows.length / per));
    for (var p = 0; p < np; p++) {
      var part = rows.slice(p * per, (p + 1) * per), cols = '';
      for (var c = 0; c < 3; c++) {
        var cr = part.slice(c * 21, (c + 1) * 21);
        cols += '<div class="xsc">' + cr.map(function (r) { var b = ''; for (var k = 0; k < r.n; k++) b += '<span>' + xbub(r.q, r.s, k) + '<b class="xlt">' + (r.tf ? (k ? 'خ' : 'ص') : L[k]) + '</b></span>'; return '<div class="xsr"><span class="xn s">' + r.lab + '</span>' + b + '</div>'; }).join('') + '</div>';
      }
      out += xopen(d, false) + '%%MK%%' + xhead(x, d, model, 'ورقة الإجابة') + '<div class="xinfo"><span>اسم الطالب: ................................</span><span>الفصل: ..........</span><span>التاريخ: ....../....../......</span></div><div class="xins">ظلل الدائرة المناسبة بقلم واضح (ظلل دائرة واحدة فقط لكل سؤال). صح = ص، خطأ = خ.</div><div class="xsg">' + cols + '</div>' + xfoot(d, p + 1, np) + '</div>';
    }
    return out;
  }
  function xdoc(x, d, model) { var h = examPages(x, d, model); if (x.ans === 'sheet') h += sheetPages(x, d, model); var i = 0; return h.replace(/%%MK%%/g, function () { return mk(model, Math.min(7, i++)); }); }
  function xall(x, d) { var h = xdoc(x, d, 'A'); if (x.models > 1) h += xdoc(x, d, 'B'); if (x.key) h += examKey(x, d); return h; }
  function xsig(x) { return JSON.stringify([xitems(x, 'A'), x.models > 1 ? xitems(x, 'B') : 0, x.ans, x.total, x.sheets]).length + ':' + (function (t) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; })(JSON.stringify([xitems(x, 'A'), x.models > 1 ? xitems(x, 'B') : 0, x.ans, x.total, x.sheets])); }
  function xlayout(x, d) {
    var host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-12000px;top:0;width:800px;visibility:hidden'; document.body.appendChild(host);
    var res = {};
    return (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      ['A', 'B'].slice(0, x.models > 1 ? 2 : 1).forEach(function (m) {
        host.innerHTML = xdoc(x, d, m); var pgs = [];
        host.querySelectorAll('.xp').forEach(function (pg) {
          var o = pg.getBoundingClientRect(), W = 800 / o.width, nb = pg.getAttribute('data-nb') === '1', P = { mk: {}, bub: [], crop: [], cd: [] };
          var cc = function (el) { var r = el.getBoundingClientRect(); return [(r.left + r.width / 2 - o.left) * W, (r.top + r.height / 2 - o.top) * W, r.width * W, r.height * W]; };
          pg.querySelectorAll('.xmk').forEach(function (e) { var c = cc(e); P.mk[e.dataset.m] = [c[0], c[1], c[2]]; });
          pg.querySelectorAll('.xcd u').forEach(function (e) { var c = cc(e); P.cd.push([c[0], c[1], c[2]]); });
          if (!nb || pg.querySelector('.xsg')) pg.querySelectorAll('.xl').forEach(function (e) { var c = cc(e); P.bub.push([+e.dataset.q, +e.dataset.s, +e.dataset.o, c[0], c[1], c[2] / 2]); });
          pg.querySelectorAll('.xq').forEach(function (e) { var r = e.getBoundingClientRect(); P.crop.push([+e.dataset.q, (r.left - o.left) * W, (r.top - o.top) * W, r.width * W, r.height * W]); });
          var ni = pg.querySelector('.xinfo'); if (ni) { var r2 = ni.getBoundingClientRect(); P.name = [(r2.left - o.left) * W, (r2.top - o.top) * W, r2.width * W, r2.height * W]; }
          pgs.push(P);
        });
        res[m] = pgs;
      });
      host.remove(); return res;
    });
  }
  function xsaveLayout() { return xlayout(X, D).then(function (lo) { X.layout = lo; X.lsig = xsig(X); var i = EXAMS.map(function (z) { return z.id; }).indexOf(X.id), cp = JSON.parse(JSON.stringify(X)); if (i >= 0) EXAMS[i] = cp; else EXAMS.push(cp); saveExams(); }); }
  window.__MX = { xdoc: xdoc, xlayout: xlayout, get EXAMS() { return EXAMS; }, saveExams: function () { saveExams(); }, xsections: xsections, xitems: xitems, xtitle: xtitle, xsig: xsig, fm: fm, txt: txt, esc: esc, L: L, $: $, toast: toast, loadH2C: loadH2C, D: function () { return D; }, get X() { return X; } };
  function chip(attr, v, on, label) { return '<button type="button" class="chip" ' + attr + '="' + v + '" aria-pressed="' + on + '">' + label + '</button>'; }
  function xcontrols() {
    var x = X, cp = xcaps(x);
    function num(k, label, max) { return '<label>' + label + '<input data-xk="' + k + '" type="number" min="0" max="' + max + '" value="' + x[k] + '"></label>'; }
    return '<div class="panel"><h3>إعدادات الاختبار</h3>' +
      '<label>اسم الاختبار (اختياري)<input data-xk="title" value="' + esc(x.title) + '" placeholder="' + esc(xtitle({ title: '', type: x.type, month: x.month })) + '"></label>' +
      '<div class="lab">نوع الاختبار</div><div class="pick">' + chip('data-xt', 'monthly', x.type === 'monthly', 'اختبار شهري') + chip('data-xt', 'full', x.type === 'full', 'شامل على المنهج كله') + '</div>' +
      (x.type === 'monthly' ? '<div class="lab">الشهر</div><div class="pick">' + MONTHS.map(function (m) { return chip('data-xm', m, x.month === m, m); }).join('') + '</div>' : '') +
      '<div class="lab">الدروس اللي اتشرحت (اختار اللي يدخل في الاختبار)</div><div class="pick">' + TOPICS.map(function (t) { return chip('data-xtp', t[0], x.topics.indexOf(t[0]) >= 0, t[1]); }).join('') + '</div>' +
      '<div class="lab">أنواع الأسئلة وعددها (الصفر يعني النوع ده مش هيظهر)</div>' +
      num('n', 'اختر الإجابة الصحيحة (متاح ' + cp.mcq + ')', cp.mcq) + num('nt', 'صح أو خطأ (متاح ' + cp.tf + ')', cp.tf) + num('nf', 'أكمل (متاح ' + cp.fill + ')', cp.fill) + num('nm', 'مزاوجة، كل سؤال ٤ عبارات (متاح ' + cp.match + ')', cp.match) + num('ne', 'أسئلة مقالية (متاح ' + cp.essay + ')', cp.essay) +
      '<div class="lab">الدرجة الكلية (بتتوزع على الأسئلة تلقائي)</div><div class="pick">' + [20, 40, 60, 100].map(function (t) { return chip('data-xtot', t, x.total === t, t); }).join('') + chip('data-xtot', '0', !x.total, 'يدوي') + '</div>' +
      '<div class="lab">الطالب بيجاوب فين؟ (للتصحيح من الصور)</div><div class="pick">' + chip('data-xans', 'paper', x.ans !== 'sheet', 'على ورقة الأسئلة نفسها') + chip('data-xans', 'sheet', x.ans === 'sheet', 'ورقة إجابة بدوائر منفصلة') + '</div>' +
      (x.total ? '' : num('per', 'درجة السؤال (اختر، صح وخطأ، أكمل)', 10) + num('pe', 'درجة السؤال المقالي', 20)) + num('time', 'الزمن بالدقائق', 180) +
      '<div class="lab">حجم الاختبار على الورق</div><div class="pick">' + chip('data-xsh', '0', !x.sheets, 'تلقائي') + chip('data-xsh', '1', x.sheets === 1, 'ورقة واحدة') + chip('data-xsh', '2', x.sheets === 2, 'ورقتين') + '</div>' + '<div class="lab">النماذج</div><div class="pick">' + chip('data-xmd', '1', x.models === 1, 'نموذج واحد') + chip('data-xmd', '2', x.models === 2, 'نموذجين (أ و ب) بترتيب مختلف') + '</div>' +
      '<div class="lab">نموذج الإجابة</div><div class="pick">' + chip('data-xkey', '1', x.key, 'اطبعه مع الاختبار') + chip('data-xkey', '0', !x.key, 'من غير') + '</div>' +
      '<button type="button" class="chip" id="xre" style="margin-top:12px;width:100%">🔀 أسئلة مختلفة من نفس الدروس</button>' +
      '<details class="xcus"><summary>+ أضف سؤال من عندك (أي نوع)</summary><label>نوع السؤال<select id="ck"><option value="mcq">اختر</option><option value="tf">صح أو خطأ</option><option value="fill">أكمل</option><option value="essay">مقالي</option></select></label><label>نص السؤال<input id="cq" placeholder="مثلا: ناتج {{2^3 × 2^2}} يساوي:"></label>' + ['أ', 'ب', 'ج', 'د'].map(function (l, k) { return '<label>الاختيار ' + l + ' (للاختر فقط)<input class="co" data-co="' + k + '"></label>'; }).join('') + '<label>الإجابة الصحيحة (للاختر: رقم الاختيار 1 إلى 4، لصح وخطأ: اكتب صح أو خطأ، للأكمل والمقالي: الإجابة النموذجية)<input id="ca"></label><button type="button" class="chip" id="cadd" style="margin-top:8px">إضافة السؤال</button>' + (x.custom.length ? '<div class="lab">أسئلتك (' + x.custom.length + ')</div>' + x.custom.map(function (c, i) { return '<div class="xcl"><span>' + txt(c.t) + '</span><button type="button" class="chip" data-cdel="' + i + '" aria-label="حذف">×</button></div>'; }).join('') : '') + '</details></div>';
  }
  function xlist() {
    return '<div class="xlist"><b>اختباراتك:</b> ' + (EXAMS.length ? EXAMS.map(function (e) { return '<span class="xli' + (X && e.id === X.id ? ' on' : '') + '"><button type="button" class="chip" data-xo="' + e.id + '">' + esc(xtitle(e)) + '</button><button type="button" class="chip" data-xd="' + e.id + '" aria-label="حذف">×</button></span>'; }).join('') : '<span class="muted">لسه مفيش اختبار محفوظ</span>') + ' <button type="button" class="chip" id="xnew">+ اختبار جديد</button></div>';
  }
  views.exams = function () {
    return '<section class="page-s"><h2>الاختبارات</h2><p class="sub">اعمل اختبار شهري على اللي اتشرح في الشهر، أو اختبار شامل على المنهج كله، بكل أنواع الأسئلة: اختر، صح وخطأ، أكمل، ومقالي. كل اختبار بيطلع باسمك وبرقمك وجاهز للطباعة، بنموذجين ونموذج إجابة.</p><div id="xl"></div><div class="ed"><div id="xc"></div><div class="prev"><div class="tabs" id="xtabs"></div><div id="xv"></div><button class="btn" id="xpr" style="margin-top:14px">اطبع الاختبار أو احفظ PDF</button> <button class="chip" id="xsv" style="margin-top:14px">💾 احفظ الاختبار</button><p class="muted" id="xmsg"></p></div></div></section>';
  };
  function examInit() {
    if (!X) { X = newExam(); var qs = /[?&]sh=(\d)/.exec(location.search); if (qs) X.sheets = +qs[1]; xgen(X); }
    var draw = function (full) {
      if (full !== false) { $('#xc').innerHTML = xcontrols(); xbind(); }
      $('#xl').innerHTML = xlist(); xbindList();
      var tabs = [['A', x_label('A')]]; if (X.models > 1) tabs.push(['B', x_label('B')]); if (X.key) tabs.push(['K', 'نموذج الإجابة']);
      if (!tabs.some(function (t) { return t[0] === XV; })) XV = 'A';
      $('#xtabs').innerHTML = tabs.map(function (t) { return '<button class="chip" data-xv="' + t[0] + '" aria-pressed="' + (XV === t[0]) + '">' + t[1] + '</button>'; }).join('');
      document.querySelectorAll('[data-xv]').forEach(function (b) { b.onclick = function () { XV = b.dataset.xv; draw(false); }; });
      var html = XV === 'K' ? examKey(X, D) : xdoc(X, D, XV);
      var pgs = html.split('<div class="xp" ').filter(Boolean).map(function (p) { return '<div class="xp" ' + p; });
      $('#xv').innerHTML = pgs.map(function (p) { return '<div style="margin-bottom:16px">' + fitBox(p, 's') + '</div>'; }).join(''); fitAll();
    };
    function x_label(m) { return X.models > 1 ? 'نموذج ' + (m === 'A' ? 'أ' : 'ب') : 'الاختبار'; }
    function xbind() {
      var c = $('#xc');
      c.querySelectorAll('[data-xk]').forEach(function (i) { i.onchange = function () { var k = i.dataset.xk; if (k === 'title') X.title = i.value; else { X[k] = Math.max(['n', 'nt', 'nf', 'ne', 'nm'].indexOf(k) >= 0 ? 0 : 1, parseInt(i.value, 10) || 0); if (['n', 'nt', 'nf', 'ne', 'nm'].indexOf(k) >= 0) xgen(X); } draw(k !== 'title'); }; if (i.dataset.xk === 'title') i.oninput = function () { X.title = i.value; draw(false); }; });
      c.querySelectorAll('[data-xt]').forEach(function (b) { b.onclick = function () { X.type = b.dataset.xt; if (X.type === 'full') { X.topics = TOPICS.map(function (t) { return t[0]; }); var cp = xcaps(X); X.n = cp.mcq; X.nt = Math.min(5, cp.tf); X.nf = Math.min(5, cp.fill); X.ne = Math.min(3, cp.essay); X.time = 90; } xgen(X); draw(); }; });
      c.querySelectorAll('[data-xm]').forEach(function (b) { b.onclick = function () { X.month = b.dataset.xm; draw(); }; });
      c.querySelectorAll('[data-xtp]').forEach(function (b) { b.onclick = function () { var t = b.dataset.xtp, i = X.topics.indexOf(t); if (i >= 0) { if (X.topics.length > 1) X.topics.splice(i, 1); } else X.topics.push(t); xgen(X); draw(); }; });
      c.querySelectorAll('[data-xtot]').forEach(function (b) { b.onclick = function () { X.total = +b.dataset.xtot; draw(); }; });
      c.querySelectorAll('[data-xans]').forEach(function (b) { b.onclick = function () { X.ans = b.dataset.xans; draw(); }; });
      c.querySelectorAll('[data-xsh]').forEach(function (b) { b.onclick = function () { X.sheets = +b.dataset.xsh; draw(); }; });
      c.querySelectorAll('[data-xmd]').forEach(function (b) { b.onclick = function () { X.models = +b.dataset.xmd; draw(); }; });
      c.querySelectorAll('[data-xkey]').forEach(function (b) { b.onclick = function () { X.key = b.dataset.xkey === '1'; draw(); }; });
      $('#xre').onclick = function () { X.seed += 13; xgen(X); draw(false); };
      $('#cadd').onclick = function () {
        var k = $('#ck').value, t = $('#cq').value.trim(), o = [].map.call(c.querySelectorAll('.co'), function (i) { return i.value.trim(); }), av = $('#ca').value.trim(), it;
        if (!t) { $('#xmsg').textContent = 'اكتب نص السؤال الأول.'; return; }
        if (k === 'mcq') { var n = parseInt(av, 10); if (o.some(function (v) { return !v; }) || !(n >= 1 && n <= 4)) { $('#xmsg').textContent = 'اكتب الأربع اختيارات ورقم الإجابة الصحيحة من 1 إلى 4.'; return; } it = { k: 'mcq', t: t, o: o, a: n - 1, s: '' }; }
        else if (k === 'tf') { if (av !== 'صح' && av !== 'خطأ') { $('#xmsg').textContent = 'اكتب في الإجابة: صح أو خطأ.'; return; } it = { k: 'tf', t: t, a: av === 'صح' ? 0 : 1, s: av }; }
        else if (k === 'fill') { it = { k: 'fill', t: t, ans: av || '', s: av }; }
        else it = { k: 'essay', t: t, s: av };
        X.custom.push(it); $('#xmsg').textContent = ''; draw();
      };
      c.querySelectorAll('[data-cdel]').forEach(function (b) { b.onclick = function () { X.custom.splice(+b.dataset.cdel, 1); draw(); }; });
    }
    function xbindList() {
      $('#xnew').onclick = function () { X = newExam(); xgen(X); draw(); };
      document.querySelectorAll('[data-xo]').forEach(function (b) { b.onclick = function () { var e = EXAMS.filter(function (z) { return z.id === b.dataset.xo; })[0]; if (e) { X = JSON.parse(JSON.stringify(e)); if (!X.gen || !X.gen.length || X.gen[0].k === undefined) { X.nt = X.nt || 3; X.nf = X.nf || 3; X.ne = X.ne || 2; X.pe = X.pe || 3; X.custom = (X.custom || []).map(function (c) { return c.k ? c : { k: 'mcq', t: c.t, o: c.o, a: c.a, s: '' }; }); xgen(X); } draw(); } }; });
      document.querySelectorAll('[data-xd]').forEach(function (b) { b.onclick = function () { EXAMS = EXAMS.filter(function (z) { return z.id !== b.dataset.xd; }); saveExams(); if (X && X.id === b.dataset.xd) { X = newExam(); xgen(X); } draw(); }; });
    }
    $('#xsv').onclick = function () { xsaveLayout().then(function () { $('#xmsg').textContent = 'اتحفظ. تقدر تعمل اختبار تاني من "+ اختبار جديد".'; draw(false); }); };
    $('#xpr').onclick = function () { xsaveLayout().then(function () { $('#xmsg').textContent = 'اتحفظ الاختبار تلقائي عشان تقدر تصححه من الصور.'; printPages(xall(X, D), false, false, 'x'); }); };
    draw();
  }

  window.addEventListener('hashchange', route);
  route();
  if (SESS) loadProfile().then(route);
  if (location.hash.indexOf('print') < 0) welcome();
})();
