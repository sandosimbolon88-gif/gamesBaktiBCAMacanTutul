/* Pengaturan permainan. Aman diubah oleh panitia booth. */
window.JSMT_CONFIG = {
  durationSec: 180,            // lama satu sesi (detik)
  durationOptions: [60, 90, 120, 180],
  bonusPoints: 3,
  bonusFirstSec: 4,
  bonusPassSec: 9,
  bonusGapSec: 10,
  bonusMaxPasses: 2,
  clearBonusSec: 0,           // bonus waktu setiap stasiun bersih
  decoyPenaltySec: 2,         // pengurangan waktu jika memilih satwa pengecoh
  hintAfterSec: 12,           // daun berguguran sebagai petunjuk
  strongHintAfterSec: 20,     // lingkaran petunjuk
  idleTimeoutSec: 45,         // kembali ke layar awal jika tidak disentuh
  factAutoSec: 7,             // kartu fakta otomatis lanjut
  boardAutoReturnSec: 30,
  attractFactSec: 7,
  adminPin: '1234',           // PIN panel admin (ganti sebelum pameran!)
  nameMaxLen: 12,
  spamMisses: 5,              // anti tap asal-asalan
  spamWindowSec: 1.6,
  spamLockSec: 1.2,
  tolMouse: 6,                // toleransi klik (piksel layar)
  tolTouch: 18,               // toleransi sentuh (piksel layar)

  /* Tingkat kesulitan per stasiun.
     count: jumlah macan tutul [min, max], scale: ukuran, occl: tanaman penutup khusus tiap satwa (0-1),
     minVis: minimal bagian tubuh yang terlihat (0-1), black: peluang macan kumbang,
     minBlack: minimal macan kumbang, decoys: jumlah satwa pengecoh, cub: peluang ada anak macan tutul,
     density: kerapatan hutan (0-1), light: kekuatan cahaya belang-belang & bayangan kanopi (0-1),
     camo: kamuflase alami (daun kering, pakis kering, bunga oranye) 0-1,
     hide: peluang bersembunyi total (badan di balik daun / batang pohon, hanya sebagian terlihat),
     mode: siang | pagi | senja | malam */
  stages: [
    { count: [8, 9], scale: 0.50,  occl: 0.68, minVis: 0.30, black: 0.25, minBlack: 0, decoys: 7, cub: 0.45, density: 1.00, light: 0.86, camo: 0.90, hide: 0.32, mode: 'siang' },
    { count: [9, 10], scale: 0.54, occl: 0.56, minVis: 0.37, black: 0.35, minBlack: 1, decoys: 8, cub: 0.40, density: 0.94, light: 0.74, camo: 0.77, hide: 0.20, mode: 'pagi' },
    { count: [10, 11], scale: 0.50, occl: 0.62, minVis: 0.32, black: 0.3,  minBlack: 0, decoys: 8, cub: 0.60, density: 0.97, light: 0.82, camo: 0.85, hide: 0.26,  mode: 'siang' },
    { count: [10, 12], scale: 0.48, occl: 0.66, minVis: 0.30, black: 0.45, minBlack: 1, decoys: 8, cub: 0.35, density: 0.98, light: 0.52, camo: 0.88, hide: 0.30,  mode: 'malam' },
    { count: [11, 13], scale: 0.46, occl: 0.72, minVis: 0.27, black: 0.4,  minBlack: 0, decoys: 9, cub: 0.55, density: 1.00, light: 0.92, camo: 0.96, hide: 0.36,  mode: 'senja' },
    { count: [11, 13], scale: 0.44, occl: 0.78, minVis: 0.24, black: 0.4,  minBlack: 0, decoys: 9, cub: 0.65, density: 1,    light: 1,    camo: 1,    hide: 0.42,  mode: 'siang' }
  ],
  endless: { count: [10, 12], scale: 0.44, minScale: 0.40, occl: 0.80, minVis: 0.22, black: 0.45, minBlack: 0, decoys: 10, cub: 0.65,
    density: 1, light: 1, camo: 1, hide: 0.46, modes: ['pagi', 'malam', 'senja', 'siang'] }
};
