/* Masarak: تصحيح الاختبارات من صور الورق. Runs in the teacher's browser, nothing is uploaded. Uses omr.js and window.__MX from app.js. */
(function () {
  'use strict';
  var MX, G = { exam: null, st: [], rub: null, pass: 50, log: [], cam: null }, DB = null, saveT = 0;
  var LET = ['أ', 'ب', 'ج', 'د'];
  var css = '.gr{max-width:1100px;margin:0 auto;padding:18px 14px 60px}.gr h1{font-size:26px;margin:0 0 6px}.gr .sub{color:#59627a;margin:0 0 16px}.gr .card{background:#fff;border:1px solid #dfe4f0;border-radius:14px;padding:14px 16px;margin:0 0 14px}.gr h2{font-size:18px;margin:0 0 10px}.gr .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.gr select,.gr input[type=text],.gr input[type=number]{font:inherit;padding:8px 10px;border:1px solid #c9d1e6;border-radius:9px;background:#fff;min-height:40px}.gr .tag{display:inline-block;border-radius:20px;padding:3px 10px;font-size:13px;background:#eef2fb;color:#12307a}.gr .tag.ok{background:#e3f6e8;color:#14692c}.gr .tag.bad{background:#fde7e7;color:#a11d1d}.gr .tag.w{background:#fff4d6;color:#7a5600}.gr table{border-collapse:collapse;width:100%;font-size:14px}.gr th,.gr td{border-bottom:1px solid #e6eaf4;padding:7px 6px;text-align:start;vertical-align:middle}.gr th{background:#f3f6fd}.gr .crop{max-width:100%;border:1px solid #dfe4f0;border-radius:8px;display:block}.gr .nm{max-width:230px;height:auto}.gr .cell{border:1px solid #dfe4f0;border-radius:10px;padding:8px;background:#fafcff}.gr .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}.gr .b{font:inherit;border:1px solid #c9d1e6;background:#fff;border-radius:9px;padding:6px 12px;min-height:38px;cursor:pointer}.gr .b.on{background:#12307a;color:#fff;border-color:#12307a}.gr .b.g.on{background:#1b8a3c;border-color:#1b8a3c}.gr .b.r.on{background:#c0392b;border-color:#c0392b}.gr .b.h.on{background:#e0a100;border-color:#e0a100;color:#111}.gr .bar{height:16px;background:#12307a;border-radius:4px;min-width:2px}.gr video{width:100%;max-width:520px;border-radius:12px;background:#000}.gr .gn{font-size:13px;color:#59627a}.gr .chips{display:flex;gap:6px;flex-wrap:wrap}@media print{body>header,.site-h,.site-f,.gr .noprint{display:none!important}.gr .card{break-inside:avoid;border:0}}';

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fm(n) { return String(Math.round(n * 100) / 100); }

  /* ---------- storage: IndexedDB on this device ---------- */
  function idb() {
    return new Promise(function (res) {
      if (DB) return res(DB);
      try { var r = indexedDB.open('masarak_grade', 1); r.onupgradeneeded = function () { r.result.createObjectStore('g'); }; r.onsuccess = function () { DB = r.result; res(DB); }; r.onerror = function () { res(null); }; } catch (e) { res(null); }
    });
  }
  function dbGet(k) { return idb().then(function (d) { return d ? new Promise(function (res) { var q = d.transaction('g').objectStore('g').get(k); q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(null); }; }) : null; }); }
  function dbPut(k, v) { return idb().then(function (d) { return d ? new Promise(function (res) { var t = d.transaction('g', 'readwrite'); t.objectStore('g').put(v, k); t.oncomplete = res; t.onerror = res; }) : null; }); }
  function persist() { clearTimeout(saveT); saveT = setTimeout(function () { if (G.exam) dbPut(G.exam.id, { st: G.st, rub: G.rub, pass: G.pass }); }, 400); }

  /* ---------- exam helpers ---------- */
  function secs(model) { return MX.xsections(G.exam, model); }
  function npages(model) { var l = G.exam.layout && G.exam.layout[model]; return l ? l.length : 0; }
  function rubric(it) { var k = G.exam.id + ':' + it.t; return (G.rub[k] = G.rub[k] || [{ n: 'الطريقة', w: 50 }, { n: 'الناتج النهائي', w: 50 }]); }
  function ansOf(s, q, sub) { var k = q + '.' + sub; if (s.ov && s.ov[k] !== undefined) return { v: s.ov[k], st: 'ok', man: true }; var best = null; Object.keys(s.pg).forEach(function (p) { var a = s.pg[p].ans[k]; if (a) best = a; }); return best; }
  function flagged(s) { var out = []; Object.keys(s.pg).forEach(function (p) { var A = s.pg[p].ans; Object.keys(A).forEach(function (k) { if (A[k].st !== 'ok' && !(s.ov && s.ov[k] !== undefined)) out.push(k); }); }); return out; }
  function fillScore(s, it) {
    if (it.k === 'fill') { var v = s.sc && s.sc[it.qi]; return v == null ? null : v * it.m; }
    var st = s.sc && s.sc[it.qi]; if (!st) return null; var R = rubric(it), tot = R.reduce(function (a, r) { return a + r.w; }, 0) || 1, got = 0;
    R.forEach(function (r, i) { got += r.w * (st[i] || 0); }); return Math.round(it.m * got / tot * 2) / 2;
  }
  function score(s) {
    var tot = 0, max = 0, pend = 0, per = {};
    secs(s.model).forEach(function (sec) {
      sec.items.forEach(function (it) {
        max += it.m; var g = 0;
        if (it.k === 'mcq' || it.k === 'tf') { var a = ansOf(s, it.qi, 0); g = a && a.v === it.a ? it.m : 0; if (!a) pend++; }
        else if (it.k === 'match') { it.a.forEach(function (c, j) { var a = ansOf(s, it.qi, j); if (a && a.v === c) g += it.m / it.l.length; if (!a) pend++; }); }
        else { var f = fillScore(s, it); if (f == null) pend++; else g = f; }
        per[it.qi] = g; tot += g;
      });
    });
    return { tot: Math.round(tot * 100) / 100, max: max, pend: pend, per: per };
  }

  /* ---------- reading a photo ---------- */
  function warp(ctxData, w, h, H, x, y, cw, ch, ow) {
    var oh = Math.max(1, Math.round(ow * ch / cw)), c = document.createElement('canvas'); c.width = ow; c.height = oh;
    var cx = c.getContext('2d'), im = cx.createImageData(ow, oh), d = im.data, S = ctxData.data;
    for (var j = 0; j < oh; j++) for (var i = 0; i < ow; i++) {
      var p = OMR.map(H, x + i / ow * cw, y + j / oh * ch), sx = Math.round(p[0]), sy = Math.round(p[1]), o = (j * ow + i) * 4;
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) { d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = 255; continue; }
      var q = (sy * w + sx) * 4; d[o] = S[q]; d[o + 1] = S[q + 1]; d[o + 2] = S[q + 2]; d[o + 3] = 255;
    }
    cx.putImageData(im, 0, 0); return c.toDataURL('image/jpeg', 0.72);
  }
  function readCanvas(src, label) {
    var sc = Math.min(1, 1800 / Math.max(src.width, src.height)), w = Math.round(src.width * sc), h = Math.round(src.height * sc), c = document.createElement('canvas');
    c.width = w; c.height = h; var cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(src, 0, 0, w, h);
    var data = cx.getImageData(0, 0, w, h), r = OMR.readPage(data, G.exam.layout, {});
    if (!r.ok) return { ok: false, err: r.err, label: label };
    var P = r.P, items = {}; secs(r.model).forEach(function (sc2) { sc2.items.forEach(function (it) { items[it.qi] = it; }); });
    var need = {}, name = null, crops = {};
    if (r.page === 0 && P.name) name = warp(data, w, h, r.H, P.name[0], P.name[1], P.name[2], P.name[3], 420);
    Object.keys(r.ans).forEach(function (k) { if (r.ans[k].st !== 'ok') need[r.ans[k].q] = 1; });
    (P.crop || []).forEach(function (cr) { var it = items[cr[0]]; if (!it) return; if (it.k === 'fill' || it.k === 'essay' || need[cr[0]]) crops[cr[0]] = warp(data, w, h, r.H, cr[1], cr[2], cr[3], cr[4], 600); });
    var ans = {}; Object.keys(r.ans).forEach(function (k) { var a = r.ans[k]; ans[k] = { v: a.v, st: a.st, f: a.f.map(function (v) { return Math.round(v * 100) / 100; }), q: a.q, s: a.s }; });
    return { ok: true, model: r.model, page: r.page, ans: ans, name: name, crops: crops, label: label, est: false };
  }
  function addResult(r) {
    if (!r.ok) { G.log.push({ ok: false, t: r.label + ': الصفحة مش واضحة (' + (r.err === 'markers' ? 'علامات الأركان مش ظاهرة كلها' : r.err === 'code' ? 'كود الصفحة مش مقروء' : 'ورقة من اختبار تاني') + '). صوّرها تاني.' }); return false; }
    var s = G.st[G.st.length - 1], last = s ? Math.max.apply(null, Object.keys(s.pg).map(Number)) : -1;
    if (!s || s.model !== r.model || r.page <= last || s.pg[r.page]) { s = { id: Date.now() + '' + G.st.length, model: r.model, name: '', pg: {}, ov: {}, sc: {}, nm: null }; G.st.push(s); }
    s.pg[r.page] = { ans: r.ans, crops: r.crops }; if (r.name) s.nm = r.name; Object.keys(r.crops).forEach(function (q) { (s.cr = s.cr || {})[q] = r.crops[q]; });
    var nf = Object.keys(r.ans).filter(function (k) { return r.ans[k].st !== 'ok'; }).length;
    G.log.push({ ok: true, t: r.label + ': طالب ' + G.st.length + '، صفحة ' + (r.page + 1) + ' (نموذج ' + r.model + ')' + (nf ? '، ' + nf + ' إجابة محتاجة مراجعة' : '') });
    persist(); return true;
  }
  function fileToCanvas(f) {
    return new Promise(function (res, rej) { var u = URL.createObjectURL(f), im = new Image(); im.onload = function () { var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); URL.revokeObjectURL(u); res(c); }; im.onerror = function () { rej(); }; im.src = u; });
  }
  function processFiles(files) {
    var list = Array.prototype.slice.call(files).sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : (a.lastModified || 0) - (b.lastModified || 0); }), i = 0;
    $('#gr-busy').textContent = 'بقرا الصور...';
    (function next() {
      if (i >= list.length) { $('#gr-busy').textContent = ''; return draw(); }
      var f = list[i++]; $('#gr-busy').textContent = 'بقرا صورة ' + i + ' من ' + list.length + '...';
      fileToCanvas(f).then(function (c) { setTimeout(function () { addResult(readCanvas(c, f.name || 'صورة ' + i)); next(); }, 20); }, function () { G.log.push({ ok: false, t: f.name + ': مش قادر أفتح الصورة' }); next(); });
    })();
  }

  /* ---------- live camera ---------- */
  function camStop() { if (G.cam) { G.cam.run = false; if (G.cam.stream) G.cam.stream.getTracks().forEach(function (t) { t.stop(); }); G.cam = null; } var v = $('#gr-cam'); if (v) v.style.display = 'none'; }
  function camStart() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { alert('الكاميرا مش متاحة في المتصفح ده. استخدم رفع الصور.'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false }).then(function (st) {
      var box = $('#gr-camb'), v = $('#gr-vid'); box.style.display = 'block'; v.srcObject = st; v.play(); G.cam = { stream: st, run: true, last: '', t: 0, same: 0 };
      var loop = function () {
        if (!G.cam || !G.cam.run) return;
        if (v.videoWidth) {
          var c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
          var auto = $('#gr-auto').checked, r;
          if (auto) {
            r = readCanvas(c, 'كاميرا'); var key = r.ok ? r.model + r.page : '';
            if (r.ok && key === G.cam.pend) G.cam.same++; else G.cam.same = 0; G.cam.pend = key;
            if (r.ok && G.cam.same >= 1 && (key !== G.cam.last || Date.now() - G.cam.t > 4000)) { G.cam.last = key; G.cam.t = Date.now(); G.cam.same = 0; addResult(r); $('#gr-camm').textContent = 'تم تصوير صفحة ' + (r.page + 1) + ' ✔'; draw(true); }
            else if (!r.ok) $('#gr-camm').textContent = 'وجّه الكاميرا على الورقة كلها (الأركان الأربعة ظاهرة)';
          }
        }
        setTimeout(loop, 700);
      };
      loop();
    }, function () { alert('مفيش إذن للكاميرا. اسمح بالكاميرا من إعدادات المتصفح أو ارفع الصور.'); });
  }
  function camShot() {
    var v = $('#gr-vid'); if (!v || !v.videoWidth) return; var c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
    var r = readCanvas(c, 'كاميرا'); var ok = addResult(r); $('#gr-camm').textContent = ok ? 'تم ✔ صفحة ' + (r.page + 1) : 'الصفحة مش واضحة، حاول تاني'; draw(true);
  }

  /* ---------- export ---------- */
  function tableRows() {
    var rows = [], head = ['#', 'الاسم', 'النموذج', 'الدرجة', 'من', 'النسبة', 'النتيجة', 'مراجعة مطلوبة'];
    var ex = G.exam, maxq = []; secs('A').forEach(function (sc) { sc.items.forEach(function (it) { maxq.push(it); }); });
    head = head.concat(maxq.map(function (it) { return 'س' + (it.qi + 1); }));
    rows.push(head);
    G.st.forEach(function (s, i) { var r = score(s), pct = r.max ? r.tot / r.max * 100 : 0; var row = [i + 1, s.name || '', s.model, r.tot, r.max, Math.round(pct), pct >= G.pass ? 'ناجح' : 'راسب', flagged(s).length + r.pend]; var m = {}; secs(s.model).forEach(function (sc) { sc.items.forEach(function (it) { m[it.qi] = it; }); }); /* model B order differs: report by question number inside that model */ maxq.forEach(function (it) { var v = r.per[qOf(s, it)]; row.push(v == null ? '' : v); }); rows.push(row); });
    return rows;
  }
  function download(name, blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  function csv() { return '\ufeff' + tableRows().map(function (r) { return r.map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n'); }
  var CT = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], cen = [], off = 0;
    function u16(n) { return [n & 255, n >> 8 & 255]; } function u32(n) { return [n & 255, n >> 8 & 255, n >> 16 & 255, n >> 24 & 255]; }
    files.forEach(function (f) {
      var nb = enc.encode(f.n), db = enc.encode(f.d), cr = crc(db);
      var lh = [0x50, 0x4b, 3, 4].concat(u16(20), u16(0x800), u16(0), u16(0), u16(0x21), u32(cr), u32(db.length), u32(db.length), u16(nb.length), u16(0));
      parts.push(new Uint8Array(lh), nb, db);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x800), u16(0), u16(0), u16(0x21), u32(cr), u32(db.length), u32(db.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nb);
      off += lh.length + nb.length + db.length;
    });
    var cs = 0; cen.forEach(function (c) { cs += c.length; });
    var end = new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(files.length), u16(files.length), u32(cs), u32(off), u16(0)));
    return new Blob(parts.concat(cen, [end]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function col(i) { var s = ''; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function xlsx() {
    var rows = tableRows(), x = rows.map(function (r, i) { return '<row r="' + (i + 1) + '">' + r.map(function (v, j) { var ref = col(j) + (i + 1); return typeof v === 'number' ? '<c r="' + ref + '"><v>' + v + '</v></c>' : '<c r="' + ref + '" t="inlineStr"><is><t>' + esc(v) + '</t></is></c>'; }).join('') + '</row>'; }).join('');
    return zip([
      { n: '[Content_Types].xml', d: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
      { n: '_rels/.rels', d: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { n: 'xl/workbook.xml', d: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="النتائج" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { n: 'xl/_rels/workbook.xml.rels', d: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
      { n: 'xl/worksheets/sheet1.xml', d: '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews><sheetData>' + x + '</sheetData></worksheet>' }
    ]);
  }

  /* ---------- screens ---------- */
  function html() {
    var ex = MX.EXAMS.filter(function (e) { return e.layout; }), h = '<div class="gr"><h1>تصحيح الاختبارات من صور الورق</h1><p class="sub">صوّر ورق الطلاب بعد ما يجاوبوا، والمنصة بتقرأ إجابات الاختيار والصح والخطأ والتوصيل. الإكمل والمقالي بتصححهم بنفسك على الشاشة بضغطة. الصور والنتايج بتتحفظ على جهازك بس.</p>';
    if (!ex.length) return h + '<div class="card"><h2>مفيش اختبار جاهز للتصحيح</h2><p>اعمل اختبار من صفحة <a href="#/exams"><b>الاختبارات</b></a>، واضغط حفظ أو طباعة مرة، وارجع هنا.</p></div></div>';
    h += '<div class="card"><h2>١) اختار الاختبار</h2><div class="row"><select id="gr-ex">' + ex.map(function (e) { return '<option value="' + e.id + '"' + (G.exam && G.exam.id === e.id ? ' selected' : '') + '>' + esc(MX.xtitle(e)) + '</option>'; }).join('') + '</select><label>درجة النجاح % <input type="number" id="gr-pass" min="0" max="100" value="' + G.pass + '" style="width:80px"></label></div>';
    if (G.exam) { var bad = G.exam.lsig && G.exam.lsig !== MX.xsig(G.exam); if (bad) h += '<p class="tag bad" style="margin-top:8px">الاختبار اتعدّل بعد آخر حفظ للورقة. افتحه في صفحة الاختبارات واضغط حفظ تاني قبل التصحيح.</p>'; }
    h += '</div>';
    h += '<div class="card noprint"><h2>٢) صوّر أو ارفع الورق</h2><div class="row"><label class="b" style="display:inline-flex;align-items:center">📁 رفع صور<input type="file" id="gr-file" accept="image/*" multiple hidden></label><button class="b" id="gr-camgo">📷 كاميرا مباشرة</button><span id="gr-busy" class="tag w" style="display:none"></span></div>';
    h += '<div id="gr-camb" style="display:none;margin-top:10px"><video id="gr-vid" playsinline muted></video><div class="row" style="margin-top:8px"><button class="b on" id="gr-shot">صوّر الصفحة</button><label><input type="checkbox" id="gr-auto"> تصوير تلقائي (تجريبي)</label><button class="b" id="gr-camx">إغلاق الكاميرا</button></div><div id="gr-camm" class="gn"></div></div>';
    h += '<p class="gn" style="margin-top:8px">نصايح: الورقة كلها في الصورة والأركان الأربعة ظاهرة، إضاءة كويسة، من غير ظل على الورقة. صفحات الطالب الواحد ورا بعض. لو الصفحة مش واضحة هتظهر رسالة وتصورها تاني.</p>';
    if (G.log.length) h += '<div style="margin-top:8px;max-height:150px;overflow:auto">' + G.log.slice(-30).map(function (l) { return '<div class="gn"><span class="tag ' + (l.ok ? 'ok' : 'bad') + '">' + (l.ok ? 'تمام' : 'مرفوضة') + '</span> ' + esc(l.t) + '</div>'; }).join('') + '</div>';
    h += '</div>';
    return h + '<div id="gr-body"></div></div>';
  }
  function bodyHtml() {
    if (!G.st.length) return '';
    var h = '', R = G.st.map(score), P = G.st.length;
    h += '<div class="card"><h2>٣) الطلاب (' + P + ')</h2><div style="overflow:auto"><table><tr><th>#</th><th>الاسم (اكتبه من الصورة)</th><th>الصفحات</th><th>الدرجة</th><th>محتاج مراجعة</th><th></th></tr>';
    G.st.forEach(function (s, i) {
      var r = R[i], f = flagged(s).length, pgs = Object.keys(s.pg).map(function (p) { return +p + 1; }).sort().join('، '), tot = npages(s.model);
      h += '<tr><td>' + (i + 1) + '</td><td>' + (s.nm ? '<img class="crop nm" src="' + s.nm + '">' : '') + '<input type="text" data-nm="' + i + '" value="' + esc(s.name) + '" placeholder="اسم الطالب"></td><td>' + pgs + ' <span class="gn">من ' + tot + '</span></td><td><b>' + fm(r.tot) + '</b> / ' + fm(r.max) + '</td><td>' + (f ? '<span class="tag w">' + f + ' إجابة</span> <button class="b" data-rv="' + i + '">راجع</button>' : '<span class="tag ok">لا</span>') + (r.pend ? ' <span class="tag">' + r.pend + ' لسه من غير درجة</span>' : '') + '</td><td><button class="b" data-del="' + i + '">حذف</button></td></tr>';
    });
    h += '</table></div></div>';
    /* fill + essay grid */
    var sec = secs('A'), obj = [];
    sec.forEach(function (c) { if (c.k === 'fill' || c.k === 'essay') c.items.forEach(function (it) { obj.push(it); }); });
    if (obj.length) {
      h += '<div class="card"><h2>٤) تصحيح الإكمل والمقالي</h2><p class="gn">كل سؤال قدامك بإجابات كل الطلاب جنب بعض. اضغط الدرجة. المقالي بيتقسم لخطوات (الطريقة والناتج) وتعدّل وزنها من هنا.</p>';
      obj.forEach(function (it0, oi) {
        h += '<div class="card" style="background:#f8fafe"><div class="row"><b>سؤال ' + (it0.qi + 1) + ' (' + (it0.k === 'fill' ? 'إكمل' : 'مقالي') + ')</b><span class="tag">' + fm(it0.m) + ' درجة</span></div>';
        h += '<div class="gn" style="margin:6px 0">الإجابة النموذجية: ' + (it0.k === 'fill' ? MX.txt('{{' + esc(it0.ans) + '}}') : MX.txt(it0.s || '')) + '</div>';
        if (it0.k === 'essay') { var Rb = rubric(it0); h += '<div class="row noprint" style="margin-bottom:8px">' + Rb.map(function (r, j) { return '<span class="tag">' + esc(r.n) + ' <input type="number" min="0" max="100" value="' + r.w + '" data-rw="' + oi + '.' + j + '" style="width:56px;min-height:28px;padding:2px 4px">%</span>'; }).join('') + '</div>'; }
        h += '<div class="grid">';
        G.st.forEach(function (s, i) {
          var it = secs(s.model).reduce(function (a, c) { return a.concat(c.items); }, []).filter(function (z) { return z.k === it0.k && z.qi !== undefined && same(z, it0); })[0] || it0;
          var cr = s.cr && s.cr[it.qi], cur = s.sc && s.sc[it.qi];
          h += '<div class="cell"><div class="gn">طالب ' + (i + 1) + (s.name ? ': ' + esc(s.name) : '') + '</div>' + (cr ? '<img class="crop" src="' + cr + '">' : '<div class="tag bad">الصفحة دي لسه متصورتش</div>');
          if (it.k === 'fill') h += '<div class="row" style="margin-top:6px"><button class="b g' + (cur === 1 ? ' on' : '') + '" data-fs="' + i + '.' + it.qi + '.1">صح</button><button class="b h' + (cur === 0.5 ? ' on' : '') + '" data-fs="' + i + '.' + it.qi + '.0.5">نص</button><button class="b r' + (cur === 0 ? ' on' : '') + '" data-fs="' + i + '.' + it.qi + '.0">غلط</button></div>';
          else { h += '<div style="margin-top:6px">'; rubric(it).forEach(function (r, j) { var v = cur && cur[j]; h += '<div class="row" style="margin-bottom:4px"><span style="min-width:90px;font-size:13px">' + esc(r.n) + '</span><button class="b g' + (v === 1 ? ' on' : '') + '" data-es="' + i + '.' + it.qi + '.' + j + '.1">كامل</button><button class="b h' + (v === 0.5 ? ' on' : '') + '" data-es="' + i + '.' + it.qi + '.' + j + '.0.5">نص</button><button class="b r' + (v === 0 ? ' on' : '') + '" data-es="' + i + '.' + it.qi + '.' + j + '.0">صفر</button></div>'; }); var fs = fillScore(s, it); h += '<div class="gn">الدرجة: <b>' + (fs == null ? '-' : fm(fs)) + '</b></div></div>'; }
          h += '</div>';
        });
        h += '</div></div>';
      });
      h += '</div>';
    }
    /* report */
    var pcts = R.map(function (r) { return r.max ? r.tot / r.max * 100 : 0; }), pass = pcts.filter(function (p) { return p >= G.pass; }).length, avg = pcts.reduce(function (a, b) { return a + b; }, 0) / P, mx = Math.max.apply(null, pcts), mn = Math.min.apply(null, pcts), bins = [0, 0, 0, 0, 0];
    pcts.forEach(function (p) { bins[Math.min(4, Math.floor(p / 20))]++; });
    h += '<div class="card" id="gr-rep"><h2>٥) تقرير النتايج</h2><div class="row"><span class="tag ok">ناجحين: ' + pass + '</span><span class="tag bad">راسبين: ' + (P - pass) + '</span><span class="tag">المتوسط: ' + fm(avg) + '%</span><span class="tag">الأعلى: ' + fm(mx) + '%</span><span class="tag">الأقل: ' + fm(mn) + '%</span><span class="tag">عدد الطلاب: ' + P + '</span></div>';
    var mb = Math.max.apply(null, bins) || 1; h += '<div style="margin:12px 0">' + ['٠-٢٠', '٢٠-٤٠', '٤٠-٦٠', '٦٠-٨٠', '٨٠-١٠٠'].map(function (l, i) { return '<div class="row" style="margin-bottom:4px"><span style="width:70px">' + l + '%</span><div class="bar" style="width:' + Math.round(bins[i] / mb * 260) + 'px"></div><b>' + bins[i] + '</b></div>'; }).join('') + '</div>';
    h += '<h3 style="font-size:15px">نسبة الإجابة الصح لكل سؤال</h3><div class="chips">';
    sec.forEach(function (c) { c.items.forEach(function (it) { var ok = 0, n = 0; G.st.forEach(function (s, i) { if (s.model !== 'A' && false) return; var q = R[i].per[qOf(s, it)]; if (q != null) { n++; if (q >= it.m - 0.001) ok++; } }); h += '<span class="tag' + (n && ok / n < 0.5 ? ' bad' : '') + '">س' + (it.qi + 1) + ': ' + (n ? Math.round(ok / n * 100) : 0) + '%</span>'; }); });
    h += '</div><table style="margin-top:12px"><tr><th>#</th><th>الاسم</th><th>الدرجة</th><th>النسبة</th><th>النتيجة</th></tr>' + G.st.map(function (s, i) { var r = R[i]; return '<tr><td>' + (i + 1) + '</td><td>' + esc(s.name || 'طالب ' + (i + 1)) + '</td><td>' + fm(r.tot) + ' / ' + fm(r.max) + '</td><td>' + Math.round(pcts[i]) + '%</td><td>' + (pcts[i] >= G.pass ? '<span class="tag ok">ناجح</span>' : '<span class="tag bad">راسب</span>') + '</td></tr>'; }).join('') + '</table>';
    h += '<div class="row noprint" style="margin-top:12px"><button class="b on" id="gr-xl">تصدير Excel</button><button class="b" id="gr-csv">تصدير CSV</button><button class="b" id="gr-pr">طباعة / PDF</button><button class="b r" id="gr-clr">مسح كل الطلاب</button></div><p class="gn noprint">ملاحظة: النتايج دي تقدير من قراءة الصور وتصحيحك. راجع الإجابات المعلّمة قبل ما تعتمد الدرجات.</p></div>';
    return h;
  }
  /* question index of the same logical question inside the student's model */
  function same(a, b) { return a === b || (a.t === b.t && a.k === b.k); }
  function qOf(s, it) { if (s.model === 'A') return it.qi; var f = secs(s.model).reduce(function (x, c) { return x.concat(c.items); }, []).filter(function (z) { return same(z, it); })[0]; return f ? f.qi : it.qi; }

  function review(i) {
    var s = G.st[i], ks = flagged(s), items = {}; secs(s.model).forEach(function (c) { c.items.forEach(function (it) { items[it.qi] = it; }); });
    var h = '<div style="position:fixed;inset:0;background:rgba(10,20,50,.55);z-index:90;overflow:auto;padding:16px" id="gr-rvw"><div class="gr" style="background:#fff;border-radius:14px;padding:16px;max-width:760px"><div class="row" style="justify-content:space-between"><h2>مراجعة طالب ' + (i + 1) + '</h2><button class="b on" id="gr-rvx">تم</button></div><p class="gn">المنصة مش متأكدة من الإجابات دي (فاضية أو أكتر من علامة أو علامة خفيفة). اختار الصح من الصورة.</p>';
    ks.forEach(function (k) {
      var a = null; Object.keys(s.pg).forEach(function (p) { if (s.pg[p].ans[k]) a = s.pg[p].ans[k]; }); var it = items[a.q], cr = s.cr && s.cr[a.q], cur = s.ov[k], opts = it.k === 'tf' ? ['صح', 'خطأ'] : [0, 1, 2, 3].map(function (z) { return LET[z]; });
      h += '<div class="cell" style="margin-bottom:10px"><b>سؤال ' + (a.q + 1) + (it.k === 'match' ? ' (جزء ' + (a.s + 1) + ')' : '') + '</b> <span class="tag w">' + (a.st === 'blank' ? 'فاضية' : a.st === 'multi' ? 'أكتر من علامة' : 'علامة خفيفة') + '</span>' + (cr ? '<img class="crop" src="' + cr + '">' : '') + '<div class="row" style="margin-top:6px">' + opts.map(function (o, z) { return '<button class="b' + (cur === z ? ' on' : '') + '" data-ov="' + i + '|' + k + '|' + z + '">' + o + '</button>'; }).join('') + '<button class="b' + (cur === -1 ? ' on' : '') + '" data-ov="' + i + '|' + k + '|-1">من غير إجابة</button></div></div>';
    });
    if (!ks.length) h += '<p>مفيش حاجة للمراجعة.</p>';
    var d = document.createElement('div'); d.innerHTML = h + '</div></div>'; document.body.appendChild(d);
    d.querySelectorAll('[data-ov]').forEach(function (b) { b.onclick = function () { var p = b.dataset.ov.split('|'); G.st[+p[0]].ov[p[1]] = +p[2]; persist(); d.remove(); review(i); draw(true); }; });
    $('#gr-rvx').onclick = function () { d.remove(); draw(true); };
  }

  function draw(bodyOnly) {
    if (location.hash.indexOf('#/grade') !== 0) return;
    if (!bodyOnly) { $('#app').innerHTML = html(); bind(); }
    var b = $('#gr-body'); if (!b) return; var y = window.scrollY; b.innerHTML = bodyHtml(); bindBody(); window.scrollTo(0, y);
  }
  function bindBody() {
    document.querySelectorAll('[data-nm]').forEach(function (e) { e.oninput = function () { G.st[+e.dataset.nm].name = e.value; persist(); }; e.onchange = function () { draw(true); }; });
    document.querySelectorAll('[data-del]').forEach(function (e) { e.onclick = function () { if (confirm('حذف الطالب ده؟')) { G.st.splice(+e.dataset.del, 1); persist(); draw(true); } }; });
    document.querySelectorAll('[data-rv]').forEach(function (e) { e.onclick = function () { review(+e.dataset.rv); }; });
    document.querySelectorAll('[data-fs]').forEach(function (e) { e.onclick = function () { var p = e.dataset.fs.split('.'), s = G.st[+p[0]]; s.sc[p[1]] = +(p[2] + (p[3] ? '.' + p[3] : '')); persist(); draw(true); }; });
    document.querySelectorAll('[data-es]').forEach(function (e) { e.onclick = function () { var p = e.dataset.es.split('.'), s = G.st[+p[0]]; var a = s.sc[p[1]] = s.sc[p[1]] || {}; a[+p[2]] = +(p[3] + (p[4] ? '.' + p[4] : '')); persist(); draw(true); }; });
    document.querySelectorAll('[data-rw]').forEach(function (e) { e.onchange = function () { var p = e.dataset.rw.split('.'), o2 = []; secs('A').forEach(function (c) { if (c.k === 'fill' || c.k === 'essay') c.items.forEach(function (z) { o2.push(z); }); }); rubric(o2[+p[0]])[+p[1]].w = Math.max(0, +e.value || 0); persist(); draw(true); }; });
    var x = $('#gr-xl'); if (!x) return;
    var nm = function (e) { return 'نتايج-' + (MX.xtitle(G.exam) || 'اختبار').replace(/[^\u0600-\u06FFa-zA-Z0-9]+/g, '-'); };
    x.onclick = function () { download(nm() + '.xlsx', xlsx()); };
    $('#gr-csv').onclick = function () { download(nm() + '.csv', new Blob([csv()], { type: 'text/csv;charset=utf-8' })); };
    $('#gr-pr').onclick = function () { window.print(); };
    $('#gr-clr').onclick = function () { if (confirm('مسح كل الطلاب ونتايجهم من الجهاز؟')) { G.st = []; G.log = []; persist(); draw(); } };
  }
  function pick(id) {
    G.exam = MX.EXAMS.filter(function (e) { return e.id === id; })[0] || null; G.st = []; G.rub = {}; G.log = [];
    if (!G.exam) return Promise.resolve();
    return dbGet(G.exam.id).then(function (v) { if (v) { G.st = v.st || []; G.rub = v.rub || {}; G.pass = v.pass == null ? 50 : v.pass; } });
  }
  function bind() {
    var s = $('#gr-ex'); if (!s) return;
    s.onchange = function () { camStop(); pick(s.value).then(function () { draw(); }); };
    $('#gr-pass').onchange = function () { G.pass = Math.max(0, Math.min(100, +this.value || 50)); persist(); draw(true); };
    $('#gr-file').onchange = function () { var f = this.files; if (f && f.length) { var b = $('#gr-busy'); b.style.display = 'inline-block'; processFiles(f); } this.value = ''; };
    $('#gr-camgo').onclick = camStart; $('#gr-shot').onclick = camShot; $('#gr-camx').onclick = function () { camStop(); $('#gr-camb').style.display = 'none'; };
  }
  function show() {
    if (!window.__MX) return setTimeout(show, 100); MX = window.__MX;
    var st = $('#grsty') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'grsty' })); st.textContent = css;
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === 'grade'); });
    var ex = MX.EXAMS.filter(function (e) { return e.layout; });
    var go = function () { draw(); };
    if (!G.exam || ex.indexOf(G.exam) < 0 && !ex.some(function (e) { return e.id === G.exam.id; })) pick(ex.length ? ex[ex.length - 1].id : '').then(go); else { G.exam = ex.filter(function (e) { return e.id === G.exam.id; })[0]; go(); }
  }
  function onHash() { if (location.hash.indexOf('#/grade') === 0) setTimeout(show, 0); else camStop(); }
  window.addEventListener('hashchange', onHash);
  window.__GR = { G: G, readCanvas: readCanvas, addResult: addResult, draw: draw, pick: pick, score: score, xlsx: xlsx, csv: csv, show: show };
  if (document.readyState !== 'loading') setTimeout(onHash, 50); else document.addEventListener('DOMContentLoaded', function () { setTimeout(onHash, 50); });
})();
