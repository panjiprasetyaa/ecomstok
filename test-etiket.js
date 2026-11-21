/**
 * Automated Verification Script for NutriLabel RS (QR Generator & Diet Safety Matcher)
 */

const fs = require('fs');
const path = require('path');

// Mock window for Node.js
global.window = {};

// Load modules
eval(fs.readFileSync(path.join(__dirname, 'js', 'qr-generator.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'js', 'diet-matcher.js'), 'utf8'));

const QRCodeUtil = window.QRCodeUtil || module.exports;
const DietSafetyMatcher = window.DietSafetyMatcher || module.exports;

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failCount++;
  }
}

console.log('=== TEST SUITE 1: GENERATOR QR CODE (QRCodeUtil) ===');

// 1. Uji pembuatan SVG
const svg = QRCodeUtil.generateSVG('ORD-001234', { size: 100 });
assert(typeof svg === 'string', 'SVG berupa string');
assert(svg.includes('<svg') && svg.includes('</svg>'), 'SVG memiliki tag pembuka dan penutup');
assert(svg.includes('rect') && svg.includes('viewBox="0 0 100 100"'), 'SVG memiliki elemen rect dan viewBox');

// 2. Uji konsistensi hash QR code
const svg2 = QRCodeUtil.generateSVG('ORD-001234', { size: 100 });
assert(svg === svg2, 'Payload yang sama menghasilkan SVG QR matriks identik');

const svgDifferent = QRCodeUtil.generateSVG('ORD-999999', { size: 100 });
assert(svg !== svgDifferent, 'Payload berbeda menghasilkan SVG QR matriks berbeda');

console.log('\n=== TEST SUITE 2: MESIN KESELAMATAN DIET & ALERGEN (DietSafetyMatcher) ===');

// Data dasar pasien uji (Tn. Andi Prasetyo)
const testOrderAndi = {
  id: 'ORD-001234',
  noRm: '001234',
  nama: 'Tn. Andi Prasetyo',
  ruangan: 'Bangsal Mawar - Bed 03',
  waktuMakan: 'Siang',
  jenisDiet: 'Diet Diabetes Mellitus (DM)',
  tekstur: 'Lunak',
  alergi: ['Telur'],
  pantangan: ['Makanan tinggi gula murni']
};

// Skenario 1: Makanan Sesuai (Lolos)
const trayAman = {
  menuNama: 'Paket Lunak A: Nasi Tim Ayam + Tahu Semur + Sop Wortel',
  tekstur: 'Lunak',
  bahan: ['Beras', 'Daging Ayam', 'Tahu Kedelai', 'Wortel', 'Bawang'],
  waktuMakan: 'Siang',
  ruangan: 'Bangsal Mawar - Bed 03'
};

const res1 = DietSafetyMatcher.verify(testOrderAndi, trayAman);
assert(res1.status === 'PASS_APPROVED', 'Skenario 1 Status: PASS_APPROVED');
assert(res1.allowDistribution === true, 'Skenario 1: Boleh didistribusikan (allowDistribution = true)');
assert(res1.issues.length === 0, 'Skenario 1: Tidak ada isu peringatan');

// Skenario 2: Bahaya Alergen (Nampan Berisi Telur)
const trayAlergen = {
  menuNama: 'Paket Lunak B: Nasi Tim + Telur Dadar Gulung + Sayur Bayam',
  tekstur: 'Lunak',
  bahan: ['Beras', 'Telur Ayam', 'Bayam'],
  waktuMakan: 'Siang',
  ruangan: 'Bangsal Mawar - Bed 03'
};

const res2 = DietSafetyMatcher.verify(testOrderAndi, trayAlergen);
assert(res2.status === 'HOLD_DANGER', 'Skenario 2 Status: HOLD_DANGER (Distribusi Ditahan)');
assert(res2.allowDistribution === false, 'Skenario 2: Tidak boleh didistribusikan (allowDistribution = false)');
assert(res2.issues.some(i => i.type === 'ALLERGEN_DANGER'), 'Skenario 2: Terdeteksi tipe isu ALLERGEN_DANGER');

// Skenario 3: Inkonsistensi Tekstur (Pasien Lunak, Nampan Keras/Biasa)
const trayTeksturSalah = {
  menuNama: 'Paket Biasa: Nasi Putih + Ayam Goreng Renyah',
  tekstur: 'Biasa',
  bahan: ['Beras', 'Daging Ayam', 'Minyak'],
  waktuMakan: 'Siang',
  ruangan: 'Bangsal Mawar - Bed 03'
};

const res3 = DietSafetyMatcher.verify(testOrderAndi, trayTeksturSalah);
assert(res3.status === 'HOLD_DANGER', 'Skenario 3 Status: HOLD_DANGER (Salah Tekstur Kritis)');
assert(res3.allowDistribution === false, 'Skenario 3: Makanan ditahan karena tekstur tidak cocok');
assert(res3.issues.some(i => i.type === 'TEXTURE_MISMATCH'), 'Skenario 3: Terdeteksi tipe isu TEXTURE_MISMATCH');

// Skenario 4: Ketidaksesuaian Waktu Makan (Jadwal Siang vs Pagi)
const trayWaktuSalah = {
  menuNama: 'Paket Lunak A: Nasi Tim Ayam',
  tekstur: 'Lunak',
  bahan: ['Beras', 'Daging Ayam'],
  waktuMakan: 'Pagi',
  ruangan: 'Bangsal Mawar - Bed 03'
};

const res4 = DietSafetyMatcher.verify(testOrderAndi, trayWaktuSalah);
assert(res4.status === 'HOLD_WARNING', 'Skenario 4 Status: HOLD_WARNING (Waktu Makan Salah)');
assert(res4.issues.some(i => i.type === 'TIME_MISMATCH'), 'Skenario 4: Terdeteksi tipe isu TIME_MISMATCH');

// Skenario 5: Pasien Tidak Terdaftar di Sistem
const res5 = DietSafetyMatcher.verify(null, trayAman);
assert(res5.status === 'NOT_FOUND', 'Skenario 5 Status: NOT_FOUND jika data order tidak ada');
assert(res5.allowDistribution === false, 'Skenario 5: Tidak boleh didistribusikan');

console.log(`\n========================================`);
console.log(`HASIL PENGUJIAN: ${passCount} LULUS, ${failCount} GAGAL`);
console.log(`========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 SELURUH SISTEM ETIKET & SAFETY MATCHER TERBUKTI 100% VALID!');
}
