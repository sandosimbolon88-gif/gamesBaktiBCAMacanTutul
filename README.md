# Jejak Si Macan Tutul

Game edukasi bergaya *cari-cari* untuk booth pameran **Program Bakti Lingkungan · Bakti BCA**.
Pemain berperan sebagai peneliti yang memeriksa rekaman kamera pengintai dan harus menemukan
**macan tutul jawa** yang bersembunyi di hutan sebelum waktu habis.

- Jumlah macan tutul di setiap hutan **acak**. Setelah semuanya ditemukan, game langsung pindah ke hutan berikutnya.
- Macan tutul yang diklik atau disentuh langsung **di-highlight** dan **skor bertambah 1**.
- Skor disimpan di **papan skor** perangkat (Hari Ini dan Sepanjang Pameran).
- Bisa dimainkan dengan **mouse (PC)** maupun **layar sentuh**.
- Semua gambar dibuat otomatis oleh kode, bergaya **kartun**. Game ini **tanpa logo resmi** dan bisa **jalan offline**.

## Cara menjalankan

**Cara cepat:** buka `index.html` dengan Google Chrome atau Microsoft Edge (klik dua kali file-nya).

**Disarankan untuk pameran** adalah menjalankan server lokal. Dengan cara ini game tetap jalan tanpa internet dan layar tidak meredup sendiri:

```bash
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`.

### Mode kiosk (layar penuh, tanpa bilah browser)

Di Windows, buat shortcut Chrome dengan target berikut:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:8080 --overscroll-history-navigation=0 --disable-pinch
```

Tekan `Alt+F4` untuk keluar dari mode kiosk. Selain itu, tombol ⛶ di layar awal juga bisa dipakai untuk layar penuh.

Tips booth:
- Matikan *sleep* dan *screen saver* di pengaturan daya komputer.
- Selalu pakai **browser dan alamat yang sama** setiap hari, karena papan skor tersimpan di browser tersebut.
- Jangan menghapus data browser selama pameran. Ekspor CSV setiap akhir hari sebagai cadangan.

## Alur permainan

1. **Layar awal**: hutan bergerak pelan, fakta "Tahukah kamu?" berganti-ganti, dan 5 skor tertinggi hari ini.
2. **Briefing**: misi peneliti dan aturan main (macan kumbang juga dihitung, awas satwa pengecoh).
3. **Bermain** (default 90 detik):
   - Ada sekitar 3–6 macan tutul per stasiun. Kesulitan naik bertahap: lebih kecil, lebih tertutup daun, ada kamuflase daun kering dan bayangan.
   - Ada mode **Pagi Berkabut**, **Senja**, dan **Malam · Inframerah**. Di mode malam, pemain mencari mata yang menyala.
   - **Satwa pengecoh** (kucing kuwuk, kijang muncak, ayam hutan merah, landak jawa, lutung jawa, elang jawa): kalau salah pilih, muncul info satwa itu dan waktu berkurang 2 detik.
   - Bonus waktu +5 detik setiap stasiun bersih, diikuti kartu fakta edukasi.
   - Kalau lama tidak ada yang ditemukan, game memberi petunjuk berupa daun berguguran lalu lingkaran putus-putus.
4. **Hasil**: skor, peringkat hari ini, ajakan aksi konservasi, dan isi nama lewat keyboard di layar atau keyboard fisik.
5. **Papan skor**, lalu otomatis kembali ke layar awal. Game juga kembali ke layar awal kalau ditinggal 45 detik.

## Panel admin

- Buka dengan **ketuk pojok kiri atas layar awal 5 kali**, atau tekan **Ctrl+Shift+A**.
- PIN bawaan adalah **`1234`**. **Ganti sebelum pameran** di `js/config.js` (`adminPin`).
- Isinya: durasi sesi (60/90/120 detik), suara nyala/mati, **unduh skor (CSV)**, hapus skor hari ini, dan hapus semua skor.

## Mengubah konten dan pengaturan

| Mau mengubah… | File |
|---|---|
| Teks, fakta edukasi, info satwa, ajakan aksi | `js/content.js` |
| Durasi, bonus/penalti waktu, tingkat kesulitan per stasiun, PIN | `js/config.js` |
| Warna dan tampilan layar | `css/style.css` |

**Aturan konten: tidak boleh ada angka.** Data survei bersifat rahasia. Setiap kali mengubah `js/content.js`, jalankan:

```bash
node tools/check-no-digits.mjs
```

Skrip ini akan **gagal** kalau ada digit di teks. Angka yang tampil di game hanya angka permainan (skor, waktu, nomor stasiun), yang diisi otomatis.

Untuk melihat semua gambar satwa dan contoh hutan, buka `tools/preview.html`. Contoh parameter: `?v=scene&stage=3&seed=7&boxes=1`.

## Kaidah alam yang dijaga di gambar kartun

- Badan macan tutul bertutul **roset** (lingkaran terbuka tanpa titik tengah). Kepala dan kaki bertutul **bintik padat**.
- Perut, dagu, dan moncong berwarna krem. Telinga bulat dengan punggung telinga gelap. Pupil **bulat** seperti kucing besar.
- Ekor panjang dengan ujung gelap.
- **Macan kumbang** berbulu hitam, tapi rosetnya masih samar terlihat. Di kamera **inframerah**, rosetnya tampak jelas.
- **Kucing kuwuk** jauh lebih kecil, bertutul bintik (bukan roset), punya garis putih di wajah, dan ekornya bercincin.
- Perilaku macan tutul: berbaring di dahan dengan kaki dan ekor menjuntai, duduk, rebahan, berjalan di jalur setapak, dan mengintip dari balik semak. Ada juga bekas cakaran di batang pohon.
- Ada anak macan tutul di dekat induknya, karena induk betina membesarkan anaknya.
- Di alam, macan tutul hidup menyendiri. Game menjelaskan hal ini lewat kartu fakta khusus.

## Struktur folder

```
index.html            halaman game
css/style.css         tampilan
js/config.js          pengaturan & tingkat kesulitan
js/content.js         semua teks (tanpa angka)
js/util.js            utilitas (RNG ber-seed, dsb.)
js/art/leopard.js     gambar macan tutul, macan kumbang, kucing kuwuk + efek inframerah
js/art/animals.js     satwa pengecoh
js/art/forest.js      pohon, dahan, semak, pakis, daun, kamuflase
js/scene.js           generator stasiun kamera (acak + jaminan tetap terlihat)
js/game.js            logika permainan & efek
js/leaderboard.js     papan skor lokal + ekspor CSV
js/audio.js           efek suara (disintesis, tanpa file)
js/ui.js, js/main.js  layar, input, mode kiosk, panel admin
sw.js                 cache offline
tools/                pemeriksa "tanpa angka" & halaman preview aset
docs/PLAN.md          rencana & keputusan
```

## Sumber edukasi

Isi edukasi diambil dari laporan kemajuan JWLS (Bakti BCA × SINTAS Indonesia; hanya informasi kualitatif, tanpa angka) dan dari sumber publik:
- Antara Jatim, "Program JWLS identifikasi macan tutul jawa di TNBTS"
- RRI Voice of Indonesia, "Javan Leopard Survey… Bromo Tengger Semeru"
- Mongabay Indonesia, liputan macan tutul jawa dan JWLS
- Kompas, "Mencari jejak macan tutul jawa yang terancam punah"
- Hedges dkk., "Melanistic leopards reveal their spots: infrared camera traps…", yang menunjukkan roset macan kumbang terlihat di kamera inframerah
