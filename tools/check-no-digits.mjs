// Memastikan tidak ada angka (digit) di teks edukasi & UI (js/content.js).
// Data survei bersifat rahasia, jadi teks yang tampil di game tidak boleh memuat angka.
// Pemakaian: node tools/check-no-digits.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const code = readFileSync(path.join(root, 'js', 'content.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
const content = sandbox.window.JSMT_CONTENT;
if (!content) { console.error('JSMT_CONTENT tidak ditemukan'); process.exit(2); }

const bad = [];
(function walk(v, where) {
  if (typeof v === 'string') { if (/[0-9]/.test(v)) bad.push(`${where}: "${v}"`); }
  else if (typeof v === 'number') bad.push(`${where}: angka ${v}`);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], where ? `${where}.${k}` : k);
})(content, '');

const facts = content.facts.length;
if (bad.length) {
  console.error('GAGAL: ditemukan angka di teks konten:\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log(`OK: ${facts} fakta & semua teks bebas angka.`);
