/* Lapisan antarmuka (DOM): layar, HUD, papan skor, keyboard nama, gelembung info. */
(function () {
  'use strict';
  const J = window.JSMT, C = window.JSMT_CONTENT, CFG = window.JSMT_CONFIG;
  const $ = (id) => document.getElementById(id);
  const UI = (J.UI = {});

  const get = (path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), C);
  UI.t = (path, vars) => J.tpl(get(path) || '', vars);

  UI.init = function () {
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = UI.t(el.getAttribute('data-t')); });
    document.title = C.title;
    const tl = C.titleLines || [C.title];
    $('attract-title').innerHTML = '<span>' + esc(tl[0]) + '</span>' + (tl[1] ? '<span class="line2">' + esc(tl[1]) + '</span>' : '');
    $('guide-decoys').textContent = Object.values(C.decoys).map(it => it.name).join(' · ');
    $('guide-target-score').textContent = `Macan +${CFG.targetPoints} · malam +${CFG.nightTargetPoints}. Lewati stasiun: −${CFG.skipPenaltyPoints} poin.`;
    $('guide-penalty').textContent = `Pengecoh: −${CFG.decoyPenaltyPoints} poin dan −${CFG.decoyPenaltySec} detik. Skor minimum nol.`;
    $('guide-bonus-score').textContent = `Macan bonus +${CFG.bonusPoints} · malam +${CFG.nightBonusPoints}. Kelompok cakaran +${CFG.cluePoints} poin.`;
    UI.buildKeyboard();
    UI.buildPinpad();
  };

  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  UI.esc = esc;

  /* ---------- layar ---------- */
  const screens = ['screen-attract', 'screen-guide', 'screen-briefing', 'overlay-fact', 'screen-result', 'screen-board', 'overlay-admin', 'overlay-jwls'];
  UI.show = function (id) {
    for (const s of screens) { if (s !== 'overlay-admin') $(s).classList.toggle('active', s === id); }
  };
  UI.overlay = function (id, on) { $(id).classList.toggle('active', !!on); };
  UI.isOpen = (id) => $(id).classList.contains('active');

  /* ---------- briefing ---------- */
  UI.buildRules = function (icons) {
    const box = $('rules');
    box.innerHTML = '';
    for (const r of C.ui.rules) {
      const d = document.createElement('div');
      d.className = 'rule';
      d.innerHTML = (icons[r.icon] ? '<img alt="" src="' + icons[r.icon] + '">' : '') + '<b>' + esc(r.title) + '</b><span>' + esc(r.text) + '</span>';
      box.appendChild(d);
    }
  };

  /* ---------- HUD ---------- */
  UI.hud = {
    show(on) { $('hud').classList.toggle('hidden', !on); $('btn-play-menu').classList.toggle('hidden', !on); },
    score(v, bump) {
      $('hud-score').textContent = v;
      if (bump) { const el = document.querySelector('.hud-score'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    },
    time(left, total) {
      $('hud-time').textContent = J.fmtTime(left);
      $('hud-timebar').style.width = J.clamp((left / total) * 100, 0, 100) + '%';
      document.querySelector('.hud-time').classList.toggle('low', left <= 10);
    },
    station(n, mode) {
      $('hud-station').textContent = UI.t('ui.station', { n });
      $('hud-mode').textContent = (C.ui.modes[mode] || '')+' · Macan +'+(mode==='malam'?CFG.nightTargetPoints:CFG.targetPoints);
      $('hud').classList.toggle('night', mode === 'malam');
    },
    bonus(active, score, clueScore=0,scene) {
      const el=$('hud-bonus');
      el.classList.toggle('live',!!active);
      const cue=active ? (active.type==='tail'?'Ekor di semak!':active.type==='rise'?'Gerak di semak!':active.type && active.type.startsWith('peek') ? 'Kepala mengintip!' : 'Macan melesat!') : 'Amati jejaknya';
      el.textContent=cue+' · Bonus macan +'+(scene?.night?CFG.nightBonusPoints:CFG.bonusPoints)+' / Cakaran +'+CFG.cluePoints+' · Terkumpul '+(score+clueScore);
    },
    pips(leopards) {
      const box = $('hud-pips');
      if (box.children.length !== leopards.length) {
        box.innerHTML = '';
        for (let i = 0; i < leopards.length; i++) { const s = document.createElement('span'); s.className = 'pip'; box.appendChild(s); }
      }
      const found = leopards.filter((l) => l.found);
      [...box.children].forEach((el, i) => {
        const l = found[i];
        el.className = 'pip' + (l ? ' done' + (l.variant === 'black' ? ' black' : '') : '');
      });
    }
  };

  /* ---------- banner & gelembung ---------- */
  let bannerTimer = null;
  UI.banner = function (html, cls) {
    const b = $('banner');
    b.className = 'banner';
    b.innerHTML = html;
    void b.offsetWidth;
    b.className = 'banner show' + (cls ? ' ' + cls : '');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { b.className = 'banner'; }, 1700);
  };
  UI.bubble = function (lx, ly, title, text, extra) {
    const box = $('bubbles');
    while (box.children.length > 1) box.removeChild(box.firstChild);
    const point = J.worldToScreen ? J.worldToScreen(lx,ly) : {x:lx,y:ly};
    lx = point.x; ly = point.y;
    const d = document.createElement('div');
    d.className = 'bubble' + (ly < 300 ? ' below' : '');
    d.style.left = J.clamp((lx / J.VW) * 100, 15, 85) + '%';
    d.style.top = (ly / J.VH) * 100 + '%';
    d.innerHTML = '<b>' + esc(title) + '</b><span>' + esc(text) + (extra ? ' <em>' + esc(extra) + '</em>' : '') + '</span>';
    box.appendChild(d);
    setTimeout(() => d.classList.add('fade'), 3200);
    setTimeout(() => d.remove(), 3700);
  };
  UI.clearBubbles = () => { $('bubbles').innerHTML = ''; };

  /* ---------- kartu fakta tanpa timer ---------- */
  UI.showFact = function (fact, onNext) {
    $('fact-title').textContent = fact.title; $('fact-text').textContent = fact.text;
    $('fact-source').textContent = fact.source || 'Edukasi macan tutul jawa · JWLS';
    UI.overlay('overlay-fact', true); let done = false;
    const finish = () => { if (done) return; done = true; UI.overlay('overlay-fact', false); $('btn-fact-next').onclick = null; onNext(); };
    $('btn-fact-next').onclick = (e) => { e.stopPropagation(); J.Audio.click(); finish(); };
  };
  UI.cancelFact = function () { UI.overlay('overlay-fact', false); };

  /* ---------- layar awal ---------- */
  let factIdx = 0, factInt = null;
  UI.startAttractFacts = function () {
    const facts = J.rng(J.randomSeed()).shuffle(C.facts.slice());
    const put = () => {
      const card = document.querySelector('.fact-card-mini');
      card.classList.add('swap');
      setTimeout(() => {
        const f = facts[factIdx++ % facts.length];
        $('attract-fact-title').textContent = f.title;
        $('attract-fact-text').textContent = f.text;
        card.classList.remove('swap');
      }, 350);
    };
    clearInterval(factInt);
    put();
    factInt = setInterval(put, CFG.attractFactSec * 1000);
  };
  UI.stopAttractFacts = () => clearInterval(factInt);

  function listHTML(entries, highlightId, n) {
    if (!entries.length) return '<li class="empty">' + esc(C.ui.empty) + '</li>';
    let html = '';
    entries.slice(0, n).forEach((e, i) => {
      html += '<li' + (e.id === highlightId ? ' class="me"' : '') + '><span class="n">' + (i + 1) + '</span><span class="nm">' + esc(e.name) + '</span><span class="sc">' + e.score + '</span></li>';
    });
    return html;
  }
  UI.renderMiniBoard = function () {
    const top = J.Leaderboard.top('today', 5);
    $('attract-top').innerHTML = top.length ? listHTML(top, null, 5) : '<li class="empty">' + esc(C.ui.noScores) + '</li>';
  };
  UI.renderBoards = function (highlightId) {
    const today = J.Leaderboard.sorted('today'), all = J.Leaderboard.sorted('all');
    const fit = (list) => {
      const top = list.slice(0, 10);
      if (highlightId && !top.some((e) => e.id === highlightId)) {
        const i = list.findIndex((e) => e.id === highlightId);
        if (i >= 0) return { top: top.slice(0, 9), extra: { e: list[i], rank: i + 1 } };
      }
      return { top, extra: null };
    };
    for (const [id, list] of [['board-today', today], ['board-all', all]]) {
      const f = fit(list);
      let html = listHTML(f.top, highlightId, 10);
      if (f.extra) html += '<li class="me"><span class="n">' + f.extra.rank + '</span><span class="nm">' + esc(f.extra.e.name) + '</span><span class="sc">' + f.extra.e.score + '</span></li>';
      $(id).innerHTML = html;
    }
  };

  /* ---------- hasil & nama ---------- */
  let nameBuf = '';
  UI.setName = function (s) {
    nameBuf = s.slice(0, CFG.nameMaxLen);
    $('name-text').textContent = nameBuf;
  };
  UI.getName = () => nameBuf;
  UI.typeKey = function (k) {
    if (k === 'DEL') UI.setName(nameBuf.slice(0, -1));
    else if (k === 'SPACE') { if (nameBuf && !nameBuf.endsWith(' ')) UI.setName(nameBuf + ' '); }
    else if (/^[A-Za-z0-9]$/.test(k)) UI.setName(nameBuf + k.toUpperCase());
  };
  UI.buildKeyboard = function () {
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    const kb = $('keyboard');
    kb.innerHTML = '';
    rows.forEach((row, ri) => {
      const r = document.createElement('div');
      r.className = 'kb-row';
      for (const ch of row) r.appendChild(keyBtn(ch, ch));
      if (ri === 2) r.appendChild(keyBtn(C.ui.del, 'DEL', 'mid'));
      kb.appendChild(r);
    });
    const r = document.createElement('div');
    r.className = 'kb-row';
    r.appendChild(keyBtn(C.ui.space, 'SPACE', 'wide'));
    kb.appendChild(r);
    function keyBtn(label, code, cls) {
      const b = document.createElement('button');
      b.className = 'key' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); J.Audio.click(); UI.typeKey(code); });
      return b;
    }
  };
  UI.cleanName = function (raw) {
    const name = (raw || '').trim().replace(/\s+/g, ' ');
    if (!name) return C.ui.defaultName;
    const low = name.toLowerCase(), squashed = low.replace(/[^a-z]/g, '');
    const words = low.split(/[^a-z]+/);
    for (const w of C.blockedWords) {
      if (w.length <= 4 ? words.includes(w) : squashed.includes(w)) return C.ui.defaultName;
    }
    return name;
  };

  /* ---------- PIN admin ---------- */
  let pinBuf = '', pinCb = null;
  UI.buildPinpad = function () {
    const pad = $('pinpad');
    pad.innerHTML = '';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK'];
    for (const k of keys) {
      const b = document.createElement('button');
      b.className = 'key';
      b.textContent = k === 'DEL' ? '⌫' : k === 'OK' ? '✓' : k;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (k === 'DEL') pinBuf = pinBuf.slice(0, -1);
        else if (k === 'OK') { if (pinCb) pinCb(pinBuf); return; }
        else if (pinBuf.length < 8) pinBuf += k;
        renderPin();
      });
      pad.appendChild(b);
    }
  };
  function renderPin(err) {
    const d = $('pin-display');
    d.classList.toggle('err', !!err);
    d.textContent = err ? C.ui.adminWrong : '•'.repeat(pinBuf.length);
  }
  UI.askPin = function (cb) { pinBuf = ''; pinCb = cb; renderPin(); };
  UI.pinError = function () { pinBuf = ''; renderPin(true); };
})();
