/* Pengaturan permainan. Aman diubah oleh panitia booth. */
window.JSMT_CONFIG = {
  durationSec: 90,            // lama satu sesi (detik)
  durationOptions: [60, 90, 120],
  clearBonusSec: 5,           // bonus waktu setiap stasiun bersih
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
    { count: [3, 4], scale: 0.6,  occl: 0.45, minVis: 0.42, black: 0.25, minBlack: 0, decoys: 2, cub: 0,   density: 0.65, light: 0.55, camo: 0.5,  hide: 0.15, mode: 'siang' },
    { count: [3, 4], scale: 0.56, occl: 0.52, minVis: 0.38, black: 0.35, minBlack: 1, decoys: 3, cub: 0.3, density: 0.75, light: 0.65, camo: 0.6,  hide: 0.25, mode: 'pagi' },
    { count: [4, 5], scale: 0.52, occl: 0.58, minVis: 0.33, black: 0.3,  minBlack: 0, decoys: 3, cub: 0.6, density: 0.85, light: 0.75, camo: 0.75, hide: 0.3,  mode: 'siang' },
    { count: [3, 4], scale: 0.55, occl: 0.52, minVis: 0.34, black: 0.45, minBlack: 1, decoys: 3, cub: 0,   density: 0.85, light: 0.35, camo: 0.55, hide: 0.3,  mode: 'malam' },
    { count: [4, 5], scale: 0.48, occl: 0.64, minVis: 0.28, black: 0.4,  minBlack: 0, decoys: 4, cub: 0.4, density: 0.92, light: 0.82, camo: 0.88, hide: 0.4,  mode: 'senja' },
    { count: [4, 6], scale: 0.45, occl: 0.7,  minVis: 0.26, black: 0.4,  minBlack: 0, decoys: 4, cub: 0.4, density: 1,    light: 0.9,  camo: 0.95, hide: 0.5,  mode: 'siang' }
  ],
  endless: { count: [4, 6], scale: 0.43, minScale: 0.36, occl: 0.72, minVis: 0.24, black: 0.45, minBlack: 0, decoys: 5, cub: 0.4,
    density: 1, light: 1, camo: 1, hide: 0.55, modes: ['pagi', 'malam', 'senja', 'siang'] }
};
