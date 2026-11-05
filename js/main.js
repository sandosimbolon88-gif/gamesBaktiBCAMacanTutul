/* Titik masuk: ukuran layar, loop gambar, alur layar, mode kiosk, panel admin. */
(function () {
  'use strict';
  const J = window.JSMT, A = J.Art, CFG = window.JSMT_CONFIG, C = window.JSMT_CONTENT, UI = J.UI;
  const W = J.W, H = J.H;
  const $ = (id) => document.getElementById(id);
  const SETTINGS_KEY = 'jsmt.settings.v1';

  const stage = $('stage'), canvas = $('game'), ctx = canvas.getContext('2d');
  let state = 'boot', lastInput = J.now(), lastFrame = 0, vignette = null, vignR = 0;
  let pendingResult = null, lastEntryId = null, boardTimer = null;

  /* ---------- pengaturan ---------- */
  const settings = Object.assign({ duration: CFG.durationSec, sound: true }, loadSettings());
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
        diff: { count: [3, 4], scale: 0.8, occl: 0.2, minVis: 0.65, black: 0.4, minBlack: 1, decoys: 2, cub: 0.8, mode: 'pagi' }
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
      attract.refresh();
      UI.show('screen-attract');
      UI.renderMiniBoard();
      UI.startAttractFacts();
      if (settings.sound) J.Audio.ambient(true);
    } else if (next === 'briefing') {
      UI.show('screen-briefing');
    } else if (next === 'play') {
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

  function showResult(res) {
    UI.show('screen-result');
    $('result-score').textContent = res.score;
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
    const e = J.Leaderboard.add({ name, score: pendingResult.score, stages: pendingResult.stages, mistakes: pendingResult.mistakes });
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
    ctx.setTransform(J.R, 0, 0, J.R, 0, 0);
    const nowS = J.now();
    if (state === 'play' || state === 'result') {
      game.update(dt, nowS);
      game.render(ctx, nowS);
    } else {
      attract.render(nowS);
    }
    if (!vignette || vignR !== J.R) { vignette = A.Forest.vignette(W, H, J.R, 0.42); vignR = J.R; }
    ctx.drawImage(vignette, 0, 0, W, H);
    // kembali ke layar awal jika ditinggal
    if (state !== 'attract' && state !== 'play' && !UI.isOpen('overlay-admin') && nowS - lastInput > CFG.idleTimeoutSec) goto('attract');
    requestAnimationFrame(frame);
  }

  /* ---------- input ---------- */
  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H, scale: W / r.width };
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'play') return;
    e.preventDefault();
    const p = toLogical(e);
    const tolPx = e.pointerType === 'mouse' ? CFG.tolMouse : CFG.tolTouch;
    game.pointer(p.x, p.y, tolPx * p.scale);
  });
  window.addEventListener('pointerdown', () => { lastInput = J.now(); J.Audio.unlock(); }, true);
  window.addEventListener('keydown', (e) => {
    lastInput = J.now();
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); openAdmin(); return; }
    if (UI.isOpen('overlay-admin')) return;
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
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  /* ---------- tombol ---------- */
  function on(id, fn) { $(id).addEventListener('click', (e) => { e.stopPropagation(); fn(e); }); }
  $('screen-attract').addEventListener('click', () => { if (state === 'attract') { J.Audio.unlock(); J.Audio.click(); goto('briefing'); } });
  on('btn-start', () => { J.Audio.unlock(); J.Audio.click(); goto('briefing'); });
  on('btn-board', () => { J.Audio.click(); goto('board'); });
  on('btn-fullscreen', () => toggleFullscreen());
  on('btn-go', () => { J.Audio.click(); goto('play'); });
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
  on('btn-admin-export', () => {
    const blob = new Blob(['﻿' + J.Leaderboard.csv()], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'skor-jejak-si-macan-tutul-' + J.Leaderboard.dayKey() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  on('btn-admin-reset-today', () => { if (confirm(C.ui.adminConfirm)) J.Leaderboard.resetToday(); });
  on('btn-admin-reset-all', () => { if (confirm(C.ui.adminConfirm)) J.Leaderboard.resetAll(); });

  /* ---------- ikon aturan main ---------- */
  function ruleIcons() {
    const mk = (o) => A.leopardSprite(Object.assign({ R: 2, flip: false }, o)).canvas.toDataURL();
    return {
      spotted: mk({ pose: 'sit', variant: 'spotted', scale: 0.6 }),
      black: mk({ pose: 'sit', variant: 'black', scale: 0.6 }),
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
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // akses untuk pengujian otomatis
  J.debug = { game, attract, goto, get state() { return state; }, settings };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
