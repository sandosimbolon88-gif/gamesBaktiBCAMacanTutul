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
    csv() {
      const rows = [['tanggal', 'waktu', 'nama', 'skor', 'stasiun_bersih', 'salah_pilih']];
      for (const e of LB.load().sort((a, b) => a.ts - b.ts)) {
        const d = new Date(e.ts);
        rows.push([e.day, d.toLocaleTimeString('id-ID'), e.name, e.score, e.stages || 0, e.mistakes || 0]);
      }
      return rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    }
  });
})();
