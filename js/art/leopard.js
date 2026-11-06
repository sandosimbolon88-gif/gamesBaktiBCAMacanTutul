/* Gambar kartun macan tutul jawa (dan kucing kuwuk) yang dibuat dengan kode.
   Kaidah alam yang dijaga:
   - badan bertutul ROSET (lingkaran terbuka, tanpa titik tengah), kepala & kaki BINTIK padat
   - perut, dagu, moncong berwarna krem; telinga bulat dengan punggung telinga gelap
   - pupil BULAT (kucing besar), mata kuning kehijauan
   - ekor panjang (hampir sepanjang badan) dengan ujung gelap
   - macan kumbang: bulu hitam dengan roset yang masih samar terlihat
   - kucing kuwuk: jauh lebih kecil, bintik padat (bukan roset), garis putih di wajah, ekor bercincin */
(function () {
  'use strict';
  const J = window.JSMT;
  const A = (J.Art = J.Art || {});
  const TAU = Math.PI * 2;

  A.PAL = {
    spotted: { base: '#dd9d43', base2: '#e9b45e', belly: '#f7e8ca', spot: '#3a2312', ros: '#c07f33', outline: '#3a2110',
      ear: '#3a2110', earIn: '#f0d0a2', nose: '#b8604f', eye: '#cdd33b', pupil: '#140d06', whisker: '#fffaf0',
      shade: 'rgba(110,52,8,0.22)', hi: 'rgba(255,240,205,0.22)', far: 'rgba(60,25,0,0.26)' },
    black: { base: '#2d2622', base2: '#3b322d', belly: '#3d342f', spot: '#100c0a', ros: '#231c19', outline: '#0b0807',
      ear: '#0b0807', earIn: '#4b3e37', nose: '#43342e', eye: '#d9d548', pupil: '#050403', whisker: '#a59b92',
      shade: 'rgba(0,0,0,0.25)', hi: 'rgba(210,200,190,0.13)', far: 'rgba(0,0,0,0.3)' },
    blackIR: { base: '#8b8178', base2: '#958b82', belly: '#9a9188', spot: '#1b1613', ros: '#625850', outline: '#151110',
      ear: '#2a2320', earIn: '#7a6f66', nose: '#4a3d38', eye: '#d9d548', pupil: '#050403', whisker: '#d0c8c0',
      shade: 'rgba(0,0,0,0.2)', hi: 'rgba(255,255,255,0.1)', far: 'rgba(0,0,0,0.26)' },
    kuwuk: { base: '#cdb17a', base2: '#d9c18e', belly: '#f6efdd', spot: '#3b2a19', ros: null, outline: '#3a2817',
      ear: '#3a2817', earIn: '#efdcbc', nose: '#b0705f', eye: '#c9c23a', pupil: '#1a1208', whisker: '#fffaf0',
      shade: 'rgba(80,50,15,0.2)', hi: 'rgba(255,245,220,0.2)', far: 'rgba(50,30,5,0.26)' }
  };

  /* ---------- tekstur tutul (tile berulang) ---------- */
  const tiles = {};
  function wrapDraw(T, fn) {
    for (const oy of [-T, 0, T]) for (const ox of [-T, 0, T]) fn(ox, oy);
  }
  function rosetteTile(pal) {
    const T = 120, S = 2;
    const c = J.makeCanvas(T * S, T * S), g = c.getContext('2d');
    g.scale(S, S);
    const r = J.rng(7331);
    g.fillStyle = pal.base;
    g.fillRect(0, 0, T, T);
    const blobs = [];
    for (let i = 0; i < 10; i++) blobs.push([r() * T, r() * T, r.range(8, 18)]);
    g.fillStyle = pal.base2;
    g.globalAlpha = 0.4;
    wrapDraw(T, (ox, oy) => { for (const b of blobs) { g.beginPath(); g.arc(b[0] + ox, b[1] + oy, b[2], 0, TAU); g.fill(); } });
    g.globalAlpha = 1;
    const N = 4, cell = T / N, ros = [];
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const cx = (i + 0.5 + (j % 2 ? 0.5 : 0)) * cell + r.range(-4, 4);
        const cy = (j + 0.5) * cell + r.range(-4, 4);
        const rad = r.range(6.2, 8.4), n = r.int(4, 6), a0 = r() * TAU;
        const gap = r.chance(0.65) ? r.int(0, n - 1) : -1;
        const parts = [];
        for (let k = 0; k < n; k++) {
          if (k === gap) continue;
          const a = a0 + (k / n) * TAU + r.range(-0.18, 0.18);
          parts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.86, r.range(2.6, 3.7), r.range(1.7, 2.5), a + Math.PI / 2]);
        }
        ros.push({ cx, cy, rad, parts, rot: r() * TAU });
      }
    }
    const dots = [];
    for (let i = 0; i < 18; i++) dots.push([r() * T, r() * T, r.range(0.9, 1.5)]);
    wrapDraw(T, (ox, oy) => {
      for (const q of ros) {
        g.fillStyle = pal.ros;
        g.beginPath(); g.ellipse(q.cx + ox, q.cy + oy, q.rad * 0.78, q.rad * 0.66, q.rot, 0, TAU); g.fill();
        g.fillStyle = pal.spot;
        for (const p of q.parts) { g.beginPath(); g.ellipse(p[0] + ox, p[1] + oy, p[2], p[3], p[4], 0, TAU); g.fill(); }
      }
      g.fillStyle = pal.spot;
      for (const d of dots) { g.beginPath(); g.arc(d[0] + ox, d[1] + oy, d[2], 0, TAU); g.fill(); }
    });
    return c;
  }
  function spotTile(pal, seed) {
    const T = 60, S = 2;
    const c = J.makeCanvas(T * S, T * S), g = c.getContext('2d');
    g.scale(S, S);
    const r = J.rng(seed || 991);
    g.fillStyle = pal.base;
    g.fillRect(0, 0, T, T);
    const N = 6, cell = T / N, sp = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const rx = r.range(1.3, 2.3);
      sp.push([(i + 0.5 + (j % 2 ? 0.5 : 0)) * cell + r.range(-2.5, 2.5), (j + 0.5) * cell + r.range(-2.5, 2.5), rx, rx * r.range(0.7, 1), r() * TAU]);
    }
    g.fillStyle = pal.spot;
    wrapDraw(T, (ox, oy) => { for (const s of sp) { g.beginPath(); g.ellipse(s[0] + ox, s[1] + oy, s[2], s[3], s[4], 0, TAU); g.fill(); } });
    return c;
  }
  function kuwukTile(pal) {
    const T = 96, S = 2;
    const c = J.makeCanvas(T * S, T * S), g = c.getContext('2d');
    g.scale(S, S);
    const r = J.rng(4242);
    g.fillStyle = pal.base;
    g.fillRect(0, 0, T, T);
    const sp = [];
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
      sp.push([(i + 0.5 + (j % 2 ? 0.5 : 0)) * 16 + r.range(-2, 2), (j + 0.5) * 16 + r.range(-1.5, 1.5), r.range(3.4, 5), r.range(2, 2.8), r.range(-0.25, 0.25)]);
    }
    g.fillStyle = pal.spot;
    wrapDraw(T, (ox, oy) => { for (const s of sp) { g.beginPath(); g.ellipse(s[0] + ox, s[1] + oy, s[2], s[3], s[4], 0, TAU); g.fill(); } });
    return c;
  }
  function getPatterns(g, key, pal) {
    if (!tiles[key]) tiles[key] = { body: pal.ros ? rosetteTile(pal) : kuwukTile(pal), spot: spotTile(pal, key === 'kuwuk' ? 515 : 991) };
    const t = tiles[key];
    const m = new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]);
    const body = g.createPattern(t.body, 'repeat');
    const spot = g.createPattern(t.spot, 'repeat');
    if (body.setTransform) { body.setTransform(m); spot.setTransform(m); }
    return { body, spot };
  }

  /* ---------- kerangka sprite umum ---------- */
  A.makeSprite = function (o, bounds, draw) {
    const s = o.scale, R = o.R || 1, pad = 16;
    const [bx0, by0, bx1, by1] = bounds;
    const lw = (bx1 - bx0) * s + pad * 2, lh = (by1 - by0) * s + pad * 2;
    const c = J.makeCanvas(lw * R, lh * R);
    const g = c.getContext('2d', { willReadFrequently: true });
    const ax = o.flip ? bx1 * s + pad : -bx0 * s + pad;
    const ay = -by0 * s + pad;
    g.setTransform(R * s * (o.flip ? -1 : 1), 0, 0, R * s, ax * R, ay * R);
    g.lineJoin = 'round';
    g.lineCap = 'round';
    const info = draw(g) || {};
    g.setTransform(1, 0, 0, 1, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height);
    const d = img.data, W = c.width, H = c.height;
    let minx = W, miny = H, maxx = -1, maxy = -1;
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (d[(y * W + x) * 4 + 3] > 40) {
          if (x < minx) minx = x; if (x > maxx) maxx = x;
          if (y < miny) miny = y; if (y > maxy) maxy = y;
        }
      }
    }
    if (maxx < 0) { minx = 0; miny = 0; maxx = W; maxy = H; }
    const mapPt = (p) => ({ x: (o.flip ? -p.x : p.x) * s, y: p.y * s });
    return {
      canvas: c, R, lw: c.width / R, lh: c.height / R, ox: -ax, oy: -ay,
      box: { x0: minx / R - ax, y0: miny / R - ay, x1: (maxx + 2) / R - ax, y1: (maxy + 2) / R - ay },
      eyes: (info.eyes || []).map(mapPt),
      head: info.head ? Object.assign(mapPt(info.head), { r: (info.head.r || 20) * s }) : null,
      mask: img,
      scale: s
    };
  };

  /* Ubah sprite menjadi tampilan kamera inframerah (hitam-putih). */
  A.toIR = function (canvas, o) {
    o = o || {};
    const g = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width, h = canvas.height;
    const img = g.getImageData(0, 0, w, h), d = img.data;
    const gain = o.gain || 1, noise = o.noise == null ? 10 : o.noise, fol = o.foliage == null ? 0.9 : o.foliage;
    const cx = (o.cx == null ? 0.5 : o.cx) * w, cy = (o.cy == null ? 0.8 : o.cy) * h;
    const rad = Math.hypot(w, h) * (o.rad || 0.62), inv = 1 / rad;
    const lvl = o.level == null ? 1 : o.level;
    // tabel gamma (lebih cepat daripada Math.pow per piksel)
    const gamma = o.gamma || 1.08, lut = new Float32Array(512);
    for (let i = 0; i < 512; i++) lut[i] = Math.pow(Math.min(255, i) / 255, gamma) * 255;
    for (let y = 0; y < h; y++) {
      const dy2 = (y - cy) * (y - cy);
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] === 0) continue;
        const R = d[i], G = d[i + 1], B = d[i + 2];
        let v = R * 0.27 + G * 0.56 + B * 0.17;
        const green = G - (R > B ? R : B);
        if (green > 0) v += green * fol; // vegetasi memantulkan inframerah
        v *= gain;
        if (o.falloff) {
          const f = 1.28 - Math.sqrt((x - cx) * (x - cx) + dy2) * inv * 1.1;
          v *= f < 0.16 ? 0.16 : f > 1.06 ? 1.06 : f;
        } else v *= lvl;
        v = lut[v < 0 ? 0 : v > 511 ? 511 : v | 0] + (Math.random() - 0.5) * noise;
        v = v < 0 ? 0 : v > 255 ? 255 : v;
        d[i] = v; d[i + 1] = v; d[i + 2] = v * 0.97;
      }
    }
    g.putImageData(img, 0, 0);
  };

  /* Versi bercahaya untuk satwa yang sudah ditemukan. */
  A.glow = function (sp, color) {
    const key = '_glow_' + (color || 'g');
    if (sp[key]) return sp[key];
    const c = J.makeCanvas(sp.canvas.width, sp.canvas.height), g = c.getContext('2d');
    g.shadowColor = color || '#ffe15a';
    g.shadowBlur = 9 * sp.R;
    for (let i = 0; i < 3; i++) g.drawImage(sp.canvas, 0, 0);
    g.shadowBlur = 0;
    g.drawImage(sp.canvas, 0, 0);
    sp[key] = c;
    return c;
  };

  A.spriteHit = function (sp, lx, ly, tol) {
    const R = sp.R, m = sp.mask;
    const px = (lx - sp.ox) * R, py = (ly - sp.oy) * R;
    const offs = [[0, 0]];
    if (tol > 0) {
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * TAU;
        offs.push([Math.cos(a) * tol * R, Math.sin(a) * tol * R]);
        offs.push([Math.cos(a) * tol * R * 0.5, Math.sin(a) * tol * R * 0.5]);
      }
    }
    for (const [dx, dy] of offs) {
      const x = Math.round(px + dx), y = Math.round(py + dy);
      if (x >= 0 && y >= 0 && x < m.width && y < m.height && m.data[(y * m.width + x) * 4 + 3] > 60) return true;
    }
    return false;
  };

  /* ---------- pose (koordinat lokal, menghadap kanan, tanah di y=0) ---------- */
  const POSES = {
    crouch() {
      const g=POSES.lie();
      g.bounds=[-240,-116,170,14];
      g.parts[0].d='M -94 -23 C -151 -39 -181 -20 -220 -30';
      g.parts[0].tip='M -202 -25 L -220 -30';
      g.parts[3].d='M -105 -19 C -111 -67 -63 -79 -17 -70 C 31 -66 80 -62 99 -35 L 76 -10 L -79 -8 Z';
      g.parts[1].d='M 62 -28 Q 97 -30 88 -9';g.parts[2].e=[94,-8,12,6,0];
      g.parts[5].d='M 62 -24 Q 92 -19 104 -7';g.parts[6].e=[112,-6,13,6,0];
      g.head={x:123,y:-53,s:.97,turn:.65,tilt:.08};
      return g;
    },
    sniff(o) {
      const g=POSES.walk(o);
      g.bounds=[-235,-138,200,15];
      g.parts[11].d='M 45 -100 Q 90 -102 117 -69 L 146 -42 L 122 -18 Q 98 -45 70 -53 Z';
      g.head={x:149,y:-35,s:1,turn:.7,tilt:.30};
      return g;
    },
    stretch(o) {
      const g=POSES.walk(o);g.bounds=[-245,-200,207,15];
      g.parts[0].d='M -88 -108 Q -142 -176 -190 -153 Q -225 -136 -224 -164';
      g.parts[0].tip='M -213 -151 Q -225 -151 -224 -164';
      g.parts[5].d='M -100 -123 Q -87 -170 -48 -141 Q -8 -99 52 -61 L 91 -38 L 62 -20 Q -5 -39 -65 -80 Z';
      g.parts[6].e=[-72,-103,29,43,-.16];
      g.parts[3].d='M -76 -104 L -93 -7';g.parts[4].e=[-89,-7,12,6,0];
      g.parts[7].d='M -60 -102 Q -68 -49 -70 -7';g.parts[8].e=[-64,-7,13,7,0];
      g.parts[1].d='M 55 -40 L 126 -8';g.parts[2].e=[132,-7,12,6,0];
      g.parts[9].d='M 67 -35 L 150 -7';g.parts[10].e=[158,-6,13,7,0];
      g.parts[11].d='M 42 -66 Q 84 -84 116 -55 L 133 -27 L 83 -20 Z';
      g.head={x:136,y:-48,s:.98,turn:.6,tilt:.12};return g;
    },
    groom(o) {
      const g=POSES.sit(o);g.bounds=[-96,-203,116,17];
      g.parts[6].d='M 38 -91 Q 82 -99 63 -132';
      g.parts[7].e=[61,-134,12,9,-.4];
      g.head={x:39,y:-144,s:1.03,turn:.6,tilt:.48};return g;
    },
    curl() {
      return {bounds:[-137,-133,145,18],shadow:[-5,1,102,9],parts:[
        {k:'shape',d:'M -104 -13 C -127 -72 -79 -117 -14 -112 C 55 -115 108 -80 102 -33 Q 87 9 -49 6 Z',f:'body',own:true,body:{shade:[-3,-8,105,20],hi:[-27,-98,68,9],belly:[20,-28,43,26,.2]}},
        {k:'ell',e:[-63,-43,33,35,-.4],f:'body',own:true},
        {k:'line',d:'M -83 -14 C -25 29 93 19 117 -26 Q 123 -44 99 -40',w:17,f:'spot',tail:true,own:true,tip:'M 117 -26 Q 123 -44 99 -40'},
        {k:'ell',e:[66,-9,15,8,0],f:'spot',own:true}
      ],head:{x:64,y:-50,s:1,turn:-.15,tilt:-.32}};
    },
    scratch() {
      return {bounds:[-136,-260,150,18],shadow:[-20,0,81,9],parts:[
        {k:'line',d:'M -48 -45 Q -98 -25 -117 5 Q -127 18 -131 1',w:14,f:'spot',tail:true,tip:'M -117 5 Q -127 18 -131 1'},
        {k:'line',d:'M -27 -70 L -34 -7',w:19,f:'spot',far:true},
        {k:'ell',e:[-28,-5,15,7,0],f:'spot',far:true},
        {k:'shape',d:'M -51 -46 C -65 -99 -21 -158 26 -181 Q 48 -191 67 -174 L 52 -124 Q 14 -106 5 -41 Z',f:'body',own:true,body:{shade:[-20,-59,45,23],hi:[15,-153,25,12]}},
        {k:'ell',e:[-28,-51,28,33,-.35],f:'body',own:true},
        {k:'line',d:'M -22 -51 L -2 -7',w:20,f:'spot',own:true},
        {k:'ell',e:[6,-5,16,8,0],f:'spot',own:true},
        {k:'line',d:'M 39 -155 Q 71 -190 119 -185',w:16,f:'spot',own:true,far:true},
        {k:'ell',e:[125,-185,13,8,0],f:'spot',own:true,far:true},
        {k:'line',d:'M 51 -148 Q 93 -162 124 -208',w:18,f:'spot',own:true},
        {k:'ell',e:[129,-212,12,9,-.45],f:'spot',own:true}
      ],head:{x:68,y:-211,s:1,turn:.7,tilt:-.12}};
    },
    climb() {
      return {bounds:[-142,-286,145,118],shadow:null,parts:[
        {k:'line',d:'M -38 -25 C -89 6 -67 69 -111 95 Q -133 100 -132 79',w:15,f:'spot',tail:true,tip:'M -111 95 Q -133 100 -132 79'},
        {k:'shape',d:'M -52 -32 Q -71 -113 -16 -170 L 21 -196 Q 55 -200 64 -173 L 31 -91 Q 10 -62 9 -12 Z',f:'body',own:true,body:{shade:[-27,-45,30,33],hi:[12,-150,15,24]}},
        {k:'ell',e:[-23,-35,26,35,-.5],f:'body',own:true},
        {k:'line',d:'M -22 -38 Q 5 -17 72 -10',w:18,f:'spot',own:true},
        {k:'ell',e:[80,-9,12,8,0],f:'spot',own:true},
        {k:'line',d:'M -17 -65 Q 29 -52 83 -79',w:16,f:'spot',own:true,far:true},
        {k:'ell',e:[89,-82,11,8,-.4],f:'spot',own:true,far:true},
        {k:'line',d:'M 32 -164 Q 59 -194 88 -229',w:17,f:'spot',own:true},
        {k:'ell',e:[92,-235,12,9,-.5],f:'spot',own:true},
        {k:'line',d:'M 20 -162 Q 68 -153 109 -184',w:15,f:'spot',own:true,far:true},
        {k:'ell',e:[116,-187,11,8,-.35],f:'spot',own:true,far:true}
      ],head:{x:39,y:-237,s:1,turn:.6,tilt:-.20}};
    },
    run(o) {
      const geom = POSES.walk(Object.assign({}, o, { gait: 0 }));
      const ph = o.gait || 0, reach = Math.cos(ph), tuck = Math.sin(ph);
      const fore = 93 + reach * 65, hind = -73 - reach * 61;
      const fy = -8 - Math.max(0, tuck) * 47, hy = -8 - Math.max(0, -tuck) * 40;
      geom.bounds = [-265, -180, 230, 30];
      geom.parts[0].d = `M -86 -78 C -140 -90 -169 -51 -217 -60 Q -239 -68 -232 -86`;
      geom.parts[0].tip = 'M -217 -60 Q -239 -68 -232 -86';
      geom.parts[1].d = `M 58 -66 Q ${fore-25} -48 ${fore-17} ${fy-5}`;
      geom.parts[2].e = [fore-14, fy-5, 12, 6.5, 0];
      geom.parts[3].d = `M -74 -62 Q ${hind-12} -45 ${hind-15} ${hy-5}`;
      geom.parts[4].e = [hind-12, hy-5, 12, 6.5, 0];
      geom.parts[7].d = `M -60 -54 Q ${hind+13} -40 ${hind} ${hy}`;
      geom.parts[8].e = [hind+5, hy, 13, 7, 0];
      geom.parts[9].d = `M 74 -70 Q ${fore-24} -43 ${fore} ${fy}`;
      geom.parts[10].e = [fore+6, fy, 13, 7, 0];
      geom.head.tilt = -.08 + tuck * .04;
      return geom;
    },
    walk(o) {
      const kw = o.variant === 'kuwuk';
      const gait = o.gait == null ? 0 : Math.sin(o.gait) * 23;
      const lift = o.gait == null ? 0 : Math.cos(o.gait) * 5;
      return {
        bounds: [kw ? -170 : -235, -170, 162, 14],
        shadow: [0, 0, 118, 10],
        parts: [
          kw
            ? { k: 'line', d: 'M -86 -78 C -116 -70 -134 -52 -150 -34', w: 13, f: 'spot', tail: true, tip: 'M -144 -40 C -146 -38 -148 -36 -150 -34' }
            : { k: 'line', d: 'M -86 -78 C -130 -66 -146 -18 -184 -12 C -204 -9 -218 -22 -214 -40', w: 15, f: 'spot', tail: true, tip: 'M -205 -13 C -214 -18 -217 -30 -214 -40' },
          { k: 'line', d: `M 58 -66 L ${64-gait*.4} -34 L ${60-gait} ${-7-Math.max(0,lift)}`, w: 18, f: 'spot', far: true },
          { k: 'ell', e: [64-gait, -7-Math.max(0,lift), 12, 6.5, 0], f: 'spot', far: true },
          { k: 'line', d: `M -74 -62 Q -94 -40 ${-88+gait*.4} -26 L ${-82+gait} ${-7-Math.max(0,-lift)}`, w: 18, f: 'spot', far: true },
          { k: 'ell', e: [-78+gait, -7-Math.max(0,-lift), 12, 6.5, 0], f: 'spot', far: true },
          { k: 'shape', d: 'M -96 -84 C -66 -104 6 -98 52 -104 C 82 -108 102 -92 98 -68 C 95 -48 74 -42 46 -45 C 14 -40 -30 -38 -68 -44 C -98 -48 -114 -68 -96 -84 Z',
            f: 'body', own: true, body: { belly: [-6, -37, 86, 12, 0], shade: [-4, -44, 104, 18], hi: [-10, -96, 80, 8] } },
          { k: 'ell', e: [-62, -70, 30, 32, -0.2], f: 'body', own: true },
          { k: 'line', d: `M -60 -54 Q -82 -36 ${-76-gait*.4} -24 L ${-66-gait} ${-7-Math.max(0,lift)}`, w: 20, f: 'spot', own: true },
          { k: 'ell', e: [-60-gait, -7-Math.max(0,lift), 13, 7, 0], f: 'spot', own: true },
          { k: 'line', d: `M 74 -70 Q 84 -40 ${84+gait*.4} -28 L ${86+gait} ${-7-Math.max(0,-lift)}`, w: 20, f: 'spot', own: true },
          { k: 'ell', e: [92+gait, -7-Math.max(0,-lift), 13, 7, 0], f: 'spot', own: true },
          { k: 'shape', d: 'M 46 -100 C 66 -126 96 -134 112 -120 L 116 -84 C 100 -72 84 -62 70 -58 Z', f: 'body' }
        ],
        head: { x: 114, y: -120, s: 1, turn: 0.45, tilt: 0 }
      };
    },
    sit(o) {
      const kw = o.variant === 'kuwuk';
      return {
        bounds: [-92, -192, 102, 14],
        shadow: [4, 0, 72, 9],
        parts: [
          { k: 'shape', d: 'M -44 -12 C -66 -60 -40 -122 2 -134 C 36 -142 58 -114 54 -76 C 52 -48 46 -20 34 -8 C 12 0 -24 2 -44 -12 Z',
            f: 'body', own: true, body: { belly: [40, -82, 17, 44, 0.1], shade: [-30, -20, 50, 30], hi: [-2, -122, 30, 10] } },
          { k: 'ell', e: [-20, -36, 36, 30, -0.3], f: 'body', own: true },
          { k: 'ell', e: [2, -6, 18, 7, 0], f: 'spot', own: true },
          kw
            ? { k: 'line', d: 'M -34 -16 C -60 -4 -40 8 -6 6 C 10 5 22 2 28 -4', w: 12, f: 'spot', tail: true, own: true, tip: 'M 20 0 C 24 -1 26 -2 28 -4' }
            : { k: 'line', d: 'M -34 -16 C -70 -2 -38 10 10 6 C 40 4 66 0 74 -10', w: 14, f: 'spot', tail: true, own: true, tip: 'M 62 -3 C 68 -5 72 -7 74 -10' },
          { k: 'line', d: 'M 20 -92 L 24 -8', w: 17, f: 'spot', own: true, far: true },
          { k: 'ell', e: [26, -6, 11, 6, 0], f: 'spot', own: true, far: true },
          { k: 'line', d: 'M 44 -94 L 48 -8', w: 18, f: 'spot', own: true },
          { k: 'ell', e: [52, -6, 12, 6.5, 0], f: 'spot', own: true }
        ],
        head: { x: 30, y: -142, s: 1.05, turn: 0.35, tilt: 0 }
      };
    },
    lie() {
      return {
        bounds: [-225, -118, 160, 12],
        shadow: [-20, 0, 130, 9],
        parts: [
          { k: 'line', d: 'M -96 -16 C -140 -8 -162 -4 -190 -8 C -206 -10 -214 -20 -208 -30', w: 14, f: 'spot', tail: true, tip: 'M -200 -10 C -208 -13 -212 -21 -208 -30' },
          { k: 'line', d: 'M 54 -24 L 112 -14', w: 15, f: 'spot', far: true },
          { k: 'ell', e: [116, -13, 12, 6, 0], f: 'spot', far: true },
          { k: 'shape', d: 'M -102 -12 C -112 -48 -64 -64 -4 -60 C 46 -58 80 -54 90 -30 C 96 -12 74 0 40 0 L -80 0 C -96 0 -102 -4 -102 -12 Z',
            f: 'body', own: true, body: { belly: [-10, -2, 80, 8, 0], shade: [-10, -6, 100, 16], hi: [-20, -56, 70, 7] } },
          { k: 'ell', e: [-62, -28, 34, 26, -0.15], f: 'body', own: true },
          { k: 'line', d: 'M 62 -16 L 118 -6', w: 16, f: 'spot', own: true },
          { k: 'ell', e: [122, -6, 13, 6.5, 0], f: 'spot', own: true }
        ],
        head: { x: 92, y: -74, s: 1, turn: 0.25, tilt: 0 }
      };
    },
    branch() {
      return {
        bounds: [-125, -84, 138, 140],
        shadow: null,
        parts: [
          { k: 'line', d: 'M -88 -10 C -108 18 -100 64 -106 104 C -108 122 -98 132 -90 128', w: 13, f: 'spot', tail: true, tip: 'M -105 112 C -106 124 -98 131 -90 128' },
          { k: 'shape', d: 'M -96 -6 C -102 -36 -62 -50 -4 -48 C 48 -46 82 -42 88 -22 C 92 -6 74 4 40 4 L -80 4 C -94 4 -96 0 -96 -6 Z',
            f: 'body', own: true, body: { shade: [-6, 2, 100, 14], hi: [-16, -44, 70, 7] } },
          { k: 'line', d: 'M -52 -6 C -56 22 -52 44 -54 66', w: 17, f: 'spot', own: true },
          { k: 'ell', e: [-54, 70, 11, 8, 0], f: 'spot', own: true },
          { k: 'line', d: 'M 56 -6 C 60 20 58 42 60 62', w: 16, f: 'spot', own: true },
          { k: 'ell', e: [60, 66, 10, 8, 0], f: 'spot', own: true }
        ],
        head: { x: 96, y: -36, s: 0.95, turn: 0.2, tilt: 0.12 }
      };
    },
    peek() {
      return {
        bounds: [-52, -100, 52, 12],
        shadow: null,
        parts: [
          { k: 'shape', d: 'M -36 8 C -36 -26 -20 -42 0 -42 C 20 -42 36 -26 36 8 Z', f: 'body', own: true },
          { k: 'ell', e: [-18, -2, 12, 7, 0], f: 'spot', own: true },
          { k: 'ell', e: [18, -2, 12, 7, 0], f: 'spot', own: true }
        ],
        head: { x: 0, y: -50, s: 1.05, turn: 0, tilt: 0 }
      };
    }
  };
  A.POSES = Object.keys(POSES);
  A.LEOPARD_NEW_POSES=['crouch','sniff','stretch','groom','curl','scratch','climb'];
  A.LEOPARD_STATIC_POSES=A.POSES.filter(p=>p!=='run');

  function pathOf(p) {
    if (p.d) return new Path2D(p.d);
    const q = new Path2D();
    q.ellipse(p.e[0], p.e[1], p.e[2], p.e[3], p.e[4] || 0, 0, TAU);
    return q;
  }

  function headOutline(g, h, pal, o, OL) {
    const hs = h.s * (o.cub ? 1.38 : 1);
    const t = (h.turn || 0) * 8;
    g.save();
    g.translate(h.x, h.y); g.rotate(h.tilt || 0); g.scale(hs, hs);
    const ol = OL / hs;
    g.fillStyle = pal.outline;
    for (const [ex, ey] of [[-20 + t * 0.4, -21], [20 + t * 0.4, -22]]) {
      g.beginPath(); g.arc(ex, ey, 10.5 + ol, 0, TAU); g.fill();
    }
    g.beginPath(); g.ellipse(0, 1, 32 + ol, 27 + ol, 0, 0, TAU); g.fill();
    g.restore();
  }

  function drawHead(g, pal, pats, h, o, OL) {
    const hs = h.s * (o.cub ? 1.38 : 1);
    const t = (h.turn || 0) * 8;
    const kw = o.variant === 'kuwuk';
    g.save();
    g.translate(h.x, h.y); g.rotate(h.tilt || 0); g.scale(hs, hs);
    const ol = OL / hs;
    g.lineJoin = 'round'; g.lineCap = 'round';
    // telinga bulat, punggung telinga gelap
    for (const [ex, ey] of [[-20 + t * 0.4, -21], [20 + t * 0.4, -22]]) {
      g.beginPath(); g.arc(ex, ey, 10.5, 0, TAU);
      g.lineWidth = ol * 2; g.strokeStyle = pal.outline; g.stroke();
      g.fillStyle = pal.ear; g.fill();
      g.beginPath(); g.arc(ex + t * 0.15, ey + 1.8, 5.6, 0, TAU);
      g.fillStyle = pal.earIn; g.fill();
    }
    // kepala dengan bintik padat
    const head = new Path2D();
    head.ellipse(0, 1, 32, 27, 0, 0, TAU);
    g.lineWidth = ol * 2; g.strokeStyle = pal.outline; g.stroke(head);
    g.fillStyle = pats.spot; g.fill(head);
    g.save(); g.clip(head);
    g.fillStyle = pal.hi; g.beginPath(); g.ellipse(-4, -14, 22, 9, 0, 0, TAU); g.fill();
    g.restore();
    // bulu terang di bawah mata
    g.fillStyle = pal.belly;
    g.globalAlpha = 0.9;
    g.beginPath(); g.ellipse(t - 12, 1, 8, 4.4, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(t + 12, 1, 8, 4.4, 0, 0, TAU); g.fill();
    g.globalAlpha = 1;
    // moncong & dagu krem
    g.beginPath(); g.arc(t - 8, 10, 10.5, 0, TAU); g.fill();
    g.beginPath(); g.arc(t + 8, 10, 10.5, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(t, 19, 8.5, 5.5, 0, 0, TAU); g.fill();
    if (kw) {
      // garis putih & gelap khas kucing kuwuk
      g.strokeStyle = pal.belly; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(t - 7, -11); g.quadraticCurveTo(t - 9, -19, t - 7, -26); g.stroke();
      g.beginPath(); g.moveTo(t + 7, -11); g.quadraticCurveTo(t + 9, -19, t + 7, -26); g.stroke();
      g.strokeStyle = pal.spot; g.lineWidth = 2.2;
      for (const dx of [-3, 3]) { g.beginPath(); g.moveTo(t + dx, -12); g.lineTo(t + dx * 1.3, -26); g.stroke(); }
      g.beginPath(); g.moveTo(t - 20, -2); g.quadraticCurveTo(t - 25, 4, t - 22, 12); g.stroke();
      g.beginPath(); g.moveTo(t + 20, -2); g.quadraticCurveTo(t + 25, 4, t + 22, 12); g.stroke();
    }
    // bintik kumis
    g.fillStyle = pal.spot;
    for (const [dx, dy] of [[-12, 8], [-9, 12], [-15, 12], [12, 8], [9, 12], [15, 12]]) {
      g.beginPath(); g.arc(t + dx, dy, 0.9, 0, TAU); g.fill();
    }
    // mata: iris kuning-hijau, pupil BULAT
    const eyes = [];
    const eR = o.cub ? 7.4 : 6.6;
    for (const ex of [t - 12, t + 12]) {
      g.beginPath(); g.ellipse(ex, -6, eR, eR * 0.88, 0, 0, TAU);
      g.fillStyle = pal.eye; g.fill();
      g.lineWidth = ol * 0.9; g.strokeStyle = pal.outline; g.stroke();
      g.beginPath(); g.arc(ex + t * 0.12, -5.6, o.cub ? 3.8 : 3.0, 0, TAU);
      g.fillStyle = pal.pupil; g.fill();
      g.beginPath(); g.arc(ex + t * 0.12 - 1.3, -7.3, o.cub ? 1.6 : 1.3, 0, TAU);
      g.fillStyle = '#ffffff'; g.fill();
      g.beginPath(); g.ellipse(ex, -6, eR + 0.6, eR * 0.88 + 0.6, 0, Math.PI * 1.1, Math.PI * 1.9);
      g.lineWidth = ol * 1.3; g.strokeStyle = pal.outline; g.stroke();
      eyes.push([ex, -6]);
    }
    // hidung & mulut
    g.beginPath();
    g.moveTo(t - 5.5, 2); g.quadraticCurveTo(t, 0, t + 5.5, 2); g.quadraticCurveTo(t + 4, 6.5, t, 8.5); g.quadraticCurveTo(t - 4, 6.5, t - 5.5, 2);
    g.closePath();
    g.fillStyle = pal.nose; g.fill();
    g.lineWidth = ol * 0.8; g.strokeStyle = pal.outline; g.stroke();
    g.beginPath();
    g.moveTo(t, 8.5); g.lineTo(t, 11.5);
    g.moveTo(t - 6, 13.2); g.quadraticCurveTo(t - 3, 15, t, 11.5); g.quadraticCurveTo(t + 3, 15, t + 6, 13.2);
    g.stroke();
    // kumis
    g.strokeStyle = pal.whisker; g.lineWidth = 0.7; g.globalAlpha = 0.85;
    for (const sd of [-1, 1]) {
      for (const [ex, ey] of [[-34, 7], [-35, 12], [-32, 17]]) {
        g.beginPath(); g.moveTo(t + sd * 13, 11); g.quadraticCurveTo(t + sd * 24, ey - 1, t + sd * -ex, ey); g.stroke();
      }
    }
    g.globalAlpha = 1;
    g.restore();
    // posisi mata dalam koordinat pose (untuk mata menyala di malam hari)
    const ct = Math.cos(h.tilt || 0), st = Math.sin(h.tilt || 0);
    return {
      eyes: eyes.map(([ex, ey]) => ({ x: h.x + (ex * ct - ey * st) * hs, y: h.y + (ex * st + ey * ct) * hs })),
      head: { x: h.x, y: h.y, r: 30 * hs }
    };
  }

  function renderBody(g, geom, pal, pats, o, OL) {
    const fillOf = (f) => (f === 'body' ? pats.body : f === 'spot' ? pats.spot : f === 'belly' ? pal.belly : f);
    const parts = geom.parts.map((p) => Object.assign({ path: pathOf(p) }, p));
    if (geom.shadow && !o.noShadow) {
      const s = geom.shadow;
      g.fillStyle = 'rgba(20,32,10,0.24)';
      g.beginPath(); g.ellipse(s[0], s[1], s[2], s[3], 0, 0, TAU); g.fill();
    }
    // 1) siluet garis luar
    g.strokeStyle = pal.outline; g.fillStyle = pal.outline;
    for (const p of parts) {
      if (p.k === 'line') { g.lineWidth = p.w + OL * 2; g.stroke(p.path); }
      else { g.lineWidth = OL * 2; g.stroke(p.path); g.fill(p.path); }
    }
    headOutline(g, geom.head, pal, o, OL);
    // 2) isi warna, dari belakang ke depan
    for (const p of parts) {
      if (p.own) {
        g.strokeStyle = pal.outline;
        if (p.k === 'line') { g.lineWidth = p.w + OL * 1.6; g.stroke(p.path); }
        else { g.lineWidth = OL * 1.8; g.stroke(p.path); }
      }
      const fs = fillOf(p.f);
      if (p.k === 'line') {
        g.strokeStyle = fs; g.lineWidth = p.w; g.stroke(p.path);
        if (p.tail) {
          if (o.variant === 'kuwuk') {
            g.save(); g.setLineDash([4, 6]); g.strokeStyle = pal.spot; g.lineWidth = p.w; g.stroke(p.path); g.restore();
          }
          g.strokeStyle = pal.spot; g.lineWidth = p.w; g.stroke(new Path2D(p.tip));
        }
        if (p.far) { g.strokeStyle = pal.far; g.lineWidth = p.w; g.stroke(p.path); }
      } else {
        g.fillStyle = fs; g.fill(p.path);
        if (p.far) { g.fillStyle = pal.far; g.fill(p.path); }
      }
      if (p.body) {
        const b = p.body;
        g.save(); g.clip(p.path);
        if (b.shade) { g.fillStyle = pal.shade; g.beginPath(); g.ellipse(b.shade[0], b.shade[1], b.shade[2], b.shade[3], 0, 0, TAU); g.fill(); }
        if (b.belly && o.variant !== 'black') {
          g.fillStyle = pal.belly;
          g.beginPath(); g.ellipse(b.belly[0], b.belly[1], b.belly[2], b.belly[3], b.belly[4] || 0, 0, TAU); g.fill();
          g.fillStyle = pal.spot;
          const rr = J.rng(77);
          for (let i = 0; i < 9; i++) {
            const a = rr() * TAU, dd = Math.sqrt(rr());
            g.beginPath();
            g.arc(b.belly[0] + Math.cos(a) * b.belly[2] * 0.8 * dd, b.belly[1] + Math.sin(a) * b.belly[3] * 0.6 * dd, 1.5, 0, TAU);
            g.fill();
          }
        }
        if (b.hi) { g.fillStyle = pal.hi; g.beginPath(); g.ellipse(b.hi[0], b.hi[1], b.hi[2], b.hi[3], 0, 0, TAU); g.fill(); }
        g.restore();
      }
    }
    return drawHead(g, pal, pats, geom.head, o, OL);
  }

  /* o: { pose, variant: spotted|black|kuwuk, night, scale, R, flip, cub } */
  A.leopardSprite = function (o) {
    const variant = o.variant || 'spotted';
    const palKey = variant === 'black' && o.night ? 'blackIR' : variant;
    let pal = A.PAL[palKey];
    if (o.soft && variant !== 'black') pal = Object.assign({}, pal, { outline: variant === 'kuwuk' ? '#5a4128' : '#5a3418' }); // garis luar lebih lembut = lebih menyatu
    const geom = POSES[o.pose](o);
    const b = geom.bounds.slice();
    if (o.cub) { // kepala anak lebih besar
      const hs = geom.head.s * 1.38;
      b[0] = Math.min(b[0], geom.head.x - 44 * hs);
      b[1] = Math.min(b[1], geom.head.y - 40 * hs);
      b[2] = Math.max(b[2], geom.head.x + 44 * hs);
    }
    const OL = J.clamp(2.3 / o.scale, 2.4, 6) * (o.soft ? 0.8 : 1);
    const sp = A.makeSprite(o, b, (g) => {
      const pats = getPatterns(g, palKey, pal);
      return renderBody(g, geom, pal, pats, Object.assign({}, o, { variant }), OL);
    });
    sp.variant = variant;
    sp.pose = o.pose;
    return sp;
  };

  // Kepala terpisah: bonus mengintip tidak pernah memiliki tubuh yang bisa diklik.
  A.leopardHeadSprite = function (o) {
    const key = o.variant === 'black' && o.night ? 'blackIR' : o.variant || 'spotted';
    const pal = A.PAL[key];
    return A.makeSprite(o, [-44, -46, 44, 40], g =>
      drawHead(g, pal, getPatterns(g, key, pal), { x:0, y:0, s:1.1, turn:0, tilt:0 }, o, 2.6));
  };

  // Ekor terpisah untuk bonus: tidak menyertakan kepala atau badan tersembunyi.
  A.leopardTailSprite = function (o) {
    const key=o.variant==='black'&&o.night?'blackIR':o.variant||'spotted',pal=A.PAL[key];
    return A.makeSprite(o,[-90,-160,145,65],g=>{
      const sway=Math.sin(o.gait||0)*22,pats=getPatterns(g,key,pal);
      const d=new Path2D(`M -53 47 C -55 -8 -17 -107 24 -91 C 65 -75 ${101+sway} -96 ${85+sway} -137`);
      g.lineCap='round';g.lineJoin='round';g.strokeStyle=pal.outline;g.lineWidth=23;g.stroke(d);
      g.strokeStyle=pats.spot;g.lineWidth=17;g.stroke(d);
      const tip=new Path2D(`M ${92+sway} -111 Q ${93+sway} -124 ${85+sway} -137`);
      g.strokeStyle=pal.spot;g.lineWidth=18;g.stroke(tip);
    });
  };

  A.scratchSprite = function (o) {
    return A.makeSprite(o, [-24, -55, 24, 55], g => {
      g.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const x = -17 + i * 10, y = -44 + (i % 2) * 6;
        const cut = new Path2D(`M ${x+5} ${y} Q ${x-6} -6 ${x-1} ${43-i*3}`);
        g.strokeStyle = '#372a1d'; g.lineWidth = 6; g.stroke(cut);
        g.strokeStyle = '#e0b979'; g.lineWidth = 3; g.stroke(cut);
        g.strokeStyle = '#f2d59a'; g.lineWidth = 1; g.stroke(cut);
      }
    });
  };
})();
