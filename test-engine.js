/**
 * Automated Verification Script for Clinical Nutrition Engine & PES Rules
 */

const fs = require('fs');
const path = require('path');

// Mock window for Node.js environment
global.window = {};

// Load modules
eval(fs.readFileSync(path.join(__dirname, 'js', 'calculator.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'js', 'rules-pes.js'), 'utf8'));

const NutritionCalc = window.NutritionCalc;
const PESRulesEngine = window.PESRulesEngine;

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

console.log('=== TEST SUITE 1: KALKULATOR GIZI KLINIS (NutritionCalc) ===');

// 1. IMT Normal
const imtNormal = NutritionCalc.calculateIMT(55, 160); // 55 / 1.6^2 = 21.48
assert(imtNormal.imt === 21.48, 'Hitung IMT 55kg/160cm = 21.48');
assert(imtNormal.category.includes('Normal'), 'Kategori IMT 21.48 adalah Normal');

// 2. IMT Kurus
const imtKurus = NutritionCalc.calculateIMT(42, 170); // 42 / 1.7^2 = 14.53
assert(imtKurus.imt === 14.53, 'Hitung IMT 42kg/170cm = 14.53');
assert(imtKurus.category.includes('Sangat Kurus'), 'Kategori IMT 14.53 adalah Sangat Kurus');

// 3. IMT Obesitas
const imtObesitas = NutritionCalc.calculateIMT(85, 165); // 85 / 1.65^2 = 31.22
assert(imtObesitas.imt === 31.22, 'Hitung IMT 85kg/165cm = 31.22');
assert(imtObesitas.category.includes('Obesitas'), 'Kategori IMT 31.22 adalah Obesitas');

// 4. BBI Broca
const bbiPria = NutritionCalc.calculateBBI(170, 'L'); // (170-100) - 10% = 70 - 7 = 63
assert(bbiPria === 63.0, 'BBI Pria 170cm = 63.0 kg');

const bbiWanita = NutritionCalc.calculateBBI(156, 'P'); // (156-100) - 15% = 56 - 8.4 = 47.6
assert(bbiWanita === 47.6, 'BBI Wanita 156cm = 47.6 kg');

// 5. BEE & TEE Mifflin-St Jeor
const beePria = NutritionCalc.calculateBEE(65, 170, 40, 'L'); // 10*65 + 6.25*170 - 5*40 + 5 = 650 + 1062.5 - 200 + 5 = 1517.5 -> 1518
assert(beePria === 1518, `BEE Pria 40th/65kg/170cm = 1518 kkal (hasil: ${beePria})`);

const teePria = NutritionCalc.calculateTEE(beePria, 1.2, 1.2); // 1518 * 1.44 = 2185.92 -> 2186
assert(teePria === 2186, `TEE Pria Faktor 1.2 x 1.2 = 2186 kkal (hasil: ${teePria})`);

console.log('\n=== TEST SUITE 2: MESIN ATURAN DIAGNOSIS GIZI (PESRulesEngine) ===');

// Kasus 1: Pasien DM Tipe 2 + Hipertensi + Asupan Rendah
const testCaseDM = {
  nama: 'Ny. Siti',
  umur: 52,
  gender: 'P',
  tb: 156,
  bb: 68,
  imt: 27.9,
  bbi: 47.6,
  diagnosaMedis: 'Diabetes Mellitus Tipe 2 + Hipertensi',
  keluhanKlinis: { tensiSistolik: 155, tensiDiastolik: 95, suhu: 36.8, mualMuntah: false, edema: false, anoreksia: true, gangguanMenelan: false },
  riwayatMakan: { asupanPersen: 50, polaMakan: ['manis', 'asin'], pantanganAlergi: '', edukasiSebelumnya: false },
  lab: { gds: 270, gdp: 0, albumin: 3.6, hb: 12.5, ureum: 35, kreatinin: 1.0, kolesterol: 210, trigliserida: 160, asamUrat: 6.0, natrium: 140, kalium: 4.0 }
};

const pesDM = PESRulesEngine.evaluate(testCaseDM);
const codesDM = pesDM.map(p => p.code);

assert(codesDM.includes('NI-2.1'), 'Terdeteksi NI-2.1 (Asupan Inadekuat) karena asupan recall 50%');
assert(codesDM.includes('NI-5.8.2'), 'Terdeteksi NI-5.8.2 (Asupan Karbohidrat Tidak Konsisten) karena DM dan GDS 270');
assert(codesDM.includes('NI-5.4'), 'Terdeteksi NI-5.4 (Penurunan Kebutuhan Natrium) karena Hipertensi dan TD 155/95');
assert(codesDM.includes('NC-3.3'), 'Terdeteksi NC-3.3 (Obesitas) karena IMT 27.9');

// Kasus 2: Pasien Ginjal Kronik (CKD Stage 4) + Hipoalbuminemia
const testCaseCKD = {
  nama: 'Tn. Bambang',
  umur: 61,
  gender: 'L',
  tb: 165,
  bb: 60,
  imt: 22.0,
  bbi: 58.5,
  diagnosaMedis: 'Chronic Kidney Disease (CKD) Stage 4',
  keluhanKlinis: { tensiSistolik: 140, tensiDiastolik: 90, suhu: 36.5, mualMuntah: true, edema: true, anoreksia: true, gangguanMenelan: false },
  riwayatMakan: { asupanPersen: 55, polaMakan: [], pantanganAlergi: '', edukasiSebelumnya: false },
  lab: { gds: 120, gdp: 0, albumin: 2.8, hb: 9.5, ureum: 88, kreatinin: 3.5, kolesterol: 180, trigliserida: 130, asamUrat: 8.5, natrium: 138, kalium: 5.1 }
};

const pesCKD = PESRulesEngine.evaluate(testCaseCKD);
const codesCKD = pesCKD.map(p => p.code);

assert(codesCKD.includes('NC-2.2'), 'Terdeteksi NC-2.2 (Gangguan Fungsi Ginjal) karena Kreatinin 3.5 & Ureum 88');
assert(codesCKD.includes('NI-5.6.1'), 'Terdeteksi NI-5.6.1 (Kebutuhan Protein / Hipoalbuminemia) karena Albumin 2.8');
assert(pesCKD.some(p => p.id === 'NC-2.2-ANEMIA'), 'Terdeteksi NC-2.2 Anemia karena Hb 9.5 g/dL');

// Kasus 3: Pasien Malnutrisi KEP Berat
const testCaseMalnutrisi = {
  nama: 'Tn. Rizky',
  umur: 28,
  gender: 'L',
  tb: 170,
  bb: 44,
  imt: 15.2,
  bbi: 63.0,
  diagnosaMedis: 'TB Paru + Gizi Buruk',
  keluhanKlinis: { tensiSistolik: 100, tensiDiastolik: 70, suhu: 38.0, mualMuntah: false, edema: false, anoreksia: true, gangguanMenelan: false },
  riwayatMakan: { asupanPersen: 35, polaMakan: [], pantanganAlergi: '', edukasiSebelumnya: false },
  lab: { gds: 95, gdp: 0, albumin: 2.4, hb: 10.0, ureum: 20, kreatinin: 0.7, kolesterol: 120, trigliserida: 80, asamUrat: 4.0, natrium: 136, kalium: 3.8 }
};

const pesMal = PESRulesEngine.evaluate(testCaseMalnutrisi);
const codesMal = pesMal.map(p => p.code);

assert(codesMal.includes('NC-3.1'), 'Terdeteksi NC-3.1 (Underweight/Gizi Kurang) karena IMT 15.2');
assert(codesMal.includes('NI-2.1'), 'Terdeteksi NI-2.1 (Asupan Inadekuat) karena asupan recall 35%');

// Preskripsi Intervensi
const rx = PESRulesEngine.generatePrescription(testCaseDM, pesDM);
assert(rx.jenisDiet.includes('Diet Diabetes Mellitus'), 'Preskripsi mencakup Diet DM');
assert(rx.jenisDiet.includes('Rendah Garam'), 'Preskripsi mencakup Diet Rendah Garam');

console.log(`\n========================================`);
console.log(`HASIL PENGUJIAN: ${passCount} LULUS, ${failCount} GAGAL`);
console.log(`========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 SELURUH ATURAN LOGIKA GIZI & PES TERBUKTI 100% VALID!');
}
