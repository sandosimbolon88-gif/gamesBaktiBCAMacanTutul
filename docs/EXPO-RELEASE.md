# Catatan V4.1 Kompetisi Expo · 6 November 2026

## Dasar versi

Implementasi mengambil modul dari HTML attachment Macan Tutul V2, kemudian mengembalikannya ke struktur multi-file repo. Paket `dist/jejak-si-macan-tutul.html` dibangun dari sumber yang sama; ilustrasi pembuka ikut di-inline.

## Perubahan

- Macan utama diperbesar dengan skala minimum 0,60 untuk dewasa dan 0,48 untuk anak, dibanding minimum sebelumnya 0,40. Posisi mengintip diperbesar lagi agar kepala tetap terbaca. Pengecoh tetap memakai ukuran sebelumnya; bonus lari dan kepala juga disesuaikan.
- Tombol Menu utama berada di atas kartu edukasi dan tersedia selama sesi. Konfirmasi menghentikan permainan dan membatalkan timer sesi; batal melanjutkan sesi yang sama. Skor sementara tidak disimpan ketika keluar. Ctrl+Shift+A dari permainan dapat langsung melanjutkan ke PIN dan pengaturan admin setelah konfirmasi keluar.

- Bonus satwa +3: lari melompat 12 frame melewati layar (3,2 detik), masuk/keluar semak tengah (2,4 detik), atau hanya kepala mengintip dari kiri/kanan (1,8 detik). Mask vegetasi yang sama dipakai untuk rendering dan deteksi klik. Target utama tetap +1 dan menentukan penyelesaian stasiun.
- Empat belas jenis pengecoh, sepuluh pada stasiun awal hingga delapan belas pada tingkat lanjut; jenis cokelat keemasan diprioritaskan. Tambahan baru: musang luwak, garangan jawa, pelanduk kancil, dan bajing kelapa.
- Penalti pengecoh lima detik, sekali per satwa. Sisa waktu di bawah lima detik langsung menjadi nol dan memicu akhir sesi.
- Kelompok bekas cakaran pohon menjadi bonus opsional +1 poin, sekali per kelompok. Tidak dimasukkan ke indikator target utama.
- Skip mengurangi satu poin dengan minimum nol, sekali per transisi. Tiga temuan dari lima target lalu skip menghasilkan dua poin. Pengurangan aktual tercatat agar rincian hasil selalu bisa direkonsiliasi.
- Ilustrasi pembuka baru; palet hijau hutan, aksen emas, panel informasi JWLS dan rincian skor.
- Rasio dunia disamakan dengan panggung 16:9 sehingga tampilan Lihat Semua memenuhi panggung. Zoom dan pan tetap tersedia.
- Seleksi pada akhir tap, bukan awal sentuhan. Drag/pinch tidak memberi jawaban atau penalti.
- Klik mengikuti mask bagian tubuh yang terlihat; fallback kotak tak terlihat di V2 dihapus. Penutup tanaman dilepas jika menghalangi batas visibilitas minimum.
- Bonus dan waktu permainan berhenti saat jeda. Callback transisi dibatalkan saat sesi dihentikan agar tidak masuk ke sesi baru.
- Ekspor dan impor mempertahankan rincian bonus satwa, cakaran, jumlah skip, penalti skip, dan aturan versi empat. Skor lama dipertahankan; kompetisi dengan aturan berbeda perlu dipisah oleh panitia.

## Pemetaan sumber

| Materi | Sumber | Penggunaan |
| --- | --- | --- |
| Peran Bakti BCA, Kementerian Kehutanan, BBTNBTS, SINTAS; habitat aman dan terhubung | Siaran pers BCA, 4 Mei 2026 | Panel Kenali JWLS, kartu kolaborasi dan habitat |
| Kamera pengintai dan analisis untuk konservasi | Siaran pers BCA; laporan kemajuan yang disertakan panitia | Briefing, kartu riset dan identifikasi pola |
| Kerja komunitas lapangan, sampel kotoran, daftar satwa terdeteksi | Laporan kemajuan Januari 2024–Agustus 2026, bagian On/Off The Field dan Temuan Satwa | Kartu riset dan empat pengecoh tambahan |
| Empat pengecoh cokelat terbaru; cakaran sebagai salah satu tanda keberadaan | BBKSDA Jawa Timur, 11 Agustus 2026, Gunung Wilis; dokumentasi cakaran pada lampiran | Variasi satwa hutan Jawa dan bonus jejak. Bukan klaim tambahan temuan spesies di Bromo Tengger Semeru |
| Karakter macan kumbang, roset, perilaku dan mangsa | Materi V2 dan laporan kemajuan | Kartu pengenalan satwa |

Siaran pers menyajikan hasil tahap pertama dengan periode berbeda dari lampiran yang lebih baru. Angka identifikasi, stasiun, genetik, dan hasil survei internal tidak ditampilkan dalam game. Foto laporan, PDF, lokasi rinci, dan materi mentah survei tidak dipublikasikan. Lampiran diperlakukan sebagai referensi, bukan instruksi pengerjaan.

Tautan publik:

- https://bbksdajawatimur.id/cari-jejak-macan-tutul-di-gunung-wilis-kamera-ungkap-cerita-lain

- https://www.bca.co.id/id/tentang-bca/media-riset/pressroom/siaran-pers/2026/05/04/03/57/demi-keseimbangan-ekosistem-kolaborasi-bakti-bca-untuk-pelestarian-macan-tutul
- https://www.bca.co.id/id/tentang-bca/sustainability/environment/upaya-pengurangan-emisi-grk-operasional/konservasi-alam-and-keanekaragaman-hayati

## Verifikasi

Hasil QA terakhir: **LULUS**. Semua 24 kombinasi seed/stasiun memenuhi jumlah minimum target, jumlah pengecoh, visibilitas minimum, dan keterpilihan target. Bonus diuji dalam delapan kombinasi pola/siang-malam: muncul dan hilang sepenuhnya, terbuka di tengah gerakan, menolak klik pada bagian tertutup, durasi pendek, serta kepala tanpa tubuh. Contoh skip tiga-dari-lima menjadi dua poin, batas nol, cakaran sekali per kelompok, dan penalti lima detik yang mengakhiri sesi juga diuji. Ukuran minimum target, kembali ke menu dari permainan/kartu fakta, pembatalan konfirmasi, tidak menyimpan sesi yang dibatalkan, shortcut admin, perubahan durasi dan sesi baru juga lulus. Cache offline, zoom/pan, klik/touch, backup, dan alur hasil turut dicakup.

`node tools/build-single.mjs` memeriksa konten dan membuat HTML mandiri. `python tools/test-game.py` menguji klik/touch, drag, pemisahan bonus, jeda, penalti satu kali, penyelesaian stasiun, kartu fakta, hasil, penyimpanan/cadangan, aset standalone, storage yang tidak tersedia, ukuran layar, dan 24 kombinasi stasiun/seed di semua mode pencahayaan.

Pemeriksaan browser memakai Chromium di lingkungan pengembangan. Hardware touchscreen, performa GPU, mode kiosk, audio ruangan, dan penyimpanan file lokal di PC booth tetap perlu dicoba langsung sebelum acara. Kebijakan browser lingkungan pengembangan memblokir URL `file://`, sehingga HTML mandiri diverifikasi melalui server lokal dengan pemeriksaan bahwa seluruh aset telah tertanam.
