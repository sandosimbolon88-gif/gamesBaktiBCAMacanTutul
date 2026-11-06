(function () {
  'use strict';
  const J = (window.JSMT = window.JSMT || {});
  J.W = 2400;
  J.H = 1350;
  J.VW = 1600;
  J.VH = 900;
  J.TAU = Math.PI * 2;
  J.R = 1;

  /* RNG ber-seed (mulberry32) supaya hutan bisa dibuat ulang persis sama. */
  J.rng = function (seed) {
    let a = (seed >>> 0) || 0x9e3779b9;
    const f = function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = (lo, hi) => lo + (hi - lo) * f();
    f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.chance = (p) => f() < p;
    f.seed = () => Math.floor(f() * 4294967295) >>> 0;
    f.weighted = (obj) => {
      let tot = 0;
      for (const k in obj) tot += obj[k];
      let x = f() * tot;
      for (const k in obj) {
        x -= obj[k];
        if (x <= 0) return k;
      }
      return Object.keys(obj)[0];
    };
    f.shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(f() * (i + 1));
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    };
    return f;
  };

  J.randomSeed = () => (Math.floor(Math.random() * 4294967295) >>> 0) || 1;
  J.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  J.lerp = (a, b, t) => a + (b - a) * t;
  J.now = () => performance.now() / 1000;

  J.makeCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  };

  J.ease = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
  };

  J.overlapArea = function (a, b) {
    const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    const iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    return ix > 0 && iy > 0 ? ix * iy : 0;
  };
  J.boxArea = (b) => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);

  J.fmtTime = function (sec) {
    sec = Math.max(0, Math.ceil(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  J.tpl = function (str, vars) {
    return String(str).replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
  };
})();
