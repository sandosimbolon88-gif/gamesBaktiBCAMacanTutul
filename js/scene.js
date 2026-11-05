/* Generator "Stasiun Kamera": merakit hutan acak, menyembunyikan macan tutul & satwa pengecoh,
   lalu memastikan setiap macan tutul masih cukup terlihat (tidak tertutup total). */
(function () {
  'use strict';
  const J = window.JSMT, A = J.Art, F = A.Forest;
  const CFG = window.JSMT_CONFIG, C = window.JSMT_CONTENT;
  const W = J.W, H = J.H;
  const S = (J.Scene = {});

  S.difficulty = function (i) {
    const st = CFG.stages;
    if (i < st.length) return Object.assign({ stage: i }, st[i]);
    const e = CFG.endless, k = i - st.length;
    return Object.assign({ stage: i }, e, { mode: e.modes[k % e.modes.length], scale: Math.max(e.minScale, e.scale - k * 0.012) });
  };

  function labelFor(it) {
    if (it.cub) return it.variant === 'black' ? C.labels.cubBlack : C.labels.cub;
    return it.variant === 'black' ? C.labels.black : C.labels.spotted;
  }

  /* Buat stasiun; ulangi dengan seed lain jika macan tutul gagal ditempatkan. */
  S.generate = function (stage, opts) {
    opts = Object.assign({}, opts);
    let sc = null;
    for (let i = 0; i < 6; i++) {
      sc = generateOnce(stage, opts);
      const need = Math.min(2, (opts.diff || S.difficulty(stage)).count[0]);
      if (sc.leopards.length >= need) return sc;
      opts.seed = J.rng(sc.seed + 7919 * (i + 1)).seed();
    }
    return sc;
  };

  function generateOnce(stage, opts) {
    const t0 = performance.now();
    const R = opts.R || J.R || 1;
    const seed = (opts.seed >>> 0) || J.randomSeed();
    const r = J.rng(seed);
    const d = Object.assign({}, opts.diff || S.difficulty(stage));
    const mode = opts.mode || d.mode;
    const night = mode === 'malam';
    const p = F.palette(mode);

    /* ---------- latar belakang ---------- */
    const bg = J.makeCanvas(W * R, H * R);
    const g = bg.getContext('2d', { willReadFrequently: night });
    g.setTransform(R, 0, 0, R, 0, 0);
    const groundY = r.range(585, 625);
    F.sky(g, p, W, groundY);
    F.farLayer(g, J.rng(r.seed()), W, groundY - 10, 16, p.far1T, p.far1C);
    if (!night) F.rays(g, J.rng(r.seed()), p, W, H);
    if (mode === 'pagi') F.mist(g, W, groundY - 340, groundY + 40, 0.6);
    F.farLayer(g, J.rng(r.seed()), W, groundY + 10, 10, p.far2T, p.far2C);
    if (mode === 'pagi') F.mist(g, W, groundY - 220, groundY + 70, 0.38);
    F.ground(g, J.rng(r.seed()), p, W, H, groundY);

    const nT = r.int(3, 5), seg = W / nT;
    const slots = [], trees = [];
    for (let i = 0; i < nT; i++) {
      trees.push({ x: seg * (i + 0.5) + r.range(-seg * 0.2, seg * 0.2), w: r.range(54, 86), base: groundY + r.range(25, 75) });
    }
    for (let i = 0; i < nT; i++) {
      const { x, w, base } = trees[i];
      // ruang bebas kiri/kanan supaya dahan tidak menembus pohon tetangga
      const roomL = (i > 0 ? x - trees[i - 1].x - trees[i - 1].w * 0.6 : x + 40) - w * 0.5 - 70;
      const roomR = (i < nT - 1 ? trees[i + 1].x - x - trees[i + 1].w * 0.6 : W - x + 40) - w * 0.5 - 70;
      const nb = r.int(1, 3), brs = [], usedY = [];
      for (let k = 0; k < nb; k++) {
        let y, tries = 0;
        do { y = r.range(240, 470); tries++; } while (usedY.some((u) => Math.abs(u - y) < 90) && tries < 12);
        let side = r.chance(0.5) ? 1 : -1;
        if ((side > 0 ? roomR : roomL) < 170) side = -side;
        const room = side > 0 ? roomR : roomL;
        if (room < 170) continue;
        usedY.push(y);
        brs.push({ side, y, len: Math.min(room, r.range(210, 330)), thick: r.range(24, 32), slope: r.range(-0.05, 0.025) });
      }
      const t = F.tree(g, J.rng(r.seed()), p, x, base, w, brs);
      slots.push(...t.slots);
    }
    F.canopy(g, J.rng(r.seed()), p, W);
    for (let i = 0, n = r.int(2, 4); i < n; i++) F.vine(g, J.rng(r.seed()), p, r.range(80, W - 80), r.range(90, 150), r.range(160, 380));
    if (r.chance(0.75)) { const rw = r.range(90, 160); F.rock(g, J.rng(r.seed()), p, r.range(100, W - 100), groundY + r.range(50, 120), rw, rw * r.range(0.45, 0.6)); }
    if (r.chance(0.55)) F.log(g, J.rng(r.seed()), p, r.range(40, W - 360), groundY + r.range(60, 130), r.range(200, 300), r.range(16, 22));
    const camo = d.camo || 0;
    for (let i = 0, n = r.int(3, 6); i < n; i++) {
      const bx = r.range(40, W - 40), by = groundY + r.range(15, 75), bw = r.range(110, 220), bh = r.range(70, 120);
      if (camo > 0) F.shadowPatch(g, bx, by + 18, bw * 0.75, 34);
      F.bush(g, J.rng(r.seed()), bx, by, bw, bh, p);
      if (r.chance(camo * 0.8)) F.flowers(g, J.rng(r.seed()), bx, by, bw, bh);
    }
    for (let i = 0, n = Math.round(camo * r.range(5, 9)); i < n; i++) {
      F.dryLeaves(g, J.rng(r.seed()), r.range(40, W - 40), r.range(groundY + 40, H - 30), r.range(60, 140));
    }
    for (let i = 0, n = Math.round(camo * 4); i < n; i++) {
      F.shadowPatch(g, r.range(60, W - 60), r.range(groundY + 60, H - 40), r.range(120, 220), r.range(30, 60));
    }
    if (!night) F.dapples(g, J.rng(r.seed()), p, W, groundY, H, 14 + Math.round(camo * 14));

    /* ---------- satwa ---------- */
    const items = [], occ = [];
    const gMin = groundY + 80, gMax = H - 14;
    const depth = (y) => J.lerp(0.8, 1.06, J.clamp((y - gMin) / (gMax - gMin), 0, 1));
    const freeSlots = r.shuffle(slots.filter((s) => s.x1 - s.x0 > 130));

    function tryPlace(sp, x, y, ignore) {
      const b = { x0: x + sp.box.x0, y0: y + sp.box.y0, x1: x + sp.box.x1, y1: y + sp.box.y1 };
      if (b.x0 < 16 || b.x1 > W - 16 || b.y0 < 112 || b.y1 > H - 4) return null;
      const area = J.boxArea(b);
      for (const o of occ) {
        if (o === ignore) continue;
        const ov = J.overlapArea(b, o);
        if (ov > 0.1 * Math.min(area, J.boxArea(o))) return null;
      }
      return b;
    }
    function mk(kind, extra, sp, x, y, b) {
      const it = Object.assign({ kind, sp, x, y, box: b, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, found: false, foundAt: 0 }, extra);
      it.eyes = sp.eyes.map((e) => ({ x: x + e.x, y: y + e.y }));
      it.head = sp.head ? { x: x + sp.head.x, y: y + sp.head.y, r: sp.head.r } : null;
      it.scale = sp.scale;
      return it;
    }
    function pickSlot(minLen) {
      const cand = freeSlots.filter((s) => !s.used && s.x1 - s.x0 >= minLen);
      return cand.length ? r.pick(cand) : null;
    }

    function placeLeopard(pose, variant, cub) {
      for (let attempt = 0; attempt < 5; attempt++) {
        let y = 0, slot = null, ds = 0.94;
        if (pose === 'branch') {
          slot = pickSlot(190 * d.scale);
          if (!slot) return null;
        } else {
          const lo = gMin + (pose === 'peek' ? -20 : 0), hi = gMax - (pose === 'peek' ? 90 : 0);
          y = r.range(lo, hi); ds = depth(y);
        }
        const scale = d.scale * ds * r.range(0.93, 1.07) * (cub ? 0.52 : 1);
        const sp = A.leopardSprite({ pose, variant, night, scale, R, flip: r.chance(0.5), cub });
        for (let k = 0; k < 14; k++) {
          let x;
          if (slot) {
            const half = 96 * scale;
            x = slot.x1 - slot.x0 > half * 2 ? r.range(slot.x0 + half, slot.x1 - half) : (slot.x0 + slot.x1) / 2;
            y = slot.y(x);
          } else x = r.range(40, W - 40);
          const b = tryPlace(sp, x, y);
          if (b) {
            occ.push(b);
            if (slot) slot.used = true;
            const it = mk('leopard', { pose, variant, cub: !!cub }, sp, x, y, b);
            it.label = labelFor(it);
            return it;
          }
          if (slot) break;
        }
      }
      return null;
    }
    function placeCub(mom) {
      const pose = r.pick(['sit', 'walk']);
      const sp = A.leopardSprite({ pose, variant: mom.variant, night, scale: Math.max(0.28, mom.scale * 0.52), R, flip: r.chance(0.5), cub: true });
      for (const side of r.shuffle([-1, 1])) {
        const x = mom.x + side * ((mom.box.x1 - mom.box.x0) * 0.5 + 34);
        const y = Math.min(gMax, mom.y + r.range(-4, 10));
        const b = tryPlace(sp, x, y, mom.box);
        if (b) {
          occ.push(b);
          const it = mk('leopard', { pose, variant: mom.variant, cub: true }, sp, x, y, b);
          it.label = labelFor(it);
          return it;
        }
      }
      return null;
    }

    const nLeo = r.int(d.count[0], d.count[1]);
    const poseW = { walk: 3, sit: 2.2, lie: 2, peek: 1.6, branch: 3.2 };
    let blackLeft = d.minBlack || 0, wantCub = !!d.cub && r.chance(d.cub);
    let placed = 0, guard = 0;
    while (placed < nLeo && guard < nLeo * 8) {
      guard++;
      const avail = Object.assign({}, poseW);
      if (!pickSlot(190 * d.scale)) delete avail.branch;
      const pose = r.weighted(avail);
      const black = blackLeft > 0 || r.chance(d.black || 0);
      const it = placeLeopard(pose, black ? 'black' : 'spotted', false);
      if (!it) { poseW[pose] *= 0.7; continue; }
      poseW[pose] *= 0.4;
      items.push(it); placed++;
      if (black && blackLeft > 0) blackLeft--;
      if (wantCub && placed < nLeo && (pose === 'walk' || pose === 'sit' || pose === 'lie')) {
        const cub = placeCub(it);
        if (cub) { items.push(cub); placed++; wantCub = false; }
      }
    }

    const dTypes = night ? ['kuwuk', 'kuwuk', 'kijang', 'landak']
      : stage === 0 ? ['kijang', 'ayam', 'landak']
        : ['kuwuk', 'kuwuk', 'kijang', 'ayam', 'landak', 'lutung', 'elang'];
    for (let i = 0; i < (d.decoys || 0); i++) {
      let type = r.pick(dTypes);
      let slot = null;
      if (A.DECOY_ON_BRANCH[type]) { slot = pickSlot(60); if (!slot) type = 'kijang'; }
      for (let k = 0; k < 16; k++) {
        let x, y, ds = 0.94;
        if (slot) { x = r.range(slot.x0 + 30, slot.x1 - 30); y = slot.y(x); }
        else { y = r.range(gMin, gMax); ds = depth(y); x = r.range(40, W - 40); }
        const sp = A.animalSprite(type, { scale: d.scale * ds * r.range(0.93, 1.07), R, flip: r.chance(0.5), night, pose: r.chance(0.6) ? 'walk' : 'sit' });
        const b = tryPlace(sp, x, y);
        if (b) {
          occ.push(b);
          if (slot) slot.used = true;
          const it = mk('decoy', { type, variant: type }, sp, x, y, b);
          it.info = C.decoys[type];
          it.label = it.info.name;
          items.push(it);
          break;
        }
      }
    }

    /* ---------- lapisan depan (penutup) ---------- */
    const fr = J.rng(r.seed());
    const fgItems = [];
    const add = (type, a, owner, essential) => fgItems.push({ type, a, owner: owner || null, essential: !!essential, seed: fr.seed(), box: null });
    for (let x = -30; x < W + 40; x += fr.range(140, 230)) add('fern', { x, y: H + 18, size: fr.range(100, 165) });
    for (let i = 0, n = fr.int(6, 10); i < n; i++) add('grass', { x: fr.range(0, W), y: H - fr.range(0, 40), h: fr.range(40, 80) });
    add('spray', { x: -10, y: fr.range(560, 820), size: fr.range(120, 170), dir: -0.3 });
    add('spray', { x: W + 10, y: fr.range(560, 820), size: fr.range(120, 170), dir: Math.PI + 0.3 });
    for (let i = 0, n = fr.int(2, 4); i < n; i++) add('vine', { x: fr.range(60, W - 60), y: -10, len: fr.range(140, 320) });

    const occl = d.occl || 0;
    for (const it of items) {
      const b = it.box, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
      const isLeo = it.kind === 'leopard';
      let k = Math.round(occl * (isLeo ? 3.2 : 2) + fr.range(-0.45, 0.45));
      if (it.pose === 'peek') {
        add('bush', { x: it.x, y: it.y + 92 * it.scale, w: 150 * it.scale + 40, h: 104 * it.scale + 12 }, it, true);
        k = Math.max(0, k - 1);
      }
      for (let j = 0; j < k; j++) {
        let px = 0, py = 0;
        for (let t = 0; t < 10; t++) {
          px = fr.range(b.x0 + bw * 0.1, b.x1 - bw * 0.1);
          py = fr.range(b.y0 + bh * 0.3, b.y1);
          if (!it.head || Math.hypot(px - it.head.x, py - it.head.y) > it.head.r * (1.9 - occl)) break;
        }
        if (it.pose === 'branch' || A.DECOY_ON_BRANCH[it.type]) {
          if (fr.chance(0.65)) add('foliage', { x: px, y: py, rad: bh * fr.range(0.3, 0.42) }, it);
          else add('spray', { x: px, y: py, size: bh * 0.6, dir: fr.range(0, Math.PI * 2) }, it);
        } else {
          const base = b.y1 + fr.range(4, 24);
          const tp = fr.pick(['fern', 'fern', 'bush', 'grass', 'spray']);
          const hh = Math.max(24, base - py);
          if (tp === 'fern') add('fern', { x: px, y: base, size: hh * fr.range(1.0, 1.25) }, it);
          else if (tp === 'bush') add('bush', { x: px, y: base, w: bw * fr.range(0.35, 0.6), h: hh * fr.range(0.9, 1.1) }, it);
          else if (tp === 'grass') add('grass', { x: px, y: base, h: hh * 1.15 }, it);
          else add('spray', { x: px, y: base, size: hh * 1.2, dir: -Math.PI / 2 + fr.range(-0.6, 0.6) }, it);
        }
      }
    }
    // beberapa penutup acak di tempat lain supaya posisi macan tutul tidak ketahuan
    for (let i = 0, n = fr.int(2, 4); i < n; i++) {
      const x = fr.range(60, W - 60), y = fr.range(gMin, H);
      if (fr.chance(0.5)) add('fern', { x, y, size: fr.range(70, 120) });
      else add('bush', { x, y, w: fr.range(90, 160), h: fr.range(60, 100) });
    }
    for (const s of slots) if (!s.used && fr.chance(0.5)) add('foliage', { x: fr.range(s.x0, s.x1), y: s.y((s.x0 + s.x1) / 2) - 10, rad: fr.range(36, 56) });

    const fg = J.makeCanvas(W * R, H * R);
    const fgc = fg.getContext('2d', { willReadFrequently: true });
    function drawFg() {
      fgc.setTransform(1, 0, 0, 1, 0, 0);
      fgc.clearRect(0, 0, fg.width, fg.height);
      fgc.setTransform(R, 0, 0, R, 0, 0);
      for (const f of fgItems) {
        const rr = J.rng(f.seed), a = f.a;
        if (f.type === 'fern') f.box = F.fern(fgc, rr, a.x, a.y, a.size, p);
        else if (f.type === 'grass') f.box = F.grass(fgc, rr, a.x, a.y, a.h, p);
        else if (f.type === 'spray') f.box = F.leafSpray(fgc, rr, a.x, a.y, a.size, p, a.dir);
        else if (f.type === 'vine') f.box = F.vine(fgc, rr, p, a.x, a.y, a.len, { big: 1.2 });
        else if (f.type === 'bush') f.box = F.bush(fgc, rr, a.x, a.y, a.w, a.h, p);
        else if (f.type === 'foliage') f.box = F.foliage(fgc, rr, a.x, a.y, a.rad, p);
      }
    }
    function visibility(it, fd) {
      const sp = it.sp, m = sp.mask, mw = m.width, mh = m.height, md = m.data;
      const offx = (it.x + sp.ox) * R, offy = (it.y + sp.oy) * R, fw = fg.width, fh = fg.height;
      const step = Math.max(2, Math.round(3 * R));
      let tot = 0, vis = 0;
      for (let y = 0; y < mh; y += step) {
        for (let x = 0; x < mw; x += step) {
          if (md[(y * mw + x) * 4 + 3] < 128) continue;
          tot++;
          const fx = Math.round(offx + x), fy = Math.round(offy + y);
          if (fx < 0 || fy < 0 || fx >= fw || fy >= fh) continue;
          if (fd[(fy * fw + fx) * 4 + 3] < 110) vis++;
        }
      }
      return tot ? vis / tot : 1;
    }
    for (let iter = 0; iter < 10; iter++) {
      drawFg();
      const fd = fgc.getImageData(0, 0, fg.width, fg.height).data;
      let changed = false;
      for (const it of items) {
        it.vis = visibility(it, fd);
        const need = it.kind === 'leopard' ? d.minVis : d.minVis * 0.8;
        if (it.vis >= need) continue;
        const cands = fgItems.filter((f) => !f.essential && f.box && J.overlapArea(f.box, it.box) > 0)
          .sort((a, b) => J.overlapArea(b.box, it.box) - J.overlapArea(a.box, it.box));
        if (cands.length) { fgItems.splice(fgItems.indexOf(cands[0]), 1); changed = true; }
      }
      if (!changed) break;
    }

    /* ---------- mode malam: kamera inframerah ---------- */
    if (night) {
      A.toIR(bg, { falloff: true, gain: 0.82, foliage: 0.7, cx: 0.5, cy: 0.86, rad: 0.58, noise: 12 });
      const diag = Math.hypot(W, H) * 0.6;
      for (const it of items) {
        const dist = Math.hypot(it.cx - W * 0.5, it.cy - H * 0.86) / diag;
        A.toIR(it.sp.canvas, { level: J.clamp(1.28 - dist * 1.1, 0.4, 1.06), gain: 1.12, noise: 8 });
      }
      A.toIR(fg, { falloff: true, gain: 1.05, foliage: 0.75, cx: 0.5, cy: 0.92, rad: 0.66, noise: 10 });
    }

    items.sort((a, b) => a.y - b.y);
    return {
      seed, stage, diff: d, mode, night, bg, fg, items, R,
      leopards: items.filter((i) => i.kind === 'leopard'),
      genMs: Math.round(performance.now() - t0)
    };
  }

  /* Cari satwa di titik (lx, ly). Prioritas: kena tepat > macan tutul dalam toleransi > pengecoh. */
  S.hit = function (scene, lx, ly, tol) {
    const list = scene.items.slice().sort((a, b) => b.y - a.y);
    const inBox = (it, t) => lx >= it.box.x0 - t && lx <= it.box.x1 + t && ly >= it.box.y0 - t && ly <= it.box.y1 + t;
    for (const it of list) if (inBox(it, 0) && A.spriteHit(it.sp, lx - it.x, ly - it.y, 0)) return it;
    for (const kind of ['leopard', 'decoy']) {
      for (const it of list) {
        if (it.kind !== kind || !inBox(it, tol)) continue;
        if (A.spriteHit(it.sp, lx - it.x, ly - it.y, tol)) return it;
      }
    }
    return null;
  };
})();
