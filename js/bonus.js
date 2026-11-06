/* Bonus lintasan terpisah dari target utama. Waktu bergerak hanya saat permainan aktif. */
(function () {
  'use strict';
  const J = window.JSMT, A = J.Art, CFG = window.JSMT_CONFIG;
  class Bonus {
    constructor(scene) {
      this.scene = scene;
      this.clock = 0;
      this.passes = 0;
      this.current = null;
      this.rng = J.rng(scene.seed ^ 0x6bca);
      this.nextAt = CFG.bonusFirstSec;
    }
    update(dt) {
      this.clock += dt;
      if (this.current) {
        const it = this.current;
        const q = (this.clock - it.started) / CFG.bonusPassSec;
        if (q >= 1) { this.current = null; this.nextAt = this.clock + CFG.bonusGapSec; return; }
        const x = J.lerp(it.from, it.to, q), dx = x - it.x;
        it.x = x; it.cx += dx; it.box.x0 += dx; it.box.x1 += dx;
        const frame = Math.floor((this.clock - it.started) * 10) % it.frames.length;
        it.sp = it.frames[frame];
      } else if (this.passes < CFG.bonusMaxPasses && this.clock >= this.nextAt) this.spawn();
    }
    spawn() {
      const flip = this.rng.chance(0.5), black = this.passes % 2 === 1;
      const frames = [];
      for (let i = 0; i < 8; i++) {
        const sp = A.leopardSprite({ pose: 'walk', variant: black ? 'black' : 'spotted',
          night: this.scene.night, scale: 0.78, R: this.scene.R, flip, gait: i / 8 * Math.PI * 2 });
        if (this.scene.night) A.toIR(sp.canvas, { level: 1, gain: 1.1, noise: 0 });
        frames.push(sp);
      }
      const sp = frames[0], from = flip ? J.W + 300 : -300, to = flip ? -300 : J.W + 300;
      const y = J.H - 125 - this.rng.range(0, 30);
      this.current = { kind: 'bonus', sp, frames, from, to, x: from, y,
        cx: from + (sp.box.x0 + sp.box.x1) / 2, cy: y + (sp.box.y0 + sp.box.y1) / 2,
        box: { x0: from + sp.box.x0, x1: from + sp.box.x1, y0: y + sp.box.y0, y1: y + sp.box.y1 },
        started: this.clock, label: 'Bonus lintasan', found: false };
      this.passes++;
    }
    hit(x, y, tol) {
      const it = this.current;
      return it && A.spriteHit(it.sp, x - it.x, y - it.y, Math.min(tol, 32)) ? it : null;
    }
    capture() { const it = this.current; this.current = null; this.nextAt = this.clock + CFG.bonusGapSec; return it; }
    render(ctx) {
      const it = this.current;
      if (!it) return;
      ctx.save();
      const glow = ctx.createRadialGradient(it.cx, it.cy, 5, it.cx, it.cy, 155);
      glow.addColorStop(0, 'rgba(255,214,103,.26)'); glow.addColorStop(1, 'rgba(255,214,103,0)');
      ctx.fillStyle = glow; ctx.fillRect(it.cx - 155, it.cy - 155, 310, 310);
      ctx.drawImage(it.sp.canvas, it.x + it.sp.ox, it.y + it.sp.oy, it.sp.lw, it.sp.lh);
      ctx.font = '800 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd76a'; ctx.shadowColor = '#051a1a'; ctx.shadowBlur = 8;
      ctx.fillText('BONUS +' + CFG.bonusPoints, it.cx, it.box.y0 - 13);
      ctx.restore();
    }
  }
  J.Bonus = Bonus;
})();
