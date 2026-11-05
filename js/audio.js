/* Efek suara disintesis langsung (tanpa file audio, tetap jalan offline). */
(function () {
  'use strict';
  const J = window.JSMT;
  let ctx = null, master = null, noiseBuf = null, enabled = true, ambientTimer = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return !!ctx; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? 0.55 : 0;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { ctx = null; return false; }
  }

  function tone(freq, dur, type, vol, when, glide) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, q, when) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime + (when || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(vol || 0.3, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const AU = (J.Audio = {
    unlock() { ensure(); },
    setEnabled(v) {
      enabled = !!v;
      if (master) master.gain.value = enabled ? 0.55 : 0;
      if (!enabled) AU.ambient(false);
    },
    isEnabled: () => enabled,
    click() { tone(660, 0.06, 'triangle', 0.08); },
    shutter() { noise(0.045, 0.45, 3200, 0.8); noise(0.05, 0.3, 1600, 1, 0.07); },
    found() { AU.shutter(); [880, 1108.7, 1318.5].forEach((f, i) => tone(f, 0.16, 'sine', 0.22, 0.05 + i * 0.07)); },
    clear() { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.18, i * 0.09)); },
    decoy() { tone(260, 0.22, 'square', 0.08, 0, 140); },
    miss() { tone(300, 0.05, 'triangle', 0.05); },
    tick() { tone(1250, 0.04, 'square', 0.05); },
    over() { [784, 659, 523, 392].forEach((f, i) => tone(f, 0.24, 'triangle', 0.16, i * 0.13)); },
    start() { [523, 659, 784].forEach((f, i) => tone(f, 0.14, 'sine', 0.16, i * 0.07)); },
    bird() {
      if (!ctx || !enabled) return;
      const base = 2200 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) tone(base, 0.09, 'sine', 0.035, i * 0.12, base * (1.2 + Math.random() * 0.3));
    },
    ambient(on) {
      if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; }
      if (!on) return;
      const loop = () => { AU.bird(); ambientTimer = setTimeout(loop, 2500 + Math.random() * 5000); };
      ambientTimer = setTimeout(loop, 1500);
    }
  });
})();
