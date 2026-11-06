/* Papan skor lokal (satu perangkat), disimpan di localStorage. */
(function () {
  'use strict';
  const J = window.JSMT;
  const KEY = 'jsmt.leaderboard.v1';
  let memory = []; // cadangan jika localStorage tidak tersedia

  function dayKey(d) {
    d = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function cmp(a, b) { return b.score - a.score || (a.mistakes || 0) - (b.mistakes || 0) || a.ts - b.ts; }

  const LB = (J.Leaderboard = {
    dayKey,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        const a = raw ? JSON.parse(raw) : [];
        return Array.isArray(a) ? a : [];
      } catch (e) { return memory.slice(); }
    },
    saveAll(a) {
      const trimmed = a.slice(-5000);
      memory = trimmed;
      try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch (e) { /* abaikan */ }
    },
    add(entry) {
      const a = LB.load();
      const e = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ts: Date.now(), day: dayKey() }, entry);
      a.push(e);
      LB.saveAll(a);
      return e;
    },
    sorted(scope) {
      let a = LB.load();
      if (scope === 'today') { const k = dayKey(); a = a.filter((e) => e.day === k); }
      return a.sort(cmp);
    },
    top(scope, n) { return LB.sorted(scope).slice(0, n); },
    rank(scope, id) { const i = LB.sorted(scope).findIndex((e) => e.id === id); return i < 0 ? null : i + 1; },
    /* Peringkat yang akan didapat jika skor ini disimpan sekarang. */
    wouldRank(scope, score, mistakes) {
      const probe = { score, mistakes, ts: Date.now() };
      return LB.sorted(scope).filter((e) => cmp(e, probe) < 0).length + 1;
    },
    resetToday() { const k = dayKey(); LB.saveAll(LB.load().filter((e) => e.day !== k)); },
    resetAll() { LB.saveAll([]); },
    /* Cadangan data untuk dipindah ke PC lain. */
    backup(settings) {
      return { app: 'jejak-si-macan-tutul', format: 1, exportedAt: new Date().toISOString(), settings: settings || null, leaderboard: LB.load() };
    },
    /* Gabungkan skor dari file cadangan (skor yang sudah ada tidak digandakan). */
    importBackup(data) {
      const list = Array.isArray(data) ? data : data && Array.isArray(data.leaderboard) ? data.leaderboard : null;
      if (!list || (data && data.app && data.app !== 'jejak-si-macan-tutul')) throw new Error('format');
      const cur = LB.load();
      const seen = new Set(cur.map((e) => e.id || e.ts + '|' + e.name));
      let added = 0, skipped = 0;
      for (const raw of list) {
        if (!raw || typeof raw !== 'object') { skipped++; continue; }
        const score = Math.floor(Number(raw.score));
        const ts = Number(raw.ts) || Date.now();
        if (!isFinite(score) || score < 0 || score > 100000) { skipped++; continue; }
        const e = {
          id: typeof raw.id === 'string' && raw.id ? raw.id.slice(0, 40) : ts.toString(36) + Math.random().toString(36).slice(2, 7),
          ts,
          day: typeof raw.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.day) ? raw.day : dayKey(new Date(ts)),
          name: String(raw.name || '').slice(0, 20) || 'Penjelajah',
          score,
          stages: Math.max(0, Math.floor(Number(raw.stages) || 0)),
          mistakes: Math.max(0, Math.floor(Number(raw.mistakes) || 0)),
          baseFound: Math.max(0, Math.floor(Number(raw.baseFound) || 0)),
          bonusFound: Math.max(0, Math.floor(Number(raw.bonusFound) || 0)),
          bonusScore: Math.max(0, Math.floor(Number(raw.bonusScore) || 0)),
          cluesFound: Math.max(0, Math.floor(Number(raw.cluesFound) || 0)),
          clueScore: Math.max(0, Math.floor(Number(raw.clueScore) || 0)),
          skips: Math.max(0, Math.floor(Number(raw.skips) || 0)),
          skipPenalty: Math.max(0, Math.floor(Number(raw.skipPenalty) || 0)),
          rulesVersion: [3,4].includes(Number(raw.rulesVersion)) ? Number(raw.rulesVersion) : 1
        };
        const key = e.id;
        if (seen.has(key) || seen.has(e.ts + '|' + e.name)) { skipped++; continue; }
        seen.add(key);
        cur.push(e);
        added++;
      }
      cur.sort((a, b) => a.ts - b.ts);
      LB.saveAll(cur);
      return { added, skipped };
    },
    csv() {
      const rows = [['tanggal', 'waktu', 'nama', 'skor', 'stasiun_bersih', 'salah_pilih', 'temuan_utama', 'bonus_lintasan', 'poin_bonus', 'cakaran', 'poin_cakaran', 'stasiun_dilewati', 'penalti_skip', 'versi_aturan']];
      for (const e of LB.load().sort((a, b) => a.ts - b.ts)) {
        const d = new Date(e.ts);
        rows.push([e.day, d.toLocaleTimeString('id-ID'), e.name, e.score, e.stages || 0, e.mistakes || 0, e.baseFound ?? e.score, e.bonusFound || 0, e.bonusScore || 0, e.cluesFound || 0, e.clueScore || 0, e.skips || 0, e.skipPenalty || 0, e.rulesVersion || 1]);
      }
      return rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    }
  });
})();
