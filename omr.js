/* Masarak OMR: reads marked circles from a photo of a printed exam page. Pure functions, no DOM. */
(function (root) {
  'use strict';
  function gray(d, w, h) { var g = new Uint8Array(w * h); for (var i = 0, j = 0; i < g.length; i++, j += 4) g[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8; return g; }
  function blur3(g, w, h) { var o = new Uint8Array(g.length); for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) { var i = y * w + x; o[i] = (g[i - w - 1] + g[i - w] + g[i - w + 1] + g[i - 1] + g[i] + g[i + 1] + g[i + w - 1] + g[i + w] + g[i + w + 1]) / 9; } return o; }
  function binarize(g, w, h, win, off) {
    var I = new Float64Array((w + 1) * (h + 1)), x, y, r = win >> 1;
    for (y = 0; y < h; y++) { var s = 0; for (x = 0; x < w; x++) { s += g[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; } }
    var b = new Uint8Array(w * h);
    for (y = 0; y < h; y++) { var y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1); for (x = 0; x < w; x++) { var x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), n = (x1 - x0) * (y1 - y0), m = (I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0]) / n; b[y * w + x] = g[y * w + x] < m - off ? 1 : 0; } }
    return b;
  }
  function comps(b, w, h, minA, maxSide) {
    var seen = new Uint8Array(w * h), out = [], st = new Int32Array(w * h);
    for (var p = 0; p < w * h; p++) {
      if (!b[p] || seen[p]) continue;
      var sp = 0, minx = w, maxx = 0, miny = h, maxy = 0, area = 0, sx = 0, sy = 0; st[sp++] = p; seen[p] = 1;
      while (sp) { var q = st[--sp], x = q % w, y = (q / w) | 0; area++; sx += x; sy += y; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
        if (x > 0 && b[q - 1] && !seen[q - 1]) { seen[q - 1] = 1; st[sp++] = q - 1; } if (x < w - 1 && b[q + 1] && !seen[q + 1]) { seen[q + 1] = 1; st[sp++] = q + 1; }
        if (y > 0 && b[q - w] && !seen[q - w]) { seen[q - w] = 1; st[sp++] = q - w; } if (y < h - 1 && b[q + w] && !seen[q + w]) { seen[q + w] = 1; st[sp++] = q + w; } }
      var bw = maxx - minx + 1, bh = maxy - miny + 1;
      if (area < minA || bw > maxSide || bh > maxSide) continue;
      out.push({ bw: bw, bh: bh, area: area, fill: area / (bw * bh), cx: sx / area, cy: sy / area, side: Math.sqrt(area) });
    }
    return out;
  }
  function dist(a, b) { return Math.hypot(a.cx - b.cx, a.cy - b.cy); }
  function cross(o, a, b) { return (a.cx - o.cx) * (b.cy - o.cy) - (a.cy - o.cy) * (b.cx - o.cx); }
  /* find the 4 corner markers: three small solid squares and one big one (bottom-right on the page) */
  function findMarkers(b, w, h, ratio) {
    var M = Math.max(w, h), cs = comps(b, w, h, 20, M * 0.14).filter(function (c) { return c.fill > 0.82 && c.bw / c.bh > 0.7 && c.bw / c.bh < 1.43 && c.bw > M * 0.008; });
    cs.sort(function (a, b2) { return b2.area - a.area; }); cs = cs.slice(0, 36);
    var best = null, bestA = 0, n = cs.length;
    for (var i = 0; i < n; i++) {
      var B = cs[i];
      for (var a = 0; a < n; a++) { if (a === i) continue; var A = cs[a]; if (B.side / A.side < 1.25 || B.side / A.side > 2.3) continue;
        for (var c = a + 1; c < n; c++) { if (c === i) continue; var C = cs[c]; if (Math.abs(C.side / A.side - 1) > 0.3) continue;
          for (var d = c + 1; d < n; d++) { if (d === i) continue; var Dd = cs[d]; if (Math.abs(Dd.side / A.side - 1) > 0.3) continue;
            var o = [A, C, Dd].sort(function (p, q) { return dist(q, B) - dist(p, B); }), TL = o[0], r1 = o[1], r2 = o[2], BL, TR;
            if (dist(r1, B) > dist(r2, B)) { TR = r1; BL = r2; } else { TR = r2; BL = r1; }
            var wd = dist(BL, B), ht = dist(TR, B); if (!(wd > M * 0.1 && ht > M * 0.1)) continue;
            var rt = wd / ht; if (rt < ratio * 0.6 || rt > ratio * 1.6) continue;
            var s1 = cross(B, TR, TL), s2 = cross(B, TL, BL); if (s1 * s2 <= 0) continue;
            var area = Math.abs(cross(TL, TR, B)) / 2 + Math.abs(cross(TL, B, BL)) / 2;
            if (area > bestA) { bestA = area; best = { tl: TL, tr: TR, bl: BL, br: B }; }
          } } }
    }
    return best;
  }
  function solve(A, bb) { var n = bb.length, i, j, k; for (i = 0; i < n; i++) A[i].push(bb[i]); for (i = 0; i < n; i++) { var m = i; for (j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[m][i])) m = j; var t = A[i]; A[i] = A[m]; A[m] = t; for (j = i + 1; j < n; j++) { var f = A[j][i] / A[i][i]; for (k = i; k <= n; k++) A[j][k] -= f * A[i][k]; } } var x = new Array(n); for (i = n - 1; i >= 0; i--) { var s = A[i][n]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; } return x; }
  /* homography mapping page coords (u,v) -> image coords */
  function homog(src, dst) { var A = [], b = []; for (var i = 0; i < 4; i++) { var u = src[i][0], v = src[i][1], x = dst[i][0], y = dst[i][1]; A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x); A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y); } var h = solve(A, b); return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1]; }
  function map(H, u, v) { var z = H[6] * u + H[7] * v + H[8]; return [(H[0] * u + H[1] * v + H[2]) / z, (H[3] * u + H[4] * v + H[5]) / z]; }
  function darkFrac(bin, w, h, H, cx, cy, r, scale) {
    var n = 0, dk = 0, K = 13;
    for (var i = 0; i < K; i++) for (var j = 0; j < K; j++) {
      var du = (i / (K - 1) * 2 - 1) * r, dv = (j / (K - 1) * 2 - 1) * r; if (du * du + dv * dv > r * r) continue;
      var p = map(H, cx + du, cy + dv), x = Math.round(p[0]), y = Math.round(p[1]); if (x < 0 || y < 0 || x >= w || y >= h) continue; n++;
      /* tolerate 1px jitter */
      if (bin[y * w + x] || (scale > 1.4 && (bin[y * w + Math.min(w - 1, x + 1)] && bin[y * w + Math.max(0, x - 1)]))) dk++;
    }
    return n ? dk / n : 0;
  }
  /* decode the 6 code squares: [anchor 1, model, page bits x3, parity] */
  function readCode(bin, w, h, H, P, scale) {
    var bits = P.cd.map(function (c) { return darkFrac(bin, w, h, H, c[0], c[1], c[2] * 0.2, scale) > 0.55 ? 1 : 0; });
    if (bits.length < 6 || bits[0] !== 1) return { bad: bits }; var par = bits.slice(0, 5).reduce(function (a, b2) { return a + b2; }, 0) % 2; if (par !== bits[5]) return { bad: bits };
    return { model: bits[1] ? 'B' : 'A', page: bits[2] * 4 + bits[3] * 2 + bits[4], bits: bits };
  }
  /* image: {data: RGBA, width, height}; layout: {A:[pages], B:[pages]} */
  function readPage(img, layout, opts) {
    opts = opts || {};
    var w = img.width, h = img.height, g = blur3(gray(img.data, w, h), w, h), M = Math.max(w, h), win = Math.max(31, Math.round(M / 9) | 1), bin = binarize(g, w, h, win, opts.off || 14);
    var ratio = 760 / 1090, mk = findMarkers(bin, w, h, ratio);
    if (!mk) return { ok: false, err: 'markers' };
    var any = null; for (var m in layout) { any = layout[m]; break; }
    var P0 = any[0]; function pt(n) { return [P0.mk[n][0], P0.mk[n][1]]; }
    var H = homog([pt('tl'), pt('tr'), pt('bl'), pt('br')], [[mk.tl.cx, mk.tl.cy], [mk.tr.cx, mk.tr.cy], [mk.bl.cx, mk.bl.cy], [mk.br.cx, mk.br.cy]]);
    var scale = Math.hypot(mk.tr.cx - mk.tl.cx, mk.tr.cy - mk.tl.cy) / Math.hypot(P0.mk.tr[0] - P0.mk.tl[0], P0.mk.tr[1] - P0.mk.tl[1]);
    var code = readCode(bin, w, h, H, P0, scale);
    if (!code || code.bad) return { ok: false, err: 'code', H: H, mk: mk, bits: code && code.bad };
    var P = layout[code.model] && layout[code.model][code.page]; if (!P) return { ok: false, err: 'layout', code: code };
    var groups = {};
    P.bub.forEach(function (b2) { var key = b2[0] + '.' + b2[1], f = darkFrac(bin, w, h, H, b2[3], b2[4], b2[5] * 0.62, scale); (groups[key] = groups[key] || { q: b2[0], s: b2[1], f: [] }).f[b2[2]] = f; });
    var ans = {}; Object.keys(groups).forEach(function (k) { ans[k] = decide(groups[k].f, opts); ans[k].q = groups[k].q; ans[k].s = groups[k].s; });
    return { ok: true, model: code.model, page: code.page, H: H, scale: scale, ans: ans, P: P };
  }
  /* decision on one question's option darkness values */
  function decide(f, opts) {
    var T1 = (opts && opts.t1) || 0.2, T0 = (opts && opts.t0) || 0.1, idx = f.map(function (v, i) { return i; }).sort(function (a, b2) { return f[b2] - f[a]; }), top = f[idx[0]], sec = f[idx[1]];
    if (top < T0) return { v: -1, st: 'blank', f: f };
    if (top < T1) return { v: idx[0], st: 'weak', f: f };
    if (sec >= T0 && sec > top * 0.45) return { v: idx[0], st: 'multi', f: f };
    return { v: idx[0], st: 'ok', f: f };
  }
  var API = { readPage: readPage, decide: decide, homog: homog, map: map, findMarkers: findMarkers, binarize: binarize, gray: gray, blur3: blur3 };
  if (typeof module !== 'undefined') module.exports = API; else root.OMR = API;
})(typeof window !== 'undefined' ? window : this);
