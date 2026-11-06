/* Generator "Stasiun Kamera": merakit hutan lebat acak dengan lapisan kedalaman,
   menyembunyikan macan tutul & satwa pengecoh di antara tanaman, memberi cahaya belang-belang
   (kamuflase alami), lalu memastikan setiap macan tutul tetap terlihat sebagian.
   Hanya bagian tubuh yang TERLIHAT yang bisa diklik. */
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
    // Level tak terbatas: jumlah target dan pengecoh naik perlahan, sedangkan ukuran/visibilitas punya batas aman.
    const tier = Math.floor(k / 3);
    const countMin = Math.min(14, e.count[0] + Math.floor(k / 5));
    const countMax = Math.min(16, e.count[1] + Math.floor(k / 4));
    return Object.assign({ stage: i }, e, {
      mode: e.modes[k % e.modes.length],
      count: [countMin, Math.max(countMin, countMax)],
      decoys: Math.min(18, e.decoys + Math.floor(k / 4)),
      scale: Math.max(0.40, e.scale - tier * 0.01),
      occl: Math.min(0.88, e.occl + tier * 0.012),
      minVis: Math.max(0.19, e.minVis - tier * 0.006),
      hide: Math.min(0.55, e.hide + tier * 0.012),
      light: Math.min(1, e.light + tier * 0.01),
      camo: Math.min(1, e.camo + tier * 0.01)
    });
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

  /* ---------- tanaman sebagai objek berlapis ---------- */
  /* Perkiraan batas gambar tiap tanaman (sengaja dilebihkan supaya perhitungan "terlihat" akurat). */
  function vegBox(t, a) {
    switch (t) {
      case 'fern': return { x0: a.x - a.size * 1.3, y0: a.y - a.size * 1.12, x1: a.x + a.size * 1.3, y1: a.y + a.size * 0.5 };
      case 'grass': return { x0: a.x - a.h * 0.9, y0: a.y - a.h - 4, x1: a.x + a.h * 0.9, y1: a.y + 4 };
      case 'spray': return { x0: a.x - a.size * 1.08, y0: a.y - a.size * 1.08, x1: a.x + a.size * 1.08, y1: a.y + a.size * 1.08 };
      case 'vine': return { x0: a.x - 75, y0: a.y - 10, x1: a.x + 75, y1: a.y + a.len + 35 };
      case 'drape': return { x0: a.x - 95, y0: a.y - 10, x1: a.x + 95, y1: a.y + a.len + 75 };
      case 'bush': return { x0: a.x - a.w / 2 - 16, y0: a.y - a.h * 1.12, x1: a.x + a.w / 2 + 16, y1: a.y + 10 };
      case 'foliage': return { x0: a.x - a.rad * 1.15 - 4, y0: a.y - a.rad - 4, x1: a.x + a.rad * 1.15 + 4, y1: a.y + a.rad + 4 };
      case 'treefern': return { x0: a.x - a.size * 1.35 - 20, y0: a.y - a.h - a.size * 1.12, x1: a.x + a.size * 1.35 + 20, y1: Math.max(a.y + 4, a.y - a.h + a.size * 0.75) };
      case 'palm': return { x0: a.x - a.size * 1.45, y0: a.y - a.size * 1.2, x1: a.x + a.size * 1.45, y1: a.y + a.size * 0.55 };
      case 'sapling': return { x0: a.x - 145, y0: a.top - 75, x1: a.x + 145, y1: a.y + 6 };
      case 'trunk': { const fr = a.w * 1.2 + 40; return { x0: a.x - Math.max(a.w * 0.9, fr * 1.15) - 4, y0: 140 - fr - 4, x1: a.x + Math.max(a.w * 0.9, fr * 1.15) + 4, y1: a.y + 8 }; }
      default: return { x0: 0, y0: 0, x1: W, y1: H };
    }
  }
  function drawVeg(g, v, p) {
    const r = J.rng(v.seed), a = v.a, pp = a.dry ? F.dryPalette(p) : p;
    switch (v.type) {
      case 'fern': F.fern(g, r, a.x, a.y, a.size, pp, a.angle != null ? { angle: a.angle } : null); break;
      case 'grass': F.grass(g, r, a.x, a.y, a.h, pp); break;
      case 'spray': F.leafSpray(g, r, a.x, a.y, a.size, pp, a.dir); break;
      case 'vine': F.vine(g, r, p, a.x, a.y, a.len, { big: 1.2 }); break;
      case 'drape': F.drape(g, r, p, a.x, a.y, a.len); break;
      case 'bush': F.bush(g, r, a.x, a.y, a.w, a.h, p); if (a.flowers) F.flowers(g, r, a.x, a.y, a.w, a.h); break;
      case 'foliage': F.foliage(g, r, a.x, a.y, a.rad, p); break;
      case 'treefern': F.treeFern(g, r, p, a.x, a.y, a.h, a.size); break;
      case 'palm': F.palm(g, r, pp, a.x, a.y, a.size); break;
      case 'sapling': F.sapling(g, r, p, a.x, a.y, a.top); break;
      case 'trunk': // batang di depan; puncaknya menyatu ke rimbun daun
        g.save(); g.beginPath(); g.rect(-50, 120, W + 100, H); g.clip();
        F.tree(g, r, p, a.x, a.y, a.w, []);
        g.restore();
        F.foliage(g, r, a.x, 140, a.w * 1.2 + 40, p);
        break;
    }
  }
  function drawObj(g, o, p) {
    if (o.kind === 'animal') { const it = o.it, sp = it.sp; g.drawImage(sp.canvas, it.x + sp.ox, it.y + sp.oy, sp.lw, sp.lh); }
    else drawVeg(g, o, p);
  }

  function generateOnce(stage, opts) {
    const t0 = performance.now();
    const R = opts.R || J.R || 1;
    const seed = (opts.seed >>> 0) || J.randomSeed();
    const r = J.rng(seed);
    const d = Object.assign({ density: 0.6, light: 0.5, camo: 0.4, hide: 0, occl: 0.3, minVis: 0.5 }, opts.diff || S.difficulty(stage));
    const mode = opts.mode || d.mode;
    const night = mode === 'malam';
    const p = F.palette(mode);
    const dens = d.density, camo = d.camo;

    /* ================= latar belakang (selalu di belakang) ================= */
    const bg = J.makeCanvas(W * R, H * R);
    const g = bg.getContext('2d');
    g.setTransform(R, 0, 0, R, 0, 0);
    const groundY = r.range(H * 0.63, H * 0.67);
    F.sky(g, p, W, groundY);
    F.farLayer(g, J.rng(r.seed()), W, groundY - 10, Math.round(38 + 26 * dens), p.far1T, p.far1C);
    if (!night) F.rays(g, J.rng(r.seed()), p, W, H);
    if (mode === 'pagi') F.mist(g, W, groundY - 340, groundY + 40, 0.6);
    F.farLayer(g, J.rng(r.seed()), W, groundY + 10, Math.round(30 + 22 * dens), p.far2T, p.far2C);
    if (mode === 'pagi') F.mist(g, W, groundY - 220, groundY + 70, 0.38);
    F.understory(g, J.rng(r.seed()), p, W, groundY + 10, dens);
    F.ground(g, J.rng(r.seed()), p, W, H, groundY);
    for (let i = 0, n = Math.round(camo * r.range(6, 11)); i < n; i++) {
      F.dryLeaves(g, J.rng(r.seed()), r.range(40, W - 40), r.range(groundY + 30, H - 20), r.range(60, 150));
    }
    for (let i = 0, n = Math.round(2 + camo * 4); i < n; i++) {
      F.shadowPatch(g, r.range(60, W - 60), r.range(groundY + 40, H - 30), r.range(120, 240), r.range(30, 60));
    }
    // pohon besar berdahan (tempat macan tutul bersantai)
    const nT = r.int(5, 7), seg = W / nT;
    const slots = [], trees = [];
    for (let i = 0; i < nT; i++) {
      trees.push({ x: seg * (i + 0.5) + r.range(-seg * 0.2, seg * 0.2), w: r.range(54, 86), base: groundY + r.range(20, 60) });
    }
    for (let i = 0; i < nT; i++) {
      const { x, w, base } = trees[i];
      const roomL = (i > 0 ? x - trees[i - 1].x - trees[i - 1].w * 0.6 : x + 40) - w * 0.5 - 70;
      const roomR = (i < nT - 1 ? trees[i + 1].x - x - trees[i + 1].w * 0.6 : W - x + 40) - w * 0.5 - 70;
      const nb = r.int(1, 3), brs = [], usedY = [];
      for (let k = 0; k < nb; k++) {
        let y, tries = 0;
        do { y = r.range(270, 480); tries++; } while (usedY.some((u) => Math.abs(u - y) < 90) && tries < 12);
        let side = r.chance(0.5) ? 1 : -1;
        if ((side > 0 ? roomR : roomL) < 170) side = -side;
        const room = side > 0 ? roomR : roomL;
        if (room < 170) continue;
        usedY.push(y);
        brs.push({ side, y, len: Math.min(room, r.range(210, 330)), thick: r.range(24, 32), slope: r.range(-0.05, 0.025) });
      }
      slots.push(...F.tree(g, J.rng(r.seed()), p, x, base, w, brs).slots);
    }
    F.canopy(g, J.rng(r.seed()), p, W, dens);
    for (let i = 0, n = r.int(2, 4) + Math.round(7 + dens * 8); i < n; i++) F.vine(g, J.rng(r.seed()), p, r.range(60, W - 60), r.range(90, 170), r.range(160, 400));
    for (let i = 0, n = Math.round(8 + dens * 9); i < n; i++) F.drape(g, J.rng(r.seed()), p, r.range(40, W - 40), r.range(120, 180), r.range(60, 160));
    if (r.chance(0.7)) { const rw = r.range(90, 160); F.rock(g, J.rng(r.seed()), p, r.range(100, W - 100), groundY + r.range(40, 110), rw, rw * r.range(0.45, 0.6)); }
    if (r.chance(0.55)) F.log(g, J.rng(r.seed()), p, r.range(40, W - 360), groundY + r.range(50, 120), r.range(200, 300), r.range(16, 22));
    for (let i = 0, n = r.int(4, 7); i < n; i++) {
      F.bush(g, J.rng(r.seed()), r.range(30, W - 30), groundY + r.range(5, 40), r.range(120, 240), r.range(80, 130), p);
    }

    /* ================= satwa ================= */
    const habitat = { centerX: W * .5 + r.range(-100, 100), y: H * .77 };
    const gateSpecs = [
      { x: habitat.centerX-360, y:habitat.y+20, w:340, h:215 },
      { x: habitat.centerX+360, y:habitat.y+20, w:340, h:215 },
      { x:-70, y:H*.70, w:260, h:185 },
      { x:W+70, y:H*.70, w:260, h:185 }
    ];
    const gateBoxes = gateSpecs.map(a => vegBox('bush', a));
    const animals = [], occ = [];
    const gMin = groundY + 60, gMax = H - 16;
    const depth = (y) => J.lerp(0.78, 1.05, J.clamp((y - gMin) / (gMax - gMin), 0, 1));
    const freeSlots = r.shuffle(slots.filter((s) => s.x1 - s.x0 > 130));
    const soft = stage >= 2;

    function tryPlace(sp, x, y, ignore) {
      const b = { x0: x + sp.box.x0, y0: y + sp.box.y0, x1: x + sp.box.x1, y1: y + sp.box.y1 };
      if (b.x0 < 16 || b.x1 > W - 16 || b.y0 < 112 || b.y1 > H - 4) return null;
      if (gateBoxes.some(gate => J.overlapArea(b, gate) > 0)) return null;
      const area = J.boxArea(b);
      for (const o of occ) {
        if (o === ignore) continue;
        if (J.overlapArea(b, o) > 0.1 * Math.min(area, J.boxArea(o))) return null;
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
    function placeLeopard(pose, variant) {
      for (let attempt = 0; attempt < 8; attempt++) {
        let y = 0, slot = null, ds = 0.94;
        if (pose === 'branch') {
          slot = pickSlot(190 * d.scale);
          if (!slot) return null;
        } else {
          const lo = gMin + (pose === 'peek' ? -10 : 0), hi = gMax - (pose === 'peek' ? 90 : 0);
          y = r.range(lo, hi); ds = depth(y);
        }
        const scale = Math.max(0.40, Math.min(0.60, d.scale * ds * r.range(0.96, 1.04)));
        const sp = A.leopardSprite({ pose, variant, night, scale, R, flip: r.chance(0.5), soft });
        for (let k = 0; k < 24; k++) {
          let x;
          if (slot) {
            const half = 96 * scale;
            x = slot.x1 - slot.x0 > half * 2 ? r.range(slot.x0 + half, slot.x1 - half) : (slot.x0 + slot.x1) / 2;
            y = slot.y(x);
          } else x = r.range(24, W - 24);
          const b = tryPlace(sp, x, y);
          const minSpread = Math.max(105, 185 - stage * 10);
          const tooClose = animals.some((a) => a.kind === 'leopard' && !a.cub && Math.hypot(a.cx - (b ? (b.x0 + b.x1) / 2 : x), a.cy - (b ? (b.y0 + b.y1) / 2 : y)) < minSpread);
          if (b && !tooClose) {
            occ.push(b);
            if (slot) slot.used = true;
            const it = mk('leopard', { pose, variant, cub: false }, sp, x, y, b);
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
      const sp = A.leopardSprite({ pose, variant: mom.variant, night, scale: Math.max(0.40, Math.min(0.48, mom.scale * r.range(0.78, 0.88))), R, flip: r.chance(0.5), cub: true, soft });
      for (const side of r.shuffle([-1, 1])) {
        const x = mom.x + side * ((mom.box.x1 - mom.box.x0) * 0.5 + r.range(38, 68));
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
    const poseW = { walk: 3, sit: 2.2, lie: 2.4, peek: 1.8, branch: 4.8 };
    let blackLeft = d.minBlack || 0, wantCub = !!d.cub && r.chance(d.cub);
    let placed = 0, guard = 0, branchPlaced = 0;
    // Selalu usahakan minimal satu macan di dahan; mulai level 4 bisa ada dua.
    const branchTarget = Math.min(stage >= 12 ? 3 : (stage >= 3 ? 2 : 1), Math.max(1, Math.floor(nLeo / 2)));
    while (placed < nLeo && guard < nLeo * 14) {
      guard++;
      const avail = Object.assign({}, poseW);
      const branchAvailable = !!pickSlot(190 * d.scale);
      if (!branchAvailable) delete avail.branch;
      const pose = branchPlaced < branchTarget && branchAvailable ? 'branch' : r.weighted(avail);
      const blackSoFar = animals.filter((a) => a.variant === 'black').length;
      const black = blackLeft > 0 || (blackSoFar < Math.ceil(nLeo / 2) && r.chance(d.black || 0));
      const it = placeLeopard(pose, black ? 'black' : 'spotted');
      if (!it) { poseW[pose] *= 0.7; continue; }
      poseW[pose] *= 0.4;
      animals.push(it); placed++;
      if (pose === 'branch') branchPlaced++;
      if (black && blackLeft > 0) blackLeft--;
      if (wantCub && placed < nLeo && (pose === 'walk' || pose === 'sit' || pose === 'lie')) {
        const cub = placeCub(it);
        if (cub) { animals.push(cub); placed++; wantCub = false; }
      }
    }

    // Acak tanpa pengulangan jenis sampai seluruh pilihan terpakai.
    const warm = r.shuffle(A.DECOY_WARM_TYPES.slice());
    const dTypes = warm.concat(r.shuffle(A.DECOY_TYPES.filter(t => !warm.includes(t))));
    let placedDecoys = 0;
    for (let i = 0; i < (d.decoys || 0) * 4 && placedDecoys < d.decoys; i++) {
      let type = dTypes[i % dTypes.length], slot = null;
      if (A.DECOY_ON_BRANCH[type]) slot = pickSlot(60);
      for (let k = 0; k < 64; k++) {
        let x, y, ds = 0.94;
        if (slot) { x = r.range(slot.x0 + 30, slot.x1 - 30); y = slot.y(x); }
        else { y = r.range(gMin, gMax); ds = depth(y); x = r.range(40, W - 40); }
        const sp = A.animalSprite(type, { scale: d.scale * ds * r.range(0.93, 1.07), R, flip: r.chance(0.5), night, pose: r.chance(0.6) ? 'walk' : 'sit', soft });
        const b = tryPlace(sp, x, y);
        if (b) {
          occ.push(b);
          if (slot) slot.used = true;
          const it = mk('decoy', { type, variant: type }, sp, x, y, b);
          it.info = C.decoys[type];
          it.label = it.info.name;
          animals.push(it); placedDecoys++;
          break;
        }
      }
    }

    // Semua kelompok cakaran yang digambar merupakan petunjuk interaktif.
    let cluesPlaced = 0;
    for (const tree of r.shuffle(trees.slice())) {
      if (cluesPlaced >= (CFG.cluesPerStation || 0)) break;
      const sp = A.scratchSprite({ scale:Math.min(.82, tree.w/90), R });
      for (const y of [H*.46, H*.40, H*.52]) {
        const x = tree.x - tree.w*.03, b = tryPlace(sp,x,y);
        if (!b) continue;
        const it = mk('clue', { type:'scratch', pose:'trunk', label:'Cakaran pohon' }, sp,x,y,b);
        animals.push(it); occ.push(b); cluesPlaced++; break;
      }
    }

    /* ================= tanaman berlapis ================= */
    const fr = J.rng(r.seed());
    const objs = [];
    const addV = (type, a, z, owner, essential) => {
      const v = { kind: 'veg', type, a, z, owner: owner || null, essential: !!essential, seed: fr.seed() };
      v.box = vegBox(type, a);
      objs.push(v);
      return v;
    };
    const gy = () => fr.range(groundY + 15, H - 10);
    // pohon & tanaman tinggi di tengah (bisa berdiri di depan satwa)
    for (let i = 0, n = Math.round(4 + dens * 6 + fr()); i < n; i++) { const y = fr.range(groundY + 30, groundY + 170); addV('trunk', { x: fr.range(40, W - 40), y, w: fr.range(28, 48) }, y); }
    for (let i = 0, n = Math.round(8 + dens * 9); i < n; i++) { const y = fr.range(groundY + 20, H - 80); addV('sapling', { x: fr.range(30, W - 30), y, top: y - fr.range(230, 380) }, y); }
    for (let i = 0, n = Math.round(5 + dens * 7 + fr()); i < n; i++) { const y = fr.range(groundY + 20, H - 50); addV('treefern', { x: fr.range(40, W - 40), y, h: fr.range(110, 240), size: fr.range(90, 140) }, y); }
    // semak, pakis, rotan, rumput tinggi, daun lebar
    for (let i = 0, n = Math.round(16 + dens * 22); i < n; i++) { const y = gy(); addV('bush', { x: fr.range(20, W - 20), y, w: fr.range(90, 210), h: fr.range(60, 120), flowers: fr.chance(camo * 0.5) }, y); }
    for (let i = 0, n = Math.round(20 + dens * 28); i < n; i++) { const y = gy(); addV('fern', { x: fr.range(20, W - 20), y, size: fr.range(60, 130), dry: fr.chance(camo * 0.35) }, y); }
    for (let i = 0, n = Math.round(7 + dens * 10); i < n; i++) { const y = gy(); addV('palm', { x: fr.range(30, W - 30), y, size: fr.range(120, 200), dry: fr.chance(camo * 0.25) }, y); }
    for (let i = 0, n = Math.round(12 + dens * 16); i < n; i++) { const y = gy(); addV('grass', { x: fr.range(20, W - 20), y, h: fr.range(60, 135), dry: fr.chance(camo * 0.35) }, y); }
    for (let i = 0, n = Math.round(7 + dens * 10); i < n; i++) { const y = gy(); addV('spray', { x: fr.range(20, W - 20), y, size: fr.range(70, 120), dir: -Math.PI / 2 + fr.range(-0.7, 0.7), dry: fr.chance(camo * 0.2) }, y); }
    // daun di sekitar dahan (di depan satwa yang di dahan)
    for (const s of slots) {
      for (let k = 0, n = Math.round(4 + dens * 6 + fr()); k < n; k++) {
        const x = fr.range(s.x0, s.x1);
        addV('foliage', { x, y: s.y(x) - fr.range(0, 30), rad: fr.range(30, 55) }, s.y(x) + 4);
      }
    }
    // tirai daun dari kanopi
    for (let i = 0, n = Math.round(7 + dens * 8); i < n; i++) addV('drape', { x: fr.range(40, W - 40), y: fr.range(120, 170), len: fr.range(120, 300) }, 3000);

    // Lapisan ekstra hutan ekstrem: tepi, lantai, tengah, dan sulur kanopi.
    for (let i = 0, n = Math.round(14 + dens * 15); i < n; i++) {
      const left = i % 2 === 0;
      const x = left ? fr.range(-35, W * 0.24) : fr.range(W * 0.76, W + 35);
      const y = fr.range(groundY - 60, H + 5);
      addV('foliage', { x, y, rad: fr.range(62, 118) }, y + 38);
    }
    for (let i = 0, n = Math.round(12 + dens * 16); i < n; i++) {
      const y = fr.range(H - 165, H + 18);
      addV('fern', { x: fr.range(-20, W + 20), y, size: fr.range(88, 170), dry: fr.chance(camo * 0.5) }, y + 58);
    }
    for (let i = 0, n = Math.round(10 + dens * 14); i < n; i++) {
      const y = fr.range(groundY - 120, H - 35);
      addV('foliage', { x: fr.range(5, W - 5), y, rad: fr.range(38, 78) }, y + fr.range(8, 42));
    }
    for (let i = 0, n = Math.round(8 + dens * 12); i < n; i++) {
      const y = fr.range(groundY + 5, H - 18);
      addV('bush', { x: fr.range(-20, W + 20), y, w: fr.range(130, 260), h: fr.range(78, 145), flowers: fr.chance(camo * 0.65) }, y + 18);
    }
    for (let i = 0, n = Math.round(6 + dens * 8); i < n; i++) {
      addV('vine', { x: fr.range(25, W - 25), y: fr.range(100, 155), len: fr.range(230, 470) }, 2950);
    }

    // penutup khusus tiap satwa
    for (const it of animals) {
      if (it.kind === "clue") continue;
      const b = it.box, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
      const isLeo = it.kind === 'leopard';
      const onBranch = it.pose === 'branch' || A.DECOY_ON_BRANCH[it.type];
      const z = it.y;
      let k = Math.round((d.occl || 0) * (isLeo ? 3.4 : 2.2) + fr.range(-0.45, 0.45));
      if (it.pose === 'peek') {
        addV('bush', { x: it.x, y: it.y + 92 * it.scale, w: 150 * it.scale + 40, h: 104 * it.scale + 12 }, z + 2, it, true);
        k = Math.max(0, k - 1);
      } else if (isLeo && onBranch && fr.chance(d.hide || 0)) {
        // badan tersembunyi di rimbun daun, kaki & ekor menjuntai
        const fx = it.x + (it.sp.head ? -it.sp.head.x * 0.25 : 0);
        addV('foliage', { x: fx, y: it.y - 26 * it.scale, rad: 70 * it.scale + 14 }, z + 3, it, true);
        k = Math.max(0, k - 1);
      } else if (isLeo && !onBranch && (it.pose === 'walk' || it.pose === 'sit' || it.pose === 'lie') && fr.chance(d.hide || 0)) {
        // bersembunyi di balik batang pohon
        addV('trunk', { x: it.cx + fr.range(-0.12, 0.12) * bw, y: it.y + fr.range(6, 26), w: J.clamp(bw * 0.28, 26, 56) }, z + 2, it, true);
        k = Math.max(0, k - 1);
      }
      for (let j = 0; j < k; j++) {
        let px = 0, py = 0;
        for (let t = 0; t < 10; t++) {
          px = fr.range(b.x0 + bw * 0.1, b.x1 - bw * 0.1);
          py = fr.range(b.y0 + bh * 0.25, b.y1);
          if (!it.head || Math.hypot(px - it.head.x, py - it.head.y) > it.head.r * (1.8 - (d.occl || 0))) break;
        }
        const zz = z + fr.range(1, 30);
        if (onBranch) {
          if (fr.chance(0.65)) addV('foliage', { x: px, y: py, rad: bh * fr.range(0.3, 0.42) }, zz, it);
          else addV('spray', { x: px, y: py, size: bh * 0.6, dir: fr.range(0, Math.PI * 2) }, zz, it);
        } else {
          const base = b.y1 + fr.range(4, 24), hh = Math.max(24, base - py);
          const tp = fr.pick(['fern', 'fern', 'bush', 'grass', 'spray', 'palm']);
          const dry = fr.chance(camo * 0.4);
          if (tp === 'fern') addV('fern', { x: px, y: base, size: hh * fr.range(1.0, 1.25), dry }, zz, it);
          else if (tp === 'bush') addV('bush', { x: px, y: base, w: bw * fr.range(0.35, 0.6), h: hh * fr.range(0.9, 1.1) }, zz, it);
          else if (tp === 'grass') addV('grass', { x: px, y: base, h: hh * 1.15, dry }, zz, it);
          else if (tp === 'palm') addV('palm', { x: px, y: base, size: hh * 1.1, dry }, zz, it);
          else addV('spray', { x: px, y: base, size: hh * 1.2, dir: -Math.PI / 2 + fr.range(-0.6, 0.6), dry }, zz, it);
        }
      }
    }
    // bingkai paling depan
    for (let x = -30; x < W + 40; x += fr.range(140, 230)) addV('fern', { x, y: H + 18, size: fr.range(100, 165) }, 5000);
    for (let i = 0, n = fr.int(5, 9); i < n; i++) addV('grass', { x: fr.range(0, W), y: H - fr.range(0, 30), h: fr.range(40, 80) }, 5000);
    addV('spray', { x: -10, y: fr.range(560, 820), size: fr.range(120, 170), dir: -0.3 }, 5000);
    addV('spray', { x: W + 10, y: fr.range(560, 820), size: fr.range(120, 170), dir: Math.PI + 0.3 }, 5000);
    for (let i = 0, n = fr.int(1, 3); i < n; i++) addV('vine', { x: fr.range(60, W - 60), y: -10, len: fr.range(140, 300) }, 5000);

    // Semak bonus tetap menjadi bagian hutan, termasuk ketika tidak ada bonus.
    for (const gate of gateSpecs) {
      const v = addV('bush', gate, 5100, null, true); v.bonusGate = true;
    }
    for (const it of animals) objs.push({ kind:'animal', it, z:it.kind==='clue' ? -1000 : it.y, box:it.box });
    const order = () => objs.sort((a, b) => a.z - b.z);
    order();

    /* ================= jaminan terlihat & topeng bagian terlihat ================= */
    for (const it of animals) {
      const sp = it.sp, cw = sp.canvas.width, ch = sp.canvas.height;
      const lc = J.makeCanvas(cw, ch), lg = lc.getContext('2d', { willReadFrequently: true });
      const need = it.kind === 'clue' ? .55 : it.kind === 'leopard' ? d.minVis : d.minVis * 0.8;
      const md = sp.mask.data, n = cw * ch;
      let vm = null;
      for (let iter = 0; iter < 64; iter++) {
        const idx = objs.findIndex((o) => o.kind === 'animal' && o.it === it);
        const front = [];
        for (let i = idx + 1; i < objs.length; i++) if (J.overlapArea(objs[i].box, it.box) > 0) front.push(objs[i]);
        lg.setTransform(1, 0, 0, 1, 0, 0);
        lg.clearRect(0, 0, cw, ch);
        lg.setTransform(R, 0, 0, R, -(it.x + sp.ox) * R, -(it.y + sp.oy) * R);
        for (const o of front) drawObj(lg, o, p);
        const cov = lg.getImageData(0, 0, cw, ch).data;
        vm = new Uint8Array(n);
        let tot = 0, vis = 0;
        for (let i = 0; i < n; i++) {
          if (md[i * 4 + 3] < 100) continue;
          tot++;
          if (cov[i * 4 + 3] < 110) { vm[i] = 1; vis++; }
        }
        it.vis = tot ? vis / tot : 1;
        if (it.vis >= need) break;
        const byOverlap = (a, b) => J.overlapArea(b.box, it.box) - J.overlapArea(a.box, it.box);
        let cands = front.filter((o) => o.kind === 'veg' && !o.essential && !o.bonusGate).sort(byOverlap);
        // Penutup khusus juga dilepas bila batas visibilitas minimum belum terpenuhi.
        if (!cands.length && it.vis < need) cands = front.filter((o) => o.kind === 'veg' && !o.bonusGate).sort(byOverlap);
        if (!cands.length) break;
        const drop = it.vis < need * 0.5 ? 2 : 1;
        for (const c of cands.slice(0, drop)) objs.splice(objs.indexOf(c), 1);
      }
      it.vmask = vm;
      // mata hanya menyala jika tidak tertutup
      it.eyesVis = it.eyes.filter((e) => {
        const ex = Math.round((e.x - it.x - sp.ox) * R), ey = Math.round((e.y - it.y - sp.oy) * R);
        for (let dy = -3; dy <= 3; dy += 3) for (let dx = -3; dx <= 3; dx += 3) {
          const x = ex + dx, y = ey + dy;
          if (x >= 0 && y >= 0 && x < cw && y < ch && vm[y * cw + x]) return true;
        }
        return false;
      });
    }

    // Mask tanaman depan dipakai bersama oleh gambar dan deteksi klik bonus.
    const bonusCover = J.makeCanvas(W*R,H*R), coverG = bonusCover.getContext('2d');
    coverG.setTransform(R,0,0,R,0,0);
    for (const o of objs) if (o.kind==='veg' && o.z>=5000) drawObj(coverG,o,p);

    /* ================= gabungkan menjadi satu gambar ================= */
    const comp = J.makeCanvas(W * R, H * R);
    const cg = comp.getContext('2d', { willReadFrequently: night });
    cg.setTransform(R, 0, 0, R, 0, 0);
    cg.drawImage(bg, 0, 0, W, H);
    for (const o of objs) drawObj(cg, o, p);
    F.dapple(cg, J.rng(r.seed()), W, H, d.light || 0, groundY, night);
    if (mode === 'pagi') { cg.fillStyle = 'rgba(240,250,240,0.08)'; cg.fillRect(0, 0, W, H); }
    if (mode === 'senja') {
      cg.save(); cg.globalCompositeOperation = 'multiply';
      cg.fillStyle = 'rgba(240,160,105,0.5)'; cg.fillRect(0, 0, W, H);
      cg.restore();
    }
    if (night) {
      A.toIR(comp, { falloff: true, gain: 0.95, foliage: 0.72, cx: 0.5, cy: 0.86, rad: 0.62, noise: 12 });
      const diag = Math.hypot(W, H) * 0.62;
      for (const it of animals) { // versi untuk sorotan saat ditemukan
        const dist = Math.hypot(it.cx - W * 0.5, it.cy - H * 0.86) / diag;
        A.toIR(it.sp.canvas, { level: J.clamp(1.28 - dist * 1.1, 0.4, 1.06), gain: 1.12, noise: 8 });
      }
    }

    animals.sort((a, b) => a.y - b.y);
    return {
      seed, stage, diff: d, mode, night, comp, items: animals, R, bonusCover, habitat,
      clues: animals.filter(i => i.kind === "clue"),
      leopards: animals.filter((i) => i.kind === 'leopard'),
      genMs: Math.round(performance.now() - t0)
    };
  }

  /* Hanya bagian tubuh yang terlihat yang bisa diklik. */
  function visHit(it, lx, ly, tol) {
    const sp = it.sp, R = sp.R, m = sp.mask, mw = m.width, mh = m.height, vm = it.vmask;
    const px = (lx - it.x - sp.ox) * R, py = (ly - it.y - sp.oy) * R;
    const test = (x, y) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= mw || y >= mh) return false;
      return vm ? vm[y * mw + x] === 1 : m.data[(y * mw + x) * 4 + 3] > 60;
    };
    if (test(px, py)) return true;
    if (tol > 0) {
      for (const f of [0.5, 1]) for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        if (test(px + Math.cos(a) * tol * R * f, py + Math.sin(a) * tol * R * f)) return true;
      }
    }
    return false;
  }

  /* Cari satwa di titik (lx, ly). Prioritas: kena tepat > macan tutul dalam toleransi > pengecoh. */
  S.hit = function (scene, lx, ly, tol) {
    const list = scene.items.slice().sort((a, b) => b.y - a.y);
    const inBox = (it, t) => lx >= it.box.x0 - t && lx <= it.box.x1 + t && ly >= it.box.y0 - t && ly <= it.box.y1 + t;
    for (const it of list) if (inBox(it, 0) && visHit(it, lx, ly, 0)) return it;
    for (const kind of ['leopard', 'clue', 'decoy']) {
      for (const it of list) {
        if (it.kind === kind && inBox(it, tol) && visHit(it, lx, ly, tol)) return it;
      }
    }
    return null;
  };
})();
