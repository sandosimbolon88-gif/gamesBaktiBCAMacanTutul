/* Logika permainan: timer, skor, tap, petunjuk, efek, pergantian stasiun. */
(function () {
  'use strict';
  const J = window.JSMT, A = J.Art, CFG = window.JSMT_CONFIG, C = window.JSMT_CONTENT;
  const W = J.W, H = J.H, TAU = Math.PI * 2;
  const UI = () => J.UI;

  /* ---------- gambar adegan (dipakai juga oleh layar awal) ---------- */
  J.drawScene = function (ctx, sc, now, opt) {
    opt = opt || {};
    ctx.drawImage(sc.comp,0,0,W,H);
    if (sc.night) { // mata memantulkan cahaya kamera inframerah
      for (const it of sc.items) {
        const eyes = it.eyesVis || it.eyes;
        if (it.found || !eyes.length) continue;
        const blink = Math.sin(now * 1.3 + it.x * 0.01) > 0.965 ? 0.15 : 1;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const e of eyes) {
          const rad = Math.max(3.5, 6 * it.scale);
          const gr = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, rad * 3.6);
          gr.addColorStop(0, 'rgba(255,255,255,' + blink + ')');
          gr.addColorStop(0.25, 'rgba(230,250,255,' + 0.75 * blink + ')');
          gr.addColorStop(1, 'rgba(200,235,255,0)');
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(e.x, e.y, rad * 3.6, 0, TAU); ctx.fill();
        }
        ctx.restore();
        for (const e of eyes) {
          ctx.fillStyle = 'rgba(255,255,255,' + blink + ')';
          ctx.beginPath(); ctx.arc(e.x, e.y, Math.max(2.2, 3.4 * it.scale), 0, TAU); ctx.fill();
        }
      }
    }
    if (opt.found !== false) {
      for (const it of sc.items) {
        if (!it.found && !it.missed && !it.demo) continue;
        const a = it.demo ? it.demo : J.clamp((now - it.foundAt) / 0.25, 0, 1);
        ctx.globalAlpha = a;
        const glow = A.glow(it.sp, it.missed ? '#ffffff' : '#ffe15a');
        ctx.drawImage(glow, it.x + it.sp.ox, it.y + it.sp.oy, it.sp.lw, it.sp.lh);
        ctx.globalAlpha = 1;
        J.drawBracket(ctx, it, it.missed ? '#ff6b5b' : '#ffd84a', it.missed ? C.ui.missed + ' · ' + it.label : it.label, a);
      }
    }
  };

  J.drawBracket = function (ctx, it, color, label, alpha) {
    const pad = 8, b = it.box;
    const x0 = b.x0 - pad, y0 = b.y0 - pad, x1 = b.x1 + pad, y1 = b.y1 + pad;
    const L = Math.min(28, (x1 - x0) / 3, (y1 - y0) / 3);
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const corners = () => {
      ctx.beginPath();
      ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0);
      ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L);
      ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1);
      ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L);
      ctx.stroke();
    };
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 8; corners();
    ctx.strokeStyle = color; ctx.lineWidth = 4.5; corners();
    if (label) {
      ctx.font = '800 19px ' + getComputedStyle(document.body).fontFamily;
      const tw = ctx.measureText(label).width + 20, th = 30;
      let lx = J.clamp((x0 + x1) / 2 - tw / 2, 8, W - tw - 8);
      let ly = y0 - th - 6;
      if (ly < 108) ly = y1 + 6;
      if (ly + th > H - 4) ly = y0 + 6;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      roundRect(ctx, lx + 2, ly + 3, tw, th, 10); ctx.fill();
      ctx.fillStyle = color;
      roundRect(ctx, lx, ly, tw, th, 10); ctx.fill();
      ctx.fillStyle = '#2a1a06';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx + 10, ly + th / 2 + 1);
    }
    ctx.restore();
  };
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------- kelas permainan ---------- */
  class Game {
    constructor(opts) {
      this.onEnd = opts.onEnd;
      this.timers = new Set();
      this.active = false;
      this.scene = null;
    }

    later(fn, ms) {
      const id = setTimeout(() => { this.timers.delete(id); if (this.active) fn(); }, ms);
      this.timers.add(id);
    }
    clearTimers() { for (const id of this.timers) clearTimeout(id); this.timers.clear(); }

    buildFactQueue() {
      const rr = J.rng(J.randomSeed());
      const byId = {};
      C.facts.forEach((f) => { byId[f.id] = f; });
      const pri = (C.priorityFacts || []).map((id) => byId[id]).filter(Boolean);
      const rest = rr.shuffle(C.facts.filter((f) => !pri.includes(f) && !(C.nightFacts || []).includes(f.id)));
      this.facts = pri.concat(rest);
      this.nightFacts = (C.nightFacts || []).map((id) => byId[id]).filter(Boolean);
    }
    nextFact(wasNight) {
      if (wasNight && this.nightFacts.length) return this.nightFacts.shift();
      const f = this.facts.shift() || C.facts[Math.floor(Math.random() * C.facts.length)];
      this.facts.push(f);
      return f;
    }

    start(duration) {
      this.clearTimers();
      this.duration = duration;
      this.timeLeft = duration;
      this.baseFound = 0; this.bonusFound = 0; this.bonusScore = 0;
      this.cluesFound = 0; this.clueScore = 0; this.skips = 0; this.skipPenalty = 0;
      this.score = 0; this.stage = 0; this.stagesCleared = 0; this.mistakes = 0;
      this.effects = []; this.particles = [];
      this.paused = false; this.ending = false; this.active = true;
      this.misses = []; this.lockUntil = 0; this.lastTickSec = null;
      this.buildFactQueue();
      this.loadScene(J.Scene.generate(0, { R: J.R }));
      this.addShutter(null, true);
      UI().hud.show(true);
      UI().hud.score(0);
      UI().hud.time(this.timeLeft, this.duration);
      J.Audio.start();
    }

    loadScene(sc) {
      if (J.resetCamera) J.resetCamera();
      this.scene = sc;
      this.bonus = new J.Bonus(sc);
      UI().hud.bonus(false, this.bonusScore, this.clueScore);
      const now = J.now();
      this.stageStart = now; this.lastFind = now; this.hintTarget = null; this.nextScene = null;
      UI().hud.station(this.stage + 1, sc.mode);
      UI().hud.pips(sc.leopards);
      UI().clearBubbles();
      if (sc.night) this.later(() => this.active && UI().banner(UI().esc(C.ui.nightTip), 'calm'), 450);
    }

    stop() { this.clearTimers(); this.active = false; UI().hud.show(false); UI().clearBubbles(); UI().cancelFact(); }

    /* ---------- input ---------- */
    pointer(lx, ly, tol, bonusAtDown) {
      if (!this.active || this.paused || this.ending) return;
      const now = J.now();
      if (now < this.lockUntil) return;
      const bonus = bonusAtDown && this.bonus.current === bonusAtDown ? bonusAtDown : this.bonus.hit(lx, ly, tol);
      if (bonus) {
        this.bonus.capture();
        this.bonusFound++; this.bonusScore += CFG.bonusPoints; this.score += CFG.bonusPoints;
        this.effects.push({ type: 'text', x: bonus.cx, y: bonus.box.y0 - 12, text: 'BONUS +' + CFG.bonusPoints, t0: now, dur: 1.1, color: '#ffe15a' });
        this.effects.push({ type: 'ring', x: bonus.cx, y: bonus.cy, r0: 20, r1: 140, t0: now, dur: 0.6 });
        J.Audio.found(); UI().hud.score(this.score, true); UI().hud.bonus(false, this.bonusScore, this.clueScore);
        return;
      }
      const it = J.Scene.hit(this.scene, lx, ly, tol);
      if (it && it.kind === 'clue') {
        if (it.found) return;
        it.found=true; it.foundAt=now;
        this.cluesFound++; this.clueScore+=CFG.cluePoints; this.score+=CFG.cluePoints;
        this.effects.push({type:'text',x:it.cx,y:it.box.y0-10,text:'CAKARAN +'+CFG.cluePoints,t0:now,dur:1,color:'#ffe15a'});
        J.Audio.found();UI().hud.score(this.score,true);UI().hud.bonus(this.bonus.current,this.bonusScore,this.clueScore);
        UI().bubble(it.cx,it.box.y0,'Jejak di pohon!','Cakaran adalah salah satu tanda yang dipelajari peneliti. Di alam, temuan jejak perlu diperiksa bersama bukti lainnya.','+'+CFG.cluePoints+' poin');
        return;
      }
      if (it && it.kind === 'leopard') {
        if (it.found) return;
        it.found = true; it.foundAt = now;
        this.score++; this.baseFound++;
        this.lastFind = now; this.hintTarget = null;
        this.effects.push({ type: 'ring', x: it.cx, y: it.cy, r0: 20, r1: Math.max(90, (it.box.x1 - it.box.x0) * 0.7), t0: now, dur: 0.6 });
        this.effects.push({ type: 'text', x: it.cx, y: it.box.y0 - 10, text: '+1', t0: now, dur: 0.9, color: '#ffe15a' });
        this.effects.push({ type: 'flash', t0: now, dur: 0.22 });
        J.Audio.found();
        UI().hud.score(this.score, true);
        UI().hud.pips(this.scene.leopards);
        if (this.scene.leopards.every((l) => l.found)) this.stageClear();
        return;
      }
      if (it && it.kind === 'decoy') {
        let extra = '';
        if (!it.penalized) {
          it.penalized = true;
          this.mistakes++;
          this.timeLeft = Math.max(0, this.timeLeft - CFG.decoyPenaltySec);
          UI().hud.time(this.timeLeft,this.duration);
          extra = J.tpl(C.ui.penalty, { s: CFG.decoyPenaltySec });
          this.effects.push({ type: 'text', x: it.cx, y: it.box.y0 - 6, text: extra, t0: now, dur: 1.1, color: '#ff8a70' });
        }
        this.effects.push({ type: 'xbox', it, t0: now, dur: 1.2 });
        J.Audio.decoy();
        UI().bubble(it.cx, it.box.y0, it.info.name, it.info.text, extra);
        if (this.timeLeft<=0) this.end();
        return;
      }
      // meleset
      this.effects.push({ type: 'miss', x: lx, y: ly, t0: now, dur: 0.4 });
      J.Audio.miss();
      this.misses = this.misses.filter((t) => now - t < CFG.spamWindowSec);
      this.misses.push(now);
      if (this.misses.length >= CFG.spamMisses) {
        this.misses = [];
        this.lockUntil = now + CFG.spamLockSec;
        UI().banner(UI().esc(C.ui.calm), 'calm');
      }
    }

    skipStation() {
      if (!this.active || this.paused || this.ending) return;
      this.paused = true; UI().clearBubbles();
      const deducted=Math.min(this.score,CFG.skipPenaltyPoints);
      this.score-=deducted;this.skipPenalty+=deducted;this.skips++;
      UI().hud.score(this.score,true);
      UI().banner('Stasiun dilewati<small>−'+deducted+' poin · Mengganti kamera...</small>');
      const nextStage = this.stage + 1;
      this.later(() => { if (!this.active) return; this.stage = nextStage;
        const sc = J.Scene.generate(nextStage, { R: J.R });
        this.addShutter(() => { this.loadScene(sc); }, false, () => { this.paused = false; this.lastFind = J.now(); });
      }, 450);
    }

    stageClear() {
      this.paused = true;
      UI().clearBubbles();
      this.stagesCleared++;
      J.Audio.clear();
      UI().banner(UI().esc(C.ui.cleared));
      const wasNight = this.scene.night;
      const nextStage = this.stage + 1;
      this.later(() => { // buat stasiun berikutnya selagi pemain membaca fakta
        if (!this.active) return;
        try { this.nextScene = J.Scene.generate(nextStage, { R: J.R }); } catch (e) { console.error(e); }
      }, 120);
      this.later(() => {
        if (!this.active) return;
        UI().showFact(this.nextFact(wasNight), () => {
          if (!this.active) return; this.stage = nextStage;
          const sc = this.nextScene || J.Scene.generate(nextStage, { R: J.R }); this.nextScene = null;
          this.addShutter(() => { this.loadScene(sc); }, false, () => { this.paused = false; this.lastFind = J.now(); });
        });
      }, 1150);
    }

    addShutter(onMid, openOnly, onEnd) {
      this.effects.push({ type: 'shutter', t0: J.now(), dur: openOnly ? 0.35 : 0.6, openOnly, onMid, onEnd, midDone: false });
    }

    end() {
      this.ending = true;
      this.paused = true;
      J.Audio.over();
      UI().banner(UI().esc(C.ui.timeUp));
      for (const l of this.scene.leopards) if (!l.found) l.missed = true;
      this.later(() => {
        if (!this.active) return;
        this.active = false;
        UI().hud.show(false);
        this.onEnd({ score: this.score, stages: this.stagesCleared, mistakes: this.mistakes, baseFound: this.baseFound, bonusFound: this.bonusFound, bonusScore: this.bonusScore, cluesFound:this.cluesFound, clueScore:this.clueScore, skips:this.skips, skipPenalty:this.skipPenalty });
      }, 2600);
    }

    /* ---------- update & render ---------- */
    update(dt, now) {
      if (!this.active) return;
      if (!this.paused && !this.ending) {
        this.bonus.update(dt);
        UI().hud.bonus(this.bonus.current, this.bonusScore, this.clueScore);
        this.timeLeft -= dt;
        const sec = Math.ceil(this.timeLeft);
        if (sec !== this.lastTickSec) {
          this.lastTickSec = sec;
          UI().hud.time(this.timeLeft, this.duration);
          if (sec <= 5 && sec > 0) J.Audio.tick();
        }
        if (this.timeLeft <= 0) { this.timeLeft = 0; UI().hud.time(0, this.duration); this.end(); }
        // petunjuk
        const idle = now - this.lastFind;
        if (idle > CFG.hintAfterSec) {
          if (!this.hintTarget || this.hintTarget.found) {
            const left = this.scene.leopards.filter((l) => !l.found);
            this.hintTarget = left[Math.floor(Math.random() * left.length)] || null;
            this.hintPulseOff = { x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 40 };
          }
          if (this.hintTarget && Math.random() < dt * 2.2) this.spawnLeaf(this.hintTarget, now);
        }
      }
      for (const p of this.particles) {
        p.vy += 26 * dt; p.x += (p.vx + Math.sin(now * 3 + p.ph) * 22) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      }
      this.particles = this.particles.filter((p) => now - p.t0 < p.life);
    }

    spawnLeaf(it, now) {
      const b = it.box;
      this.particles.push({
        x: J.lerp(b.x0, b.x1, Math.random()), y: b.y0 - 10 + Math.random() * 20, vx: (Math.random() - 0.5) * 20, vy: 10,
        rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 6, ph: Math.random() * TAU, t0: now, life: 1.8,
        col: Math.random() < 0.5 ? '#6fb552' : '#c9a646', s: 7 + Math.random() * 5
      });
    }

    render(ctx, now) {
      if (!this.scene) return;
      J.drawScene(ctx, this.scene, now);
      if (this.bonus && !this.ending) this.bonus.render(ctx);
      // lingkaran petunjuk kuat
      if (this.active && !this.paused && this.hintTarget && now - this.lastFind > CFG.strongHintAfterSec) {
        const it = this.hintTarget, k = (Math.sin(now * 3) + 1) / 2;
        const rad = Math.max(it.box.x1 - it.box.x0, it.box.y1 - it.box.y0) * 0.75 + 30;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.25 + 0.35 * k) + ')';
        ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -now * 30;
        ctx.beginPath(); ctx.arc(it.cx + this.hintPulseOff.x, it.cy + this.hintPulseOff.y, rad + k * 10, 0, TAU); ctx.stroke();
        ctx.restore();
      }
      for (const p of this.particles) {
        const a = 1 - (now - p.t0) / p.life;
        ctx.save(); ctx.globalAlpha = J.clamp(a * 1.5, 0, 1); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.col; ctx.strokeStyle = '#22331a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      const keep = [];
      for (const e of this.effects) {
        const t = (now - e.t0) / e.dur;
        if (t >= 1) { if (e.type === 'shutter') { if (e.onMid && !e.midDone) e.onMid(); if (e.onEnd) e.onEnd(); } continue; }
        keep.push(e);
        this.drawEffect(ctx, e, t, now);
      }
      this.effects = keep;
    }

    drawEffect(ctx, e, t, now) {
      if (e.type === 'ring') {
        const k = J.ease.outCubic(t);
        ctx.save(); ctx.strokeStyle = 'rgba(255,225,90,' + (1 - t) + ')'; ctx.lineWidth = 8 * (1 - t) + 2;
        ctx.beginPath(); ctx.arc(e.x, e.y, J.lerp(e.r0, e.r1, k), 0, TAU); ctx.stroke(); ctx.restore();
      } else if (e.type === 'text') {
        const k = J.ease.outCubic(t);
        ctx.save(); ctx.globalAlpha = 1 - t * t;
        ctx.font = '900 46px ' + getComputedStyle(document.body).fontFamily; ctx.textAlign = 'center';
        ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(40,20,0,0.85)';
        const y = Math.max(130, e.y - k * 50);
        ctx.strokeText(e.text, e.x, y); ctx.fillStyle = e.color; ctx.fillText(e.text, e.x, y);
        ctx.restore();
      } else if (e.type === 'flash') {
        ctx.fillStyle = 'rgba(255,255,255,' + 0.35 * (1 - t) + ')'; ctx.fillRect(0, 0, W, H);
      } else if (e.type === 'miss') {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + 0.8 * (1 - t) + ')'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(e.x, e.y, 8 + t * 22, 0, TAU); ctx.stroke(); ctx.restore();
      } else if (e.type === 'xbox') {
        J.drawBracket(ctx, e.it, '#ff8a70', null, 1 - t);
      } else if (e.type === 'shutter') {
        let close;
        if (e.openOnly) close = 1 - J.ease.inOut(t);
        else if (t < 0.5) close = J.ease.inOut(t * 2);
        else { if (!e.midDone) { e.midDone = true; if (e.onMid) e.onMid(); } close = 1 - J.ease.inOut((t - 0.5) * 2); }
        const hgt = (H / 2) * close;
        ctx.fillStyle = '#060d08';
        ctx.fillRect(0, 0, W, hgt); ctx.fillRect(0, H - hgt, W, hgt);
        if (close > 0.05) {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(0, hgt); ctx.lineTo(W, hgt); ctx.moveTo(0, H - hgt); ctx.lineTo(W, H - hgt); ctx.stroke();
        }
      }
    }
  }
  J.Game = Game;
})();
