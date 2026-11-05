# Rencana Game "Cari Macan Tutul" — Bakti BCA × SINTAS Indonesia (JWLS)

> Status: **versi pertama selesai dibangun** (lihat README.md untuk cara menjalankan).
> Catatan: dua temuan kualitatif di §5 "Perlu konfirmasi" TIDAK dipakai di game sampai dikonfirmasi tim.

## 0. Keputusan tim (final)

| Topik | Keputusan |
|---|---|
| Nama game | **Jejak Si Macan Tutul** |
| Logo | **Tanpa logo resmi** dan tanpa logo macan tutul/SINTAS. Judul cukup berupa teks. |
| Gaya gambar | **Kartun**, tapi anatomi dan perilaku macan tutul tetap sesuai alam: roset di badan, bintik padat di kepala dan kaki, pupil bulat, ekor panjang berujung gelap, macan kumbang dengan roset samar. |
| Perangkat | **PC dengan mouse dan layar sentuh**, keduanya didukung. |
| Papan skor | **Satu perangkat** (`localStorage`) dengan ekspor CSV. |
| Data pemain | Nama panggilan saja. |
| Bahasa | Bahasa Indonesia. |

## 1. Ringkasan konsep

Game *hidden object* (cari benda tersembunyi) untuk booth pameran. Pemain berperan sebagai
**peneliti Java-Wide Leopard Survey (JWLS)** yang memeriksa rekaman **kamera pengintai** di hutan
Bromo Tengger Semeru. Di tiap layar (disebut "Stasiun Kamera") ada sejumlah **macan tutul jawa** yang
tersembunyi di antara pepohonan, dan jumlahnya acak.

- Kalau macan tutul ditap: muncul **highlight** (lingkaran menyala dan cap jejak kaki) dan **skor +1**.
- Kalau semua macan tutul di layar sudah ketemu: muncul kartu fakta singkat, lalu **ganti ke hutan berikutnya**.
- Waktu bermain dibatasi. Skor akhir masuk ke **papan skor (leaderboard)**.
- Pesan edukasinya disisipkan di sela permainan, tanpa angka dari data survei (lihat §5).

Nama game: **"Jejak Si Macan Tutul"**.

## 2. Alur layar

```
[Attract / Idle] → [Briefing] → [Main: Stasiun 1 → fakta → Stasiun 2 → fakta → …] → [Waktu habis]
       ↑                                                                                  ↓
       └──────────── (idle timeout) ←── [Papan Skor] ←── [Input Nama] ←── [Hasil + Ajakan aksi]
```

1. **Attract screen**: animasi hutan berjalan sendiri, judul game (teks, tanpa logo), fakta yang berganti-ganti,
   tulisan besar "SENTUH UNTUK MULAI", dan Top 5 hari ini. Layar ini menarik pengunjung yang lewat.
2. **Briefing** (sekitar 5 detik, bisa di-skip): "Kamu peneliti JWLS! Kamera pengintai sudah dipasang di hutan.
   Temukan semua macan tutul jawa, termasuk **macan kumbang** yang hitam!"
3. **Bermain**: timer berjalan, HUD menampilkan skor, sisa waktu, dan "Ditemukan x/y" untuk stasiun ini.
4. **Kartu fakta** di antara stasiun (sekitar 3 detik, timer dijeda).
5. **Hasil**: total macan tutul ditemukan, peringkat, dan satu ajakan aksi konservasi.
6. **Input nama**: keyboard di layar dengan nama panggilan maksimal sekitar 12 karakter dan filter kata kasar sederhana.
7. **Papan skor**: Top 10 **Hari Ini** dan **Sepanjang Pameran**. Kalau dibiarkan, kembali ke attract screen.
8. **Idle timeout**: kalau tidak disentuh sekitar 30–45 detik di layar mana pun, game kembali ke attract screen.

## 3. Mekanik permainan

| Aspek | Rencana (default, bisa diubah lewat config) |
|---|---|
| Durasi sesi | 90 detik |
| Jumlah macan tutul per stasiun | acak, 3–6 (makin sulit di stasiun lanjut) |
| Tap benar | highlight dan skor +1, daun di sekitarnya tersibak, suara "klik kamera" |
| Bersihkan stasiun | bonus waktu kecil, kartu fakta, lanjut ke hutan baru |
| Tap salah (area kosong) | getar kecil di layar. Kalau tap asal-asalan beruntun, game "tenang sejenak" ±1 detik (anti-spam) |
| Tap satwa lain (decoy) | popup edukasi, misalnya "Itu **kucing kuwuk**, salah satu mangsa macan tutul!" dan waktu −2 detik |
| Petunjuk (hint) | kalau 15 detik tidak menemukan apa-apa, semak di dekat satu macan tutul bergoyang pelan |
| Skor | jumlah macan tutul ditemukan. Kalau seri, yang lebih dulu mencapai skor itu menang |

**Kenaikan kesulitan per stasiun:**
- Stasiun awal: macan tutul lebih besar dan sedikit tertutup, latar siang hari.
- Lanjut: lebih kecil, lebih tertutup daun, ada **macan kumbang di bayangan**, dan lebih banyak decoy.
- Stasiun spesial **"Rekaman Malam (IR)"**: hitam-putih seperti kamera inframerah, cari **mata yang menyala**.
  Mata menyala ini mengacu pada foto kamera pengintai asli di laporan.

**Variasi pose macan tutul** (diambil dari perilaku di laporan):
berbaring di dahan dengan kaki menjuntai, mengintip dari semak, berjalan, duduk di bawah pohon,
ekor menjuntai dari dahan, mencakar pohon, dan wajah penasaran yang dekat sekali ke kamera.

**Satwa decoy dari laporan (edukatif):** kucing kuwuk (mirip tapi kecil, jadi pengecoh utama),
kijang muncak, ayam hutan merah, landak jawa, lutung jawa, elang jawa, binturong, trenggiling, paok pancawarna.

## 4. Pendekatan visual & teknis

### Gambar hutan: digenerate otomatis oleh kode (rekomendasi)
Setiap stasiun dirakit acak dari kumpulan aset ilustrasi vektor: langit dan kabut, siluet pohon jauh,
batang pohon, liana, pakis, semak, lalu daun di lapisan depan. Macan tutul diletakkan di "slot"
yang masuk akal (dahan, semak, tanah), lalu sebagian ditutup daun di lapisan depan.

- Kelebihan: gambar tidak pernah habis dan selalu beda, jumlah macan tutul acak dengan alami,
  posisi untuk deteksi tap diketahui pasti, tidak ada masalah lisensi foto, dan ringan dijalankan offline.
- Gaya: **ilustrasi flat/vektor** dengan nuansa hijau hutan dan aksen biru BCA.
  Kalau ada ilustrator, aset pohon, daun, dan macan tutul bisa diganti dengan karya ilustrator tanpa mengubah kode.
- Alternatif lain: (a) ilustrasi manual oleh desainer dengan titik macan tutul ditandai satu per satu,
  jumlahnya terbatas dan randomnya hanya urutan. (b) Foto kamera pengintai asli dari SINTAS, butuh izin
  dan penandaan manual, dan cukup sulit dijadikan game cari-cari.

### HUD bergaya kamera pengintai
Sudut bingkai viewfinder, titik "● REC", label "Stasiun Kamera", dan efek *shutter* saat macan tutul ditemukan.

### Teknologi
- **Web app statis** (HTML, CSS, JavaScript, Canvas 2D), tanpa server.
  Jalan di Chrome mode kiosk atau fullscreen, di layar sentuh, tablet, maupun laptop.
- **Offline-first**: semua aset lokal. Bisa dipasang sebagai PWA agar tetap jalan tanpa internet di lokasi pameran.
- **Papan skor**: disimpan di perangkat (`localStorage`), dengan tombol **ekspor CSV** sebagai cadangan.
  Kalau ada beberapa perangkat yang harus berbagi satu papan skor, perlu backend kecil (lihat Pertanyaan).
- **Panel admin tersembunyi** (tap pojok kiri atas layar awal 5× lalu PIN, atau Ctrl+Shift+A): reset papan skor harian, ekspor CSV, atur durasi dan
  tingkat kesulitan, uji suara.
- **Pengamanan kiosk**: nonaktifkan zoom, cubit, klik kanan, seleksi teks, dan tekan lama. Layar dijaga tetap
  menyala (Wake Lock). Ada mode layar penuh dan pemulihan otomatis kalau terjadi error.
- **Suara**: suasana hutan (opsional), klik kamera, suara "ketemu!", dan bunyi waktu hampir habis.
  Ada tombol mute untuk booth yang bising.

### Struktur proyek (rencana)
```
index.html
css/style.css
js/main.js          # state machine layar (attract → briefing → play → result → leaderboard)
js/scene.js         # generator hutan (RNG ber-seed, slot penempatan, tingkat kesulitan)
js/sprites.js       # gambar vektor: pohon, daun, pakis, macan tutul (tutul & kumbang), satwa decoy
js/input.js         # deteksi tap / hit-test, anti-spam
js/hud.js           # timer, skor, efek highlight
js/leaderboard.js   # simpan / urut / ekspor CSV / reset harian
js/audio.js         # efek suara (WebAudio)
js/content.js       # SEMUA teks edukasi & UI (mudah diedit tim)
js/config.js        # durasi, jumlah macan per stasiun, dsb.
assets/             # ikon aplikasi (tanpa logo resmi)
tools/check-no-digits.mjs   # pemeriksa otomatis: teks edukasi tidak boleh mengandung angka
```

## 5. Konten edukasi (TANPA angka)

Aturan: **tidak ada angka dari laporan** (jumlah individu, kamera, gambar, sampel, persentase, indeks,
tanggal). Untuk menjaminnya, ada skrip `tools/check-no-digits.mjs` yang **menggagalkan build**
kalau ada digit di teks edukasi. Angka yang tetap muncul hanya angka permainan
(skor, timer, "x/y"), bukan data survei.

### Draf fakta (dari laporan + sumber publik)
1. Macan tutul jawa adalah **satu-satunya kucing besar yang tersisa di Pulau Jawa**, karnivora besar terakhir
   setelah harimau jawa punah.
2. Macan tutul jawa **hanya ada di Indonesia**, endemik Pulau Jawa dan beberapa pulau kecil di sekitarnya.
3. Statusnya **Kritis (Critically Endangered)** menurut IUCN dan **dilindungi undang-undang** di Indonesia.
4. **Macan kumbang yang hitam juga macan tutul jawa!** Tutulnya tetap ada, hanya tersamar.
5. Nama ilmiahnya *Panthera pardus melas*. Kata "melas" berarti hitam.
6. **Pola tutul tiap individu berbeda, seperti sidik jari.** Dari foto kamera pengintai, peneliti bisa
   mengenali setiap individu.
7. Macan tutul dewasa **hidup menyendiri (soliter)**. Mereka bertemu saat kawin, dan induk betina membesarkan anaknya.
8. Macan tutul suka **beristirahat di tanah, di bawah semak, atau berbaring di dahan besar** dengan kaki menjuntai.
9. Macan tutul membuat **cakaran di pohon dan kaisan di tanah** sebagai tanda keberadaannya.
10. Macan tutul **membersihkan diri** dengan menjilati tubuhnya, seperti kucing di rumah.
11. Macan tutul jawa sering **penasaran dengan kamera pengintai**. Kadang wajahnya terekam dari dekat sekali!
12. Mangsanya antara lain **kijang muncak, ayam hutan merah, kucing kuwuk, dan landak jawa**.
13. Sebagai **predator puncak**, macan tutul menjaga keseimbangan hutan. Melindunginya berarti melindungi
    seluruh hutan dan satwa di dalamnya.
14. Macan tutul jawa paling banyak ditemukan di **hutan yang masih terjaga**.
15. Peneliti memakai **kamera pengintai** dan mengumpulkan **kotoran** macan tutul. Dari DNA di kotoran itu
    bisa diketahui jenis kelamin dan makanannya.
16. Hutan Bromo Tengger Semeru juga rumah bagi **elang jawa, lutung jawa, trenggiling, binturong,
    dan paok pancawarna**.
17. **Ancaman** bagi macan tutul: perburuan dan jerat, hutan yang menyempit, serta aktivitas manusia di dalam hutan.
18. Saat hutan menyempit, **konflik manusia dan macan tutul** bisa terjadi. Kita perlu hidup berdampingan.
19. **Java-Wide Leopard Survey** adalah survei macan tutul jawa di seluruh Pulau Jawa. Ini kolaborasi pemerintah,
    lembaga konservasi, sektor swasta, dan komunitas lokal, dan disebut sebagai kolaborasi lintas sektor
    terbesar pertama untuk konservasi satwa liar di Indonesia.
20. **Bakti BCA** bersama **SINTAS Indonesia** dan **Balai Besar Taman Nasional Bromo Tengger Semeru**
    mendukung survei macan tutul jawa di bentang alam Bromo Tengger Semeru.
21. **Komunitas lokal yang terlatih** menjadi penggerak survei di lapangan.
22. **Aksi kamu:** jangan membeli produk dari satwa liar, laporkan jerat atau perburuan ke petugas, jaga hutan,
    dan ceritakan tentang macan tutul jawa ke teman-temanmu!

### Perlu konfirmasi tim sebelum dipakai
Temuan kualitatif dari laporan yang mungkin belum dipublikasikan:
- "Di Bromo Tengger Semeru, macan kumbang lebih sering terekam dibanding yang bertutul."
- "Macan tutul jawa di sini cenderung aktif di siang hari."

Semua teks disimpan di `js/content.js` agar mudah direvisi tim komunikasi atau SINTAS.

## 6. Tahapan pengerjaan

1. **Prototipe inti**: satu hutan hasil generate, macan tutul tersembunyi, tap untuk highlight dan skor +1,
   semua ketemu lalu pindah ke hutan berikutnya. Prototipe ini sudah bisa dimainkan untuk dicoba rasanya.
2. **Gameplay lengkap**: timer, HUD kamera pengintai, kenaikan kesulitan, macan kumbang, decoy, hint,
   mode malam IR, animasi, dan suara.
3. **Layar-layar**: attract, briefing, hasil, input nama, papan skor, dan panel admin.
4. **Konten edukasi**: kartu fakta, popup decoy, ajakan aksi, dan skrip cek "tanpa angka".
5. **Kiosk**: warna, pengamanan kiosk, offline/PWA, dan uji di perangkat pameran.
6. **Rilis**: deploy (misalnya GitHub Pages untuk demo) dan panduan setup booth (mode kiosk Chrome, reset harian,
   ekspor skor).

## 7. Pertanyaan untuk tim (dengan default yang direkomendasikan)

1. **Perangkat di pameran?** Default: TV/monitor layar sentuh landscape. Alternatif: tablet atau laptop dengan mouse.
2. **Sumber gambar?** Default: hutan digenerate otomatis dengan ilustrasi vektor. Alternatif: ilustrasi desainer
   atau foto kamera pengintai asli.
3. **Mode waktu?** Default: sesi berwaktu 90 detik. Alternatif: tanpa batas waktu dengan level bertingkat.
4. **Papan skor?** Default: lokal di satu perangkat dengan ekspor CSV. Alternatif: online bersama untuk beberapa
   booth, yang butuh backend dan internet.
5. **Data pemain?** Default: hanya nama panggilan. Kalau mau mengumpulkan kontak untuk hadiah, perlu persetujuan
   pemain (consent).
6. **Bahasa?** Default: Bahasa Indonesia. Opsional: bilingual Indonesia/Inggris.
7. ~~Logo resmi~~ → diputuskan **tanpa logo**.
8. **Hadiah harian** untuk skor tertinggi? Kalau ada, papan skor harian bisa ditampilkan lebih menonjol.

## 8. Sumber

- Laporan internal "Kajian Struktur Populasi Macan Tutul Jawa serta Preferensi Satwa Mangsanya di Bentang Alam
  Bromo Tengger Semeru": hanya informasi kualitatif yang dipakai, tanpa angka.
- Antara Jatim, "Program JWLS identifikasi macan tutul jawa di TNBTS": https://jatim.antaranews.com/berita/1063423/program-jwls-identifikasi-delapan-macan-tutul-jawa-di-tnbts
- RRI Voice of Indonesia, "Javan Leopard Survey… Bromo Tengger Semeru": https://rri.co.id/en/environment/2392921/javan-leopard-survey-finds-eight-in-bromo-tengger-semeru
- Mongabay, "Menghitung populasi macan tutul jawa di habitat tersisa": https://mongabay.co.id/2025/03/13/menghitung-populasi-macan-tutul-jawa-di-habitat-tersisa/
- Mongabay, "Macan tutul jawa, sang penjaga hutan yang semakin terdesak": https://mongabay.co.id/2021/08/13/macan-tutul-jawa-sang-penjaga-hutan-yang-semakin-terdesak-hidupnya/
- Mongabay, "Terekam kamera, macan tutul mangsa kucing kuwuk di hutan Muria": https://mongabay.co.id/2025/02/10/terekam-kamera-macan-tutul-mangsa-kucing-kuwuk-di-hutan-muria/
- Kompas, "Mencari jejak macan tutul jawa yang terancam punah": https://lestari.kompas.com/read/2025/02/18/211700886/mencari-jejak-macan-tutul-jawa-yang-terancam-punah-
- UGM Biologi, "The Faculty of Biology UGM supports the Java Wide Leopard Survey": https://biologi.ugm.ac.id/en/2024/02/29/the-faculty-of-biology-ugm-supports-the-java-wide-leopard-survey/
