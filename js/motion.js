/* Gerak pengecoh dan angin. Gambar dan area klik memakai mask vegetasi yang sama. */
(function () {
  'use strict';
  const J=window.JSMT,A=J.Art,TAU=Math.PI*2;
  const intersects=(a,b)=>J.overlapArea(a,b)>0;
  class Motion {
    constructor(scene) {
      this.scene=scene;this.clock=0;this.frame=-1;
      this.items=scene.items.filter(it=>it.moving);
      this.update(0);
    }
    update(dt) {
      this.clock+=dt;
      const frame=Math.floor(this.clock*12);
      if(frame===this.frame)return;
      this.frame=frame;
      for(const it of this.items){
        const m=it.motion,phase=this.clock*m.speed+m.phase;
        const walk=m.kind==='walk',fly=m.kind==='fly';
        const flip=(walk||fly)?Math.cos(phase)<0:m.flip;
        it.x=m.x+(walk||fly?Math.sin(phase)*m.amplitude:0);
        it.y=m.y+(fly?Math.sin(phase*1.7)*12:0);
        const n=Math.floor(this.clock*(fly?2.3:walk?1.4:.28)*12)%12;
        it.sp=m.frames[flip?1:0][n];
        const b=it.sp.box;it.box={x0:it.x+b.x0,y0:it.y+b.y0,x1:it.x+b.x1,y1:it.y+b.y1};
        it.cx=(it.box.x0+it.box.x1)/2;it.cy=(it.box.y0+it.box.y1)/2;
        it.eyes=it.sp.eyes.map(e=>({x:it.x+e.x,y:it.y+e.y}));
        this.compose(it);
      }
    }
    compose(it) {
      const sp=it.sp,m=it.motion,R=sp.R,c=it.visibleCanvas;
      if(c.width!==sp.canvas.width)c.width=sp.canvas.width;
      if(c.height!==sp.canvas.height)c.height=sp.canvas.height;
      const g=c.getContext('2d',{willReadFrequently:true});
      g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
      g.drawImage(sp.canvas,0,0);
      g.globalCompositeOperation='destination-out';
      g.drawImage(m.cover,(m.coverBox.x0-it.x-sp.ox)*R,(m.coverBox.y0-it.y-sp.oy)*R);
      g.globalCompositeOperation='source-over';
      it.visibleMask=g.getImageData(0,0,c.width,c.height);it.vmask=null;
      // Tidak ada mata mengambang di lokasi sprite sebelumnya pada mode IR.
      it.eyesVis=it.eyes.filter(e=>this.visibleAt(it,e.x,e.y));
    }
    visibleAt(it,x,y) {
      const sp=it.sp,m=it.visibleMask,px=Math.round((x-it.x-sp.ox)*sp.R),py=Math.round((y-it.y-sp.oy)*sp.R);
      return px>=0&&py>=0&&px<m.width&&py<m.height&&m.data[(py*m.width+px)*4+3]>100;
    }
    hit(x,y,tol=0) {
      for(const it of this.items.slice().reverse()){
        const b=it.box,sp=it.sp,m=it.motion,t=Math.min(tol,24);
        // Metadata batas sprite disampel tiap dua piksel; mask tetap menentukan hit akhir.
        const edge=t+2/sp.R;
        if(x<b.x0-edge||x>b.x1+edge||y<b.y0-edge||y>b.y1+edge)continue;
        const cx=Math.round((x-m.coverBox.x0)*sp.R),cy=Math.round((y-m.coverBox.y0)*sp.R),cover=m.coverMask;
        if(cx>=0&&cy>=0&&cx<cover.width&&cy<cover.height&&cover.data[(cy*cover.width+cx)*4+3]>100&&!this.visibleAt(it,x,y))continue;
        if(A.spriteHit(Object.assign({},sp,{mask:it.visibleMask}),x-it.x,y-it.y,t))return it;
      }
      return null;
    }
    cloudX(cloud) {
      const span=J.W+cloud.width;
      return ((cloud.x+this.clock*cloud.speed+cloud.width)%span+span)%span-cloud.width;
    }
    renderSky(ctx) {
      const sc=this.scene;ctx.drawImage(sc.sky,0,0,J.W,J.H);
      ctx.save();ctx.globalAlpha=sc.night?.14:.48;
      for(const c of sc.clouds){const x=this.cloudX(c);ctx.drawImage(c.canvas,x,c.y,c.width,c.height);}
      ctx.restore();
    }
    render(ctx) {
      for(const it of this.items)ctx.drawImage(it.visibleCanvas,it.x+it.sp.ox,it.y+it.sp.oy,it.sp.lw,it.sp.lh);
      for(const w of this.scene.wind){
        const a=Math.sin(this.clock*w.speed+w.phase)*.045;
        ctx.save();ctx.translate(w.x,w.y);ctx.rotate(a);ctx.drawImage(w.canvas,-w.size,-w.size,w.size*2,w.size*2);ctx.restore();
      }
    }
  }
  Motion.prepare=function(sc,objs,p,drawObj,trees) {
    const r=J.rng(sc.seed^0x71bc),R=sc.R;
    const cr=J.rng(sc.seed^0x8c10);
    sc.clouds=Array.from({length:4},(_,i)=>{
      const width=cr.range(460,720),height=cr.range(100,160),canvas=J.makeCanvas(width*R,height*R),g=canvas.getContext('2d');
      g.setTransform(R,0,0,R,0,0);
      const shade=sc.mode==='senja'?'255,226,183':'250,255,245';
      for(let j=0;j<6;j++){
        const x=width*(.16+j*.13),y=height*cr.range(.42,.64),rx=width*cr.range(.16,.21),ry=height*cr.range(.26,.44);
        g.save();g.translate(x,y);g.scale(1,ry/rx);
        const local=g.createRadialGradient(0,0,rx*.16,0,0,rx);local.addColorStop(0,'rgba('+shade+',.85)');local.addColorStop(1,'rgba('+shade+',0)');
        g.fillStyle=local;g.beginPath();g.arc(0,0,rx,0,TAU);g.fill();g.restore();
      }
      return {canvas,width,height,x:i*J.W/4-cr.range(100,300),y:cr.range(180,390),speed:cr.range(10,18)};
    });
    for(const it of sc.items.filter(x=>x.moving)){
      const m=it.motion;
      m.x=it.x;m.y=it.y;m.phase=0;m.speed=m.kind==='fly'?.34:m.kind==='walk'?.60:.28;
      m.flip=it.renderOptions.flip;m.frames=[[],[]];
      for(const flip of [false,true])for(let i=0;i<12;i++){
        const sp=A.animalSprite(it.type,Object.assign({},it.renderOptions,{flip,gait:i/12*TAU}));
        if(sc.night)A.toIR(sp.canvas,{level:.85,gain:1.12,noise:0});
        m.frames[flip?1:0].push(sp);
      }
      const area=it.motionArea;
      const box={x0:Math.floor(area.x0-24),y0:Math.floor(area.y0-24),x1:Math.ceil(area.x1+24),y1:Math.ceil(area.y1+24)};
      const c=J.makeCanvas((box.x1-box.x0)*R,(box.y1-box.y0)*R),g=c.getContext('2d',{willReadFrequently:true});
      g.setTransform(R,0,0,R,-box.x0*R,-box.y0*R);
      for(const o of objs)if(o.z>it.y&&!o.it?.moving&&intersects(o.box,box))drawObj(g,o,p);
      m.cover=c;m.coverBox=box;m.coverMask=g.getImageData(0,0,c.width,c.height);
      it.visibleCanvas=J.makeCanvas(it.sp.canvas.width,it.sp.canvas.height);
    }
    sc.wind=[];
    const forbidden=sc.items.map(it=>it.motionArea||it.box);
    for(const tree of trees)for(let k=0;k<12;k++){
      const size=r.range(34,50),x=J.clamp(tree.x+r.range(-105,105),size,J.W-size),y=r.range(210,530);
      const box={x0:x-size-8,y0:y-size-8,x1:x+size+8,y1:y+size+8};
      if(forbidden.some(b=>intersects(b,box)))continue;
      const canvas=J.makeCanvas(size*2*R,size*2*R),g=canvas.getContext('2d');
      g.setTransform(R,0,0,R,size*R,size*R);
      A.Forest.leafSpray(g,J.rng(r.seed()),0,0,size*.72,p,-Math.PI/2);
      if(sc.night)A.toIR(canvas,{level:.8,foliage:.72,gain:.95,noise:0});
      sc.wind.push({canvas,size,x,y,phase:r.range(0,TAU),speed:r.range(.8,1.3)});break;
    }
    sc.motion=new Motion(sc);
  };
  J.Motion=Motion;
})();
