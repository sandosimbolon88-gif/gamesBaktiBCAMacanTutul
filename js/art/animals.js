/* Satwa pengecoh bergaya kartun. Ukuran relatif dibuat mendekati aslinya
   (satuan lokal ≈ sama dengan satuan macan tutul). */
(function () {
  'use strict';
  const J = window.JSMT;
  const A = J.Art;
  const TAU = Math.PI * 2;

  const AP = {
    kijang: { body: '#b5622d', dark: '#8a4519', belly: '#f0d6b0', outline: '#3a1d0c', hoof: '#2a1a10', antler: '#eadcbf', eye: '#1a0f08', face: '#5a2a10' },
    ayam: { body: '#7f2616', wing: '#b5481f', hackle: '#e88a2a', hackleDark: '#c4621a', tail: '#183d2e', tailHi: '#3a7a5c', comb: '#e0261d', face: '#d33a26', beak: '#cbbb8c', leg: '#8a7a66', outline: '#2a120a', breast: '#211b16', lappet: '#f4f1e8' },
    landak: { body: '#3a2e28', face: '#64514a', quillW: '#f2ede2', quillB: '#1c1714', outline: '#15100d', nose: '#2a1f1a' },
    lutung: { fur: '#26262c', furHi: '#41414b', face: '#555460', outline: '#0b0b0e', eye: '#d4bf84' },
    elang: { back: '#6b4322', wing: '#583519', chest: '#efe0c4', streak: '#8a5a2e', head: '#7a4c25', face: '#a8794a', crest: '#22160b', beak: '#2e2a28', cere: '#e6c23a', eye: '#f0c419', feet: '#e6c23a', outline: '#24160a', band: '#3a2412' }
  };

  function part(g, path, fill, ol, olc) {
    g.lineWidth = ol * 2; g.strokeStyle = olc; g.stroke(path);
    g.fillStyle = fill; g.fill(path);
  }
  function ell(x, y, rx, ry, rot) { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot || 0, 0, TAU); return p; }
  function line(g, d, w, col, ol, olc) {
    const p = new Path2D(d);
    g.lineWidth = w + ol * 2; g.strokeStyle = olc; g.stroke(p);
    g.lineWidth = w; g.strokeStyle = col; g.stroke(p);
  }

  const DRAW = {
    kijang: {
      bounds: [-92, -150, 120, 10],
      draw(g, ol) {
        const p = AP.kijang, o = p.outline;
        g.fillStyle = 'rgba(20,32,10,0.22)'; g.beginPath(); g.ellipse(0, 0, 80, 7, 0, 0, TAU); g.fill();
        line(g, 'M 40 -42 L 44 -5', 8, p.dark, ol, o);
        line(g, 'M -42 -44 Q -52 -28 -47 -18 L -43 -5', 9, p.dark, ol, o);
        part(g, ell(44, -4, 5, 4), p.hoof, ol * 0.6, o);
        part(g, ell(-43, -4, 5, 4), p.hoof, ol * 0.6, o);
        part(g, new Path2D('M -60 -66 Q -76 -70 -74 -54 Q -66 -56 -60 -60 Z'), p.body, ol, o);
        const body = new Path2D('M -62 -70 C -24 -84 30 -82 54 -74 C 70 -68 70 -46 54 -40 C 22 -34 -28 -34 -56 -40 C -72 -46 -76 -64 -62 -70 Z');
        part(g, body, p.body, ol, o);
        g.save(); g.clip(body);
        g.fillStyle = p.belly; g.beginPath(); g.ellipse(0, -34, 62, 8, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,220,180,0.18)'; g.beginPath(); g.ellipse(-4, -76, 50, 6, 0, 0, TAU); g.fill();
        g.restore();
        part(g, ell(-42, -56, 18, 20, -0.2), p.body, ol, o);
        line(g, 'M 50 -46 L 54 -5', 9, p.body, ol, o);
        line(g, 'M -38 -50 Q -48 -30 -44 -20 L -38 -5', 10, p.body, ol, o);
        part(g, ell(54, -4, 5.5, 4), p.hoof, ol * 0.6, o);
        part(g, ell(-38, -4, 5.5, 4), p.hoof, ol * 0.6, o);
        part(g, new Path2D('M 42 -76 C 54 -98 66 -112 80 -110 L 88 -94 C 78 -82 66 -66 56 -58 Z'), p.body, ol, o);
        part(g, ell(74, -124, 5.5, 11, -0.5), p.body, ol, o);
        line(g, 'M 78 -121 L 74 -136 L 79 -142', 3.2, p.antler, ol * 0.6, o);
        line(g, 'M 83 -120 L 81 -137 L 87 -143', 3.4, p.antler, ol * 0.6, o);
        part(g, new Path2D('M 72 -118 C 84 -126 98 -118 108 -104 C 112 -98 106 -93 100 -95 C 92 -97 80 -96 74 -100 C 68 -104 66 -114 72 -118 Z'), p.body, ol, o);
        g.strokeStyle = p.face; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(82, -119); g.lineTo(90, -108); g.moveTo(78, -119); g.lineTo(86, -106); g.stroke();
        g.fillStyle = p.eye; g.beginPath(); g.arc(88, -109, 2.7, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(87.2, -110, 0.9, 0, TAU); g.fill();
        g.fillStyle = p.hoof; g.beginPath(); g.arc(106, -99, 2.6, 0, TAU); g.fill();
        g.fillStyle = p.belly; g.beginPath(); g.ellipse(98, -95, 6, 2, 0.2, 0, TAU); g.fill();
        return { eyes: [{ x: 88, y: -109 }], head: { x: 90, y: -108, r: 18 } };
      }
    },
    ayam: {
      bounds: [-78, -84, 36, 6],
      draw(g, ol) {
        const p = AP.ayam, o = p.outline;
        g.fillStyle = 'rgba(20,32,10,0.22)'; g.beginPath(); g.ellipse(-4, 0, 34, 5, 0, 0, TAU); g.fill();
        g.strokeStyle = p.leg; g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(-3, -24); g.lineTo(-5, -2); g.lineTo(3, -1); g.moveTo(-5, -2); g.lineTo(-11, -1);
        g.moveTo(7, -24); g.lineTo(9, -2); g.lineTo(17, -1); g.moveTo(9, -2); g.lineTo(3, -1);
        g.stroke();
        for (const d of ['M -18 -44 C -40 -88 -70 -72 -66 -28', 'M -16 -40 C -34 -76 -58 -64 -56 -24', 'M -14 -38 C -28 -64 -46 -56 -46 -24']) {
          line(g, d, 6, p.tail, ol * 0.8, o);
          g.strokeStyle = p.tailHi; g.lineWidth = 1.6; g.stroke(new Path2D(d));
        }
        const body = ell(-2, -36, 25, 17, 0.15);
        part(g, body, p.body, ol, o);
        g.save(); g.clip(body); g.fillStyle = p.breast; g.beginPath(); g.ellipse(12, -28, 13, 12, 0, 0, TAU); g.fill(); g.restore();
        part(g, new Path2D('M -16 -42 C -4 -51 12 -45 14 -36 C 6 -28 -8 -26 -18 -32 Z'), p.wing, ol * 0.8, o);
        g.strokeStyle = 'rgba(40,10,0,0.45)'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(-12, -35); g.lineTo(6, -38); g.moveTo(-10, -31); g.lineTo(8, -33); g.stroke();
        part(g, new Path2D('M 3 -60 C 18 -63 25 -46 19 -31 C 10 -35 1 -42 -1 -50 Z'), p.hackle, ol * 0.8, o);
        g.strokeStyle = p.hackleDark; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(8, -56); g.lineTo(12, -38); g.moveTo(13, -57); g.lineTo(16, -40); g.stroke();
        part(g, ell(17, -61, 8.5, 8), p.face, ol * 0.8, o);
        part(g, new Path2D('M 10 -67 Q 11 -76 14 -69 Q 16 -79 19 -69 Q 22 -77 24 -66 Z'), p.comb, ol * 0.7, o);
        part(g, ell(22, -52, 3, 5), p.comb, ol * 0.6, o);
        g.fillStyle = p.lappet; g.beginPath(); g.ellipse(13, -58, 2.6, 2, 0, 0, TAU); g.fill();
        part(g, new Path2D('M 24 -63 L 31 -59 L 24 -56 Z'), p.beak, ol * 0.6, o);
        g.fillStyle = '#e98a20'; g.beginPath(); g.arc(19, -63, 2, 0, TAU); g.fill();
        g.fillStyle = '#111'; g.beginPath(); g.arc(19.4, -63, 1, 0, TAU); g.fill();
        return { eyes: [{ x: 19, y: -63 }], head: { x: 17, y: -61, r: 9 } };
      }
    },
    landak: {
      bounds: [-82, -84, 64, 8],
      draw(g, ol) {
        const p = AP.landak, o = p.outline;
        g.fillStyle = 'rgba(20,32,10,0.22)'; g.beginPath(); g.ellipse(0, 0, 54, 6, 0, 0, TAU); g.fill();
        const r = J.rng(31);
        const quills = [];
        for (let i = 0; i < 36; i++) {
          const a = -Math.PI + 0.1 + (i / 35) * (Math.PI - 0.5) + r.range(-0.05, 0.05);
          const bx = Math.cos(a) * 36, by = -22 + Math.sin(a) * 20;
          const L = 26 + 18 * Math.sin((i / 35) * Math.PI) * r.range(0.7, 1.1);
          const ta = a - 0.25 + r.range(-0.15, 0.15);
          quills.push([bx, by, bx + Math.cos(ta) * L, by + Math.sin(ta) * L]);
        }
        for (const q of quills) {
          g.strokeStyle = o; g.lineWidth = 4.6; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); g.stroke();
          g.strokeStyle = p.quillB; g.lineWidth = 3; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); g.stroke();
          g.strokeStyle = p.quillW; g.lineWidth = 2.2; g.beginPath();
          g.moveTo(J.lerp(q[0], q[2], 0.42), J.lerp(q[1], q[3], 0.42)); g.lineTo(J.lerp(q[0], q[2], 0.72), J.lerp(q[1], q[3], 0.72));
          g.moveTo(J.lerp(q[0], q[2], 0.86), J.lerp(q[1], q[3], 0.86)); g.lineTo(q[2], q[3]); g.stroke();
        }
        part(g, ell(0, -20, 42, 21), p.body, ol, o);
        part(g, ell(-18, -3, 8, 5), p.body, ol * 0.7, o);
        part(g, ell(20, -3, 8, 5), p.body, ol * 0.7, o);
        part(g, ell(40, -15, 15, 11, 0.2), p.face, ol, o);
        part(g, ell(32, -23, 4, 3.5), p.face, ol * 0.6, o);
        g.fillStyle = p.nose; g.beginPath(); g.arc(54, -12, 3.2, 0, TAU); g.fill();
        g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(43, -19, 2.3, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(42.4, -19.8, 0.7, 0, TAU); g.fill();
        for (let i = 0; i < 10; i++) { // duri yang menutupi punggung
          const a = -Math.PI * 0.85 + i * 0.2;
          const bx = Math.cos(a) * 26, by = -24 + Math.sin(a) * 12;
          g.strokeStyle = p.quillB; g.lineWidth = 2.2; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - 16, by - 8); g.stroke();
          g.strokeStyle = p.quillW; g.lineWidth = 1.4; g.beginPath(); g.moveTo(bx - 9, by - 4.5); g.lineTo(bx - 16, by - 8); g.stroke();
        }
        return { eyes: [{ x: 43, y: -19 }], head: { x: 40, y: -15, r: 13 } };
      }
    },
    lutung: {
      bounds: [-42, -112, 42, 120],
      draw(g, ol) {
        const p = AP.lutung, o = p.outline;
        line(g, 'M -12 -8 C -18 30 -10 72 -16 112', 7, p.fur, ol, o);
        line(g, 'M -10 0 L -12 22', 6, p.fur, ol, o);
        line(g, 'M 10 0 L 12 22', 6, p.fur, ol, o);
        part(g, new Path2D('M -24 -2 C -31 -40 -18 -66 0 -68 C 18 -66 30 -40 23 -2 Z'), p.fur, ol, o);
        part(g, ell(-14, -7, 14, 9), p.fur, ol, o);
        part(g, ell(14, -7, 14, 9), p.fur, ol, o);
        line(g, 'M -18 -50 Q -27 -26 -12 -12', 7, p.fur, ol, o);
        line(g, 'M 18 -50 Q 27 -26 12 -12', 7, p.fur, ol, o);
        g.strokeStyle = p.furHi; g.lineWidth = 2;
        g.beginPath(); g.moveTo(-10, -56); g.quadraticCurveTo(-16, -40, -12, -24); g.stroke();
        part(g, new Path2D('M -8 -88 L 0 -106 L 8 -88 Z'), p.fur, ol, o);
        part(g, ell(0, -78, 15.5, 15), p.fur, ol, o);
        part(g, ell(0, -75, 9.5, 8.5), p.face, ol * 0.5, o);
        g.fillStyle = p.eye;
        for (const ex of [-3.6, 3.6]) { g.beginPath(); g.arc(ex, -77.5, 1.9, 0, TAU); g.fill(); }
        g.fillStyle = '#111';
        for (const ex of [-3.6, 3.6]) { g.beginPath(); g.arc(ex, -77.5, 0.9, 0, TAU); g.fill(); }
        g.strokeStyle = '#222'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(-2.5, -70.5); g.quadraticCurveTo(0, -69, 2.5, -70.5); g.stroke();
        return { eyes: [{ x: -3.6, y: -77.5 }, { x: 3.6, y: -77.5 }], head: { x: 0, y: -78, r: 15 } };
      }
    },
    elang: {
      bounds: [-36, -122, 34, 30],
      draw(g, ol) {
        const p = AP.elang, o = p.outline;
        const tail = new Path2D('M -7 -12 L -11 27 L 11 27 L 7 -12 Z');
        part(g, tail, p.back, ol, o);
        g.strokeStyle = p.band; g.lineWidth = 2.4;
        g.beginPath(); for (const y of [5, 13, 21]) { g.moveTo(-9, y); g.lineTo(9, y); } g.stroke();
        const body = new Path2D('M -18 -10 C -25 -40 -14 -66 2 -68 C 18 -66 25 -40 16 -10 C 8 -2 -10 -2 -18 -10 Z');
        part(g, body, p.chest, ol, o);
        g.save(); g.clip(body); g.fillStyle = p.streak;
        const r = J.rng(5);
        for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(r.range(-16, 16), r.range(-60, -8), 1.4, 3.4, 0, 0, TAU); g.fill(); }
        g.restore();
        part(g, new Path2D('M -18 -58 C -31 -40 -29 -10 -15 6 C -11 -20 -11 -44 -12 -58 Z'), p.wing, ol, o);
        part(g, new Path2D('M 5 -61 C 25 -53 29 -20 17 6 C 9 -10 3 -36 5 -61 Z'), p.wing, ol, o);
        g.strokeStyle = 'rgba(20,10,0,0.4)'; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(10, -40); g.lineTo(20, -28); g.moveTo(9, -28); g.lineTo(19, -14); g.stroke();
        line(g, 'M -6 -4 L -8 4', 3, p.feet, ol * 0.6, o);
        line(g, 'M 6 -4 L 8 4', 3, p.feet, ol * 0.6, o);
        // jambul panjang khas elang jawa (ujung putih)
        line(g, 'M 0 -84 C -4 -100 -10 -108 -15 -113', 4, p.crest, ol * 0.7, o);
        line(g, 'M 4 -86 C 2 -102 -2 -110 -7 -118', 4, p.crest, ol * 0.7, o);
        g.fillStyle = '#f4efe6';
        g.beginPath(); g.arc(-15, -113, 2.1, 0, TAU); g.arc(-7, -118, 2.1, 0, TAU); g.fill();
        part(g, ell(6, -74, 13.5, 13), p.head, ol, o);
        g.fillStyle = p.face; g.beginPath(); g.ellipse(10, -70, 7, 6, 0, 0, TAU); g.fill();
        part(g, new Path2D('M 16 -77 C 24 -77 27 -71 22 -66 L 16 -70 Z'), p.beak, ol * 0.6, o);
        g.fillStyle = p.cere; g.beginPath(); g.ellipse(16, -75, 2.6, 2.2, 0, 0, TAU); g.fill();
        g.fillStyle = p.eye; g.beginPath(); g.arc(11, -77, 3.1, 0, TAU); g.fill();
        g.fillStyle = '#111'; g.beginPath(); g.arc(11.6, -77, 1.5, 0, TAU); g.fill();
        g.strokeStyle = o; g.lineWidth = 1.6; g.beginPath(); g.moveTo(6, -81); g.lineTo(15, -80); g.stroke();
        return { eyes: [{ x: 11, y: -77 }], head: { x: 6, y: -74, r: 13 } };
      }
    }
  };

  Object.assign(DRAW, {
    binturong: {
      bounds: [-185, -116, 117, 35],
      draw(g, ol) {
        const o = '#101c22', fur = '#35474a';
        line(g, 'M -62 -45 C -118 -55 -127 18 -161 18 Q -181 18 -167 -4', 19, fur, ol, o);
        for (const x of [-54, 45]) line(g, `M ${x} -34 L ${x+9} -4`, 15, '#26363b', ol, o);
        const body = ell(-8, -52, 72, 34, -.1);
        part(g, body, fur, ol, o);
        g.save(); g.clip(body); g.strokeStyle = '#688080'; g.lineWidth = 1.7;
        for (let i=0;i<36;i++) { const x=-65+i*3.8; g.beginPath(); g.moveTo(x,-75); g.lineTo(x-9,-46); g.stroke(); } g.restore();
        part(g, new Path2D('M 45 -70 L 46 -105 L 64 -89 L 84 -96 L 100 -64 Z'), fur, ol, o);
        line(g, 'M 49 -94 L 43 -110 M 84 -91 L 89 -108', 3, '#9eb1a5', 0, o);
        part(g, ell(72,-66,28,25),fur,ol,o);
        part(g, ell(91,-54,20,13),'#7a8d89',ol*.5,o);
        part(g, ell(106,-57,6,4),o,ol*.4,o);
        g.fillStyle='#deb75f'; for(const x of [62,82]) {g.beginPath();g.arc(x,-72,3,0,TAU);g.fill();}
        g.strokeStyle='#dddcc5';g.lineWidth=1.1;
        for(const y of [-58,-52,-46]) {g.beginPath();g.moveTo(91,y);g.lineTo(116,y-4);g.stroke();}
        return {eyes:[{x:62,y:-72},{x:82,y:-72}],head:{x:76,y:-65,r:26}};
      }
    },
    trenggiling: {
      bounds: [-152, -84, 112, 12],
      draw(g, ol) {
        const o='#3b3023', scales='#9e8c61';
        const tail=new Path2D('M -44 -45 C -78 -38 -99 -11 -142 -8 Q -100 10 -47 -15 Z');
        part(g,tail,scales,ol,o);
        for(const x of [-36,40]) line(g,`M ${x} -20 L ${x+5} -2 L ${x+15} -2`,9,'#6e6249',ol,o);
        const body=new Path2D('M -63 -28 C -67 -85 14 -95 57 -48 L 73 -24 L 36 -10 L -36 -12 Z');
        part(g,body,scales,ol,o);
        g.save();g.clip(body);g.lineWidth=1.6;g.strokeStyle='#5c5035';
        for(let row=0;row<5;row++)for(let col=0;col<9;col++) {
          const x=-63+col*17+(row%2)*8,y=-76+row*15;
          const q=new Path2D(`M ${x} ${y} Q ${x+8} ${y+18} ${x+17} ${y} Q ${x+9} ${y-5} ${x} ${y}`);
          g.fillStyle=(row+col)%2?'#b1a075':'#93805b';g.fill(q);g.stroke(q);
        }g.restore();
        part(g,new Path2D('M 46 -46 Q 66 -50 79 -33 L 105 -19 Q 99 -13 84 -17 L 58 -20 Z'),'#a79671',ol,o);
        g.fillStyle=o;g.beginPath();g.arc(71,-34,2.8,0,TAU);g.arc(104,-19,2.3,0,TAU);g.fill();
        g.strokeStyle='#ede4c8';g.lineWidth=1.2;g.beginPath();g.moveTo(50,0);g.lineTo(56,4);g.moveTo(45,-1);g.lineTo(50,4);g.stroke();
        return {eyes:[{x:71,y:-34}],head:{x:77,y:-29,r:18}};
      }
    },
    linsang: {
      bounds: [-158, -100, 115, 10],
      draw(g,ol) {
        const o='#332a21', fur='#d9c591';
        line(g,'M -52 -40 Q -104 -3 -144 -25',12,fur,ol,o);
        g.strokeStyle=o;g.lineWidth=9;
        for(let i=0;i<6;i++){g.beginPath();g.moveTo(-70-i*13,-26+(i>2?2:-i));g.lineTo(-75-i*13,-16+(i>2?2:-i));g.stroke();}
        for(const x of [-43,43])line(g,`M ${x} -33 L ${x+9} -3`,7,fur,ol,o);
        const body=ell(0,-45,64,20,-.06);part(g,body,fur,ol,o);
        g.save();g.clip(body);g.fillStyle='#4a3621';
        for(let i=0;i<18;i++){g.beginPath();g.ellipse(-51+(i%9)*13,-54+Math.floor(i/9)*17,6,4.5,.3,0,TAU);g.fill();}g.restore();
        part(g,new Path2D('M 49 -51 Q 53 -84 72 -80 L 90 -61 L 106 -50 L 85 -43 L 60 -37 Z'),fur,ol,o);
        part(g,ell(62,-82,8,11,-.2),fur,ol,o);part(g,ell(84,-78,7,10,.3),fur,ol,o);
        g.fillStyle=o;g.beginPath();g.arc(85,-63,3,0,TAU);g.arc(104,-50,3,0,TAU);g.fill();
        g.strokeStyle=o;g.lineWidth=4;g.beginPath();g.moveTo(59,-70);g.lineTo(71,-61);g.stroke();
        return {eyes:[{x:85,y:-63}],head:{x:79,y:-61,r:19}};
      }
    },
    monyet: {
      bounds: [-102, -142, 58, 55],
      draw(g,ol) {
        const o='#34342c', fur='#8f9281';
        line(g,'M -21 -6 C -71 -15 -78 52 -94 42',7,fur,ol,o);
        part(g,ell(0,-47,27,38),fur,ol,o);
        part(g,ell(7,-42,16,26),'#c6c4a7',ol*.3,o);
        for(const sd of [-1,1]) {
          line(g,`M ${sd*18} -60 Q ${sd*39} -35 ${sd*25} -11`,9,fur,ol,o);
          part(g,ell(sd*24,-8,12,7),fur,ol,o);
        }
        for(const sd of [-1,1])part(g,ell(sd*25,-104,9,12),'#b9a58b',ol,o);
        part(g,ell(0,-108,25,25),fur,ol,o);
        part(g,ell(0,-104,18,18),'#c5ac91',ol*.5,o);
        part(g,ell(0,-93,13,9),'#d6bfa3',ol*.4,o);
        g.fillStyle=o;for(const x of [-8,8]){g.beginPath();g.arc(x,-111,3,0,TAU);g.fill();}
        g.strokeStyle=o;g.lineWidth=1.4;g.beginPath();g.moveTo(-5,-91);g.quadraticCurveTo(0,-88,5,-91);g.stroke();
        return {eyes:[{x:-8,y:-111},{x:8,y:-111}],head:{x:0,y:-105,r:24}};
      }
    }
  });
  A.DECOY_TYPES = Object.keys(DRAW).concat(['kuwuk']);
  A.DECOY_ON_BRANCH = { lutung: true, elang: true, binturong: true, monyet: true };

  /* o: { scale, R, flip } */
  A.animalSprite = function (type, o) {
    if (type === 'kuwuk') {
      const sp = A.leopardSprite(Object.assign({}, o, { variant: 'kuwuk', pose: o.pose || 'walk', scale: o.scale * 0.42 }));
      sp.type = 'kuwuk';
      return sp;
    }
    const def = DRAW[type];
    const ol = J.clamp(2 / o.scale, 2, 5);
    const sp = A.makeSprite(o, def.bounds, (g) => def.draw(g, ol));
    sp.type = type;
    return sp;
  };
})();
