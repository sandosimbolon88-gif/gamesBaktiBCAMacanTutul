# Jejak Si Macan Tutul · V3 Expo

Game edukasi Bakti BCA: cari macan tutul jawa di hutan Bromo Tengger Semeru, kenali satwa lain, dan pelajari Java Wide Leopard Survey (JWLS).

Versi ini melanjutkan **attachment Macan Tutul V2**, termasuk durasi awal tiga menit, hutan lebat, zoom, pergantian stasiun, dan kartu fakta yang dibaca tanpa mengurangi waktu permainan.

## Menjalankan di booth

1. Salin **`dist/jejak-si-macan-tutul.html`** ke PC booth.
2. Buka dengan Chrome atau Edge. Semua gambar, kode, dan materi permainan sudah berada di dalam file; internet tidak diperlukan untuk bermain.
3. Pilih tombol layar penuh atau tekan F11. Gunakan monitor/touchscreen landscape.
4. Coba satu sesi di perangkat booth sebelum acara. Nonaktifkan sleep dan screen saver melalui pengaturan PC.

Bacaan siaran pers pada menu **Kenali JWLS** membutuhkan internet. Permainan dan kartu edukasi tetap berjalan tanpa koneksi. Penyimpanan skor untuk file lokal bergantung pada pengaturan browser: selalu uji simpan dan cadangan di PC tujuan.

## Aturan

- **Target utama: +1 poin** untuk tiap macan tutul atau macan kumbang. Temukan semuanya untuk menyelesaikan stasiun.
- **Bonus lintasan: +3 poin** untuk macan bergerak bertanda BONUS. Gerak kaki memiliki delapan frame animasi. Bonus tidak masuk indikator target utama, tidak wajib ditemukan, dan tidak memberi penalti jika terlewat.
- Bonus pertama muncul setelah empat detik waktu main aktif. Maksimal dua lintasan per stasiun, masing-masing sembilan detik. Kartu fakta dan jeda stasiun menghentikan jam bonus.
- Ada **sepuluh jenis pengecoh**: kucing kuwuk, kijang muncak, ayam hutan merah, landak jawa, lutung jawa, elang jawa, binturong, trenggiling peusing, linsang, dan monyet ekor panjang. Stasiun awal memuat tujuh pengecoh; kesulitan selanjutnya menambah jumlahnya.
- Salah memilih satwa mengurangi dua detik, sekali per satwa. Klik berulang pada satwa yang sama tidak menambah penalti.
- Scroll atau cubit untuk zoom, geser untuk menjelajah, dan pilih **Lihat Semua** untuk kembali ke tampilan penuh. Menggeser dan mencubit tidak dihitung sebagai jawaban.
- **Menyerah & ganti stasiun** melewati kamera tanpa mengisi target yang belum ditemukan.
- Hasil menampilkan temuan utama dan poin bonus secara terpisah. Skor total = temuan utama + poin bonus.

Kepadatan satwa dan pertemuan dalam game merupakan simulasi edukasi, bukan gambaran jumlah satwa di satu lokasi.

## Panel panitia dan data

Ketuk pojok kiri atas beranda lima kali, atau tekan **Ctrl+Shift+A**. PIN awal: **1234**; ganti `adminPin` pada `js/config.js` lalu bangun ulang sebelum acara. PIN ini adalah pengunci antarmuka lokal, bukan autentikasi server.

Panel menyediakan durasi **60 / 90 / 120 / 180 detik**, suara, ekspor CSV, cadangan JSON, pemulihan cadangan, dan penghapusan skor. Durasi bawaan pada perangkat baru adalah **180 detik**. Pengaturan lama yang masih valid dipertahankan.

Skor hanya tersimpan di browser/perangkat tersebut. Untuk pindah PC:

1. Di PC lama, pilih **Simpan cadangan** dan salin berkas JSON bersama HTML game.
2. Di PC baru, buka game, pilih **Muat cadangan**, lalu pilih JSON. Impor menggabungkan skor dan mengabaikan ID yang sudah ada.
3. Ekspor CSV untuk rekap; kolom temuan utama, jumlah bonus, poin bonus, dan versi aturan disertakan.

Skor versi lama tidak dihapus otomatis. Karena V3 menambahkan poin bonus, panitia sebaiknya memulai papan kompetisi baru melalui panel setelah menyimpan cadangan. Jangan membandingkan skor dengan aturan berbeda sebagai satu kompetisi.

## Mengembangkan

Tidak ada dependency runtime atau build framework. Untuk versi multi-file:

```sh
python -m http.server 8080
```

Buka `http://localhost:8080`. Service worker menyimpan aset untuk penggunaan offline setelah instalasi cache berhasil. Untuk distribusi satu file:

```sh
node tools/build-single.mjs
```

Pemeriksa konten mencegah digit dalam `js/content.js` agar angka hasil survei internal tidak ikut masuk tanpa sengaja. Metadata tanggal sumber pada panel informasi terpisah dari pemeriksa ini.

Jalankan regresi browser dengan Python Playwright dan Chromium yang sudah terpasang:

```sh
python tools/test-game.py
```

Gunakan `CHROMIUM_PATH` jika executable bukan `/usr/bin/chromium`; gunakan `JSMT_TEST_OUTPUT` untuk mengganti folder hasil QA. Pengujian memulai server sementara dan tidak memakai profil browser pengunjung.

Struktur utama:

- `js/scene.js`: penempatan satwa, lapisan tanaman, mask tubuh yang terlihat.
- `js/bonus.js`: lintasan opsional, waktu aktif, animasi dan deteksi bonus.
- `js/game.js`: skor, penalti, transisi, timer dan efek.
- `js/content.js`: aturan dan kartu edukasi.
- `js/art/`: ilustrasi vektor satwa dan hutan; `assets/forest-hero.webp`: ilustrasi pembuka.
- `docs/EXPO-RELEASE.md`: perubahan, sumber, dan batas verifikasi.

## Sumber edukasi

Laporan yang diberikan panitia berjudul **Kajian Struktur Populasi Macan Tutul Jawa serta Preferensi Satwa Mangsanya di Bentang Alam Bromo Tengger Semeru, Jawa Timur — Laporan Kemajuan Januari 2024–Agustus 2026**. Hanya materi kualitatif dipakai; PDF dan angka survei internal tidak dimasukkan ke repo.

Sumber publik: [siaran pers BCA, 4 Mei 2026](https://www.bca.co.id/id/tentang-bca/media-riset/pressroom/siaran-pers/2026/05/04/03/57/demi-keseimbangan-ekosistem-kolaborasi-bakti-bca-untuk-pelestarian-macan-tutul) dan [Konservasi Alam & Keanekaragaman Hayati BCA](https://www.bca.co.id/id/tentang-bca/sustainability/environment/upaya-pengurangan-emisi-grk-operasional/konservasi-alam-and-keanekaragaman-hayati).

Ilustrasi pembuka dibuat dengan bantuan AI; satwa permainan memakai ilustrasi programatis. Tulisan Bakti BCA merupakan teks identitas, bukan aset logo resmi. Gunakan master logo dari tim brand jika diperlukan untuk final produksi acara.
