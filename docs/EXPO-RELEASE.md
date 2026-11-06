# Catatan V6 Kompetisi Expo · 6 November 2026

## Dasar versi

Implementasi mengambil modul dari HTML attachment Macan Tutul V2, kemudian mengembalikannya ke struktur multi-file repo. Paket `dist/jejak-si-macan-tutul.html` dibangun dari sumber yang sama; ilustrasi pembuka ikut di-inline.

## Perubahan

- Macan utama kini memiliki 12 pose statis; tujuh tambahan menggambar ulang kepala, tubuh, tungkai dan ekor untuk mengendap, mengendus, meregangkan tubuh, merawat bulu, meringkuk, mencakar, dan memanjat. Prioritas wajib di dahan dihapus. Pemilihan pose memakai daftar acak tanpa mengulang sebelum daftar habis; anak dapat memakai pose berbeda.
- Empat belas jenis pengecoh mendukung 51 variasi pose. `js/art/animal-poses.js` menggambar postur menurut kelompok anatomi, dengan penempatan sesuai tanah atau dahan. Sprite yang sama dipakai untuk render dan mask klik.
- Penempatan macan mengacak pola tersebar, berkelompok, atau campuran. Pose batang dipasang pada koordinat pohon sebenarnya; penutup batang/pakis menyesuaikan posisi dan pose. Jumlah satwa dan batas ukuran tetap dipertahankan.

- Macan utama diperbesar dengan skala minimum 0,60 untuk dewasa dan 0,48 untuk anak, dibanding minimum sebelumnya 0,40. Posisi mengintip diperbesar lagi agar kepala tetap terbaca. Pengecoh tetap memakai ukuran sebelumnya; bonus lari dan kepala juga disesuaikan.
- Tombol Menu utama berada di atas kartu edukasi dan tersedia selama sesi. Konfirmasi menghentikan permainan dan membatalkan timer sesi; batal melanjutkan sesi yang sama. Skor sementara tidak disimpan ketika keluar. Ctrl+Shift+A dari permainan dapat langsung melanjutkan ke PIN dan pengaturan admin setelah konfirmasi keluar.

- Bonus satwa +5: lari melompat 12 frame melewati layar (3,2 detik), masuk/keluar semak tengah (2,4 detik), atau hanya kepala mengintip dari kiri/kanan (1,8 detik). Mask vegetasi yang sama dipakai untuk rendering dan deteksi klik. Target utama memberi +3 dan menentukan penyelesaian stasiun. Urutan pola bonus diacak; jeda pertama tiga hingga lima detik, jeda berikutnya enam hingga delapan detik.
- Empat belas jenis pengecoh, sembilan hingga enam belas per stasiun; jenis cokelat keemasan diprioritaskan. Tambahan baru: musang luwak, garangan jawa, pelanduk kancil, dan bajing kelapa.
- Komposisi stasiun diacak: 2–3 macan dengan 12–16 pengecoh; 3–4 dengan 10–14; atau 4–6 dengan 9–13. Jumlah target tidak terus meningkat di tingkat lanjut. Hutan memakai seed baru, dengan kepadatan konfigurasi minimal 0,94 serta ukuran minimum macan yang tetap terbaca.
- Setiap klik pengecoh mengurangi dua poin dan lima detik, termasuk klik ulang. Skor tidak menjadi negatif; potongan poin aktual tercatat terpisah dari jumlah klik salah. Sisa waktu di bawah lima detik langsung menjadi nol dan memicu akhir sesi.
- Kelompok bekas cakaran pohon menjadi bonus opsional +1 poin, sekali per kelompok. Tidak dimasukkan ke indikator target utama.
- Skip mengurangi satu poin dengan minimum nol, sekali per transisi. Tiga temuan dari lima target menghasilkan sembilan poin; setelah skip menjadi delapan poin. Pengurangan aktual tercatat agar rincian hasil selalu bisa direkonsiliasi.
- Ilustrasi pembuka baru; palet hijau hutan, aksen emas, panel informasi JWLS dan rincian skor.
- Rasio dunia disamakan dengan panggung 16:9 sehingga tampilan Lihat Semua memenuhi panggung. Zoom dan pan tetap tersedia.
- Seleksi pada akhir tap, bukan awal sentuhan. Drag/pinch tidak memberi jawaban atau penalti.
- Klik mengikuti mask bagian tubuh yang terlihat; fallback kotak tak terlihat di V2 dihapus. Penutup tanaman dilepas jika menghalangi batas visibilitas minimum.
- Bonus dan waktu permainan berhenti saat jeda. Callback transisi dibatalkan saat sesi dihentikan agar tidak masuk ke sesi baru.
- Ekspor dan impor mempertahankan rincian bonus satwa, cakaran, jumlah skip, penalti skip, poin temuan utama, penalti pengecoh, dan aturan versi enam. Skor lama dipertahankan; kompetisi dengan aturan berbeda perlu dipisah oleh panitia.

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

Hasil QA terakhir: **LULUS**. Katalog 75 sprite (24 variasi pose/warna macan dan 51 pose pengecoh) diperiksa agar siluet tiap pose berbeda, mata memiliki koordinat valid, dan gambar tidak terpotong batas canvas. Seluruh 12 pose macan serta 51 variasi pengecoh muncul dalam 48 kombinasi stasiun; pola dekat dan tersebar teramati. Semua 48 kombinasi seed/stasiun memenuhi jumlah minimum target, jumlah pengecoh, visibilitas minimum, dan keterpilihan target. Bonus diuji dalam delapan kombinasi pola/siang-malam: muncul dan hilang sepenuhnya, terbuka di tengah gerakan, menolak klik pada bagian tertutup, durasi pendek, serta kepala tanpa tubuh. Contoh skip tiga-dari-lima menjadi delapan poin, batas nol, cakaran sekali per kelompok, temuan +3, penalti −2 poin/−5 detik per klik, serta rekonsiliasi nilai dalam CSV/cadangan juga diuji. Ukuran minimum target, kembali ke menu dari permainan/kartu fakta, pembatalan konfirmasi, tidak menyimpan sesi yang dibatalkan, shortcut admin, perubahan durasi dan sesi baru juga lulus. Cache offline, zoom/pan, klik/touch, backup, dan alur hasil turut dicakup.

`node tools/build-single.mjs` memeriksa konten dan membuat HTML mandiri. `python tools/test-game.py` menguji klik/touch, drag, pemisahan bonus, jeda, penalti per klik, penyelesaian stasiun, kartu fakta, hasil, penyimpanan/cadangan, aset standalone, storage yang tidak tersedia, ukuran layar, dan 48 kombinasi stasiun/seed di semua mode pencahayaan.

Pemeriksaan browser memakai Chromium di lingkungan pengembangan. Hardware touchscreen, performa GPU, mode kiosk, audio ruangan, dan penyimpanan file lokal di PC booth tetap perlu dicoba langsung sebelum acara. Kebijakan browser lingkungan pengembangan memblokir URL `file://`, sehingga HTML mandiri diverifikasi melalui server lokal dengan pemeriksaan bahwa seluruh aset telah tertanam.
