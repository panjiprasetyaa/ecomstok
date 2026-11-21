/**
 * NutriKlinis RS Pro - Modul Kalkulator Gizi Klinis Terstandar (Kemenkes & WHO Asia-Pasifik)
 */

const NutritionCalc = {
  /**
   * Hitung Indeks Massa Tubuh (IMT)
   * @param {number} bb Berat badan dalam kg
   * @param {number} tb Tinggi badan dalam cm
   * @returns {{ imt: number, category: string, color: string, badgeBg: string, advice: string }}
   */
  calculateIMT(bb, tb) {
    if (!bb || !tb || tb <= 0 || bb <= 0) {
      return { imt: 0, category: '-', color: 'text-slate-400', badgeBg: 'bg-slate-100 text-slate-600', advice: 'Masukkan TB dan BB valid' };
    }
    const tbMeter = tb / 100;
    const imt = parseFloat((bb / (tbMeter * tbMeter)).toFixed(2));

    // Standar Kemenkes RI / WHO Asia-Pasifik
    if (imt < 17.0) {
      return {
        imt,
        category: 'Sangat Kurus (KEP Berat)',
        color: 'text-amber-700',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        advice: 'Risiko malnutrisi berat, perlu intervensi diet tinggi kalori tinggi protein (TKTP).'
      };
    } else if (imt >= 17.0 && imt <= 18.4) {
      return {
        imt,
        category: 'Kurus Tingkat Ringan',
        color: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        advice: 'Perlu peningkatan asupan energi harian secara bertahap.'
      };
    } else if (imt >= 18.5 && imt <= 22.9) {
      return {
        imt,
        category: 'Normal (Ideal)',
        color: 'text-emerald-700',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        advice: 'Pertahankan status gizi dengan pola makan seimbang.'
      };
    } else if (imt >= 23.0 && imt <= 24.9) {
      return {
        imt,
        category: 'Kelebihan Berat Badan (Overweight)',
        color: 'text-orange-600',
        badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
        advice: 'Waspada peningkatan faktor risiko metabolik kardiovaskular.'
      };
    } else if (imt >= 25.0 && imt <= 29.9) {
      return {
        imt,
        category: 'Obesitas Tingkat I',
        color: 'text-rose-600',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        advice: 'Disarankan penurunan berat badan bertahap dengan restriksi kalori.'
      };
    } else {
      return {
        imt,
        category: 'Obesitas Tingkat II (Morbid)',
        color: 'text-rose-700',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
        advice: 'Risiko tinggi komorbiditas, perlu intervensi gizi intensif.'
      };
    }
  },

  /**
   * Hitung Berat Badan Ideal (BBI) - Rumus Broca Modifikasi Kemenkes
   * @param {number} tb Tinggi badan dalam cm
   * @param {string} gender 'L' (Laki-laki) atau 'P' (Perempuan)
   * @returns {number} BBI dalam kg
   */
  calculateBBI(tb, gender = 'L') {
    if (!tb || tb <= 0) return 0;
    const diff = tb - 100;
    if (gender === 'L') {
      if (tb < 160) return parseFloat(diff.toFixed(1));
      return parseFloat((diff - 0.10 * diff).toFixed(1));
    } else {
      if (tb < 150) return parseFloat(diff.toFixed(1));
      return parseFloat((diff - 0.15 * diff).toFixed(1));
    }
  },

  /**
   * Hitung Basal Energy Expenditure (BEE) menggunakan rumus Mifflin-St Jeor
   * @param {number} bb Berat badan dalam kg
   * @param {number} tb Tinggi badan dalam cm
   * @param {number} umur Usia dalam tahun
   * @param {string} gender 'L' atau 'P'
   * @returns {number} BEE dalam kkal/hari
   */
  calculateBEE(bb, tb, umur, gender = 'L') {
    if (!bb || !tb || !umur) return 0;
    // Mifflin-St Jeor Formula
    if (gender === 'L') {
      return Math.round(10 * bb + 6.25 * tb - 5 * umur + 5);
    } else {
      return Math.round(10 * bb + 6.25 * tb - 5 * umur - 161);
    }
  },

  /**
   * Hitung Total Energy Expenditure (TEE)
   * @param {number} bee Basal Energy Expenditure (kkal)
   * @param {number} faktorAktivitas Nilai faktor aktivitas (misal 1.2 untuk bed rest)
   * @param {number} faktorStres Nilai faktor stres/penyakit (misal 1.2 untuk infeksi/post-op)
   * @returns {number} TEE dalam kkal/hari
   */
  calculateTEE(bee, faktorAktivitas = 1.2, faktorStres = 1.0) {
    if (!bee || bee <= 0) return 0;
    return Math.round(bee * faktorAktivitas * faktorStres);
  },

  /**
   * Hitung Kebutuhan Makronutrien Terstandar
   * @param {number} tee Total Energy Expenditure (kkal)
   * @param {number} bb Berat badan (kg)
   * @param {object} options Opsi penyesuaian khusus klinis
   * @returns {{ proteinGram: number, proteinKkal: number, proteinPersen: number, lemakGram: number, lemakKkal: number, lemakPersen: number, karboGram: number, karboKkal: number, karboPersen: number }}
   */
  calculateMacronutrients(tee, bb, options = {}) {
    if (!tee || tee <= 0) {
      return {
        proteinGram: 0, proteinKkal: 0, proteinPersen: 0,
        lemakGram: 0, lemakKkal: 0, lemakPersen: 0,
        karboGram: 0, karboKkal: 0, karboPersen: 0
      };
    }

    // Default persentase energi: Protein 15%, Lemak 25%, Karbohidrat 60%
    let proteinPersen = options.proteinPersen || 15;
    let lemakPersen = options.lemakPersen || 25;

    // Bila ada preskripsi khusus penyakit
    if (options.isCKDNonDialysis) {
      // Pembatasan protein 0.6 - 0.8 g/kgBB
      const gram = Math.round(bb * 0.7);
      const kkal = gram * 4;
      proteinPersen = Math.round((kkal / tee) * 100);
      lemakPersen = 25;
    } else if (options.isKatabolikTinggi || options.isLukaBakar) {
      // Peningkatan protein 1.5 - 2.0 g/kgBB
      proteinPersen = 20;
      lemakPersen = 25;
    }

    const karboPersen = 100 - (proteinPersen + lemakPersen);

    const proteinKkal = Math.round((proteinPersen / 100) * tee);
    const proteinGram = Math.round(proteinKkal / 4);

    const lemakKkal = Math.round((lemakPersen / 100) * tee);
    const lemakGram = Math.round(lemakKkal / 9);

    const karboKkal = Math.round((karboPersen / 100) * tee);
    const karboGram = Math.round(karboKkal / 4);

    return {
      proteinGram, proteinKkal, proteinPersen,
      lemakGram, lemakKkal, lemakPersen,
      karboGram, karboKkal, karboPersen
    };
  }
};

if (typeof window !== 'undefined') {
  window.NutritionCalc = NutritionCalc;
}
