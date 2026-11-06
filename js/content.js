/* SEMUA teks yang tampil di game ada di sini supaya mudah direvisi.
   ATURAN: tidak boleh ada angka (digit) di file ini — data survei bersifat rahasia.
   Jalankan `node tools/check-no-digits.mjs` untuk memeriksa.
   Angka permainan (skor, waktu, nomor stasiun) diisi otomatis lewat placeholder {n}, {s}, dst. */
window.JSMT_CONTENT = {
  title: 'Jejak Si Macan Tutul · Bakti BCA',
  titleLines: ['Jejak Si', 'Macan Tutul'],
  tagline: 'Masuki rimbunnya hutan. Temukan sang penjaga keseimbangan.',
  credit: 'Program Bakti Lingkungan · Bakti BCA',

  ui: {
    start: 'Mulai Main',
    playMenu: 'Menu utama',
    leaveConfirm: 'Kembali ke menu utama? Sesi ini akan dihentikan dan skor sesi ini tidak disimpan.',
    touchToStart: 'Klik atau sentuh layar untuk mulai',
    didYouKnow: 'Tahukah kamu?',
    topToday: 'Jagoan hari ini',
    noScores: 'Belum ada skor hari ini. Jadilah yang pertama!',
    boardButton: 'Papan Skor',
    fullscreen: 'Layar penuh',

    briefKicker: 'Misi Peneliti',
    briefTitle: 'Kamu adalah peneliti macan tutul!',
    briefText: 'Kamera pengintai sudah dipasang di hutan Bromo Tengger Semeru. Periksa setiap rekaman dan temukan semua macan tutul jawa sebelum waktu habis.',
    rules: [
      { icon: 'spotted', title: 'Klik atau sentuh macan tutul', text: 'Macan utama memberi tiga poin. Saat malam lebih sulit: setiap temuan memberi lima poin.' },
      { icon: 'black', title: 'Macan kumbang juga dihitung', text: 'Macan kumbang yang hitam juga macan tutul jawa. Cari juga, ya!' },
      { icon: 'kuwuk', title: 'Kenali satwa lain', text: 'Pengecoh bisa berjalan, terbang, memanjat atau bergelantungan. Setiap klik salah mengurangi dua poin dan lima detik, termasuk satwa bergerak. Skor minimum nol.' },
      { icon: 'moving', title: 'Tangkap momen singkat!', text: 'Bonus macan berlari, keluar semak, atau mengintip memberi lima poin; saat malam tujuh poin. Amati pola bulunya sebelum mengeklik!' },
      { icon:'scratch', title:'Baca tanda di pohon', text:'Klik satu kelompok cakaran untuk satu poin tambahan. Temuan jejak juga membantu peneliti.' }
    ],
    go: 'Ayo Mulai!',

    score: 'Skor',
    time: 'Waktu',
    station: 'Stasiun Kamera {n}',
    modes: { siang: 'Siang', pagi: 'Pagi Berkabut', senja: 'Senja', malam: 'Malam · Inframerah' },
    cleared: 'Stasiun bersih!',
    bonus: '+{s} detik',
    penalty: '−{s} detik',
    calm: 'Pelan-pelan, amati baik-baik!',
    timeUp: 'Waktu habis!',
    missed: 'Terlewat',
    nightTip: 'Rekaman malam! Cari mata yang menyala.',
    next: 'Lanjut ke stasiun berikutnya',
    stationClearKicker: 'Stasiun bersih!',

    resultKicker: 'Waktu habis!',
    resultTitles: ['Kerja bagus, peneliti!', 'Hebat, matamu tajam!', 'Luar biasa, peneliti ulung!'],
    resultUnit: 'total poin ekspedisi',
    stations: 'Stasiun bersih',
    mistakes: 'Salah pilih',
    rankToday: 'Peringkat hari ini',
    namePrompt: 'Tulis nama panggilanmu',
    save: 'Simpan Skor',
    skip: 'Lewati',
    defaultName: 'Penjelajah',
    space: 'Spasi',
    del: 'Hapus',
    actionKicker: 'Yang bisa kamu lakukan',

    boardTitle: 'Papan Skor',
    today: 'Hari Ini',
    allTime: 'Sepanjang Pameran',
    again: 'Main Lagi',
    home: 'Beranda',
    empty: 'Belum ada skor.',

    adminTitle: 'Panel Admin',
    adminPin: 'Masukkan PIN admin',
    adminWrong: 'PIN salah',
    adminDuration: 'Durasi sesi',
    adminSeconds: '{s} detik',
    adminSound: 'Suara',
    adminOn: 'Nyala',
    adminOff: 'Mati',
    adminExport: 'Unduh skor (CSV untuk Excel)',
    adminBackup: 'Simpan cadangan',
    adminImport: 'Muat cadangan',
    adminBackupDone: 'Cadangan tersimpan di folder Downloads. Salin ke PC lain, lalu pilih Muat cadangan.',
    adminImported: 'Berhasil: {added} skor baru ditambahkan, {skipped} sudah ada.',
    adminImportFail: 'File cadangan tidak bisa dibaca. Pastikan memilih file cadangan game ini.',
    adminResetToday: 'Hapus skor hari ini',
    adminResetAll: 'Hapus semua skor',
    adminConfirm: 'Yakin? Tindakan ini tidak bisa dibatalkan.',
    adminClose: 'Tutup',
    adminDone: 'Selesai'
  },

  labels: {
    spotted: 'Macan tutul jawa',
    black: 'Macan kumbang',
    cub: 'Anak macan tutul',
    cubBlack: 'Anak macan kumbang'
  },

  /* Satwa pengecoh — muncul saat pemain salah memilih. */
  decoys: {
    musang: { name:'Musang luwak', text:'Bulu cokelatnya bisa menyatu dengan hutan. Kenali wajah bermasker dan ekor panjangnya; satwa ini bukan macan tutul.' },
    garangan: { name:'Garangan jawa', text:'Tubuh cokelat keemasannya ramping dengan moncong panjang. Perhatikan bentuknya, bukan hanya warnanya.' },
    kancil: { name:'Pelanduk kancil', text:'Satwa kecil ini berbulu cokelat dengan kaki ramping dan tanpa tanduk. Bukan anak macan tutul, ya!' },
    bajing: { name:'Bajing kelapa', text:'Ekornya lebat dan panjang dengan garis pucat di sisi tubuh. Warna cokelatnya bisa mengecoh pengamat.' },
    trenggiling: { name: 'Trenggiling peusing', text: 'Tubuhnya bersisik dan moncongnya panjang. Satwa ini ikut tercatat dalam laporan JWLS, tetapi bukan macan tutul.' },
    binturong: { name: 'Binturong', text: 'Bulunya gelap, berkumis panjang, dan berekor kuat. Binturong termasuk satwa yang tercatat di bentang alam survei.' },
    linsang: { name: 'Linsang', text: 'Badannya ramping dengan ekor panjang bercincin. Perhatikan bentuk tubuhnya agar tidak tertukar dengan macan tutul.' },
    monyet: { name: 'Monyet ekor panjang', text: 'Primata ini juga tercatat dalam laporan JWLS. Menjaga habitat berarti melindungi beragam penghuni hutan.' },
    kuwuk: { name: 'Kucing kuwuk', text: 'Mirip macan tutul, tapi jauh lebih kecil dan tutulnya bintik, bukan roset. Kucing kuwuk termasuk mangsa macan tutul.' },
    kijang: { name: 'Kijang muncak', text: 'Rusa kecil ini adalah salah satu mangsa macan tutul jawa.' },
    ayam: { name: 'Ayam hutan merah', text: 'Nenek moyang ayam kampung ini juga mangsa macan tutul.' },
    landak: { name: 'Landak jawa', text: 'Durinya tajam, tapi tetap bisa menjadi mangsa macan tutul.' },
    lutung: { name: 'Lutung jawa', text: 'Primata berbulu hitam yang hidup di pepohonan. Bukan macan kumbang, ya!' },
    elang: { name: 'Elang jawa', text: 'Burung pemangsa yang dilindungi. Ia hidup di hutan yang sama dengan macan tutul.' }
  },

  /* Materi edukasi diringkas dari publikasi SINTAS Indonesia dan Bakti BCA. */
  facts: [
    { id: 'endemik', title: 'Hanya Ada di Pulau Jawa', text: 'Macan tutul jawa adalah satwa endemik. Di alam liar, satwa ini hanya ditemukan di Pulau Jawa.' },
    { id: 'predator', title: 'Penjaga Keseimbangan Hutan', text: 'Sebagai predator puncak, macan tutul membantu menjaga keseimbangan populasi mangsa dan rantai kehidupan hutan.' },
    { id: 'sidikjari', title: 'Tutul seperti Sidik Jari', text: 'Pola tutul setiap individu berbeda. Peneliti membandingkan pola pada foto kamera pengintai untuk mengenali macan yang sama.' },
    { id: 'kumbang', title: 'Macan Kumbang', text: 'Macan kumbang bukan spesies berbeda. Warna gelapnya disebut melanisme, dan pola tutulnya masih dapat terlihat pada pencahayaan tertentu.' },
    { id: 'kamera', title: 'Kamera Tanpa Penjaga', text: 'Kamera pengintai memakai sensor gerak dan panas tubuh untuk merekam satwa secara otomatis tanpa harus ditunggu manusia.' },
    { id: 'stasiun', title: 'Mengapa Kameranya Berpindah?', text: 'Satu kamera hanya melihat sebagian kecil hutan. Banyak stasiun kamera diperlukan untuk memahami persebaran macan di bentang alam luas.' },
    { id: 'dna', title: 'Jejak Bukan Hanya Foto', text: 'Sampel kotoran dapat dianalisis secara genetik untuk mempelajari jenis kelamin, struktur populasi, dan hubungan antarpopulasi.' },
    { id: 'jawa', title: 'Survei Seluas Pulau Jawa', text: 'Java-Wide Leopard Survey memantau habitat macan tutul dari Jawa bagian barat hingga timur melalui banyak bentang alam.' },
    { id: 'baseline', title: 'Data Awal, Bukan Total Populasi', text: 'Jumlah individu yang dikenali dari survei adalah data awal. Angka itu bukan jumlah seluruh macan tutul jawa di alam.' },
    { id: 'fragmentasi', title: 'Habitat yang Terpisah', text: 'Kantong hutan yang terpisah menyulitkan macan mencari wilayah jelajah dan pasangan. Karena itu, konektivitas habitat perlu dijaga.' },
    { id: 'permukiman', title: 'Mengapa Mendekati Permukiman?', text: 'Perubahan habitat dan jalur jelajah dapat mendorong macan keluar dari hutan. Menjaga habitat membantu mengurangi perjumpaan dengan manusia.' },
    { id: 'srak', title: 'Data Menjadi Aksi', text: 'Foto, lokasi, jejak, dan data genetik membantu menentukan kawasan prioritas dan memperkuat strategi konservasi macan tutul jawa.' },
    { id: 'survei', title: 'Dari Rekaman Menjadi Pengetahuan', text: 'Survei di Bromo Tengger Semeru menggabungkan kamera pengintai dan sampel kotoran untuk mempelajari individu serta satwa mangsa.', source: 'Laporan kemajuan JWLS · Januari dua ribu dua puluh empat–Agustus dua ribu dua puluh enam' },
    { id: 'lapangan', title: 'Penjaga Hutan di Balik Layar', text: 'Komunitas lokal terlatih membantu memasang dan mengambil kamera. Konservasi tumbuh lewat kerja bersama di lapangan.', source: 'Laporan kemajuan JWLS · Kegiatan lapangan' },
    { id: 'latihkamera', title: 'Belajar Memasang Kamera', text: 'Pelatihan survei dan analisis membantu tim mengubah rekaman satwa menjadi dasar perencanaan konservasi.', source: 'Siaran pers BCA · Mei dua ribu dua puluh enam' },
    { id: 'luas', title: 'Habitat Harus Cukup Luas', text: 'Macan tutul membutuhkan habitat aman dan cukup luas untuk bergerak, berburu, berlindung, dan berkembang biak.' },
    { id: 'terhubung', title: 'Hutan Perlu Terhubung', text: 'Keterhubungan antarkawasan membantu satwa mencari makanan, pasangan, dan wilayah jelajah yang lebih aman.' },
    { id: 'rumah', title: 'Hutan Adalah Rumah Mereka', text: 'Perubahan bentang alam akibat aktivitas manusia dapat mendorong macan tutul keluar dari habitat alaminya.' },
    { id: 'aman', title: 'Jangan Mengganggu Satwa', text: 'Jika berjumpa macan tutul, jangan mendekat, mengejar, mengelilingi, atau memprovokasi. Beri ruang agar satwa dapat menjauh.' },
    { id: 'waktu', title: 'Berbagi Waktu dengan Satwa', text: 'Pengaturan waktu aktivitas manusia dapat mengurangi perjumpaan di jalur yang masih digunakan satwa liar.' },
    { id: 'kolaborasi', title: 'Konservasi Perlu Kolaborasi', text: 'JWLS di Bromo Tengger Semeru melibatkan Bakti BCA, Kementerian Kehutanan, pengelola taman nasional, dan SINTAS Indonesia.' },
    { id: 'baktibca', title: 'Dukungan Bakti BCA', text: 'Sejak dua ribu dua puluh empat, Bakti BCA mendukung JWLS untuk memperkuat konservasi berbasis data dan penyusunan strategi perlindungan macan tutul jawa.' },
    { id: 'riset', title: 'Riset Sebelum Bertindak', text: 'Konservasi yang tepat dimulai dari data yang dapat dipertanggungjawabkan, bukan hanya dari perkiraan.' },
    { id: 'masyarakat', title: 'Masyarakat Ikut Menjaga', text: 'Pengetahuan dan keterlibatan masyarakat sekitar hutan membantu menjaga habitat serta mengurangi risiko konflik dengan satwa.' }
  ],
  /* Fakta yang ditampilkan lebih dulu di setiap sesi. */
  priorityFacts: ['baktibca', 'sidikjari', 'survei', 'lapangan', 'kumbang'],
  /* Fakta khusus saat stasiun malam. */
  nightFacts: ['kamera', 'kumbang'],

  actions: [
    'Jangan membeli produk dari satwa liar.',
    'Laporkan jerat atau perburuan kepada petugas.',
    'Jaga hutan dan bawa pulang sampahmu saat berwisata alam.',
    'Ceritakan tentang macan tutul jawa kepada teman dan keluargamu!'
  ],

  /* Nama yang tidak pantas diganti otomatis menjadi nama bawaan. */
  blockedWords: ['anjing', 'anjir', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'entot', 'goblok', 'tolol', 'bego', 'jancok', 'jancuk', 'asu', 'tai', 'kampret', 'bajingan', 'pepek', 'fuck', 'shit', 'bitch', 'dick']
};
