/**
 * NutriLabel RS Pro - Modul Pencocok Keselamatan Diet & Alergen (Diet Matcher Engine)
 * Memverifikasi kesesuaian nampan makanan pasien terhadap instruksi gizi dan alergi medis
 */

const DietSafetyMatcher = {
  /**
   * Evaluasi kesesuaian isi nampan makanan dengan pesanan/instruksi gizi pasien
   * @param {object} orderData Data instruksi diet pasien
   * @param {object} trayData Data nampan/sajian makanan aktual
   * @returns {{ status: string, allowDistribution: boolean, issues: Array, summary: string, badgeClass: string }}
   */
  verify(orderData, trayData) {
    const issues = [];
    if (!orderData) {
      return {
        status: 'NOT_FOUND',
        allowDistribution: false,
        issues: [{ type: 'NOT_FOUND', severity: 'critical', message: 'Data pesanan/instruksi diet pasien tidak ditemukan di sistem!' }],
        summary: 'Data Tidak Ditemukan',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300'
      };
    }

    // 1. VALIDASI LOKASI RUANGAN / KAMAR
    if (trayData.ruangan && orderData.ruangan) {
      const roomClean1 = orderData.ruangan.toLowerCase().replace(/[^a-z0-9]/g, '');
      const roomClean2 = trayData.ruangan.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (roomClean1 !== roomClean2 && !roomClean1.includes(roomClean2) && !roomClean2.includes(roomClean1)) {
        issues.push({
          type: 'ROOM_MISMATCH',
          severity: 'warning',
          message: `Nampan ditujukan untuk kamar "${trayData.ruangan}", tetapi data sistem mencatat kamar "${orderData.ruangan}". Pastikan pasien tidak pindah bed.`
        });
      }
    }

    // 2. VALIDASI WAKTU MAKAN (PAGI / SIANG / MALAM)
    if (trayData.waktuMakan && orderData.waktuMakan) {
      if (trayData.waktuMakan.toLowerCase() !== orderData.waktuMakan.toLowerCase()) {
        issues.push({
          type: 'TIME_MISMATCH',
          severity: 'warning',
          message: `Nampan untuk jadwal "${trayData.waktuMakan}", sedangkan instruksi aktif adalah jadwal "${orderData.waktuMakan}".`
        });
      }
    }

    // 3. VALIDASI BENTUK / TEKSTUR MAKANAN
    if (trayData.tekstur && orderData.tekstur) {
      const tTray = trayData.tekstur.toLowerCase();
      const tOrder = orderData.tekstur.toLowerCase();

      if (!tTray.includes(tOrder) && !tOrder.includes(tTray)) {
        issues.push({
          type: 'TEXTURE_MISMATCH',
          severity: 'critical',
          message: `Konsistensi tekstur makanan tidak sesuai! Pasien membutuhkan tekstur "${orderData.tekstur}", nampan berisi "${trayData.tekstur}". Risiko aspirasi/gangguan cerna!`
        });
      }
    }

    // 4. VALIDASI BAHAN ALERGEN BERBAHAYA (CRITICAL SAFETY CHECK)
    const allergies = this.parseList(orderData.alergi);
    const trayIngredients = this.parseList(trayData.bahan);
    const menuTitle = (trayData.menuNama || '').toLowerCase();

    allergies.forEach(allergy => {
      const a = allergy.toLowerCase().trim();
      if (!a || a.includes('tidak ada') || a.includes('none') || a.includes('-')) return;

      // Periksa bahan makanan dan judul menu
      const matchInIngredients = trayIngredients.some(ing => ing.toLowerCase().includes(a));
      const matchInTitle = menuTitle.includes(a);

      if (matchInIngredients || matchInTitle) {
        issues.push({
          type: 'ALLERGEN_DANGER',
          severity: 'critical',
          message: `BAHAYA ALERGI FATAL: Nampan mengandung bahan "${a.toUpperCase()}", sedangkan pasien memiliki riwayat ALERGI "${a.toUpperCase()}". Makanan dilarang diserahkan!`
        });
      }
    });

    // 5. VALIDASI PANTANGAN DIET KHUSUS
    const restrictions = this.parseList(orderData.pantangan);
    restrictions.forEach(restriction => {
      const r = restriction.toLowerCase().trim();
      if (!r || r.includes('tidak ada') || r.includes('-')) return;

      const matchInIngredients = trayIngredients.some(ing => ing.toLowerCase().includes(r));
      const matchInTitle = menuTitle.includes(r);

      if (matchInIngredients || matchInTitle) {
        issues.push({
          type: 'DIET_RESTRICTION_WARNING',
          severity: 'warning',
          message: `Peringatan Pantangan Diet: Menu nampan mengandung "${r}", bertentangan dengan pantangan diet pasien.`
        });
      }
    });

    // 6. KEPUTUSAN AKHIR STATUS PEMERIKSAAN
    const hasCritical = issues.some(i => i.severity === 'critical');
    const hasWarning = issues.some(i => i.severity === 'warning');

    if (hasCritical) {
      return {
        status: 'HOLD_DANGER',
        allowDistribution: false,
        issues,
        summary: 'DISTRIBUSI DITAHAN (BAHAYA ALERGI / TEKSTUR)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    } else if (hasWarning) {
      return {
        status: 'HOLD_WARNING',
        allowDistribution: false,
        issues,
        summary: 'PERINGATAN KETIDAKSESUAIAN (BUTUH KONFIRMASI)',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    } else {
      return {
        status: 'PASS_APPROVED',
        allowDistribution: true,
        issues: [],
        summary: 'LOLOS PEMERIKSAAN SISTEM (SESUAI INSTRUKSI)',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    }
  },

  /**
   * Mengubah array atau string koma menjadi array string bersih
   */
  parseList(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input.filter(Boolean);
    if (typeof input === 'string') {
      return input.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
};

if (typeof window !== 'undefined') {
  window.DietSafetyMatcher = DietSafetyMatcher;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DietSafetyMatcher;
}
