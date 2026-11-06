/* Pose satwa berdasarkan anatomi: kepala, tungkai, ekor dan sayap digambar ulang.
   Tidak merentangkan atau memutar seluruh gambar untuk menyamarkan pose yang sama. */
(function () {
  'use strict';
  const J=window.JSMT,A=J.Art,TAU=Math.PI*2,baseSprite=A.animalSprite;
  const part=(g,p,c,ol,o)=>{g.lineWidth=ol*2;g.strokeStyle=o;g.stroke(p);g.fillStyle=c;g.fill(p);};
  const ell=(x,y,rx,ry,a=0)=>{const p=new Path2D();p.ellipse(x,y,rx,ry,a,0,TAU);return p;};
  const line=(g,d,w,c,ol,o)=>{const p=new Path2D(d);g.strokeStyle=o;g.lineWidth=w+ol*2;g.stroke(p);g.strokeStyle=c;g.lineWidth=w;g.stroke(p);};
  const eye=(g,x,y,c='#f0cf72',r=3)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='#131810';g.beginPath();g.arc(x+.4,y+.3,r*.48,0,TAU);g.fill();};
  function faceInfo(x,y,a,ex,ey,r){const c=Math.cos(a),s=Math.sin(a);return {eyes:[{x:x+ex*c-ey*s,y:y+ex*s+ey*c}],head:{x,y,r}};}
  function ungulate(g,type,pose,ol) {
    const small=type==='kancil',o='#49301c',fur=small?'#bb823c':'#b5622d',belly='#edc990';
    const stride=pose==='walk'?17:0,hy=pose==='graze'?-29:pose==='alert'?-139:-113;
    const hx=pose==='graze'?83:73,angle=pose==='graze'?.96:pose==='alert'?-.16:0;
    for(const [x,s] of [[-46,1],[-30,-1],[39,-1],[54,1]])line(g,`M ${x} -48 L ${x+stride*s*.5} -23 L ${x+stride*s} -3`,small?4.7:7,fur,ol*.65,o);
    part(g,new Path2D('M -61 -66 Q -80 -70 -76 -56 L -61 -50 Z'),fur,ol,o);
    const body=ell(-5,-63,67,31,-.04);part(g,body,fur,ol,o);
    g.save();g.clip(body);g.fillStyle=belly;g.fill(ell(-1,-42,55,9));g.restore();
    line(g,`M 42 -68 Q 57 ${hy+34} ${hx} ${hy+10}`,small?22:26,fur,ol,o);
    g.save();g.translate(hx,hy);g.rotate(angle);
    for(const [x,a] of [[-7,-.5],[12,.3]])part(g,ell(x,-22,small?7:8,small?17:15,a),fur,ol*.8,o);
    if(!small){line(g,'M -5 -27 L -9 -45 L -3 -53',3,'#e9d8b1',ol*.5,o);line(g,'M 7 -28 L 8 -47 L 16 -53',3,'#e9d8b1',ol*.5,o);}
    part(g,new Path2D('M -14 -13 Q 6 -25 26 -5 L 40 13 Q 34 22 20 14 L -10 10 Z'),fur,ol,o);
    g.fillStyle='#241c12';g.fill(ell(38,13,3.6,3));eye(g,10,-6,'#251e12',3.8);g.fillStyle='#fff3d4';g.fill(ell(9,-7,1.1,1.1));
    g.strokeStyle=belly;g.lineWidth=3;g.beginPath();g.moveTo(-7,10);g.lineTo(-6,24);g.lineTo(3,13);g.stroke();g.restore();
    return faceInfo(hx,hy,angle,10,-6,22);
  }
  const coats={linsang:['#d9c591','#44321e'],musang:['#a88c59','#3b342c'],garangan:['#bf8b42','#70512f'],binturong:['#35474a','#101c22']};
  function carnivore(g,type,pose,ol){
    const [fur,mark]=coats[type],o=type==='binturong'?'#101c22':'#44311e';
    const low=pose==='crouch'||pose==='rest',by=low?-28:-48,hy=pose==='sniff'?-22:low?-38:-71,hx=78;
    const bodyW=type==='linsang'?77:68,tail=type==='binturong'?'M -54 -34 C -104 -22 -117 34 -154 23 Q -173 18 -158 -4':`M -57 ${by+6} Q -113 ${by+29} -166 ${by+13}`;
    line(g,tail,type==='binturong'?18:12,fur,ol,o);
    if(type==='linsang'){g.save();g.strokeStyle=mark;g.lineWidth=12;g.setLineDash([7,10]);g.stroke(new Path2D(tail));g.restore();}
    for(const [x,sgn] of [[-45,1],[43,-1]]){const step=pose==='walk'?sgn*17:low?sgn*8:0;line(g,`M ${x} ${by+10} Q ${x+step} -18 ${x+step+5} -3`,low?9:11,fur,ol,o);}
    const body=ell(-7,by,bodyW,low?22:27,-.05);part(g,body,fur,ol,o);
    g.save();g.clip(body);
    if(type==='linsang'){g.fillStyle=mark;for(let i=0;i<19;i++)g.fill(ell(-65+i%10*14,by-9+Math.floor(i/10)*18,5.5,4,.2));}
    else if(type==='musang'){g.strokeStyle='#6e5637';g.lineWidth=3;for(const y of [-13,-3,8]){g.beginPath();g.moveTo(-60,by+y);g.quadraticCurveTo(-7,by+y-6,48,by+y-4);g.stroke();}}
    else {g.strokeStyle=type==='binturong'?'#69817f':'#d6ac6a';g.lineWidth=1.4;for(let i=0;i<30;i++){g.beginPath();g.moveTo(-62+i*4.3,by-15);g.lineTo(-68+i*4.3,by+10);g.stroke();}}g.restore();
    line(g,`M 45 ${by-5} L ${hx-7} ${hy+10}`,22,fur,ol,o);
    g.save();g.translate(hx,hy);g.rotate(pose==='sniff'?.24:0);
    part(g,ell(0,0,type==='garangan'?20:25,20),fur,ol,o);
    for(const x of [-15,14])part(g,ell(x,-20,type==='garangan'?5:7,9,x/90),fur,ol*.7,o);
    if(type==='musang')part(g,new Path2D('M -23 -6 Q 0 -22 21 -7 L 19 7 L -21 6 Z'),mark,ol*.3,o);
    if(type==='linsang'){g.strokeStyle=mark;g.lineWidth=4;g.beginPath();g.moveTo(-14,-16);g.lineTo(-6,2);g.stroke();}
    part(g,ell(type==='garangan'?24:20,11,type==='garangan'?24:18,10),'#d6bd8a',ol*.6,o);
    eye(g,7,-5,'#e6c46d',3);g.fillStyle='#171b15';g.fill(ell(type==='garangan'?46:36,10,4,3));
    g.strokeStyle='#e6d9b1';g.lineWidth=.9;for(const y of [9,14]){g.beginPath();g.moveTo(25,y);g.lineTo(49,y-5);g.stroke();}g.restore();
    return faceInfo(hx,hy,pose==='sniff'?.24:0,7,-5,25);
  }
  function armored(g,type,pose,ol){
    const o='#372b20',curl=pose==='curl'||pose==='defend',pangolin=type==='trenggiling';
    if(pangolin&&!curl)part(g,new Path2D('M -43 -44 Q -96 -34 -145 -3 Q -81 11 -37 -13 Z'),'#a28b5e',ol,o);
    if(!curl||!pangolin)for(const x of [-29,30])line(g,`M ${x} -22 L ${x+7} -2`,9,'#6f6249',ol,o);
    const body=ell(-5,curl?-37:-29,curl?43:pangolin?57:44,curl?36:28,-.1);
    if(!pangolin){for(let i=0;i<32;i++){const a=-Math.PI+.14+i/31*(Math.PI-.28),x=-5+Math.cos(a)*31,y=-30+Math.sin(a)*22;line(g,`M ${x} ${y} L ${x+Math.cos(a)*35} ${y+Math.sin(a)*35}`,2.2,i%2?'#eadfbe':'#342c22',ol*.4,o);}}
    part(g,body,pangolin?'#aa956a':'#5f4c3a',ol,o);
    if(pangolin){g.save();g.clip(body);g.strokeStyle='#645437';g.lineWidth=1.3;for(let row=0;row<5;row++)for(let col=0;col<9;col++){const x=-67+col*16+(row%2)*8,y=-77+row*15;const q=new Path2D(`M ${x} ${y} Q ${x+8} ${y+20} ${x+16} ${y}`);g.fillStyle=(row+col)%2?'#c1ad7b':'#9b865d';g.fill(q);g.stroke(q);}g.restore();}
    if(curl){if(pangolin){g.strokeStyle='#6d5a3b';g.lineWidth=3;g.beginPath();g.arc(2,-32,20,.3,Math.PI*1.8);g.stroke();}return {eyes:[],head:null};}
    const hx=pangolin?62:44,hy=-17;
    part(g,new Path2D(`M ${hx-17} -38 Q ${hx+2} -35 ${hx+30} -10 Q ${hx+26} -5 ${hx+9} -10 L ${hx-14} -13 Z`),pangolin?'#b19a70':'#7c6350',ol,o);
    eye(g,hx+1,-24,'#251c13',2.6);g.fillStyle='#201b13';g.fill(ell(hx+29,-10,3,2.4));
    return {eyes:[{x:hx+1,y:-24}],head:{x:hx+4,y:-22,r:19}};
  }
  function primate(g,type,pose,ol){
    const fur=type==='lutung'?'#292c30':'#91937d',o='#182724',skin=type==='lutung'?'#616462':'#c3a98b',reach=pose==='reach';
    line(g,reach?'M -14 -6 Q -36 72 -74 107':'M -40 -49 Q -95 -91 -106 -28',7,fur,ol,o);
    if(reach){for(const s of [-1,1]){line(g,`M ${s*12} -24 L ${s*25} -3`,9,fur,ol,o);part(g,ell(s*26,-2,12,6),fur,ol,o);}}
    else for(const [x,s] of [[-37,-1],[-22,1],[21,-1],[37,1]])line(g,`M ${x} -45 Q ${x+s*12} -24 ${x+s*17} -2`,8.5,fur,ol,o);
    part(g,reach?ell(-3,-49,25,42,-.1):ell(-5,-51,43,24,-.04),fur,ol,o);
    const hx=reach?6:48,hy=reach?-106:-75;
    if(reach){line(g,'M 14 -76 L 35 -123 L 59 -177',8,fur,ol,o);part(g,ell(61,-180,7,9),skin,ol*.6,o);line(g,'M -17 -72 Q -43 -87 -35 -111',8,fur,ol,o);}
    for(const x of [hx-20,hx+20])part(g,ell(x,hy,7,9),skin,ol*.7,o);
    if(type==='lutung')part(g,new Path2D(`M ${hx-12} ${hy-18} L ${hx} ${hy-38} L ${hx+12} ${hy-18} Z`),fur,ol,o);
    part(g,ell(hx,hy,22,22),fur,ol,o);part(g,ell(hx+2,hy+4,15,15),skin,ol*.5,o);
    for(const ex of [-6,8])eye(g,hx+ex,hy-1,'#decd9a',2.7);
    g.strokeStyle=o;g.lineWidth=1.3;g.beginPath();g.moveTo(hx-4,hy+13);g.quadraticCurveTo(hx+2,hy+16,hx+8,hy+12);g.stroke();
    return {eyes:[{x:hx-6,y:hy-1},{x:hx+8,y:hy-1}],head:{x:hx,y:hy,r:22}};
  }
  function squirrel(g,pose,ol){
    const o='#543a23',fur='#be8c48',reach=pose==='reach',forage=pose==='forage';
    const tail=new Path2D(pose==='walk'?'M -24 -27 Q -83 -76 -128 -38 Q -143 -11 -110 -8 L -23 -8 Z':'M -22 -9 C -91 -4 -126 -74 -91 -111 C -58 -141 -39 -92 -72 -76 Q -83 -53 -18 -36 Z');
    part(g,tail,'#9e723e',ol,o);g.save();g.clip(tail);g.strokeStyle='#d8b477';g.lineWidth=1.3;for(let i=0;i<22;i++){g.beginPath();g.moveTo(-126+i*4,-126);g.lineTo(-100+i*4,-4);g.stroke();}g.restore();
    const by=forage?-27:-42;part(g,ell(-4,by,reach?24:35,reach?34:23,-.15),fur,ol,o);
    g.strokeStyle='#e9dbab';g.lineWidth=5;g.beginPath();g.moveTo(-29,by-13);g.quadraticCurveTo(-9,by-12,13,by+3);g.stroke();
    line(g,`M -10 ${by+13} L -4 -4 L 16 -3`,7,fur,ol,o);
    const hx=forage?43:27,hy=forage?-23:-77;
    line(g,reach?'M 10 -57 L 43 -126':`M 12 ${by-2} L ${hx+14} ${hy+13}`,6,fur,ol,o);
    part(g,ell(hx,hy,22,20),fur,ol,o);for(const x of [hx-9,hx+10])part(g,ell(x,hy-22,6,10),fur,ol*.7,o);
    part(g,ell(hx+21,hy+10,16,9),'#d4ba82',ol*.5,o);eye(g,hx+9,hy-4,'#251c12',3.2);g.fillStyle='#251c12';g.fill(ell(hx+36,hy+10,3,2.5));
    return {eyes:[{x:hx+9,y:hy-4}],head:{x:hx+7,y:hy,r:23}};
  }
  function bird(g,type,pose,ol){
    const eagle=type==='elang',o='#332416',wing=eagle?'#6f4827':'#aa5129',spread=pose==='wings';
    const body=ell(0,eagle?-56:-39,eagle?23:29,eagle?38:21,eagle?0:.1);
    part(g,new Path2D(eagle?'M -9 -24 L -16 23 L 17 23 L 10 -24 Z':'M -17 -40 Q -62 -104 -87 -53 L -54 -26 Z'),eagle?'#745332':'#244b3b',ol,o);
    if(spread){for(const sd of [-1,1]){g.save();g.scale(sd,1);part(g,new Path2D('M 11 -70 Q 76 -129 135 -64 L 145 -31 L 119 -45 L 123 -20 L 98 -38 L 99 -14 L 78 -36 L 76 -16 L 51 -37 L 45 -22 L 21 -40 Z'),wing,ol,o);g.strokeStyle=eagle?'#c2a47b':'#df9a4e';g.lineWidth=2;for(let i=0;i<6;i++){g.beginPath();g.moveTo(33+i*13,-69-i*2);g.lineTo(46+i*13,-42+i*2);g.stroke();}g.restore();}}
    part(g,body,eagle?'#e7d4ae':'#32251b',ol,o);
    if(!spread)part(g,ell(-6,eagle?-58:-40,eagle?13:22,eagle?33:14,.15),wing,ol,o);
    g.strokeStyle=eagle?'#9b733f':'#c0803c';g.lineWidth=2;for(let i=0;i<8;i++){g.beginPath();g.moveTo(-14+i*4,eagle?-71:-39);g.lineTo(-13+i*4,eagle?-61:-31);g.stroke();}
    for(const x of [-7,10]){line(g,`M ${x} -15 L ${x+1} -1 L ${x+10} 0`,3,eagle?'#d1b24b':'#9d895d',ol*.5,o);}
    const hx=eagle?(pose==='lookback'?-10:9):(pose==='forage'?43:24),hy=eagle?-103:pose==='forage'?-16:-81;
    if(!eagle)line(g,`M 13 -51 Q 23 ${hy+7} ${hx} ${hy+6}`,13,'#d1943d',ol*.7,o);
    g.save();g.translate(hx,hy);if(pose==='lookback')g.scale(-1,1);
    if(eagle){line(g,'M -3 -10 Q -11 -30 -23 -42',4,'#292319',ol*.5,o);}
    part(g,ell(0,0,eagle?15:10,eagle?14:10),eagle?'#9f6b36':'#c8582f',ol,o);
    if(!eagle)part(g,new Path2D('M -8 -7 Q -7 -20 -2 -11 Q 1 -24 5 -11 Q 11 -20 10 -5 Z'),'#d73624',ol*.5,o);
    part(g,new Path2D(eagle?'M 10 -4 Q 29 -2 17 11 L 13 2 Z':'M 8 -1 L 22 7 L 9 9 Z'),eagle?'#51432f':'#d9bc77',ol*.5,o);
    eye(g,eagle?4:3,-3,eagle?'#f0cf56':'#e8a84a',eagle?3.5:2.6);g.restore();
    return {eyes:[{x:hx+(pose==='lookback'?-4:4),y:hy-3}],head:{x:hx,y:hy,r:eagle?17:12}};
  }
  A.DECOY_POSES={
    kijang:['stand','walk','graze','alert'],kancil:['stand','walk','graze','alert'],
    linsang:['stand','walk','sniff','crouch'],musang:['stand','walk','sniff','crouch'],garangan:['stand','walk','sniff','crouch'],binturong:['stand','walk','sniff','rest'],
    kuwuk:['walk','crouch','sniff','sit','curl'],landak:['stand','forage','defend'],trenggiling:['stand','forage','curl'],
    lutung:['sit','walk','reach'],monyet:['sit','walk','reach'],bajing:['sit','walk','forage','reach'],
    ayam:['stand','forage','wings'],elang:['perch','wings','lookback']
  };
  A.decoyHabitats=function(type,pose){
    if(type==='elang')return ['branch'];
    if((type==='lutung'||type==='monyet')&&pose==='reach')return ['branch'];
    if(['lutung','monyet','bajing','musang','binturong'].includes(type)&&!['walk','forage','sniff'].includes(pose))return ['ground','branch'];
    return ['ground'];
  };
  A.animalSprite=function(type,o){
    const pose=o.pose||(A.DECOY_POSES[type]||['stand'])[0];
    if(type==='kuwuk')return baseSprite(type,Object.assign({},o,{pose}));
    const original=(A.DECOY_POSES[type]||['stand'])[0];
    if(pose===original){const sp=baseSprite(type,o);sp.pose=pose;return sp;}
    let draw,bounds;
    if(type==='kijang'||type==='kancil'){draw=g=>ungulate(g,type,pose,ol);bounds=[-112,-202,152,18];}
    else if(coats[type]){draw=g=>carnivore(g,type,pose,ol);bounds=[-202,-137,156,45];}
    else if(type==='landak'||type==='trenggiling'){draw=g=>armored(g,type,pose,ol);bounds=[-162,-125,113,20];}
    else if(type==='lutung'||type==='monyet'){draw=g=>primate(g,type,pose,ol);bounds=[-126,-218,115,132];}
    else if(type==='bajing'){draw=g=>squirrel(g,pose,ol);bounds=[-156,-153,107,18];}
    else {draw=g=>bird(g,type,pose,ol);bounds=[-160,-164,160,35];}
    const ol=J.clamp(2/o.scale,2,5);
    const sp=A.makeSprite(o,bounds,draw);sp.type=type;sp.pose=pose;return sp;
  };
})();
