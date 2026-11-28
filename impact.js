/* Masarak: قياس الأثر. Pairs pre/post scores by a stable local student ID. Runs in the browser, nothing is uploaded. */
(function () {
  'use strict';
  var S = { pre: '', post: '', max: 100, sample: false };
  var css = '.im{max-width:1000px;margin:0 auto;padding:18px 14px 60px}.im h1{font-size:26px;margin:0 0 6px}.im .sub{color:#59627a;margin:0 0 16px}.im .card{background:#fff;border:1px solid #dfe4f0;border-radius:14px;padding:14px 16px;margin:0 0 14px}.im h2{font-size:18px;margin:0 0 10px}.im .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:700px){.im .two{grid-template-columns:1fr}}.im textarea{width:100%;min-height:150px;font:14px/1.5 monospace;direction:ltr;padding:8px;border:1px solid #c9d1e6;border-radius:9px;box-sizing:border-box}.im input[type=number]{font:inherit;padding:8px;border:1px solid #c9d1e6;border-radius:9px;width:90px}.im .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0}.im table{border-collapse:collapse;width:100%;font-size:14px}.im th,.im td{border-bottom:1px solid #e6eaf4;padding:6px;text-align:start}.im th{background:#f3f6fd}.im .stats{display:flex;gap:10px;flex-wrap:wrap}.im .st{flex:1;min-width:130px;background:#f3f6fd;border-radius:12px;padding:10px;text-align:center}.im .st b{display:block;font-size:24px;color:#12307a}.im .up{color:#14692c;font-weight:700}.im .dn{color:#a11d1d;font-weight:700}.im .warn{background:#fff4d6;color:#5c4200;border-radius:10px;padding:8px 12px;margin:8px 0}.im .bar{display:flex;height:12px;border-radius:6px;background:#eef2fb;overflow:hidden;margin:2px 0}.im .bar i{display:block;background:#12307a}.im .bar i.p{background:#f2b705}';
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function dig(s) { return String(s).replace(/[\u0660-\u0669]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/[\u06f0-\u06f9]/g, function (c) { return c.charCodeAt(0) - 1776; }).replace(/\u066b/g, '.'); }
  function nid(s) { return dig(s).trim().replace(/\s+/g, '').toLowerCase(); }
  function parse(txt) {
    var rows = [], bad = [];
    dig(txt).split(/\r?\n/).forEach(function (ln, k) {
      if (!ln.trim()) return;
      var c = ln.split(/[,;\t]/).map(function (x) { return x.trim(); });
      if (c.length < 2) { bad.push({ line: k + 1, raw: ln, why: 'سطر ناقص (محتاج رقم ودرجة)' }); return; }
      var id = nid(c[0]), sc = c[c.length - 1];
      if (k === 0 && isNaN(parseFloat(sc))) return;
      if (!id) { bad.push({ line: k + 1, raw: ln, why: 'مفيش رقم طالب' }); return; }
      var v = Number(sc); if (sc === '' || isNaN(v)) { bad.push({ line: k + 1, raw: ln, why: 'الدرجة مش رقم' }); return; }
      rows.push({ id: id, name: c.length > 2 ? c[1] : '', v: v, line: k + 1 });
    });
    return { rows: rows, bad: bad };
  }
  function split(p) {
    var by = {}; p.rows.forEach(function (r) { (by[r.id] = by[r.id] || []).push(r); });
    var ok = {}, dup = [];
    Object.keys(by).forEach(function (id) { if (by[id].length > 1) dup.push({ id: id, n: by[id].length, vals: by[id].map(function (r) { return r.v; }) }); else ok[id] = by[id][0]; });
    return { ok: ok, dup: dup };
  }
  function compute(pre, post, max) {
    var a = parse(pre), b = parse(post), A = split(a), B = split(b), out = { pairs: [], onlyPre: [], onlyPost: [], dupPre: A.dup, dupPost: B.dup, badPre: [], badPost: [], range: [] };
    var dupIds = {}; A.dup.concat(B.dup).forEach(function (d) { dupIds[d.id] = 1; });
    a.bad.forEach(function (x) { out.badPre.push(x); }); b.bad.forEach(function (x) { out.badPost.push(x); });
    Object.keys(A.ok).forEach(function (id) {
      var x = A.ok[id], y = B.ok[id];
      if (dupIds[id]) return;
      if (!y) { out.onlyPre.push(x); return; }
      if (x.v < 0 || x.v > max || y.v < 0 || y.v > max) { out.range.push({ id: id, pre: x.v, post: y.v }); return; }
      out.pairs.push({ id: id, name: y.name || x.name, pre: x.v, post: y.v, d: Math.round((y.v - x.v) * 100) / 100 });
    });
    Object.keys(B.ok).forEach(function (id) { if (!A.ok[id] && !dupIds[id]) out.onlyPost.push(B.ok[id]); });
    return out;
  }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function f1(x) { return (Math.round(x * 10) / 10).toString(); }
  function list(title, items, fmt) { return items.length ? '<h2>' + title + ' (' + items.length + ')</h2><table><tbody>' + items.map(function (x) { return '<tr><td>' + fmt(x) + '</td></tr>'; }).join('') + '</tbody></table>' : ''; }
  function result() {
    var r = compute(S.pre, S.post, S.max), n = r.pairs.length, h = '';
    if (!S.pre.trim() && !S.post.trim()) return '<p class="sub">الصق النتايج أو جرّب البيانات التجريبية.</p>';
    if (S.sample) h += '<div class="warn">بيانات تجريبية مخترعة للعرض بس. مش نتايج طلاب حقيقيين.</div>';
    h += '<div class="card"><h2>الطلاب اللي اتطابقوا (' + n + ')</h2>';
    if (n) {
      var mp = avg(r.pairs.map(function (p) { return p.pre; })), mq = avg(r.pairs.map(function (p) { return p.post; })), up = r.pairs.filter(function (p) { return p.d > 0; }).length, dn = r.pairs.filter(function (p) { return p.d < 0; }).length;
      h += '<div class="stats"><div class="st"><b>' + f1(mp) + '</b>متوسط قبل</div><div class="st"><b>' + f1(mq) + '</b>متوسط بعد</div><div class="st"><b>' + (mq - mp > 0 ? '+' : '') + f1(mq - mp) + '</b>متوسط التغيير</div><div class="st"><b>' + up + '</b>زادت درجتهم</div><div class="st"><b>' + (n - up - dn) + '</b>ثابتة</div><div class="st"><b>' + dn + '</b>قلّت</div></div>';
      h += '<div class="warn">ده تغيير في الدرجات بين الاختبارين لنفس الطلاب. مش دليل إن التدريس هو السبب، ممكن يكون اختلاف صعوبة الاختبارين أو عوامل تانية.</div>';
      h += '<table><thead><tr><th>الرقم</th><th>الاسم</th><th>قبل</th><th>بعد</th><th>التغيير</th><th></th></tr></thead><tbody>' + r.pairs.map(function (p) { return '<tr><td>' + esc(p.id) + '</td><td>' + esc(p.name) + '</td><td>' + p.pre + '</td><td>' + p.post + '</td><td class="' + (p.d > 0 ? 'up' : p.d < 0 ? 'dn' : '') + '">' + (p.d > 0 ? '+' : '') + p.d + '</td><td style="width:35%"><div class="bar"><i class="p" style="width:' + Math.min(100, p.pre / S.max * 100) + '%"></i></div><div class="bar"><i style="width:' + Math.min(100, p.post / S.max * 100) + '%"></i></div></td></tr>'; }).join('') + '</tbody></table><p class="sub">الأصفر قبل، الأزرق بعد.</p>';
    } else h += '<p class="sub">مفيش طلاب متطابقين لسه.</p>';
    h += '</div>';
    var o = list('في الاختبار القبلي بس (مفيش بعدي)', r.onlyPre, function (x) { return esc(x.id) + ' ' + esc(x.name) + ' : ' + x.v; }) +
      list('في الاختبار البعدي بس (مفيش قبلي)', r.onlyPost, function (x) { return esc(x.id) + ' ' + esc(x.name) + ' : ' + x.v; }) +
      list('أرقام مكررة في القبلي (مستبعدة من المقارنة)', r.dupPre, function (d) { return esc(d.id) + ' ظهر ' + d.n + ' مرات: ' + d.vals.join(' ، '); }) +
      list('أرقام مكررة في البعدي (مستبعدة من المقارنة)', r.dupPost, function (d) { return esc(d.id) + ' ظهر ' + d.n + ' مرات: ' + d.vals.join(' ، '); }) +
      list('درجات برا المدى 0 إلى ' + S.max + ' (مستبعدة)', r.range, function (x) { return esc(x.id) + ' : قبل ' + x.pre + ' بعد ' + x.post; }) +
      list('أسطر مش مفهومة في القبلي', r.badPre, function (x) { return 'سطر ' + x.line + ': ' + esc(x.why); }) +
      list('أسطر مش مفهومة في البعدي', r.badPost, function (x) { return 'سطر ' + x.line + ': ' + esc(x.why); });
    if (o) h += '<div class="card"><p class="sub">دول مش داخلين في المقارنة، ومحدش اتحسب بالغلط:</p>' + o + '</div>';
    return h;
  }
  var SAMPLE_PRE = 'id,name,score\n101,طالب ١,45\n102,طالب ٢,60\n103,طالب ٣,38\n104,طالب ٤,72\n105,طالب ٥,55\n106,طالب ٦,41\n107,طالب ٧,80\n108,طالب ٨,50\n108,طالب ٨ مكرر,52\n110,طالب ١٠,66';
  var SAMPLE_POST = 'id,name,score\n101,طالب ١,58\n102,طالب ٢,64\n103,طالب ٣,52\n104,طالب ٤,70\n105,طالب ٥,71\n106,طالب ٦,41\n107,طالب ٧,88\n109,طالب ٩,60\n110,طالب ١٠,75\n111,طالب ١١,abc';
  function draw() {
    $('#im-res').innerHTML = result();
  }
  function show() {
    var st = $('#imsty') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'imsty' })); st.textContent = css;
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === 'impact'); });
    $('#app').innerHTML = '<div class="im"><h1>قياس الأثر</h1><p class="sub">قارن درجات اختبار قبلي وبعدي لنفس الطلاب. الربط بالرقم الثابت للطالب (كود أو رقم جلوس)، مش بالاسم. كل حاجة بتتحسب على جهازك ومش بتتبعت لأي مكان.</p><div class="card"><div class="two"><div><h2>الاختبار القبلي</h2><textarea id="im-pre" placeholder="رقم الطالب,الاسم (اختياري),الدرجة"></textarea></div><div><h2>الاختبار البعدي</h2><textarea id="im-post" placeholder="رقم الطالب,الاسم (اختياري),الدرجة"></textarea></div></div><div class="row"><label>الدرجة الكبرى <input type="number" id="im-max" min="1" value="100"></label><button class="btn y" id="im-go">احسب</button><button class="btn" id="im-smp">جرّب بيانات تجريبية</button></div></div><div id="im-res"></div></div>';
    $('#im-pre').value = S.pre; $('#im-post').value = S.post; $('#im-max').value = S.max;
    var rd = function () { S.pre = $('#im-pre').value; S.post = $('#im-post').value; S.max = Math.max(1, +$('#im-max').value || 100); };
    $('#im-go').onclick = function () { rd(); S.sample = false; draw(); };
    $('#im-smp').onclick = function () { S.pre = SAMPLE_PRE; S.post = SAMPLE_POST; S.max = 100; S.sample = true; $('#im-pre').value = S.pre; $('#im-post').value = S.post; $('#im-max').value = 100; draw(); };
    draw();
  }
  function onHash() { if (location.hash.indexOf('#/impact') === 0) setTimeout(show, 0); }
  window.addEventListener('hashchange', onHash);
  window.__IM = { compute: compute, show: show };
  if (document.readyState !== 'loading') setTimeout(onHash, 50); else document.addEventListener('DOMContentLoaded', function () { setTimeout(onHash, 50); });
})();
