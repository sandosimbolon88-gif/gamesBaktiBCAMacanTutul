# Catatan V3 Expo · 6 November 2026

## Dasar versi

Implementasi mengambil modul dari HTML attachment Macan Tutul V2, kemudian mengembalikannya ke struktur multi-file repo. Paket `dist/jejak-si-macan-tutul.html` dibangun dari sumber yang sama; ilustrasi pembuka ikut di-inline.

## Perubahan

- Macan bergerak menjadi bonus opsional dengan +3 poin dan animasi kaki delapan frame. Target utama tetap +1 dan menentukan penyelesaian stasiun.
- Sepuluh jenis pengecoh, penempatan lebih padat, dan pemilihan jenis diacak sebelum pengulangan.
- Ilustrasi pembuka baru; palet hijau hutan, aksen emas, panel informasi JWLS dan rincian skor.
- Rasio dunia disamakan dengan panggung 16:9 sehingga tampilan Lihat Semua memenuhi panggung. Zoom dan pan tetap tersedia.
- Seleksi pada akhir tap, bukan awal sentuhan. Drag/pinch tidak memberi jawaban atau penalti.
- Klik mengikuti mask bagian tubuh yang terlihat; fallback kotak tak terlihat di V2 dihapus. Penutup tanaman dilepas jika menghalangi batas visibilitas minimum.
- Bonus dan waktu permainan berhenti saat jeda. Callback transisi dibatalkan saat sesi dihentikan agar tidak masuk ke sesi baru.
- Ekspor dan impor mempertahankan rincian bonus. Skor lama dipertahankan; kompetisi dengan aturan berbeda perlu dipisah oleh panitia.

## Pemetaan sumber

| Materi | Sumber | Penggunaan |
| --- | --- | --- |
| Peran Bakti BCA, Kementerian Kehutanan, BBTNBTS, SINTAS; habitat aman dan terhubung | Siaran pers BCA, 4 Mei 2026 | Panel Kenali JWLS, kartu kolaborasi dan habitat |
| Kamera pengintai dan analisis untuk konservasi | Siaran pers BCA; laporan kemajuan yang disertakan panitia | Briefing, kartu riset dan identifikasi pola |
| Kerja komunitas lapangan, sampel kotoran, daftar satwa terdeteksi | Laporan kemajuan Januari 2024–Agustus 2026, bagian On/Off The Field dan Temuan Satwa | Kartu riset dan empat pengecoh tambahan |
| Karakter macan kumbang, roset, perilaku dan mangsa | Materi V2 dan laporan kemajuan | Kartu pengenalan satwa |

Siaran pers menyajikan hasil tahap pertama dengan periode berbeda dari lampiran yang lebih baru. Angka identifikasi, stasiun, genetik, dan hasil survei internal tidak ditampilkan dalam game. Foto laporan, PDF, lokasi rinci, dan materi mentah survei tidak dipublikasikan. Lampiran diperlakukan sebagai referensi, bukan instruksi pengerjaan.

Tautan publik:

- https://www.bca.co.id/id/tentang-bca/media-riset/pressroom/siaran-pers/2026/05/04/03/57/demi-keseimbangan-ekosistem-kolaborasi-bakti-bca-untuk-pelestarian-macan-tutul
- https://www.bca.co.id/id/tentang-bca/sustainability/environment/upaya-pengurangan-emisi-grk-operasional/konservasi-alam-and-keanekaragaman-hayati

## Verifikasi

Hasil QA terakhir: **LULUS**. Semua 24 kombinasi seed/stasiun memenuhi jumlah minimum target, jumlah pengecoh, visibilitas minimum, dan keterpilihan target. Cache offline, zoom/pan, klik/touch, backup, dan alur hasil juga lulus.

`node tools/build-single.mjs` memeriksa konten dan membuat HTML mandiri. `python tools/test-game.py` menguji klik/touch, drag, pemisahan bonus, jeda, penalti satu kali, penyelesaian stasiun, kartu fakta, hasil, penyimpanan/cadangan, aset standalone, storage yang tidak tersedia, ukuran layar, dan 24 kombinasi stasiun/seed di semua mode pencahayaan.

Pemeriksaan browser memakai Chromium di lingkungan pengembangan. Hardware touchscreen, performa GPU, mode kiosk, audio ruangan, dan penyimpanan file lokal di PC booth tetap perlu dicoba langsung sebelum acara. Kebijakan browser lingkungan pengembangan memblokir URL `file://`, sehingga HTML mandiri diverifikasi melalui server lokal dengan pemeriksaan bahwa seluruh aset telah tertanam.
