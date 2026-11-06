/* Elemen hutan bergaya kartun: pohon, dahan, kanopi, semak, pakis, daun, rumput, batu, kayu tumbang. */
(function () {
  'use strict';
  const J = window.JSMT;
  const A = J.Art;
  const TAU = Math.PI * 2;
  const F = (A.Forest = {});

  F.palette = function (mode) {
    const p = {
      sky0: '#e5edd3', sky1: '#b1cdb4',
      far1T: '#adc8ba', far1C: '#99bda9', far2T: '#7fa995', far2C: '#749c86',
      ground0: '#8f9d61', ground1: '#4b7250', trail: 'rgba(196,166,104,0.55)', trailHi: 'rgba(222,198,140,0.35)',
      trunk: '#6c5940', trunkDark: '#3d4331', trunkHi: '#8f7857', outline: '#173f35',
      canopy: '#39795c', canopyHi: '#74a56b', canopyDark: '#255e4c',
      bush: '#32765b', bushHi: '#69a16e', bushDark: '#235345',
      fern: '#276b50', fernHi: '#58936a', fernDark: '#174b3b',
      leaf: '#367d5c', leafHi: '#70a974', leafVein: '#b7ce91',
      grass: '#537d4c', grassHi: '#82a369',
      litter: ['#a7843e', '#8d6b2f', '#bb9549', '#7f903b', '#9c6b35'],
      rock: '#8e948a', rockHi: '#b4b9ae', moss: '#6aa443', vine: '#315f42',
      ray: 'rgba(255,255,225,0.14)', dapple: 'rgba(255,248,190,0.22)'
    };
    if (mode === 'senja') {
      Object.assign(p, { sky0: '#fbe2b6', sky1: '#e6c38b', far1T: '#cdc79a', far1C: '#c3bf8f', far2T: '#aab27f', far2C: '#a2ad76', ray: 'rgba(255,214,150,0.18)' });
    }
    return p;
  };

  function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }

  /* Kumpulan lingkaran ala kartun: garis luar, bayangan bawah, isi, kilap. */
  F.blobs = function (g, cs, fill, hi, outline, olw, dark) {
    if (outline) { g.fillStyle = outline; for (const c of cs) { circ(g, c[0], c[1], c[2] + olw); g.fill(); } }
    if (dark) { g.fillStyle = dark; for (const c of cs) { circ(g, c[0], c[1], c[2]); g.fill(); } }
    g.fillStyle = fill;
    for (const c of cs) { circ(g, c[0] - c[2] * 0.03, c[1] - c[2] * (dark ? 0.1 : 0), c[2] * (dark ? 0.9 : 1)); g.fill(); }
    if (hi) { g.fillStyle = hi; for (const c of cs) { circ(g, c[0] - c[2] * 0.3, c[1] - c[2] * 0.36, c[2] * 0.46); g.fill(); } }
  };

  F.sky = function (g, p, W, y1) {
    const gr = g.createLinearGradient(0, 0, 0, y1);
    gr.addColorStop(0, p.sky0); gr.addColorStop(1, p.sky1);
    g.fillStyle = gr; g.fillRect(0, 0, W, J.H);
  };

  F.farLayer = function (g, r, W, yBase, n, trunk, canopy) {
    g.fillStyle = trunk; g.strokeStyle = trunk;
    for (let i = 0; i < n; i++) {
      const x = (i + r.range(0, 0.9)) * (W / n), tw = r.range(10, 28);
      g.beginPath(); g.moveTo(x - tw / 2, yBase + 30); g.lineTo(x - tw * 0.34, -20); g.lineTo(x + tw * 0.34, -20); g.lineTo(x + tw / 2, yBase + 30); g.fill();
      const by = r.range(180, 430), sd = r.chance(0.5) ? 1 : -1;
      g.lineWidth = tw * 0.32; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, by); g.lineTo(x + sd * r.range(40, 90), by - r.range(25, 60)); g.stroke();
    }
    g.fillStyle = canopy;
    for (let x = -60; x < W + 60; x += r.range(50, 90)) { circ(g, x, r.range(-20, 110), r.range(50, 100)); g.fill(); }
    for (let x = -40; x < W + 40; x += r.range(40, 70)) { circ(g, x, yBase + r.range(-5, 25), r.range(26, 60)); g.fill(); }
  };

  F.rays = function (g, r, p, W, H) {
    const n = r.int(3, 5);
    for (let i = 0; i < n; i++) {
      const x = r.range(60, W - 200), w = r.range(40, 110), sk = r.range(260, 420);
      const gr = g.createLinearGradient(x, 0, x + sk, H * 0.8);
      gr.addColorStop(0, p.ray); gr.addColorStop(1, 'rgba(255,255,225,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x, -10); g.lineTo(x + w, -10); g.lineTo(x + w + sk, H * 0.8); g.lineTo(x + sk, H * 0.8); g.closePath(); g.fill();
    }
  };

  F.mist = function (g, W, y0, y1, a) {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.55, 'rgba(255,255,255,' + a + ')');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
  };

  F.ground = function (g, r, p, W, H, y0) {
    const path = new Path2D();
    path.moveTo(-10, H + 10); path.lineTo(-10, y0);
    let x = -10, y = y0;
    while (x < W + 10) {
      const nx = x + r.range(160, 320), ny = y0 + r.range(-16, 16);
      path.quadraticCurveTo((x + nx) / 2, (y + ny) / 2 - r.range(4, 20), nx, ny);
      x = nx; y = ny;
    }
    path.lineTo(W + 10, H + 10); path.closePath();
    const gr = g.createLinearGradient(0, y0, 0, H);
    gr.addColorStop(0, p.ground0); gr.addColorStop(1, p.ground1);
    g.fillStyle = gr; g.fill(path);
    g.lineWidth = 3; g.strokeStyle = 'rgba(30,50,20,0.45)'; g.stroke(path);
    // jalur setapak (macan tutul sering melintasi jalur seperti ini)
    g.save(); g.clip(path);
    const ty = r.range(y0 + 110, y0 + 190), ty2 = ty + r.range(-60, 60);
    g.lineCap = 'round';
    g.strokeStyle = p.trail; g.lineWidth = r.range(70, 100);
    g.beginPath(); g.moveTo(-60, ty); g.bezierCurveTo(W * 0.3, ty + r.range(-70, 70), W * 0.65, ty2 + r.range(-70, 70), W + 60, ty2); g.stroke();
    g.strokeStyle = p.trailHi; g.lineWidth *= 0.45;
    g.stroke();
    for (let i = 0; i < 280; i++) {
      const yy = r.range(y0 + 6, H), xx = r.range(0, W);
      const s = 0.6 + (yy - y0) / (H - y0);
      g.fillStyle = r.pick(p.litter); g.globalAlpha = 0.85;
      g.beginPath(); g.ellipse(xx, yy, r.range(3, 7) * s, r.range(1.4, 3) * s, r() * TAU, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    g.restore();
  };

  F.dapples = function (g, r, p, W, y0, H, n) {
    g.fillStyle = p.dapple;
    for (let i = 0; i < n; i++) { g.beginPath(); g.ellipse(r.range(0, W), r.range(y0 + 20, H), r.range(20, 60), r.range(6, 16), 0, 0, TAU); g.fill(); }
  };

  F.tree = function (g, r, p, x, baseY, w, branches) {
    const topY = -60, wTop = w * 0.62;
    const wig = () => r.range(-w * 0.12, w * 0.12);
    const lx = x - w * 0.5, rx = x + w * 0.5;
    const trunk = new Path2D(
      `M${x - w * 0.85} ${baseY + 4} Q${x - w * 0.52} ${baseY - 6} ${lx} ${baseY - 70} ` +
      `C${lx + wig()} ${baseY * 0.55} ${x - wTop / 2 + wig()} ${baseY * 0.25} ${x - wTop / 2} ${topY} ` +
      `L${x + wTop / 2} ${topY} C${x + wTop / 2 + wig()} ${baseY * 0.25} ${rx + wig()} ${baseY * 0.55} ${rx} ${baseY - 70} ` +
      `Q${x + w * 0.52} ${baseY - 6} ${x + w * 0.85} ${baseY + 4} Z`);
    g.lineJoin = 'round';
    g.lineWidth = 3.5; g.strokeStyle = p.outline; g.stroke(trunk);
    g.fillStyle = p.trunk; g.fill(trunk);
    g.save(); g.clip(trunk);
    g.globalAlpha = 0.55; g.fillStyle = p.trunkDark; g.fillRect(x + w * 0.12, topY, w, baseY - topY + 10);
    g.globalAlpha = 0.4; g.fillStyle = p.trunkHi; g.fillRect(x - w * 0.42, topY, w * 0.16, baseY - topY);
    g.globalAlpha = 1;
    g.strokeStyle = p.trunkDark; g.lineWidth = 2; g.lineCap = 'round';
    for (let k = 0; k < 12; k++) {
      const bx = x + r.range(-w * 0.42, w * 0.3), by = r.range(topY + 40, baseY - 30), bl = r.range(20, 60);
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + r.range(-5, 5), by + bl / 2, bx + r.range(-3, 3), by + bl); g.stroke();
    }
    if (r.chance(0.6)) {
      const kx = x + r.range(-w * 0.2, w * 0.05), ky = r.range(280, baseY - 140);
      g.fillStyle = p.trunkDark; g.beginPath(); g.ellipse(kx, ky, w * 0.11, w * 0.15, 0, 0, TAU); g.fill();
      g.fillStyle = '#3a2615'; g.beginPath(); g.ellipse(kx, ky + 1, w * 0.06, w * 0.09, 0, 0, TAU); g.fill();
    }
    // Cakaran interaktif ditempatkan oleh generator adegan.
    g.restore();
    const slots = [];
    for (const b of branches) slots.push(F.branch(g, r, p, x, baseY, w, wTop, topY, b));
    return { slots, box: { x0: x - w * 0.85, x1: x + w * 0.85, y0: topY, y1: baseY } };
  };

  F.branch = function (g, r, p, x, baseY, w, wTop, topY, b) {
    const side = b.side;
    const frac = (baseY - b.y) / (baseY - topY);
    const half = J.lerp(w * 0.5, wTop / 2, frac);
    const x0 = x + side * half * 0.3, xe = x + side * (half + b.len), th = b.thick;
    const yT0 = b.y - th / 2, yTE = yT0 + b.slope * b.len, tipTh = 8;
    const sag = yT0 + th + 6 + b.slope * b.len * 0.5;
    const fillP = new Path2D();
    fillP.moveTo(x0, yT0); fillP.lineTo(xe, yTE);
    fillP.quadraticCurveTo(xe + side * 7, yTE + tipTh / 2, xe, yTE + tipTh);
    fillP.quadraticCurveTo((x0 + xe) / 2, sag, x0, yT0 + th + 2);
    fillP.closePath();
    const edge = x + side * half * 0.96;
    const yEdge = yT0 + (b.slope * (edge - x0)) / side;
    const lineP = new Path2D();
    lineP.moveTo(edge, yEdge); lineP.lineTo(xe, yTE);
    lineP.quadraticCurveTo(xe + side * 7, yTE + tipTh / 2, xe, yTE + tipTh);
    lineP.quadraticCurveTo((x0 + xe) / 2, sag, edge, yT0 + th + 2);
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.lineWidth = 7; g.strokeStyle = p.outline; g.stroke(lineP);
    g.fillStyle = p.trunk; g.fill(fillP);
    g.save(); g.clip(fillP);
    g.globalAlpha = 0.5; g.fillStyle = p.trunkDark;
    g.beginPath(); g.moveTo(x0, yT0 + th * 0.55); g.lineTo(xe, yTE + tipTh * 0.5); g.lineTo(xe, yTE + 40); g.lineTo(x0, yT0 + th + 30); g.fill();
    g.globalAlpha = 0.6; g.strokeStyle = p.trunkHi; g.lineWidth = 3;
    g.beginPath(); g.moveTo(edge, yEdge + 3); g.lineTo(xe, yTE + 2); g.stroke();
    g.globalAlpha = 1;
    g.restore();
    // daun di ujung dahan
    const cs = [];
    const n = r.int(4, 7);
    for (let k = 0; k < n; k++) cs.push([xe + side * r.range(-28, 26), yTE + r.range(-46, 12), r.range(18, 34)]);
    F.blobs(g, cs, p.canopy, p.canopyHi, p.outline, 3, p.canopyDark);
    const sx0 = x + side * (half + 6), sx1 = x + side * (half + b.len * 0.72);
    const slope = (yTE - yT0) / (xe - x0);
    return { x0: Math.min(sx0, sx1), x1: Math.max(sx0, sx1), side, y: (px) => yT0 + slope * (px - x0), used: false };
  };

  F.canopy = function (g, r, p, W, low) {
    low = low || 0;
    const cs = [];
    for (let x = -80; x < W + 80; x += r.range(70, 120)) {
      const base = r.range(10, 70) + low * r.range(40, 90), n = r.int(3, 5);
      for (let k = 0; k < n; k++) cs.push([x + r.range(-50, 50), base + r.range(-60, 36), r.range(50, 92)]);
    }
    F.blobs(g, cs, p.canopy, p.canopyHi, p.outline, 3.5, p.canopyDark);
    g.strokeStyle = 'rgba(20,60,20,0.35)'; g.lineWidth = 2; g.lineCap = 'round';
    for (let i = 0; i < 60; i++) {
      const c = r.pick(cs), a = r() * TAU, d = c[2] * r.range(0.2, 0.8);
      const px = c[0] + Math.cos(a) * d, py = c[1] + Math.sin(a) * d;
      g.beginPath(); g.arc(px, py, r.range(5, 10), 0.2, 1.6); g.stroke();
    }
  };

  F.bush = function (g, r, x, y, w, h, p, o) {
    o = o || {};
    const n = Math.max(4, Math.round(w / 34));
    const cs = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1), dome = Math.sin(Math.PI * (0.15 + 0.7 * t));
      const rad = h * 0.34 * (0.75 + 0.45 * dome) * r.range(0.88, 1.12);
      cs.push([x - w / 2 + w * (0.1 + 0.8 * t) + r.range(-6, 6), y - rad * 0.55 - dome * h * 0.4, rad]);
    }
    for (let i = 0; i < Math.ceil(n * 0.6); i++) { const rad = h * 0.26 * r.range(0.85, 1.1); cs.push([x - w / 2 + r() * w, y - rad * 0.4, rad]); }
    for (let i = 0; i < Math.ceil(n * 0.4); i++) { const rad = h * 0.22 * r.range(0.8, 1.1); cs.push([x - w * 0.3 + r() * w * 0.6, y - h * 0.7 + r.range(-8, 8), rad]); }
    g.save();
    g.beginPath(); g.rect(x - w * 1.5, y - h * 3, w * 3, h * 3 + (o.below == null ? 6 : o.below)); g.clip();
    F.blobs(g, cs, o.fill || p.bush, o.hi || p.bushHi, p.outline, o.olw || 3, o.dark || p.bushDark);
    g.strokeStyle = 'rgba(15,45,15,0.35)'; g.lineWidth = 1.8; g.lineCap = 'round';
    for (let k = 0; k < n * 2; k++) {
      const c = r.pick(cs), a = r() * TAU, d = c[2] * r.range(0.2, 0.7);
      g.beginPath(); g.arc(c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d, r.range(4, 8), 0.3, 1.8); g.stroke();
    }
    g.restore();
    return { x0: x - w / 2 - 12, y0: y - h * 1.05, x1: x + w / 2 + 12, y1: y + 8 };
  };

  /* Gerombol daun mengambang (untuk menutupi dahan). */
  F.foliage = function (g, r, x, y, rad, p) {
    const cs = [];
    const n = r.int(4, 7);
    for (let i = 0; i < n; i++) { const a = r() * TAU, d = rad * r.range(0, 0.55); cs.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, rad * r.range(0.35, 0.55)]); }
    F.blobs(g, cs, p.canopy, p.canopyHi, p.outline, 3, p.canopyDark);
    return { x0: x - rad * 1.1, y0: y - rad * 0.95, x1: x + rad * 1.1, y1: y + rad * 0.95 };
  };

  function frond(g, x, y, a, len, col, p, o) {
    o = o || {};
    const dx = Math.cos(a), dy = Math.sin(a);
    const droop = len * (o.droop || 0.32) * (Math.abs(dx) + 0.25);
    const cx = x + dx * len * 0.55, cy = y + dy * len * 0.55;
    const tx = x + dx * len, ty = y + dy * len + droop;
    const pts = [], N = 13;
    for (let i = 1; i <= N; i++) {
      const t = i / (N + 1), it = 1 - t;
      const px = it * it * x + 2 * it * t * cx + t * t * tx, py = it * it * y + 2 * it * t * cy + t * t * ty;
      const ddx = 2 * it * (cx - x) + 2 * t * (tx - cx), ddy = 2 * it * (cy - y) + 2 * t * (ty - cy);
      const L = Math.hypot(ddx, ddy) || 1;
      pts.push([px, py, ddx / L, ddy / L, t]);
    }
    const leafL = len * (o.leafL || 0.2), leafW = o.leafW || 0.2;
    for (let pass = 0; pass < 2; pass++) {
      g.fillStyle = pass === 0 ? p.outline : col;
      const grow = pass === 0 ? 1.7 : 0;
      for (const [px, py, ux, uy, t] of pts) {
        const l = leafL * (1 - t * 0.7), nx = -uy, ny = ux;
        for (const s of [-1, 1]) {
          const vx = nx * s + ux * 0.5, vy = ny * s + uy * 0.5;
          const ang = Math.atan2(vy, vx);
          g.beginPath();
          g.ellipse(px + vx * l * 0.48, py + vy * l * 0.48, l * 0.55 + grow, l * leafW + grow, ang, 0, TAU);
          g.fill();
        }
      }
      g.beginPath(); g.ellipse(tx, ty, leafL * 0.28 + grow, leafL * 0.14 + grow, Math.atan2(ty - cy, tx - cx), 0, TAU); g.fill();
    }
    g.strokeStyle = p.fernDark; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(cx, cy, tx, ty); g.stroke();
  }

  F.fern = function (g, r, x, y, size, p, o) {
    o = o || {};
    const n = o.n || r.int(6, 9), spread = o.spread || 1.25, base = o.angle == null ? -Math.PI / 2 : o.angle;
    const fr = [];
    for (let i = 0; i < n; i++) {
      const a = base + (n === 1 ? 0 : (i / (n - 1) - 0.5) * 2 * spread) + r.range(-0.12, 0.12);
      fr.push({ a, len: size * r.range(0.7, 1.05), col: r.chance(0.5) ? p.fern : p.fernHi });
    }
    fr.sort((a, b) => Math.abs(b.a - base) - Math.abs(a.a - base));
    for (const f of fr) frond(g, x, y, f.a, f.len, f.col, p);
    return { x0: x - size * 1.05, y0: y - size * 1.0, x1: x + size * 1.05, y1: y + 6 };
  };

  F.leaf = function (g, x, y, len, ang, p, o) {
    o = o || {};
    const wd = o.wid || 0.3, col = o.col || p.leaf;
    g.save(); g.translate(x, y); g.rotate(ang);
    const path = new Path2D(`M0 0 C${len * 0.22} ${-len * wd} ${len * 0.72} ${-len * wd * 0.95} ${len} 0 C${len * 0.72} ${len * wd * 0.95} ${len * 0.22} ${len * wd} 0 0 Z`);
    g.lineJoin = 'round';
    g.lineWidth = o.olw || 3; g.strokeStyle = p.outline; g.stroke(path);
    g.fillStyle = col; g.fill(path);
    g.save(); g.clip(path); g.fillStyle = 'rgba(10,40,10,0.16)'; g.fillRect(0, 0, len, len * wd); g.restore();
    g.strokeStyle = p.leafVein; g.lineCap = 'round';
    g.lineWidth = Math.max(1.2, len * 0.025);
    g.beginPath(); g.moveTo(len * 0.04, 0); g.quadraticCurveTo(len * 0.5, -len * 0.02, len * 0.94, 0); g.stroke();
    g.lineWidth = Math.max(0.8, len * 0.014);
    g.beginPath();
    for (let k = 1; k <= 5; k++) {
      const vx = (len * k) / 6.4;
      g.moveTo(vx, 0); g.quadraticCurveTo(vx + len * 0.06, -len * wd * 0.3, vx + len * 0.13, -len * wd * 0.62);
      g.moveTo(vx, 0); g.quadraticCurveTo(vx + len * 0.06, len * wd * 0.3, vx + len * 0.13, len * wd * 0.62);
    }
    g.stroke();
    g.restore();
  };

  F.leafSpray = function (g, r, x, y, size, p, dir) {
    const n = r.int(3, 6);
    for (let i = 0; i < n; i++) {
      F.leaf(g, x, y, size * r.range(0.65, 1), dir + r.range(-0.85, 0.85), p, { col: r.chance(0.5) ? p.leaf : p.leafHi, wid: r.range(0.26, 0.34) });
    }
    return { x0: x - size, y0: y - size, x1: x + size, y1: y + size };
  };

  F.grass = function (g, r, x, y, h, p) {
    const n = r.int(7, 12);
    g.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      const bx = x + r.range(-h * 0.35, h * 0.35), lean = r.range(-h * 0.45, h * 0.45), th = h * r.range(0.55, 1), w = r.range(3, 6);
      const path = new Path2D(`M${bx - w} ${y} Q${bx + lean * 0.3} ${y - th * 0.6} ${bx + lean} ${y - th} Q${bx + lean * 0.3 + w * 0.4} ${y - th * 0.55} ${bx + w} ${y} Z`);
      g.lineWidth = 2; g.strokeStyle = p.outline; g.stroke(path);
      g.fillStyle = r.chance(0.5) ? p.grass : p.grassHi; g.fill(path);
    }
    return { x0: x - h * 0.8, y0: y - h, x1: x + h * 0.8, y1: y + 4 };
  };

  F.vine = function (g, r, p, x, y0, len, o) {
    o = o || {};
    const amp = r.range(10, 30), ph = r.range(0, TAU), pts = [];
    for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([x + Math.sin(ph + t * 4) * amp * t, y0 + len * t]); }
    const poly = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = p.outline; g.lineWidth = 5; poly();
    g.strokeStyle = p.vine; g.lineWidth = 2.6; poly();
    const big = o.big || 1;
    for (let i = 2; i < pts.length; i += 2) {
      const left = (i / 2) % 2 === 0;
      F.leaf(g, pts[i][0], pts[i][1], r.range(14, 24) * big, left ? Math.PI - r.range(0.4, 1.1) : r.range(0.4, 1.1), p, { wid: 0.36, olw: 2, col: left ? p.leaf : p.leafHi });
    }
    return { x0: x - amp - 30 * big, y0: y0, x1: x + amp + 30 * big, y1: y0 + len + 20 };
  };

  F.rock = function (g, r, p, x, y, w, h) {
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / (n - 1)) * Math.PI;
      pts.push([x + Math.cos(a) * w * 0.5 * r.range(0.9, 1.05), y + Math.sin(a) * h * r.range(0.85, 1.05)]);
    }
    const path = new Path2D();
    path.moveTo(x - w * 0.52, y + 2);
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      path.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    path.lineTo(x + w * 0.52, y + 2); path.closePath();
    g.lineWidth = 3; g.strokeStyle = p.outline; g.stroke(path);
    g.fillStyle = p.rock; g.fill(path);
    g.save(); g.clip(path);
    g.fillStyle = p.rockHi; g.beginPath(); g.ellipse(x - w * 0.15, y - h * 0.7, w * 0.25, h * 0.22, -0.2, 0, TAU); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x - w, y - h * 0.3, w * 2, h);
    g.fillStyle = p.moss;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + r.range(-w * 0.3, w * 0.3), y - h * r.range(0.75, 1), r.range(5, 10), 0, TAU); g.fill(); }
    g.restore();
    return { x0: x - w * 0.55, y0: y - h, x1: x + w * 0.55, y1: y + 2 };
  };

  F.log = function (g, r, p, x, y, len, rad) {
    const body = new Path2D();
    body.moveTo(x, y - rad * 2); body.lineTo(x + len, y - rad * 2);
    body.quadraticCurveTo(x + len + rad * 0.55, y - rad, x + len, y);
    body.lineTo(x, y);
    body.quadraticCurveTo(x - rad * 0.5, y - rad, x, y - rad * 2);
    g.lineWidth = 3; g.strokeStyle = p.outline; g.stroke(body);
    g.fillStyle = p.trunk; g.fill(body);
    g.save(); g.clip(body);
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - rad, y - rad * 0.8, len + rad * 2, rad);
    g.strokeStyle = p.trunkDark; g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const yy = y - rad * r.range(0.3, 1.7), xx = x + r.range(0, len * 0.8); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + r.range(20, 60), yy + r.range(-2, 2)); g.stroke(); }
    g.restore();
    const end = new Path2D(); end.ellipse(x + len, y - rad, rad * 0.42, rad, 0, 0, TAU);
    g.lineWidth = 3; g.strokeStyle = p.outline; g.stroke(end);
    g.fillStyle = '#c9a06a'; g.fill(end);
    g.strokeStyle = '#9a7448'; g.lineWidth = 1.6;
    for (const k of [0.7, 0.45, 0.2]) { g.beginPath(); g.ellipse(x + len, y - rad, rad * 0.42 * k, rad * k, 0, 0, TAU); g.stroke(); }
    g.fillStyle = p.moss;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + r.range(0, len), y - rad * 2 + 2, r.range(4, 9), Math.PI, 0); g.fill(); }
    return { x0: x - rad, y0: y - rad * 2 - 6, x1: x + len + rad, y1: y + 2 };
  };

  /* Tumpukan daun kering oranye-cokelat: kamuflase alami bagi macan tutul. */
  F.dryLeaves = function (g, r, x, y, w) {
    const cols = ['#c98a3a', '#a8662a', '#d9a24c', '#8a5424', '#b9793a'];
    const n = Math.round(w / 6);
    for (let i = 0; i < n; i++) {
      const lx = x + r.range(-w / 2, w / 2), ly = y + r.range(-w * 0.12, w * 0.12) * (1 - Math.abs(lx - x) / w);
      const len = r.range(9, 16), a = r() * TAU;
      g.save(); g.translate(lx, ly); g.rotate(a);
      g.beginPath(); g.ellipse(0, 0, len, len * 0.42, 0, 0, TAU);
      g.fillStyle = r.pick(cols); g.fill();
      g.lineWidth = 1.4; g.strokeStyle = 'rgba(60,30,10,0.7)'; g.stroke();
      g.beginPath(); g.moveTo(-len, 0); g.lineTo(len, 0); g.strokeStyle = 'rgba(70,35,10,0.55)'; g.lineWidth = 1; g.stroke();
      g.restore();
    }
    return { x0: x - w / 2, y0: y - w * 0.15, x1: x + w / 2, y1: y + w * 0.15 };
  };

  /* Bayangan gelap di bawah semak/pohon — tempat macan kumbang sulit terlihat. */
  F.shadowPatch = function (g, x, y, rx, ry) {
    const gr = g.createRadialGradient(x, y, 0, x, y, rx);
    gr.addColorStop(0, 'rgba(12,30,10,0.5)');
    gr.addColorStop(1, 'rgba(12,30,10,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, TAU); g.fill();
    g.restore();
  };

  /* Bunga oranye kecil di semak (warna mirip macan tutul). */
  F.flowers = function (g, r, x, y, w, h) {
    const n = r.int(4, 8);
    for (let i = 0; i < n; i++) {
      const fx = x + r.range(-w * 0.4, w * 0.4), fy = y - r.range(h * 0.2, h * 0.9), s = r.range(4, 7);
      g.fillStyle = r.pick(['#f08a3c', '#f5b041', '#e46b2c']);
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; g.beginPath(); g.arc(fx + Math.cos(a) * s, fy + Math.sin(a) * s, s * 0.7, 0, TAU); g.fill(); }
      g.fillStyle = '#5a2a0a'; g.beginPath(); g.arc(fx, fy, s * 0.45, 0, TAU); g.fill();
    }
  };

  /* Palet pakis/daun kering (cokelat-oranye) — warnanya mirip macan tutul. */
  F.dryPalette = function (p) {
    return Object.assign({}, p, {
      fern: '#b47b3c', fernHi: '#cf9b52', fernDark: '#7a4e22',
      leaf: '#b8843f', leafHi: '#d3a257', leafVein: '#ecd09a', grass: '#b49448', grassHi: '#cdb062'
    });
  };

  /* Pakis haji (paku pohon) — khas hutan pegunungan Jawa. */
  F.treeFern = function (g, r, p, x, baseY, h, size) {
    const topX = x + r.range(-18, 18), topY = baseY - h;
    const trunk = new Path2D(`M${x} ${baseY} Q${x + r.range(-14, 14)} ${(baseY + topY) / 2} ${topX} ${topY}`);
    g.lineCap = 'round';
    g.strokeStyle = p.outline; g.lineWidth = 18; g.stroke(trunk);
    g.strokeStyle = '#5b4330'; g.lineWidth = 12.5; g.stroke(trunk);
    g.strokeStyle = '#3e2c1e'; g.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const t = r(), px = J.lerp(x, topX, t) + r.range(-3, 3), py = J.lerp(baseY, topY, t);
      g.beginPath(); g.moveTo(px - 5, py); g.lineTo(px + 5, py - 3); g.stroke();
    }
    const n = r.int(9, 13), fr = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * Math.PI * 1.85 + r.range(-0.1, 0.1);
      fr.push({ a, len: size * r.range(0.75, 1.05), col: r.chance(0.5) ? p.fern : p.fernHi });
    }
    fr.sort((A, B) => Math.sin(A.a) - Math.sin(B.a));
    for (const f of fr) frond(g, topX, topY, f.a, f.len, f.col, p, { droop: 0.42 });
    g.fillStyle = p.fernDark; circ(g, topX, topY, 8); g.fill();
    return { x0: topX - size * 1.15, y0: topY - size * 0.85, x1: topX + size * 1.15, y1: baseY + 4 };
  };

  /* Rumpun rotan/palem: pelepah panjang melengkung. */
  F.palm = function (g, r, p, x, y, size) {
    const n = r.int(4, 7);
    for (let i = 0; i < n; i++) {
      frond(g, x, y, -Math.PI / 2 + r.range(-1.15, 1.15), size * r.range(0.8, 1.1), r.chance(0.5) ? p.leaf : p.leafHi, p, { leafL: 0.26, leafW: 0.09, droop: 0.4 });
    }
    return { x0: x - size * 1.15, y0: y - size * 1.05, x1: x + size * 1.15, y1: y + 6 };
  };

  /* Pohon muda kurus dengan mahkota daun. */
  F.sapling = function (g, r, p, x, baseY, topY) {
    const w = r.range(8, 15), tx = x + r.range(-14, 14);
    const trunk = new Path2D(`M${x} ${baseY} Q${x + r.range(-26, 26)} ${(baseY + topY) / 2} ${tx} ${topY}`);
    g.lineCap = 'round';
    g.strokeStyle = p.outline; g.lineWidth = w + 5; g.stroke(trunk);
    g.strokeStyle = p.trunk; g.lineWidth = w; g.stroke(trunk);
    const cs = [], n = r.int(5, 9), rad = r.range(42, 70);
    for (let i = 0; i < n; i++) { const a = r() * TAU, d = rad * r.range(0, 0.6); cs.push([tx + Math.cos(a) * d * 1.2, topY + Math.sin(a) * d * 0.6, rad * r.range(0.42, 0.62)]); }
    F.blobs(g, cs, r.chance(0.5) ? p.canopy : p.bush, p.canopyHi, p.outline, 3, p.canopyDark);
    return { x0: Math.min(x, tx) - rad * 1.3, y0: topY - rad * 0.95, x1: Math.max(x, tx) + rad * 1.3, y1: baseY + 4 };
  };

  /* Gerombol daun yang menggantung dari kanopi. */
  F.drape = function (g, r, p, x, y0, len) {
    const vb = F.vine(g, r, p, x, y0, len, { big: 1.1 });
    const fb = F.foliage(g, r, x + r.range(-12, 12), y0 + len, r.range(34, 56), p);
    return { x0: Math.min(vb.x0, fb.x0), y0: y0, x1: Math.max(vb.x1, fb.x1), y1: fb.y1 };
  };

  /* Semak bawah di kejauhan yang rapat dan agak buram. */
  F.understory = function (g, r, p, W, groundY, dens) {
    const cs = [];
    for (let x = -40; x < W + 40; x += r.range(28, 52)) cs.push([x, groundY - r.range(10, 150 * (0.4 + dens)), r.range(30, 70)]);
    g.save(); g.globalAlpha = 0.85;
    F.blobs(g, cs, '#5f9a4c', '#78ae5d', null, 0, '#4d843f');
    g.restore();
  };

  /* Cahaya belang-belang: bayangan kanopi + bintik sinar matahari.
     Jatuh juga di tubuh macan tutul sehingga siluetnya pecah — kamuflase alami. */
  F.dapple = function (g, r, W, H, s, groundY, night) {
    if (!(s > 0)) return;
    g.save();
    g.globalCompositeOperation = 'multiply';
    const n = Math.round(12 + 20 * s);
    for (let i = 0; i < n; i++) {
      const x = r.range(-100, W + 100), y = r.range(130, H), rad = r.range(80, 230);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(38,70,34,' + (0.6 * s) + ')');
      gr.addColorStop(1, 'rgba(38,70,34,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    const lg = g.createLinearGradient(0, groundY - 260, 0, H);
    lg.addColorStop(0, 'rgba(70,100,60,0)');
    lg.addColorStop(0.45, 'rgba(70,100,60,' + (0.4 * s) + ')');
    lg.addColorStop(1, 'rgba(70,100,60,' + (0.22 * s) + ')');
    g.fillStyle = lg; g.fillRect(0, groundY - 260, W, H);
    if (!night) {
      g.globalCompositeOperation = 'soft-light';
      const zones = r.int(4, 7);
      for (let z = 0; z < zones; z++) {
        const zx = r.range(0, W), zy = r.range(220, H - 30), m = Math.round(24 + 46 * s);
        for (let k = 0; k < m; k++) {
          const x = zx + r.range(-190, 190), y = zy + r.range(-100, 100), rr = r.range(4, 15);
          const gr = g.createRadialGradient(x, y, 0, x, y, rr);
          const al = r.range(0.25, 0.5) * s;
          gr.addColorStop(0, 'rgba(255,226,130,' + al + ')');
          gr.addColorStop(0.6, 'rgba(255,226,130,' + al * 0.6 + ')');
          gr.addColorStop(1, 'rgba(255,226,130,0)');
          g.fillStyle = gr;
          g.save(); g.translate(x, y); g.scale(1.4, 1); g.translate(-x, -y);
          g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
          g.restore();
        }
      }
    }
    g.restore();
  };

  F.vignette = function (W, H, R, strength) {
    const c = J.makeCanvas(W * R, H * R), g = c.getContext('2d');
    g.scale(R, R);
    const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.02);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,' + (strength || 0.42) + ')');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return c;
  };
})();
