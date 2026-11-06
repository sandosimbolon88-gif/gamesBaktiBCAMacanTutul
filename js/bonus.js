/* Kemunculan singkat: lari, semak, kepala, ekor, dan tubuh merunduk muncul.
   Sprite yang dirender dan yang bisa dipilih memakai mask vegetasi yang sama. */
(function () {
  'use strict';
  const J = window.JSMT, A = J.Art, CFG = window.JSMT_CONFIG;
  const cache = new Map();

  function sprites(scene, type, flip, variant) {
    const head=type.startsWith('peek'),tail=type==='tail',rise=type==='rise';
    const style=head?'head':tail?'tail':rise?'rise':'run';
    const key = [scene.R,scene.night,style,flip,variant,CFG.bonusRunScale,CFG.bonusHeadScale,CFG.bonusTailScale].join('|');
    if (cache.has(key)) return cache.get(key);
    const frames = [];
    for (let i=0; i<(head||rise ? 1 : 12); i++) {
      const o = { pose:rise?'crouch':'run', variant, night:scene.night, scale:head ? CFG.bonusHeadScale : tail?CFG.bonusTailScale:CFG.bonusRunScale,
        R:scene.R, flip, gait:i/12*Math.PI*2 };
      const sp = head ? A.leopardHeadSprite(o) : tail?A.leopardTailSprite(o):A.leopardSprite(o);
      if (scene.night) A.toIR(sp.canvas,{level:1,gain:1.1,noise:0});
      frames.push(sp);
    }
    // Batasi cache ketika ukuran jendela/densitas piksel berubah berulang kali.
    if (cache.size >= 24) cache.delete(cache.keys().next().value);
    cache.set(key,frames);
    return frames;
  }

  class Bonus {
    constructor(scene) {
      this.scene = scene;
      this.clock = 0; this.passes = 0; this.current = null;
      this.rng = J.rng(scene.seed ^ 0x6bca);
      this.nextAt = CFG.bonusFirstSec+this.rng.range(-1,1);
      this.sequence = this.rng.shuffle([this.rng.pick(['dash','cover']),this.rng.chance(.5) ? 'peek-left' : 'peek-right','tail','rise']);
    }
    update(dt) {
      this.clock += dt;
      if (this.current) {
        const it = this.current;
        const q = (this.clock-it.started)/it.duration;
        if (q >= 1) { this.current=null; this.nextAt=this.clock+CFG.bonusGapSec+this.rng.range(-1,1); return; }
        this.place(it,Math.max(0,q));
      } else if (this.passes<CFG.bonusMaxPasses && this.clock>=this.nextAt) this.spawn();
    }
    spawn(type) {
      if (this.current || this.passes>=CFG.bonusMaxPasses) return null;
      type = type || this.sequence[this.passes % this.sequence.length];
      const peek = type.startsWith('peek'),tail=type==='tail',rise=type==='rise';
      const flip = peek ? type==='peek-right' : this.rng.chance(.5);
      const variant = (this.scene.stage+this.passes)%3===2 ? 'black' : 'spotted';
      const frames = sprites(this.scene,type,flip,variant), sp=frames[0];
      const center=this.scene.habitat.centerX;
      let from=-350, to=J.W+350, baseY=J.H*.88;
      let opening={x0:0,y0:0,x1:J.W,y1:J.H};
      let duration=CFG.bonusPassSec;
      if (type==='cover') {
        from=center-650; to=center+650; baseY=this.scene.habitat.y;
        opening={x0:center-360,y0:baseY-350,x1:center+360,y1:baseY+70};
        duration=CFG.bonusCoverSec;
      } else if(tail||rise){
        const gate=center+(this.rng.chance(.5)?-360:360);
        from=gate+(tail?this.rng.range(-35,35):0);to=from;
        baseY=this.scene.habitat.y-(tail?100:185);
        opening={x0:gate-200,y0:this.scene.habitat.y-380,x1:gate+200,y1:this.scene.habitat.y+60};
        duration=tail?CFG.bonusTailSec:CFG.bonusRiseSec;
      } else if (peek) {
        from=-90; to=115; baseY=J.H*.61;
        opening={x0:0,y0:0,x1:225,y1:J.H};
        if (flip) { from=J.W-from; to=J.W-to; opening.x0=J.W-225; opening.x1=J.W; }
        duration=CFG.bonusPeekSec;
      }
      if (flip && !peek) [from,to]=[to,from];
      this.current={kind:'bonus',type,sp,frames,from,to,baseY,opening,duration,
        started:this.clock,label:peek ? 'Kepala mengintip' : tail?'Ekor di semak':rise?'Mengendap dari semak':'Lari melompat',found:false,
        visibleCanvas:J.makeCanvas(sp.canvas.width,sp.canvas.height)};
      this.passes++;
      this.place(this.current,0);
      return this.current;
    }
    place(it,q) {
      const age=q*it.duration, peek=it.type.startsWith('peek'),emerge=it.type==='tail'||it.type==='rise';
      const reveal=q<.22 ? J.ease.inOut(q/.22) : q<.65 ? 1 : 1-J.ease.inOut((q-.65)/.35);
      const phase=age*Math.PI*2*3.3;
      it.progress=q;
      it.x=J.lerp(it.from,it.to,peek ? reveal : q);
      it.y=emerge?it.baseY+(1-reveal)*230:it.baseY-(peek ? 0 : Math.max(0,Math.sin(phase))*48);
      it.reveal=emerge?reveal:1;
      it.sp=it.frames[it.frames.length===1 ? 0 : Math.floor(age*(emerge?1.4:3.3)*12)%it.frames.length];
      const b=it.sp.box;
      it.box={x0:it.x+b.x0,y0:it.y+b.y0,x1:it.x+b.x1,y1:it.y+b.y1};
      it.cx=(it.box.x0+it.box.x1)/2;it.cy=(it.box.y0+it.box.y1)/2;
      this.compose(it);
    }
    compose(it) {
      const sp=it.sp,R=sp.R,c=it.visibleCanvas;
      if(c.width!==sp.canvas.width)c.width=sp.canvas.width;
      if(c.height!==sp.canvas.height)c.height=sp.canvas.height;
      const g=c.getContext('2d',{willReadFrequently:true});
      g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
      g.save();g.setTransform(R,0,0,R,-(it.x+sp.ox)*R,-(it.y+sp.oy)*R);
      const o=it.opening;g.beginPath();g.rect(o.x0,o.y0,o.x1-o.x0,o.y1-o.y0);g.clip();
      g.globalAlpha=it.reveal;g.drawImage(sp.canvas,it.x+sp.ox,it.y+sp.oy,sp.lw,sp.lh);g.globalAlpha=1;
      g.globalCompositeOperation='destination-out';
      g.drawImage(this.scene.bonusCover,0,0,J.W,J.H);
      g.restore();
      it.visibleMask=null;
    }
    hit(x,y,tol=0) {
      const it=this.current;
      if(!it)return null;
      const t=Math.min(tol,24),o=it.opening,b=it.box;
      // Toleransi sentuhan tidak boleh menjangkau menembus batas semak.
      if(x<o.x0||x>o.x1||y<o.y0||y>o.y1||x<b.x0-t||x>b.x1+t||y<b.y0-t||y>b.y1+t)return null;
      const R=it.sp.R;
      const cx=Math.round(x*R),cy=Math.round(y*R);
      if(cx>=0&&cy>=0&&cx<this.scene.bonusCover.width&&cy<this.scene.bonusCover.height &&
        this.scene.bonusCover.getContext('2d').getImageData(cx,cy,1,1).data[3]>100)return null;
      if(!it.visibleMask)it.visibleMask=it.visibleCanvas.getContext('2d').getImageData(0,0,it.visibleCanvas.width,it.visibleCanvas.height);
      const visible=Object.assign({},it.sp,{mask:it.visibleMask});
      return A.spriteHit(visible,x-it.x,y-it.y,t) ? it : null;
    }
    capture() {
      const it=this.current;this.current=null;this.nextAt=this.clock+CFG.bonusGapSec+this.rng.range(-1,1);return it;
    }
    render(ctx) {
      const it=this.current;if(!it)return;
      ctx.drawImage(it.visibleCanvas,it.x+it.sp.ox,it.y+it.sp.oy,it.sp.lw,it.sp.lh);
    }
  }
  J.Bonus=Bonus;
})();
