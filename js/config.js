/* Pengaturan permainan. Aman diubah oleh panitia booth. */
window.JSMT_CONFIG = {
  durationSec: 90,            // lama satu sesi (detik)
  durationOptions: [60, 90, 120],
  clearBonusSec: 5,           // bonus waktu setiap stasiun bersih
  decoyPenaltySec: 2,         // pengurangan waktu jika memilih satwa pengecoh
  hintAfterSec: 14,           // daun berguguran sebagai petunjuk
  strongHintAfterSec: 24,     // lingkaran petunjuk
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
     count: jumlah macan tutul [min, max], scale: ukuran, occl: seberapa tertutup daun (0-1),
     minVis: minimal bagian tubuh yang terlihat, black: peluang macan kumbang,
     minBlack: minimal macan kumbang, decoys: jumlah satwa pengecoh, cub: peluang ada anak macan tutul,
     camo: kamuflase alami (daun kering, bayangan, bunga oranye) 0-1,
     mode: siang | pagi | senja | malam */
  stages: [
    { count: [3, 3], scale: 0.82, occl: 0.18, minVis: 0.66, black: 0,    minBlack: 0, decoys: 1, cub: 0,   camo: 0, mode: 'siang' },
    { count: [3, 4], scale: 0.74, occl: 0.32, minVis: 0.56, black: 0.35, minBlack: 1, decoys: 2, cub: 0,   camo: 0.3, mode: 'pagi' },
    { count: [4, 5], scale: 0.68, occl: 0.42, minVis: 0.5,  black: 0.3,  minBlack: 0, decoys: 2, cub: 0.7, camo: 0.5, mode: 'siang' },
    { count: [3, 4], scale: 0.7,  occl: 0.38, minVis: 0.5,  black: 0.45, minBlack: 1, decoys: 2, cub: 0,   camo: 0.4, mode: 'malam' },
    { count: [4, 5], scale: 0.62, occl: 0.5,  minVis: 0.42, black: 0.4,  minBlack: 0, decoys: 3, cub: 0.4, camo: 0.7, mode: 'senja' },
    { count: [4, 6], scale: 0.58, occl: 0.56, minVis: 0.38, black: 0.4,  minBlack: 0, decoys: 3, cub: 0.4, camo: 0.8, mode: 'siang' }
  ],
  endless: { count: [4, 6], scale: 0.56, minScale: 0.46, occl: 0.62, minVis: 0.34, black: 0.45, minBlack: 0, decoys: 4, cub: 0.4, camo: 1,
    modes: ['pagi', 'malam', 'senja', 'siang'] }
};
