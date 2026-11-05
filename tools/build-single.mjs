// Menggabungkan seluruh game menjadi SATU file HTML mandiri (CSS, JS, ikon di-inline)
// supaya mudah dipindah antar PC lewat flashdisk dan dibuka dengan klik dua kali.
// Pemakaian: node tools/build-single.mjs   →   dist/jejak-si-macan-tutul.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFileSync(path.join(root, p), 'utf8');

// 1) pastikan teks konten bebas angka
execFileSync(process.execPath, [path.join(root, 'tools', 'check-no-digits.mjs')], { stdio: 'inherit' });

let html = read('index.html');

// 2) CSS
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => `<style>\n${read(href)}\n</style>`);

// 3) ikon sebagai data URI, manifest tidak dipakai di mode satu file
const icon = Buffer.from(read('assets/icon.svg')).toString('base64');
html = html.replace(/<link rel="icon" href="[^"]+" type="image\/svg\+xml">/, `<link rel="icon" href="data:image/svg+xml;base64,${icon}">`);
html = html.replace(/\s*<link rel="manifest" href="[^"]+">/, '');

// 4) JavaScript
let first = true;
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const code = read(src).replace(/<\/script/gi, '<\\/script');
  const flag = first ? '<script>window.JSMT_SINGLE_FILE = true;</script>\n  ' : '';
  first = false;
  return `${flag}<script>/* ${src} */\n${code}\n</script>`;
});
if (/<script src=|<link rel="stylesheet"/.test(html)) throw new Error('Masih ada file eksternal yang belum di-inline');

let version = '';
try { version = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim(); } catch (e) { /* bukan repo git */ }
const stamp = new Date().toISOString().slice(0, 10);
html = html.replace('<!doctype html>', `<!doctype html>\n<!-- Jejak Si Macan Tutul · versi satu file · dibuat ${stamp}${version ? ' · ' + version : ''} -->`);

mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'jejak-si-macan-tutul.html');
writeFileSync(out, html);

const guide = `JEJAK SI MACAN TUTUL — PANDUAN PINDAH PC
=========================================

MEMASANG DI PC LAIN
1. Salin file "jejak-si-macan-tutul.html" ke PC tujuan (flashdisk, Google Drive, atau email).
2. Buka dengan Google Chrome atau Microsoft Edge:
   klik kanan file > Open with / Buka dengan > Chrome atau Edge.
   Tidak perlu internet dan tidak perlu instal apa pun.
3. Layar penuh: klik tombol [ ] di pojok kiri bawah layar awal, atau tekan F11.

MEMINDAHKAN PAPAN SKOR (DATA)
Skor tersimpan di browser masing-masing PC, jadi perlu dipindah lewat file cadangan:
a. Di PC LAMA: buka Panel Admin
   (ketuk pojok kiri atas layar awal 5 kali, atau tekan Ctrl+Shift+A), masukkan PIN,
   lalu pilih "Simpan cadangan". File "cadangan-jejak-si-macan-tutul-....json"
   tersimpan di folder Downloads.
b. Salin file .json itu ke PC BARU (bersama file .html).
c. Di PC BARU: buka game > Panel Admin > "Muat cadangan" > pilih file .json tadi.
   Skor digabungkan dan tidak akan dobel walau dimuat dua kali.
   Pengaturan durasi dan suara juga ikut terbawa.

TIPS SELAMA PAMERAN
- Simpan cadangan setiap akhir hari.
- Pakai browser yang sama setiap hari dan jangan hapus riwayat/data browser.
- "Unduh skor (CSV untuk Excel)" untuk rekap pemenang harian.
- Matikan sleep/screen saver di pengaturan daya PC.
- PIN admin: tanyakan ke panitia (PIN bawaan 1234 bila belum diganti).
`;
writeFileSync(path.join(root, 'dist', 'PANDUAN-PINDAH-PC.txt'), guide.replace(/\n/g, '\r\n'));

console.log(`OK: ${path.relative(root, out)} (${Math.round(html.length / 1024)} KB)`);
