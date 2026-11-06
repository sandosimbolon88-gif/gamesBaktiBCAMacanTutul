/* Titik masuk: ukuran layar, loop gambar, alur layar, mode kiosk, panel admin. */
(function () {
  'use strict';
  const J = window.JSMT, A = J.Art, CFG = window.JSMT_CONFIG, C = window.JSMT_CONTENT, UI = J.UI;
  const W=J.VW,H=J.VH,WORLD_W=J.W,WORLD_H=J.H;
  const $ = (id) => document.getElementById(id);
  const SETTINGS_KEY = 'jsmt.settings.v1';

  const stage = $('stage'), canvas = $('game'), ctx = canvas.getContext('2d');
  let state = 'boot', lastInput = J.now(), lastFrame = 0, vignette = null, vignR = 0;
  let pendingResult=null,lastEntryId=null,boardTimer=null;
  const FIT_ZOOM=W/WORLD_W;
  const camera={x:WORLD_W/2,y:WORLD_H/2,zoom:FIT_ZOOM,min:FIT_ZOOM,max:1.8};
  function clampCamera(){if(camera.zoom<=camera.min+.0001){camera.zoom=camera.min;camera.x=WORLD_W/2;camera.y=WORLD_H/2;return;}const hw=W/(2*camera.zoom),hh=H/(2*camera.zoom);camera.x=J.clamp(camera.x,hw,WORLD_W-hw);camera.y=J.clamp(camera.y,hh,WORLD_H-hh);}
  function resetCamera(){camera.x=WORLD_W/2;camera.y=WORLD_H/2;camera.zoom=FIT_ZOOM;clampCamera();}
  function screenToWorld(cx,cy){const r=canvas.getBoundingClientRect(),sx=(cx-r.left)/r.width*W,sy=(cy-r.top)/r.height*H;return{x:camera.x+(sx-W/2)/camera.zoom,y:camera.y+(sy-H/2)/camera.zoom,scale:W/r.width/camera.zoom};}

  J.resetCamera = resetCamera;
  J.worldToScreen = (x,y) => ({ x:(x-camera.x)*camera.zoom+W/2, y:(y-camera.y)*camera.zoom+H/2 });

  /* ---------- pengaturan ---------- */
  const settings = Object.assign({ duration: CFG.durationSec, sound: true }, loadSettings());
  if (!CFG.durationOptions.includes(settings.duration)) settings.duration = CFG.durationSec;
  function loadSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (e) { return {}; } }
  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* abaikan */ } }

  /* ---------- ukuran panggung 16:9 ---------- */
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let w = vw, h = (vw * 9) / 16;
    if (h > vh) { h = vh; w = (vh * 16) / 9; }
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    document.documentElement.style.setProperty('--u', w / 100 + 'px');
    const dpr = window.devicePixelRatio || 1;
    J.R = J.clamp((w * dpr) / W, 0.6, 1.6);
    canvas.width = Math.round(W * J.R);
    canvas.height = Math.round(H * J.R);
  }

  /* ---------- layar awal (demo hutan bergerak pelan) ---------- */
  const attract = {
    scene: null, t0: 0,
    refresh() {
      this.scene = J.Scene.generate(0, {
        R: J.R, mode: J.rng(J.randomSeed()).pick(['pagi', 'siang', 'senja']),
        diff: { count: [3, 4], scale: 0.7, occl: 0.25, minVis: 0.6, black: 0.4, minBlack: 1, decoys: 2, cub: 0.8, density: 0.55, light: 0.4, camo: 0.35, hide: 0, mode: 'pagi' }
      });
      this.t0 = J.now();
    },
    render(now) {
      if (!this.scene) return;
      const t = now - this.t0;
      const z = 1.05 + 0.025 * Math.sin(t * 0.15), px = Math.sin(t * 0.06) * 30;
      // hanya sorot macan tutul yang tidak tertutup panel di sisi kanan
      const leos = this.scene.leopards.filter((l) => !(l.cx > 1000 && l.cy < 600));
      const idx = Math.floor(t / 3.2) % Math.max(1, leos.length);
      const ph = (t % 3.2) / 3.2;
      leos.forEach((l, i) => { l.demo = i === idx ? Math.min(1, Math.sin(ph * Math.PI) * 1.6) : 0; });
      ctx.save();
      ctx.translate(W / 2 + px, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      J.drawScene(ctx, this.scene, now);
      ctx.restore();
    }
  };

  const game = new J.Game({ onEnd: (res) => goto('result', res) });

  /* ---------- alur layar ---------- */
  function goto(next, data) {
    const prev = state;
    state = next;
    lastInput = J.now();
    UI.clearBubbles();
    clearTimeout(boardTimer);
    if (prev === 'attract') { UI.stopAttractFacts(); J.Audio.ambient(false); }
    if (next === 'attract') {
      game.stop();
      document.getElementById("session-length").textContent = Math.round(settings.duration/60*10)/10 + " menit";
      attract.refresh();
      UI.show('screen-attract');
      UI.renderMiniBoard();
      UI.startAttractFacts();
      if (settings.sound) J.Audio.ambient(true);
    } else if (next === 'briefing') {
      UI.show('screen-briefing');
    } else if (next === 'play') {
      resetCamera();
      UI.show(null);
      game.start(settings.duration);
    } else if (next === 'result') {
      pendingResult = data;
      showResult(data);
    } else if (next === 'board') {
      UI.show('screen-board');
      UI.renderBoards(data && data.highlight);
      boardTimer = setTimeout(() => { if (state === 'board') goto('attract'); }, CFG.boardAutoReturnSec * 1000);
    }
  }

  function returnToMenu(settingsAfter=false) {
    if (state!=='play' || !window.confirm(C.ui.leaveConfirm)) return;
    pendingResult=null;
    pointers.clear();drag=null;pinch=null;
    J.Audio.click();
    goto('attract'); // game.stop membatalkan timer dan kartu fakta sesi lama.
    if (settingsAfter) openAdmin();
  }

  function showResult(res) {
    UI.show('screen-result');
    $('result-score').textContent = res.score;
    $('result-breakdown').textContent = res.baseFound + ' temuan ('+res.baseScore+' poin) + ' + res.bonusScore + ' bonus satwa + ' + res.clueScore + ' cakaran − ' + res.skipPenalty + ' skip − '+res.decoyPenalty+' pengecoh';
    $('result-stations').textContent = res.stages;
    $('result-mistakes').textContent = res.mistakes;
    $('result-rank').textContent = '#' + J.Leaderboard.wouldRank('today', res.score, res.mistakes);
    const titles = C.ui.resultTitles;
    $('result-title').textContent = titles[res.score >= 14 ? 2 : res.score >= 7 ? 1 : 0];
    $('result-action').textContent = C.actions[Math.floor(Math.random() * C.actions.length)];
    UI.setName('');
  }
  function saveResult(skip) {
    if (!pendingResult) return;
    const name = skip ? C.ui.defaultName : UI.cleanName(UI.getName());
    const e = J.Leaderboard.add({ name, score: pendingResult.score, stages: pendingResult.stages, mistakes: pendingResult.mistakes, baseFound: pendingResult.baseFound, baseScore:pendingResult.baseScore, decoyPenalty:pendingResult.decoyPenalty, bonusFound: pendingResult.bonusFound, bonusScore: pendingResult.bonusScore, cluesFound:pendingResult.cluesFound, clueScore:pendingResult.clueScore, skips:pendingResult.skips, skipPenalty:pendingResult.skipPenalty, rulesVersion:CFG.rulesVersion });
    lastEntryId = e.id;
    pendingResult = null;
    J.Audio.click();
    goto('board', { highlight: lastEntryId });
  }

  /* ---------- loop gambar ---------- */
  function frame(ts) {
    const now = ts / 1000;
    const dt = Math.min(0.05, lastFrame ? now - lastFrame : 0);
    lastFrame = now;
    ctx.setTransform(J.R,0,0,J.R,0,0);ctx.clearRect(0,0,W,H);const nowS=J.now();
    if(state==='play'||state==='result'){game.update(dt,nowS);ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);game.render(ctx,nowS);ctx.restore();}
    else{ctx.save();const fit=W/WORLD_W;ctx.translate(W/2,H/2);ctx.scale(fit,fit);ctx.translate(-WORLD_W/2,-WORLD_H/2);attract.render(nowS);ctx.restore();}
    if (!vignette || vignR !== J.R) { vignette = A.Forest.vignette(W, H, J.R, 0.42); vignR = J.R; }
    ctx.drawImage(vignette, 0, 0, W, H);
    // kembali ke layar awal jika ditinggal
    if (state !== 'attract' && (state !== 'play' || game.paused && !game.ending) && !UI.isOpen('overlay-admin') && nowS - lastInput > CFG.idleTimeoutSec) goto('attract');
    requestAnimationFrame(frame);
  }

  /* ---------- input ---------- */
  const pointers=new Map();let drag=null,pinch=null;
  canvas.addEventListener('pointerdown', e => {
    if (state !== 'play') return;
    e.preventDefault(); canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      const p=screenToWorld(e.clientX,e.clientY), tol=e.pointerType==='mouse'?CFG.tolMouse:CFG.tolTouch;
      drag = { id:e.pointerId, sx:e.clientX, sy:e.clientY, moved:false, bonusTarget:game.bonus.hit(p.x,p.y,tol*p.scale),movingTarget:game.scene.motion.hit(p.x,p.y,tol*p.scale) };
    }
    else if (pointers.size === 2) { const a = [...pointers.values()]; pinch = { d: Math.hypot(a[1].x-a[0].x, a[1].y-a[0].y), z: camera.zoom }; drag = null; }
  });
  canvas.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId) || state !== 'play') return;
    const old = pointers.get(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const a = [...pointers.values()], d = Math.hypot(a[1].x-a[0].x, a[1].y-a[0].y);
      camera.zoom = J.clamp(pinch.z*d/Math.max(20,pinch.d), camera.min, camera.max); clampCamera();
    } else if (drag && drag.id === e.pointerId) {
      if (Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy) > 10) drag.moved = true;
      if (camera.zoom > camera.min+.0001) {
        const r = canvas.getBoundingClientRect(), k = W/r.width/camera.zoom;
        camera.x -= (e.clientX-old.x)*k; camera.y -= (e.clientY-old.y)*k; clampCamera();
      }
    }
  });
  function finishPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    if (e.type === 'pointerup' && pointers.size === 1 && drag && !drag.moved && state === 'play') {
      const p = screenToWorld(e.clientX,e.clientY), tol = e.pointerType === 'mouse' ? CFG.tolMouse : CFG.tolTouch;
      game.pointer(p.x,p.y,tol*p.scale,drag.bonusTarget,drag.movingTarget);
    }
    pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; drag = null;
  }
  canvas.addEventListener('pointerup',finishPointer); canvas.addEventListener('pointercancel',finishPointer);
  canvas.addEventListener('wheel',e=>{if(state!=='play')return;e.preventDefault();const b=screenToWorld(e.clientX,e.clientY);camera.zoom=J.clamp(camera.zoom*Math.exp(-e.deltaY*.0012),camera.min,camera.max);const a=screenToWorld(e.clientX,e.clientY);camera.x+=b.x-a.x;camera.y+=b.y-a.y;clampCamera();},{passive:false});
  window.addEventListener('pointerdown', () => { lastInput = J.now(); J.Audio.unlock(); }, true);
  window.addEventListener('keydown', (e) => {
    lastInput = J.now();
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); if(state==='play') returnToMenu(true); else openAdmin(); return; }
    if (UI.isOpen('overlay-admin')) return;
    if (e.key==='Escape' && state==='play') { e.preventDefault(); returnToMenu(); return; }
    if (state === 'result') {
      if (e.key === 'Enter') saveResult(false);
      else if (e.key === 'Backspace') { e.preventDefault(); UI.typeKey('DEL'); }
      else if (e.key === ' ') { e.preventDefault(); UI.typeKey('SPACE'); }
      else if (e.key.length === 1) UI.typeKey(e.key);
    } else if (state === 'attract' && (e.key === 'Enter' || e.key === ' ')) { J.Audio.unlock(); goto('briefing'); }
    else if (state === 'briefing' && (e.key === 'Enter' || e.key === ' ')) goto('play');
  });

  // mode kiosk: cegah zoom, menu klik kanan, seleksi
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('touchmove',e=>{if(state==='play')e.preventDefault();},{passive:false});

  /* ---------- tombol ---------- */
  function on(id, fn) { $(id).addEventListener('click', (e) => { e.stopPropagation(); fn(e); }); }
  $('screen-attract').addEventListener('click', () => { if (state === 'attract') { J.Audio.unlock(); J.Audio.click(); goto('briefing'); } });
  on('btn-start', () => { J.Audio.unlock(); J.Audio.click(); goto('briefing'); });
  on('btn-board', () => { J.Audio.click(); goto('board'); });
  on('btn-fullscreen', () => toggleFullscreen());
  on('btn-jwls', () => UI.overlay('overlay-jwls', true));
  on('btn-jwls-close', () => UI.overlay('overlay-jwls', false));
  on('btn-jwls-source', () => window.open('https://www.bca.co.id/id/tentang-bca/media-riset/pressroom/siaran-pers/2026/05/04/03/57/demi-keseimbangan-ekosistem-kolaborasi-bakti-bca-untuk-pelestarian-macan-tutul', '_blank', 'noopener,noreferrer'));
  on('btn-go', () => { J.Audio.click(); goto('play'); });
  on('btn-play-menu', () => returnToMenu());
  on('btn-reset-view',()=>{J.Audio.click();resetCamera();});
  on('btn-skip-station', () => { J.Audio.click(); game.skipStation(); });
  on('btn-save', () => saveResult(false));
  on('btn-skip', () => saveResult(true));
  on('btn-again', () => { J.Audio.click(); goto('briefing'); });
  on('btn-home', () => { J.Audio.click(); goto('attract'); });
  on('btn-mute', () => { settings.sound = !settings.sound; applySound(); saveSettings(); });

  function applySound() {
    J.Audio.setEnabled(settings.sound);
    $('btn-mute').classList.toggle('is-off', !settings.sound);
    if (settings.sound && state === 'attract') J.Audio.ambient(true);
  }
  function toggleFullscreen() {
    const d = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const el = d.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
  }

  /* ---------- admin ---------- */
  let hotTaps = [];
  $('admin-hotspot').addEventListener('click', (e) => {
    e.stopPropagation();
    const now = J.now();
    hotTaps = hotTaps.filter((t) => now - t < 3).concat(now);
    if (hotTaps.length >= 5) { hotTaps = []; openAdmin(); }
  });
  function openAdmin() {
    if (state === 'play') return;
    UI.overlay('overlay-admin', true);
    $('admin-pin').classList.remove('hidden');
    adminMsg('');
    $('admin-menu').classList.add('hidden');
    UI.askPin((pin) => {
      if (pin === String(CFG.adminPin)) { $('admin-pin').classList.add('hidden'); $('admin-menu').classList.remove('hidden'); renderAdmin(); }
      else UI.pinError();
    });
  }
  function closeAdmin() { UI.overlay('overlay-admin', false); if (state === 'attract') UI.renderMiniBoard(); if (state === 'board') UI.renderBoards(lastEntryId); }
  function renderAdmin() {
    const dur = $('admin-durations');
    dur.innerHTML = '';
    for (const s of CFG.durationOptions) {
      const b = document.createElement('button');
      b.className = 'btn' + (settings.duration === s ? ' on' : '');
      b.textContent = J.tpl(C.ui.adminSeconds, { s });
      b.onclick = (e) => { e.stopPropagation(); settings.duration = s; saveSettings(); renderAdmin(); };
      dur.appendChild(b);
    }
    const snd = $('admin-sound');
    snd.innerHTML = '';
    for (const v of [true, false]) {
      const b = document.createElement('button');
      b.className = 'btn' + (settings.sound === v ? ' on' : '');
      b.textContent = v ? C.ui.adminOn : C.ui.adminOff;
      b.onclick = (e) => { e.stopPropagation(); settings.sound = v; applySound(); saveSettings(); renderAdmin(); };
      snd.appendChild(b);
    }
  }
  on('btn-admin-cancel', closeAdmin);
  on('btn-admin-close', closeAdmin);
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function adminMsg(text, err) {
    const m = $('admin-msg');
    m.textContent = text || '';
    m.classList.toggle('err', !!err);
  }
  on('btn-admin-export', () => {
    download('skor-jejak-si-macan-tutul-' + J.Leaderboard.dayKey() + '.csv', '\ufeff' + J.Leaderboard.csv(), 'text/csv;charset=utf-8');
  });
  on('btn-admin-backup', () => {
    const stamp = J.Leaderboard.dayKey() + '-' + new Date().toTimeString().slice(0, 5).replace(':', '');
    download('cadangan-jejak-si-macan-tutul-' + stamp + '.json', JSON.stringify(J.Leaderboard.backup(settings), null, 1), 'application/json');
    adminMsg(C.ui.adminBackupDone);
  });
  on('btn-admin-import', () => { $('admin-import-file').value = ''; $('admin-import-file').click(); });
  $('admin-import-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(String(rd.result).replace(/^\ufeff/, ''));
        const res = J.Leaderboard.importBackup(data);
        if (data && data.settings && typeof data.settings === 'object') {
          if (CFG.durationOptions.includes(data.settings.duration)) settings.duration = data.settings.duration;
          if (typeof data.settings.sound === 'boolean') settings.sound = data.settings.sound;
          saveSettings(); applySound(); renderAdmin();
        }
        adminMsg(J.tpl(C.ui.adminImported, res));
      } catch (err) { adminMsg(C.ui.adminImportFail, true); }
    };
    rd.onerror = () => adminMsg(C.ui.adminImportFail, true);
    rd.readAsText(f);
  });
  on('btn-admin-reset-today', () => { if (confirm(C.ui.adminConfirm)) J.Leaderboard.resetToday(); });
  on('btn-admin-reset-all', () => { if (confirm(C.ui.adminConfirm)) J.Leaderboard.resetAll(); });

  /* ---------- ikon aturan main ---------- */
  function ruleIcons() {
    const mk = (o) => A.leopardSprite(Object.assign({ R: 2, flip: false }, o)).canvas.toDataURL();
    return {
      spotted: mk({ pose: 'crouch', variant: 'spotted', scale: 0.6 }),
      black: mk({ pose: 'sniff', variant: 'black', scale: 0.6 }),
      moving: mk({ pose: 'run', variant: 'spotted', scale: 0.6, gait:Math.PI*.5 }),
      scratch: A.scratchSprite({scale:1,R:2}).canvas.toDataURL(),
      kuwuk: A.animalSprite('kuwuk', { scale: 1.3, R: 2, pose: 'sit' }).canvas.toDataURL()
    };
  }

  /* ---------- mulai ---------- */
  function boot() {
    resize();
    window.addEventListener('resize', resize);
    UI.init();
    UI.buildRules(ruleIcons());
    applySound();
    goto('attract');
    $('loading').classList.add('done');
    requestAnimationFrame(frame);
    if ('wakeLock' in navigator) {
      const lock = () => navigator.wakeLock.request('screen').catch(() => {});
      lock();
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') lock(); });
    }
    if (!window.JSMT_SINGLE_FILE && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // akses untuk pengujian otomatis
  J.debug = { game, attract, goto, get state() { return state; }, settings };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
