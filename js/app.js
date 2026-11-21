/**
 * NutriKlinis RS Pro - Main Application Logic & Reactive State Management
 */

// State Pasien Aktif
let currentPatient = {
  id: '',
  noRm: '',
  nama: '',
  umur: 52,
  gender: 'P',
  ruangan: 'Bangsal Melati - Bed 04',
  tglAsesmen: new Date().toISOString().split('T')[0],
  tb: 156,
  bb: 68,
  imt: 0,
  bbi: 0,
  diagnosaMedis: 'Diabetes Mellitus Tipe 2 + Hipertensi Grade I',
  faktorAktivitas: 1.2,
  faktorStres: 1.2,
  keluhanKlinis: {
    tensiSistolik: 150,
    tensiDiastolik: 90,
    suhu: 36.8,
    mualMuntah: false,
    edema: false,
    anoreksia: true,
    gangguanMenelan: false
  },
  riwayatMakan: {
    asupanPersen: 55,
    polaMakan: ['manis', 'asin'],
    pantanganAlergi: 'Tidak ada riwayat alergi',
    edukasiSebelumnya: false
  },
  lab: {
    gds: 268,
    gdp: 0,
    albumin: 3.4,
    hb: 12.4,
    ureum: 38,
    kreatinin: 1.1,
    kolesterol: 215,
    trigliserida: 170,
    asamUrat: 6.2,
    natrium: 142,
    kalium: 4.1
  },
  // Diagnosis Gizi yang sedang aktif/dipilih
  activePESList: [],
  preskripsi: {}
};

// Preset Kasus Klinis Rumah Sakit (Untuk Demo Cepat)
const CLINICAL_PRESETS = {
  dm_ht: {
    nama: 'Ny. Siti Aminah',
    noRm: 'RM-2026-8841',
    umur: 52,
    gender: 'P',
    ruangan: 'Penyakit Dalam (Melati 04)',
    tb: 156,
    bb: 68,
    diagnosaMedis: 'Diabetes Mellitus Tipe 2 + Hipertensi Grade I',
    keluhanKlinis: { tensiSistolik: 150, tensiDiastolik: 90, suhu: 36.8, mualMuntah: false, edema: false, anoreksia: true, gangguanMenelan: false },
    riwayatMakan: { asupanPersen: 55, polaMakan: ['manis', 'asin'], pantanganAlergi: 'Tidak ada alergi', edukasiSebelumnya: false },
    lab: { gds: 268, gdp: 165, albumin: 3.4, hb: 12.4, ureum: 38, kreatinin: 1.1, kolesterol: 215, trigliserida: 170, asamUrat: 6.2, natrium: 142, kalium: 4.1 }
  },
  ckd: {
    nama: 'Tn. Bambang Sutrisno',
    noRm: 'RM-2026-7102',
    umur: 61,
    gender: 'L',
    ruangan: 'Bangsal Cempaka - Bed 02',
    tb: 164,
    bb: 62,
    diagnosaMedis: 'Chronic Kidney Disease (CKD) Stage 4 non-dialisis + Hipertensi',
    keluhanKlinis: { tensiSistolik: 160, tensiDiastolik: 95, suhu: 36.5, mualMuntah: true, edema: true, anoreksia: true, gangguanMenelan: false },
    riwayatMakan: { asupanPersen: 45, polaMakan: ['asin'], pantanganAlergi: 'Udang/seafood', edukasiSebelumnya: false },
    lab: { gds: 128, gdp: 98, albumin: 3.1, hb: 9.8, ureum: 86, kreatinin: 3.4, kolesterol: 185, trigliserida: 140, asamUrat: 8.4, natrium: 136, kalium: 5.2 }
  },
  malnutrisi: {
    nama: 'Tn. M. Rizky Pratama',
    noRm: 'RM-2026-4091',
    umur: 28,
    gender: 'L',
    ruangan: 'Rawat Inap Isolasi Paru - Bed 01',
    tb: 170,
    bb: 44,
    diagnosaMedis: 'TB Paru Kasus Baru + Gizi Buruk (KEP Berat) + Hipoalbuminemia',
    keluhanKlinis: { tensiSistolik: 100, tensiDiastolik: 70, suhu: 38.2, mualMuntah: true, edema: false, anoreksia: true, gangguanMenelan: false },
    riwayatMakan: { asupanPersen: 35, polaMakan: ['rendah_serat'], pantanganAlergi: 'Tidak ada alergi', edukasiSebelumnya: false },
    lab: { gds: 110, gdp: 88, albumin: 2.3, hb: 9.2, ureum: 24, kreatinin: 0.8, kolesterol: 130, trigliserida: 90, asamUrat: 4.5, natrium: 135, kalium: 3.6 }
  },
  stroke_disfagia: {
    nama: 'Ny. Hendrawati',
    noRm: 'RM-2026-3129',
    umur: 67,
    gender: 'P',
    ruangan: 'Stroke Unit / Neuro - Bed 03',
    tb: 152,
    bb: 58,
    diagnosaMedis: 'Stroke Non-Hemoragik Fase Akut + Disfagia + Hemiparesis Dekstra',
    keluhanKlinis: { tensiSistolik: 145, tensiDiastolik: 85, suhu: 36.7, mualMuntah: false, edema: false, anoreksia: false, gangguanMenelan: true },
    riwayatMakan: { asupanPersen: 40, polaMakan: ['lemak', 'asin'], pantanganAlergi: 'Tidak ada', edukasiSebelumnya: false },
    lab: { gds: 142, gdp: 110, albumin: 3.6, hb: 12.1, ureum: 32, kreatinin: 0.9, kolesterol: 245, trigliserida: 195, asamUrat: 5.8, natrium: 140, kalium: 4.0 }
  }
};

// Inisialisasi Aplikasi Saat DOM Selesai Dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Bind input listeners
  initFormBindings();
  // Muat pasien default (DM + HT)
  applyPreset('dm_ht');
  // Muat riwayat tersimpan dari LocalStorage
  renderSavedPatientsList();
  // Aktifkan Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * Hubungkan seluruh input form dengan reaktivitas state
 */
function initFormBindings() {
  const syncElements = [
    'nama', 'noRm', 'umur', 'gender', 'ruangan', 'tglAsesmen', 'tb', 'bb',
    'diagnosaMedis', 'tensiSistolik', 'tensiDiastolik', 'suhu', 'faktorAktivitas', 'faktorStres',
    'asupanPersen', 'pantanganAlergi',
    'gds', 'gdp', 'albumin', 'hb', 'ureum', 'kreatinin', 'kolesterol', 'trigliserida', 'asamUrat', 'natrium', 'kalium'
  ];

  syncElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        readFormData();
        recalculateAndRender();
      });
      el.addEventListener('change', () => {
        readFormData();
        recalculateAndRender();
      });
    }
  });

  // Slider & Number sync untuk asupan
  const slider = document.getElementById('asupanPersenSlider');
  const numberInput = document.getElementById('asupanPersen');
  if (slider && numberInput) {
    slider.addEventListener('input', () => {
      numberInput.value = slider.value;
      readFormData();
      recalculateAndRender();
    });
    numberInput.addEventListener('input', () => {
      slider.value = numberInput.value;
      readFormData();
      recalculateAndRender();
    });
  }

  // Checkbox klinis & pola makan
  const checkboxes = ['mualMuntah', 'edema', 'anoreksia', 'gangguanMenelan', 'edukasiSebelumnya'];
  checkboxes.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        readFormData();
        recalculateAndRender();
      });
    }
  });

  document.querySelectorAll('input[name="polaMakan"]').forEach(cb => {
    cb.addEventListener('change', () => {
      readFormData();
      recalculateAndRender();
    });
  });
}

/**
 * Membaca nilai dari DOM ke object currentPatient
 */
function readFormData() {
  const getVal = (id, fallback = '') => {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  };
  const getNum = (id, fallback = 0) => {
    const el = document.getElementById(id);
    return el ? (parseFloat(el.value) || fallback) : fallback;
  };
  const getChecked = (id) => {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  };

  currentPatient.nama = getVal('nama');
  currentPatient.noRm = getVal('noRm');
  currentPatient.umur = getNum('umur', 30);
  currentPatient.gender = getVal('gender', 'L');
  currentPatient.ruangan = getVal('ruangan');
  currentPatient.tglAsesmen = getVal('tglAsesmen');
  currentPatient.tb = getNum('tb', 160);
  currentPatient.bb = getNum('bb', 55);
  currentPatient.diagnosaMedis = getVal('diagnosaMedis');
  currentPatient.faktorAktivitas = getNum('faktorAktivitas', 1.2);
  currentPatient.faktorStres = getNum('faktorStres', 1.0);

  currentPatient.keluhanKlinis = {
    tensiSistolik: getNum('tensiSistolik', 120),
    tensiDiastolik: getNum('tensiDiastolik', 80),
    suhu: getNum('suhu', 36.5),
    mualMuntah: getChecked('mualMuntah'),
    edema: getChecked('edema'),
    anoreksia: getChecked('anoreksia'),
    gangguanMenelan: getChecked('gangguanMenelan')
  };

  const polaMakanSelected = [];
  document.querySelectorAll('input[name="polaMakan"]:checked').forEach(cb => {
    polaMakanSelected.push(cb.value);
  });

  currentPatient.riwayatMakan = {
    asupanPersen: getNum('asupanPersen', 100),
    polaMakan: polaMakanSelected,
    pantanganAlergi: getVal('pantanganAlergi'),
    edukasiSebelumnya: getChecked('edukasiSebelumnya')
  };

  currentPatient.lab = {
    gds: getNum('gds', 0),
    gdp: getNum('gdp', 0),
    albumin: getNum('albumin', 0),
    hb: getNum('hb', 0),
    ureum: getNum('ureum', 0),
    kreatinin: getNum('kreatinin', 0),
    kolesterol: getNum('kolesterol', 0),
    trigliserida: getNum('trigliserida', 0),
    asamUrat: getNum('asamUrat', 0),
    natrium: getNum('natrium', 0),
    kalium: getNum('kalium', 0)
  };
}

/**
 * Menulis nilai object currentPatient kembali ke DOM
 */
function populateFormFromState() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : '';
  };
  const setChecked = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };

  setVal('nama', currentPatient.nama);
  setVal('noRm', currentPatient.noRm);
  setVal('umur', currentPatient.umur);
  setVal('gender', currentPatient.gender);
  setVal('ruangan', currentPatient.ruangan);
  setVal('tglAsesmen', currentPatient.tglAsesmen);
  setVal('tb', currentPatient.tb);
  setVal('bb', currentPatient.bb);
  setVal('diagnosaMedis', currentPatient.diagnosaMedis);
  setVal('faktorAktivitas', currentPatient.faktorAktivitas);
  setVal('faktorStres', currentPatient.faktorStres);

  setVal('tensiSistolik', currentPatient.keluhanKlinis.tensiSistolik || '');
  setVal('tensiDiastolik', currentPatient.keluhanKlinis.tensiDiastolik || '');
  setVal('suhu', currentPatient.keluhanKlinis.suhu || 36.5);
  setChecked('mualMuntah', currentPatient.keluhanKlinis.mualMuntah);
  setChecked('edema', currentPatient.keluhanKlinis.edema);
  setChecked('anoreksia', currentPatient.keluhanKlinis.anoreksia);
  setChecked('gangguanMenelan', currentPatient.keluhanKlinis.gangguanMenelan);

  setVal('asupanPersen', currentPatient.riwayatMakan.asupanPersen);
  const slider = document.getElementById('asupanPersenSlider');
  if (slider) slider.value = currentPatient.riwayatMakan.asupanPersen;
  setVal('pantanganAlergi', currentPatient.riwayatMakan.pantanganAlergi);
  setChecked('edukasiSebelumnya', currentPatient.riwayatMakan.edukasiSebelumnya);

  document.querySelectorAll('input[name="polaMakan"]').forEach(cb => {
    cb.checked = currentPatient.riwayatMakan.polaMakan.includes(cb.value);
  });

  const labKeys = ['gds', 'gdp', 'albumin', 'hb', 'ureum', 'kreatinin', 'kolesterol', 'trigliserida', 'asamUrat', 'natrium', 'kalium'];
  labKeys.forEach(k => {
    setVal(k, currentPatient.lab[k] ? currentPatient.lab[k] : '');
  });
}

/**
 * Hitung ulang seluruh kalkulasi klinis dan perbarui UI secara realtime
 */
function recalculateAndRender() {
  // 1. Hitung IMT & BBI
  const imtResult = window.NutritionCalc.calculateIMT(currentPatient.bb, currentPatient.tb);
  const bbi = window.NutritionCalc.calculateBBI(currentPatient.tb, currentPatient.gender);
  currentPatient.imt = imtResult.imt;
  currentPatient.bbi = bbi;

  // Render Antropometri Badges
  const imtValEl = document.getElementById('displayIMT');
  const imtCatEl = document.getElementById('displayIMTCategory');
  const bbiValEl = document.getElementById('displayBBI');
  const adviceEl = document.getElementById('displayIMTAdvice');

  if (imtValEl) imtValEl.textContent = imtResult.imt > 0 ? imtResult.imt.toFixed(1) : '-';
  if (imtCatEl) {
    imtCatEl.textContent = imtResult.category;
    imtCatEl.className = `text-xs px-2.5 py-1 rounded-full font-bold border ${imtResult.badgeBg}`;
  }
  if (bbiValEl) bbiValEl.textContent = bbi > 0 ? `${bbi.toFixed(1)} kg` : '-';
  if (adviceEl) adviceEl.textContent = imtResult.advice;

  // 2. Hitung Kebutuhan Energi (BEE & TEE)
  const bee = window.NutritionCalc.calculateBEE(currentPatient.bb, currentPatient.tb, currentPatient.umur, currentPatient.gender);
  const tee = window.NutritionCalc.calculateTEE(bee, currentPatient.faktorAktivitas, currentPatient.faktorStres);
  
  const isCKD = currentPatient.diagnosaMedis.toLowerCase().includes('ckd');
  const isKatabolik = currentPatient.lab.albumin > 0 && currentPatient.lab.albumin < 3.5;
  const macros = window.NutritionCalc.calculateMacronutrients(tee, currentPatient.bb, {
    isCKDNonDialysis: isCKD,
    isKatabolikTinggi: isKatabolik
  });

  // Render Energi & Makronutrien
  const beeEl = document.getElementById('displayBEE');
  const teeEl = document.getElementById('displayTEE');
  const proteinEl = document.getElementById('displayProtein');
  const lemakEl = document.getElementById('displayLemak');
  const karboEl = document.getElementById('displayKarbo');

  if (beeEl) beeEl.textContent = `${bee} kkal`;
  if (teeEl) teeEl.textContent = `${tee} kkal`;
  if (proteinEl) proteinEl.textContent = `${macros.proteinGram}g (${macros.proteinPersen}%)`;
  if (lemakEl) lemakEl.textContent = `${macros.lemakGram}g (${macros.lemakPersen}%)`;
  if (karboEl) karboEl.textContent = `${macros.karboGram}g (${macros.karboPersen}%)`;

  // 3. Evaluasi Mesin Diagnosis Gizi (PES Engine)
  const generatedPES = window.PESRulesEngine.evaluate(currentPatient);
  currentPatient.activePESList = generatedPES;

  renderPESCards(generatedPES);

  // 4. Update Preskripsi Intervensi
  const preskripsi = window.PESRulesEngine.generatePrescription(currentPatient, generatedPES.filter(p => p.isSelected));
  currentPatient.preskripsi = { ...preskripsi, tee, macros };

  renderPrescription(currentPatient.preskripsi);

  // Re-init lucide icons for newly generated markup
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Render Kartu Diagnosis Gizi (Auto-Fill PES)
 */
function renderPESCards(pesList) {
  const container = document.getElementById('pesCardsContainer');
  if (!container) return;

  if (pesList.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <i data-lucide="sparkles" class="w-8 h-8 text-teal-600/60 mx-auto mb-2"></i>
        <p class="text-sm font-semibold">Diagnosis gizi akan otomatis terformulasi saat data pasien diisi.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pesList.map((pes, idx) => {
    const isSelected = pes.isSelected !== false;
    const domainBg = pes.domain.includes('Intake') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                     pes.domain.includes('Klinis') ? 'bg-blue-50 text-blue-800 border-blue-200' :
                     'bg-purple-50 text-purple-800 border-purple-200';

    return `
      <div class="p-4 rounded-2xl border transition-all ${isSelected ? 'bg-white border-[#1B5E4B]/30 shadow-sm ring-1 ring-[#1B5E4B]/10' : 'bg-slate-50/70 border-slate-200 opacity-60'}" id="pes-card-${idx}">
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="pes-check-${idx}" ${isSelected ? 'checked' : ''} onchange="togglePESSelection(${idx})" class="w-4 h-4 text-[#1B5E4B] rounded border-slate-300 focus:ring-[#1B5E4B] cursor-pointer">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border ${domainBg}">
              ${pes.domain}
            </span>
            <span class="text-xs font-extrabold text-[#1B5E4B] tracking-tight">
              ${pes.code}
            </span>
          </div>
          <span class="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
            <i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i> Akurasi: ${pes.confidence}
          </span>
        </div>

        <!-- Judul Masalah -->
        <p class="text-xs font-bold text-slate-800 mb-2">${pes.title}</p>

        <!-- PES Formulation (Editable Content) -->
        <div class="space-y-2 text-xs bg-[#FBFBFA] p-3 rounded-xl border border-slate-200/80">
          <div>
            <span class="font-bold text-amber-700 uppercase text-[10px] tracking-wider block mb-0.5">Problem (P):</span>
            <textarea id="pes-p-${idx}" rows="2" oninput="updatePESText(${idx})" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-xs focus:border-[#1B5E4B] focus:ring-1 focus:ring-[#1B5E4B] focus:outline-none transition resize-none">${pes.problem}</textarea>
          </div>
          <div>
            <span class="font-bold text-blue-700 uppercase text-[10px] tracking-wider block mb-0.5">Etiology / Berkaitan Dengan (E):</span>
            <textarea id="pes-e-${idx}" rows="2" oninput="updatePESText(${idx})" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-xs focus:border-[#1B5E4B] focus:ring-1 focus:ring-[#1B5E4B] focus:outline-none transition resize-none">${pes.etiology}</textarea>
          </div>
          <div>
            <span class="font-bold text-emerald-700 uppercase text-[10px] tracking-wider block mb-0.5">Signs & Symptoms / Ditandai Oleh (S):</span>
            <textarea id="pes-s-${idx}" rows="2" oninput="updatePESText(${idx})" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-xs focus:border-[#1B5E4B] focus:ring-1 focus:ring-[#1B5E4B] focus:outline-none transition resize-none">${pes.signs}</textarea>
          </div>
        </div>

        <div class="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span class="italic text-[10px] text-slate-400">💡 ${pes.rationale}</span>
          <button onclick="resetPESItem(${idx})" class="text-[11px] text-slate-500 hover:text-[#1B5E4B] underline transition">Reset Redaksi</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Toggle keaktifan diagnosis gizi tertentu
 */
function togglePESSelection(idx) {
  if (currentPatient.activePESList[idx]) {
    currentPatient.activePESList[idx].isSelected = !currentPatient.activePESList[idx].isSelected;
    recalculateAndRender();
  }
}

/**
 * Memperbarui teks PES saat ahli gizi mengedit langsung di kartu
 */
function updatePESText(idx) {
  const p = document.getElementById(`pes-p-${idx}`)?.value;
  const e = document.getElementById(`pes-e-${idx}`)?.value;
  const s = document.getElementById(`pes-s-${idx}`)?.value;

  if (currentPatient.activePESList[idx]) {
    if (p !== undefined) currentPatient.activePESList[idx].problem = p;
    if (e !== undefined) currentPatient.activePESList[idx].etiology = e;
    if (s !== undefined) currentPatient.activePESList[idx].signs = s;
  }
}

/**
 * Reset redaksi satu kartu PES kembali ke default kalkulasi engine
 */
function resetPESItem(idx) {
  const freshList = window.PESRulesEngine.evaluate(currentPatient);
  if (freshList[idx] && currentPatient.activePESList[idx]) {
    currentPatient.activePESList[idx].problem = freshList[idx].problem;
    currentPatient.activePESList[idx].etiology = freshList[idx].etiology;
    currentPatient.activePESList[idx].signs = freshList[idx].signs;
    renderPESCards(currentPatient.activePESList);
  }
}

/**
 * Render bagian Preskripsi Diet & Intervensi
 */
function renderPrescription(p) {
  const jenisEl = document.getElementById('preskripsiJenis');
  const bentukEl = document.getElementById('preskripsiBentuk');
  const ruteEl = document.getElementById('preskripsiRute');
  const frekuensiEl = document.getElementById('preskripsiFrekuensi');
  const catatanEl = document.getElementById('preskripsiCatatan');

  if (jenisEl) jenisEl.textContent = p.jenisDiet || '-';
  if (bentukEl) bentukEl.textContent = p.bentukMakanan || '-';
  if (ruteEl) ruteEl.textContent = p.rute || '-';
  if (frekuensiEl) frekuensiEl.textContent = p.frekuensi || '-';
  if (catatanEl) catatanEl.textContent = p.catatanKhusus || '-';
}

/**
 * Menerapkan Preset Contoh Kasus Rumah Sakit
 */
function applyPreset(key) {
  const preset = CLINICAL_PRESETS[key];
  if (!preset) return;

  currentPatient = {
    ...currentPatient,
    ...preset,
    id: `pt_${Date.now()}`
  };

  populateFormFromState();
  recalculateAndRender();

  // Tampilkan toast notifikasi
  showToast(`Kasus "${preset.nama}" berhasil dimuat!`);
}

/**
 * Pilihan Cepat Diagnosa Medis (Quick Pick Chip)
 */
function setDiagnosaMedis(text) {
  const el = document.getElementById('diagnosaMedis');
  if (el) {
    el.value = text;
    readFormData();
    recalculateAndRender();
  }
}

/**
 * Simpan Data Pasien Saat Ini ke LocalStorage
 */
function saveCurrentPatient() {
  readFormData();
  const patients = getStoredPatients();

  const record = {
    ...currentPatient,
    id: currentPatient.id || `pt_${Date.now()}`,
    updatedAt: new Date().toISOString()
  };

  const existingIdx = patients.findIndex(p => p.noRm === record.noRm && record.noRm !== '');
  if (existingIdx >= 0) {
    patients[existingIdx] = record;
  } else {
    patients.unshift(record);
  }

  localStorage.setItem('nutriklinis_patients', JSON.stringify(patients));
  renderSavedPatientsList();
  showToast('Data asuhan gizi pasien berhasil disimpan ke riwayat!');
}

/**
 * Ambil daftar pasien dari LocalStorage
 */
function getStoredPatients() {
  try {
    const raw = localStorage.getItem('nutriklinis_patients');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Render Tabel Riwayat Pasien Tersimpan
 */
function renderSavedPatientsList() {
  const container = document.getElementById('savedPatientsTableBody');
  if (!container) return;

  const patients = getStoredPatients();
  if (patients.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-xs text-slate-400">
          Belum ada riwayat pasien tersimpan. Klik "Simpan Pasien" untuk menyimpan asesmen.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = patients.map(p => `
    <tr class="hover:bg-slate-50 border-b border-slate-100 transition">
      <td class="px-4 py-3 text-xs font-bold text-slate-800">${p.noRm || '-'}</td>
      <td class="px-4 py-3 text-xs font-semibold text-slate-700">${p.nama || 'Tanpa Nama'}</td>
      <td class="px-4 py-3 text-xs text-slate-500">${p.umur} th / ${p.gender}</td>
      <td class="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">${p.diagnosaMedis}</td>
      <td class="px-4 py-3 text-xs font-bold text-[#1B5E4B]">IMT ${p.imt ? p.imt.toFixed(1) : '-'}</td>
      <td class="px-4 py-3 text-xs text-right space-x-2">
        <button onclick="loadPatientById('${p.id}')" class="px-2.5 py-1 text-[11px] bg-[#1B5E4B]/10 hover:bg-[#1B5E4B]/20 text-[#1B5E4B] font-bold rounded-lg transition">Buka</button>
        <button onclick="deletePatientById('${p.id}')" class="px-2 py-1 text-[11px] text-rose-500 hover:text-rose-700 transition">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function loadPatientById(id) {
  const patients = getStoredPatients();
  const target = patients.find(p => p.id === id);
  if (target) {
    currentPatient = { ...target };
    populateFormFromState();
    recalculateAndRender();
    showToast(`Data ${currentPatient.nama} berhasil dibuka.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function deletePatientById(id) {
  if (confirm('Yakin ingin menghapus riwayat pasien ini?')) {
    let patients = getStoredPatients();
    patients = patients.filter(p => p.id !== id);
    localStorage.setItem('nutriklinis_patients', JSON.stringify(patients));
    renderSavedPatientsList();
    showToast('Riwayat berhasil dihapus.');
  }
}

/**
 * Salin Format CPPT Gizi ke Clipboard (Siap Paste ke SIMRS)
 */
function copyCPPTToClipboard() {
  readFormData();
  const pesSelected = currentPatient.activePESList.filter(p => p.isSelected !== false);
  const pesString = pesSelected.map((p, i) => `${i+1}. ${p.problem} berkaitan dengan ${p.etiology} ditandai oleh ${p.signs}`).join('\n');

  const text = `
CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT) - ASUHAN GIZI
Tgl: ${currentPatient.tglAsesmen} | Pasien: ${currentPatient.nama} (${currentPatient.umur} th / ${currentPatient.gender}) | No. RM: ${currentPatient.noRm} | Ruang: ${currentPatient.ruangan}

[S] SUBJEKTIF:
- Keluhan: ${currentPatient.keluhanKlinis.anoreksia ? 'Nafsu makan menurun, ' : ''}${currentPatient.keluhanKlinis.mualMuntah ? 'Mual/muntah, ' : ''}${currentPatient.keluhanKlinis.gangguanMenelan ? 'Sulit menelan, ' : ''}Toleransi asupan recall ~${currentPatient.riwayatMakan.asupanPersen}% kebutuhan.
- Alergi: ${currentPatient.riwayatMakan.pantanganAlergi || 'Tidak ada'}.

[O] OBJEKTIF:
- Antropometri: TB ${currentPatient.tb} cm, BB ${currentPatient.bb} kg, IMT ${currentPatient.imt.toFixed(1)} kg/m² (${window.NutritionCalc.calculateIMT(currentPatient.bb, currentPatient.tb).category}), BBI ${currentPatient.bbi} kg.
- Fisik/Klinis: TD ${currentPatient.keluhanKlinis.tensiSistolik}/${currentPatient.keluhanKlinis.tensiDiastolik} mmHg, Suhu ${currentPatient.keluhanKlinis.suhu}°C, Edema: ${currentPatient.keluhanKlinis.edema ? '(+)' : '(-) '}.
- Biokimia: GDS ${currentPatient.lab.gds || '-'} mg/dL, Albumin ${currentPatient.lab.albumin || '-'} g/dL, Hb ${currentPatient.lab.hb || '-'} g/dL, Ureum ${currentPatient.lab.ureum || '-'}, Kreatinin ${currentPatient.lab.kreatinin || '-'}.
- Diagnosa Medis: ${currentPatient.diagnosaMedis}.

[A] ASESMEN / DIAGNOSIS GIZI (PES):
${pesString}

[P] PLAN / INTERVENSI:
- Kebutuhan Energi: ${currentPatient.preskripsi.tee} kkal/hari (Protein: ${currentPatient.preskripsi.macros?.proteinGram}g, Lemak: ${currentPatient.preskripsi.macros?.lemakGram}g, Karbo: ${currentPatient.preskripsi.macros?.karboGram}g).
- Preskripsi Diet: ${currentPatient.preskripsi.jenisDiet} | Bentuk: ${currentPatient.preskripsi.bentukMakanan} | Frekuensi: ${currentPatient.preskripsi.frekuensi}.
- Monitoring: Pantau asupan makan harian $\ge 80\%$, monitoring berkala laboratorium & kondisi klinis.
  `.trim();

  navigator.clipboard.writeText(text).then(() => {
    showToast('Teks format CPPT berhasil disalin ke clipboard! Siap dipaste ke SIMRS.');
  }).catch(() => {
    alert('Gagal menyalin otomatis. Silakan salin manual.');
  });
}

/**
 * Buka Dialog Cetak Formulir Rekam Medis ADIME (A4 Print-Ready)
 */
function printADIMEForm() {
  readFormData();
  window.print();
}

/**
 * Toast Notifikasi Sederhana
 */
function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3200);
}
