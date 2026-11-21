/**
 * NutriKlinis RS Pro - Mesin Inferensi Otomatis Diagnosis Gizi Terstandar (Rule-Based PES Generator)
 * Mengacu pada Pedoman Proses Asuhan Gizi Terstandar (PAGT) / Nutrition Care Process (NCP)
 */

const PESRulesEngine = {
  /**
   * Menjalankan evaluasi cerdas terhadap seluruh data pasien
   * @param {object} patientData Data komprehensif pasien
   * @returns {Array} Daftar diagnosis gizi (PES) yang terdeteksi
   */
  evaluate(patientData) {
    const results = [];
    const d = this.normalizeData(patientData);

    // 1. EVALUASI DOMAIN INTAKE (NI)
    
    // NI-2.1: Asupan Oral Inadekuat
    if (d.asupanPersen > 0 && d.asupanPersen < 65) {
      const keluhan = [];
      if (d.keluhanKlinis.anoreksia) keluhan.push('penurunan nafsu makan');
      if (d.keluhanKlinis.mualMuntah) keluhan.push('keluhan mual dan muntah');
      if (d.keluhanKlinis.gangguanMenelan) keluhan.push('gangguan menelan');
      const etiologiPenyebab = keluhan.length > 0 ? keluhan.join(', ') : 'kondisi klinis hiperkatabolik/anoreksia';

      results.push({
        id: 'NI-2.1',
        domain: 'Intake (Asupan)',
        code: 'NI-2.1',
        title: 'Asupan Makanan & Minuman Oral Tidak Adekuat',
        confidence: 'Tinggi',
        isSelected: true,
        problem: 'Asupan makanan dan minuman oral tidak adekuat (NI-2.1)',
        etiology: `${etiologiPenyebab} berkaitan dengan ${d.diagnosaMedis || 'kondisi sakit akut'}`,
        signs: `Estimasi asupan makan harian hasil recall hanya ${d.asupanPersen}% dari estimasi kebutuhan energi total`,
        rationale: `Asupan recall pasien (${d.asupanPersen}%) berada di bawah ambang batas adekuat 65% kebutuhan.`
      });
    }

    // NI-5.8.2: Asupan Karbohidrat Tidak Konsisten / Utilisasi Karbohidrat (DM)
    const isDM = d.diagnosaMedisLower.includes('dm') || 
                 d.diagnosaMedisLower.includes('diabetes') || 
                 d.diagnosaMedisLower.includes('gula');
    if (isDM || (d.lab.gds && d.lab.gds > 180) || (d.lab.gdp && d.lab.gdp > 126)) {
      const gdsText = d.lab.gds ? `GDS ${d.lab.gds} mg/dL (rujukan normal < 140 mg/dL)` : 'riwayat hiperglikemia';
      const habitText = d.riwayatMakan.polaMakan.includes('manis') ? ' dan riwayat sering mengonsumsi makanan/minuman manis' : '';

      results.push({
        id: 'NI-5.8.2',
        domain: 'Intake (Asupan)',
        code: 'NI-5.8.2',
        title: 'Asupan Karbohidrat Tidak Konsisten / Gangguan Utilisasi Karbohidrat',
        confidence: isDM ? 'Tinggi' : 'Sedang',
        isSelected: true,
        problem: 'Asupan karbohidrat tidak konsisten / perubahan utilisasi zat gizi karbohidrat (NI-5.8.2)',
        etiology: 'Gangguan regulasi insulin metabolik (Diabetes Mellitus) dan pola konsumsi karbohidrat belum teratur',
        signs: `Kadar glukosa darah ${gdsText}${habitText}`,
        rationale: `Terdeteksi indikasi Diabetes Mellitus atau kadar glukosa darah di atas batas rujukan.`
      });
    }

    // NI-5.4: Penurunan Kebutuhan Zat Gizi Spesifik (Natrium) / Kelebihan Asupan Natrium
    const isHT = d.diagnosaMedisLower.includes('hipertensi') || d.diagnosaMedisLower.includes('ht');
    const isTensiTinggi = d.keluhanKlinis.tensiSistolik >= 140 || d.keluhanKlinis.tensiDiastolik >= 90;
    if (isHT || isTensiTinggi || d.riwayatMakan.polaMakan.includes('asin')) {
      const tensiText = (d.keluhanKlinis.tensiSistolik && d.keluhanKlinis.tensiDiastolik) 
        ? `${d.keluhanKlinis.tensiSistolik}/${d.keluhanKlinis.tensiDiastolik} mmHg` 
        : 'tinggi';
      const edemaText = d.keluhanKlinis.edema ? ' dan adanya edema ekstremitas' : '';

      results.push({
        id: 'NI-5.4',
        domain: 'Intake (Asupan)',
        code: 'NI-5.4',
        title: 'Penurunan Kebutuhan Natrium / Kelebihan Asupan Natrium',
        confidence: (isHT || isTensiTinggi) ? 'Tinggi' : 'Sedang',
        isSelected: isHT || isTensiTinggi,
        problem: 'Penurunan kebutuhan zat gizi khusus Natrium / Kelebihan asupan natrium (NI-5.4)',
        etiology: 'Disfungsi regulasi hemodinamik vaskular serta kebiasaan konsumsi bahan makanan tinggi natrium/garam',
        signs: `Tekanan darah ${tensiText}${edemaText}`,
        rationale: `Terdeteksi riwayat hipertensi atau tekanan darah sistolik >= 140 / diastolik >= 90 mmHg.`
      });
    }

    // NI-5.6.1: Peningkatan Kebutuhan Protein Spesifik / Hipoalbuminemia
    if (d.lab.albumin && d.lab.albumin > 0 && d.lab.albumin < 3.5) {
      results.push({
        id: 'NI-5.6.1',
        domain: 'Intake (Asupan)',
        code: 'NI-5.6.1',
        title: 'Peningkatan Kebutuhan Protein Spesifik (Hipoalbuminemia)',
        confidence: 'Tinggi',
        isSelected: true,
        problem: 'Peningkatan kebutuhan zat gizi khusus protein (NI-5.6.1)',
        etiology: `Peningkatan katabolisme protein sistemik atau kehilangan protein ekstravaskular berkaitan dengan ${d.diagnosaMedis || 'kondisi inflamasi/hati'}`,
        signs: `Kadar serum Albumin ${d.lab.albumin} g/dL (Nilai normal rujukan: 3.5 - 5.0 g/dL)`,
        rationale: `Kadar serum albumin pasien ${d.lab.albumin} g/dL menunjukkan hipoalbuminemia.`
      });
    }

    // NI-5.7.1: Kelebihan Asupan Lemak / Dislipidemia
    const isLipidHigh = (d.lab.kolesterol && d.lab.kolesterol > 200) || (d.lab.trigliserida && d.lab.trigliserida > 150);
    if (isLipidHigh || d.diagnosaMedisLower.includes('dislipidemia') || d.diagnosaMedisLower.includes('kolesterol')) {
      const lipidSigns = [];
      if (d.lab.kolesterol && d.lab.kolesterol > 200) lipidSigns.push(`Kolesterol Total ${d.lab.kolesterol} mg/dL (> 200)`);
      if (d.lab.trigliserida && d.lab.trigliserida > 150) lipidSigns.push(`Trigliserida ${d.lab.trigliserida} mg/dL (> 150)`);

      results.push({
        id: 'NI-5.7.1',
        domain: 'Intake (Asupan)',
        code: 'NI-5.7.1',
        title: 'Kelebihan Asupan Lemak / Dislipidemia',
        confidence: isLipidHigh ? 'Tinggi' : 'Sedang',
        isSelected: isLipidHigh,
        problem: 'Kelebihan asupan lemak / Asupan lemak tidak sesuai kebutuhan fisiologis (NI-5.7.1)',
        etiology: 'Pola makan tinggi asam lemak jenuh/kolesterol dan gangguan metabolisme lipoprotein lipid',
        signs: lipidSigns.length > 0 ? lipidSigns.join(' dan ') : 'Profil lipid abnormal pada pemeriksaan laboratorium',
        rationale: 'Hasil profil fraksi lipid serum melampaui batas target proteksi vaskular.'
      });
    }

    // 2. EVALUASI DOMAIN KLINIS (NC)

    // NC-3.1: Berat Badan Kurang (Underweight / Gizi Kurang)
    if (d.imt > 0 && d.imt < 18.5) {
      results.push({
        id: 'NC-3.1',
        domain: 'Klinis (Clinical)',
        code: 'NC-3.1',
        title: 'Berat Badan Kurang / Underweight',
        confidence: 'Tinggi',
        isSelected: true,
        problem: 'Berat badan kurang / Underweight (NC-3.1)',
        etiology: `Asupan energi dan zat gizi tidak adekuat dalam jangka waktu berkepanjangan berkaitan dengan ${d.diagnosaMedis || 'penyakit kronik'}`,
        signs: `IMT ${d.imt.toFixed(1)} kg/m² (Kategori Kurus menurut standar Kemenkes RI) dan BB aktual ${d.bb} kg (< BBI ${d.bbi.toFixed(1)} kg)`,
        rationale: `Indeks Massa Tubuh (${d.imt.toFixed(1)} kg/m²) berada di bawah rentang normal (18.5 - 22.9).`
      });
    }

    // NC-3.3: Overweight / Obesitas
    if (d.imt >= 25.0) {
      const tingkat = d.imt >= 30.0 ? 'Tingkat II' : 'Tingkat I';
      results.push({
        id: 'NC-3.3',
        domain: 'Klinis (Clinical)',
        code: 'NC-3.3',
        title: `Kelebihan Berat Badan / Obesitas ${tingkat}`,
        confidence: 'Tinggi',
        isSelected: true,
        problem: `Kelebihan berat badan / Obesitas ${tingkat} (NC-3.3)`,
        etiology: 'Ketidakseimbangan asupan energi melebihi kebutuhan metabolik tubuh dalam periode waktu lama',
        signs: `IMT ${d.imt.toFixed(1)} kg/m² (Kategori Obesitas standar Kemenkes/Asia-Pasifik) dan BB ${d.bb} kg (> BBI ${d.bbi.toFixed(1)} kg)`,
        rationale: `Indeks Massa Tubuh (${d.imt.toFixed(1)} kg/m²) mengindikasikan obesitas klinis.`
      });
    }

    // NC-2.2: Perubahan Nilai Laboratorium Terkait Ginjal (CKD / Gangguan Ginjal)
    const isCKD = d.diagnosaMedisLower.includes('ckd') || 
                  d.diagnosaMedisLower.includes('ginjal') || 
                  d.diagnosaMedisLower.includes('renal');
    const isRenalLabAbnormal = (d.lab.kreatinin && d.lab.kreatinin > 1.3) || (d.lab.ureum && d.lab.ureum > 50);
    if (isCKD || isRenalLabAbnormal) {
      const renalSigns = [];
      if (d.lab.kreatinin) renalSigns.push(`Kreatinin ${d.lab.kreatinin} mg/dL (rujukan: 0.7 - 1.3)`);
      if (d.lab.ureum) renalSigns.push(`Ureum ${d.lab.ureum} mg/dL (rujukan: 15 - 50)`);

      results.push({
        id: 'NC-2.2-CKD',
        domain: 'Klinis (Clinical)',
        code: 'NC-2.2',
        title: 'Perubahan Nilai Lab Terkait Fungsi Ginjal',
        confidence: isRenalLabAbnormal ? 'Tinggi' : 'Sedang',
        isSelected: isRenalLabAbnormal || isCKD,
        problem: 'Perubahan nilai laboratorium terkait gizi dan fungsi ginjal (NC-2.2)',
        etiology: `Penurunan laju filtrasi glomerulus ginjal berkaitan dengan ${d.diagnosaMedis || 'penyakit ginjal kronik'}`,
        signs: renalSigns.length > 0 ? renalSigns.join(', ') : 'Hasil skrining fungsi ginjal di atas nilai batas normal',
        rationale: 'Kadar Kreatinin atau Ureum serum meningkat di atas rujukan fisiologis normal.'
      });
    }

    // NC-2.2-Hb: Anemia Terkait Gizi
    const isAnemia = (d.gender === 'L' && d.lab.hb && d.lab.hb < 13.0) ||
                     (d.gender === 'P' && d.lab.hb && d.lab.hb < 12.0);
    if (isAnemia) {
      const rujukan = d.gender === 'L' ? '>= 13.0' : '>= 12.0';
      results.push({
        id: 'NC-2.2-ANEMIA',
        domain: 'Klinis (Clinical)',
        code: 'NC-2.2',
        title: 'Perubahan Nilai Laboratorium Terkait Gizi (Anemia)',
        confidence: 'Tinggi',
        isSelected: true,
        problem: 'Perubahan nilai laboratorium terkait gizi / Anemia (NC-2.2)',
        etiology: `Penurunan sintesis hemoglobin, kehilangan darah, atau defisiensi mikronutrien pembentuk darah berkaitan dengan ${d.diagnosaMedis || 'kondisi medis'}`,
        signs: `Kadar Hemoglobin ${d.lab.hb} g/dL (Nilai rujukan normal ${rujukan} g/dL)`,
        rationale: `Kadar Hemoglobin pasien di bawah nilai cut-off standar normal Kemenkes.`
      });
    }

    // NC-1.1: Gangguan Menelan / Disfagia
    if (d.keluhanKlinis.gangguanMenelan || d.diagnosaMedisLower.includes('stroke') || d.diagnosaMedisLower.includes('disfagia')) {
      results.push({
        id: 'NC-1.1',
        domain: 'Klinis (Clinical)',
        code: 'NC-1.1',
        title: 'Kesulitan Menelan (Disfagia)',
        confidence: d.keluhanKlinis.gangguanMenelan ? 'Tinggi' : 'Sedang',
        isSelected: d.keluhanKlinis.gangguanMenelan,
        problem: 'Kesulitan menelan / Disfagia fase oral/faringeal (NC-1.1)',
        etiology: `Penurunan fungsi neuromuskular orofaringeal berkaitan dengan ${d.diagnosaMedis || 'gangguan neurologis / pasca stroke'}`,
        signs: 'Pasien mengalami batuk/tersedak saat menelan makanan padat dan membutuhkan modifikasi tekstur cair/saring',
        rationale: 'Terdapat keluhan kesulitan menelan atau riwayat penyakit serebrovaskular.'
      });
    }

    // 3. EVALUASI DOMAIN PERILAKU & LINGKUNGAN (NB)

    // NB-1.1: Kurang Pengetahuan Terkait Gizi
    if (!d.riwayatMakan.edukasiSebelumnya || d.riwayatMakan.polaMakan.length > 0) {
      const habits = d.riwayatMakan.polaMakan.map(h => {
        if (h === 'manis') return 'tinggi gula/karbohidrat sederhana';
        if (h === 'asin') return 'tinggi garam/makanan gurih diawetkan';
        if (h === 'lemak') return 'tinggi lemak/gorengan';
        if (h === 'rendah_serat') return 'kurang sayur dan buah';
        return h;
      });

      const habitText = habits.length > 0 ? `kebiasaan konsumsi makanan ${habits.join(', ')}` : 'pola makan yang belum terencana';

      results.push({
        id: 'NB-1.1',
        domain: 'Perilaku (Behavioral)',
        code: 'NB-1.1',
        title: 'Kurang Pengetahuan Terkait Makanan dan Zat Gizi',
        confidence: 'Sedang',
        isSelected: results.length <= 2, // aktifkan jika diagnosis lain masih sedikit
        problem: 'Kurang pengetahuan terkait makanan dan zat gizi (NB-1.1)',
        etiology: `Kurangnya paparan informasi dan edukasi gizi klinis terstandar sebelumnya mengenai diet ${d.diagnosaMedis || 'penyakit pasien'}`,
        signs: `Riwayat ${habitText} yang belum sesuai dengan preskripsi diet rumah sakit`,
        rationale: 'Pasien belum pernah mendapat edukasi diet terstruktur atau memiliki pola makan berisiko.'
      });
    }

    // Fallback bila semua data normal / belum terisi lengkap
    if (results.length === 0) {
      results.push({
        id: 'DEFAULT-ASSESSMENT',
        domain: 'Intake (Asupan)',
        code: 'NI-1.1',
        title: 'Pemantauan Kebutuhan Energi dan Asupan Gizi Harian',
        confidence: 'Sedang',
        isSelected: true,
        problem: 'Kebutuhan energi dan zat gizi fisiologis normal dalam pemeliharaan status gizi',
        etiology: `Pemeliharaan homeostasis metabolisme tubuh berkaitan dengan kondisi rawat ${d.diagnosaMedis || 'pasien'}`,
        signs: `Status gizi normal (IMT ${d.imt ? d.imt.toFixed(1) : '-'} kg/m²) dengan toleransi asupan oral adekuat`,
        rationale: 'Belum ditemukan anomali mayor pada laboratorium maupun antropometri pasien.'
      });
    }

    return results;
  },

  /**
   * Menormalkan dan melengkapi struktur data input pasien
   */
  normalizeData(input = {}) {
    const diagnosaMedis = (input.diagnosaMedis || '').trim();
    const diagnosaMedisLower = diagnosaMedis.toLowerCase();

    let asupanPersen = 100;
    if (input.riwayatMakan && input.riwayatMakan.asupanPersen !== undefined) {
      asupanPersen = parseFloat(input.riwayatMakan.asupanPersen) || 0;
    } else if (input.asupanPersen !== undefined) {
      asupanPersen = parseFloat(input.asupanPersen) || 0;
    }

    return {
      nama: input.nama || '',
      umur: parseFloat(input.umur) || 0,
      gender: input.gender === 'P' ? 'P' : 'L',
      tb: parseFloat(input.tb) || 0,
      bb: parseFloat(input.bb) || 0,
      imt: parseFloat(input.imt) || 0,
      bbi: parseFloat(input.bbi) || 0,
      asupanPersen,
      diagnosaMedis,
      diagnosaMedisLower,
      keluhanKlinis: {
        tensiSistolik: parseFloat(input.keluhanKlinis?.tensiSistolik) || 0,
        tensiDiastolik: parseFloat(input.keluhanKlinis?.tensiDiastolik) || 0,
        suhu: parseFloat(input.keluhanKlinis?.suhu) || 36.5,
        mualMuntah: !!input.keluhanKlinis?.mualMuntah,
        edema: !!input.keluhanKlinis?.edema,
        anoreksia: !!input.keluhanKlinis?.anoreksia,
        gangguanMenelan: !!input.keluhanKlinis?.gangguanMenelan
      },
      riwayatMakan: {
        asupanPersen,
        polaMakan: Array.isArray(input.riwayatMakan?.polaMakan) ? input.riwayatMakan.polaMakan : [],
        pantanganAlergi: input.riwayatMakan?.pantanganAlergi || '',
        edukasiSebelumnya: !!input.riwayatMakan?.edukasiSebelumnya
      },
      lab: {
        gds: parseFloat(input.lab?.gds) || 0,
        gdp: parseFloat(input.lab?.gdp) || 0,
        albumin: parseFloat(input.lab?.albumin) || 0,
        hb: parseFloat(input.lab?.hb) || 0,
        ureum: parseFloat(input.lab?.ureum) || 0,
        kreatinin: parseFloat(input.lab?.kreatinin) || 0,
        kolesterol: parseFloat(input.lab?.kolesterol) || 0,
        trigliserida: parseFloat(input.lab?.trigliserida) || 0,
        asamUrat: parseFloat(input.lab?.asamUrat) || 0,
        natrium: parseFloat(input.lab?.natrium) || 0,
        kalium: parseFloat(input.lab?.kalium) || 0
      }
    };
  },

  /**
   * Menghasilkan teks rekomendasi Preskripsi Diet dan Intervensi
   */
  generatePrescription(patientData, pesList = []) {
    const d = this.normalizeData(patientData);
    const codes = pesList.map(p => p.code);

    let bentukMakanan = 'Makanan Biasa (Nasi Tim / Nasi)';
    let jenisDiet = 'Diet Gizi Seimbang Standar RS';
    let rute = 'Oral';
    let frekuensi = '3x Makan Utama + 2x Makanan Selingan';
    const catatanKhusus = [];

    // Evaluasi Bentuk Makanan
    if (d.keluhanKlinis.gangguanMenelan) {
      bentukMakanan = 'Makanan Cair Kental / Saring Halus';
      catatanKhusus.push('Modifikasi tekstur makanan untuk mencegah aspirasi pulmonal');
    } else if (d.keluhanKlinis.mualMuntah || (d.asupanPersen > 0 && d.asupanPersen < 60)) {
      bentukMakanan = 'Makanan Lunak (Bubur Ayam / Bubur Nasi Beras)';
      catatanKhusus.push('Porsi kecil tapi sering (small frequent meals)');
    }

    // Evaluasi Jenis Diet
    const isDM = codes.includes('NI-5.8.2') || d.diagnosaMedisLower.includes('dm') || d.diagnosaMedisLower.includes('diabetes');
    const isHT = codes.includes('NI-5.4') || d.diagnosaMedisLower.includes('hipertensi');
    const isCKD = codes.includes('NC-2.2-CKD') || d.diagnosaMedisLower.includes('ckd');
    const isHipoalbumin = codes.includes('NI-5.6.1') || (d.lab.albumin && d.lab.albumin < 3.5);

    const dietTags = [];
    if (isDM) dietTags.push('Diet Diabetes Mellitus (B1/B2)');
    if (isHT) dietTags.push('Diet Rendah Garam II (RG II / 600-800 mg Na)');
    if (isCKD) dietTags.push('Diet Rendah Protein (RP 0.6-0.8 g/kgBB)');
    if (isHipoalbumin) dietTags.push('Diet Tinggi Protein (Ekstra Putih Telur / Formula Ekstrak Ikan Gabus)');
    if (d.imt > 0 && d.imt < 18.5) dietTags.push('Diet Tinggi Kalori Tinggi Protein (TKTP)');

    if (dietTags.length > 0) {
      jenisDiet = dietTags.join(' + ');
    }

    return {
      bentukMakanan,
      jenisDiet,
      rute,
      frekuensi,
      catatanKhusus: catatanKhusus.length > 0 ? catatanKhusus.join('; ') : 'Toleransi asupan oral baik, awasi kepatuhan makan'
    };
  }
};

if (typeof window !== 'undefined') {
  window.PESRulesEngine = PESRulesEngine;
}
