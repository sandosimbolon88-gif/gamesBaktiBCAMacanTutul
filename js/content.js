/* SEMUA teks yang tampil di game ada di sini supaya mudah direvisi.
   ATURAN: tidak boleh ada angka (digit) di file ini — data survei bersifat rahasia.
   Jalankan `node tools/check-no-digits.mjs` untuk memeriksa.
   Angka permainan (skor, waktu, nomor stasiun) diisi otomatis lewat placeholder {n}, {s}, dst. */
window.JSMT_CONTENT = {
  title: 'Jejak Si Macan Tutul',
  titleLines: ['Jejak Si', 'Macan Tutul'],
  tagline: 'Jadilah peneliti! Temukan macan tutul jawa yang bersembunyi di hutan.',
  credit: 'Program Bakti Lingkungan · Bakti BCA',

  ui: {
    start: 'Mulai Main',
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
      { icon: 'spotted', title: 'Klik atau sentuh macan tutul', text: 'Setiap macan tutul yang kamu temukan menambah satu skor.' },
      { icon: 'black', title: 'Macan kumbang juga dihitung', text: 'Macan kumbang yang hitam juga macan tutul jawa. Cari juga, ya!' },
      { icon: 'kuwuk', title: 'Awas pengecoh!', text: 'Salah memilih satwa lain, waktumu berkurang sedikit.' }
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
    resultUnit: 'macan tutul ditemukan',
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
    adminExport: 'Unduh skor (CSV)',
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
    kuwuk: { name: 'Kucing kuwuk', text: 'Mirip macan tutul, tapi jauh lebih kecil dan tutulnya bintik, bukan roset. Kucing kuwuk termasuk mangsa macan tutul.' },
    kijang: { name: 'Kijang muncak', text: 'Rusa kecil ini adalah salah satu mangsa macan tutul jawa.' },
    ayam: { name: 'Ayam hutan merah', text: 'Nenek moyang ayam kampung ini juga mangsa macan tutul.' },
    landak: { name: 'Landak jawa', text: 'Durinya tajam, tapi tetap bisa menjadi mangsa macan tutul.' },
    lutung: { name: 'Lutung jawa', text: 'Primata berbulu hitam yang hidup di pepohonan. Bukan macan kumbang, ya!' },
    elang: { name: 'Elang jawa', text: 'Burung pemangsa yang dilindungi. Ia hidup di hutan yang sama dengan macan tutul.' }
  },

  /* Fakta edukasi (tanpa angka). id dipakai untuk urutan prioritas. */
  facts: [
    { id: 'kumbang', title: 'Macan kumbang', text: 'Macan kumbang yang hitam juga macan tutul jawa! Tutulnya tetap ada, hanya tersamar oleh bulu yang gelap.' },
    { id: 'sidikjari', title: 'Seperti sidik jari', text: 'Pola tutul setiap macan tutul berbeda-beda. Dari foto kamera pengintai, peneliti bisa mengenali setiap individu.' },
    { id: 'terakhir', title: 'Kucing besar terakhir di Jawa', text: 'Macan tutul jawa adalah satu-satunya kucing besar yang masih hidup di Pulau Jawa, setelah harimau jawa punah.' },
    { id: 'roset', title: 'Tutul berbentuk bunga', text: 'Tutul di badan macan tutul berbentuk lingkaran terbuka seperti bunga, disebut roset. Di kepala dan kaki, tutulnya berupa bintik padat.' },
    { id: 'endemik', title: 'Asli Indonesia', text: 'Macan tutul jawa hanya ada di Indonesia. Ia endemik Pulau Jawa dan beberapa pulau kecil di sekitarnya.' },
    { id: 'status', title: 'Terancam punah', text: 'Statusnya Kritis (Critically Endangered) menurut IUCN dan dilindungi undang-undang di Indonesia.' },
    { id: 'inframerah', title: 'Rahasia kamera malam', text: 'Di rekaman kamera inframerah, tutul macan kumbang bisa terlihat jelas. Ini membantu peneliti mengenali setiap individu.' },
    { id: 'mata', title: 'Mata yang menyala', text: 'Di malam hari, mata satwa memantulkan cahaya kamera. Mata yang menyala belum tentu macan tutul, perhatikan ukurannya!' },
    { id: 'soliter', title: 'Si penyendiri', text: 'Macan tutul dewasa hidup menyendiri. Mereka bertemu saat musim kawin, dan induk betina membesarkan anaknya.' },
    { id: 'gamenote', title: 'Kenapa banyak di satu layar?', text: 'Di alam, macan tutul jarang terlihat bersama. Di game ini, kami kumpulkan dari banyak rekaman supaya kamu bisa berlatih jadi peneliti!' },
    { id: 'pohon', title: 'Suka bersantai di pohon', text: 'Macan tutul suka beristirahat di tanah, di bawah semak, atau berbaring di dahan besar dengan kaki menjuntai.' },
    { id: 'tanda', title: 'Meninggalkan tanda', text: 'Macan tutul membuat cakaran di batang pohon dan kaisan di tanah sebagai tanda keberadaannya.' },
    { id: 'rawat', title: 'Rajin merawat diri', text: 'Seperti kucing di rumah, macan tutul membersihkan diri dengan menjilati bulunya.' },
    { id: 'penasaran', title: 'Penasaran dengan kamera', text: 'Macan tutul jawa sering penasaran dengan kamera pengintai. Kadang wajahnya terekam dari dekat sekali!' },
    { id: 'mangsa', title: 'Menu makan', text: 'Mangsa macan tutul jawa antara lain kijang muncak, ayam hutan merah, kucing kuwuk, dan landak jawa.' },
    { id: 'predator', title: 'Penjaga keseimbangan hutan', text: 'Sebagai predator puncak, macan tutul menjaga keseimbangan hutan. Melindunginya berarti melindungi satwa lain juga.' },
    { id: 'habitat', title: 'Rumah yang terjaga', text: 'Macan tutul jawa paling banyak ditemukan di hutan yang masih terjaga baik.' },
    { id: 'dna', title: 'Detektif dari kotoran', text: 'Peneliti mengumpulkan kotoran macan tutul. Dari DNA di dalamnya, bisa diketahui jenis kelamin dan apa yang dimakannya.' },
    { id: 'tetangga', title: 'Tetangga di hutan', text: 'Hutan Bromo Tengger Semeru juga rumah bagi elang jawa, lutung jawa, trenggiling, binturong, dan paok pancawarna.' },
    { id: 'ancaman', title: 'Ancaman', text: 'Perburuan, jerat, hutan yang menyempit, dan aktivitas manusia di dalam hutan mengancam kehidupan macan tutul jawa.' },
    { id: 'konflik', title: 'Hidup berdampingan', text: 'Saat hutan menyempit, macan tutul bisa mendekati permukiman. Menjaga hutan membantu manusia dan macan tutul hidup berdampingan.' },
    { id: 'jwls', title: 'Java-Wide Leopard Survey', text: 'JWLS adalah survei macan tutul jawa di seluruh Pulau Jawa, hasil kolaborasi pemerintah, lembaga konservasi, sektor swasta, dan komunitas lokal.' },
    { id: 'baktibca', title: 'Bakti BCA untuk macan tutul', text: 'Bakti BCA bersama Kementerian Kehutanan, Taman Nasional Bromo Tengger Semeru, dan SINTAS Indonesia mendukung survei macan tutul jawa.' },
    { id: 'lokal', title: 'Pahlawan lokal', text: 'Komunitas lokal yang terlatih menjadi penggerak survei di lapangan: memasang kamera pengintai dan menjelajah hutan.' }
  ],
  /* Fakta yang ditampilkan lebih dulu di setiap sesi. */
  priorityFacts: ['kumbang', 'sidikjari', 'terakhir', 'gamenote', 'roset'],
  /* Fakta khusus saat stasiun malam. */
  nightFacts: ['inframerah', 'mata'],

  actions: [
    'Jangan membeli produk dari satwa liar.',
    'Laporkan jerat atau perburuan kepada petugas.',
    'Jaga hutan dan bawa pulang sampahmu saat berwisata alam.',
    'Ceritakan tentang macan tutul jawa kepada teman dan keluargamu!'
  ],

  /* Nama yang tidak pantas diganti otomatis menjadi nama bawaan. */
  blockedWords: ['anjing', 'anjir', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'entot', 'goblok', 'tolol', 'bego', 'jancok', 'jancuk', 'asu', 'tai', 'kampret', 'bajingan', 'pepek', 'fuck', 'shit', 'bitch', 'dick']
};
