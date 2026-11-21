/**
 * NutriLabel RS Pro - Aplikasi Utama Etiket Makan & Pemindai Verifikasi QR
 */

// State Aplikasi
let activeOrders = [];
let currentSelectedOrderId = null;
let auditLogs = [];
let currentVerificationResult = null;
let activeTab = 'create'; // 'create' | 'scanner' | 'audit'

// Database Demo Menu Rumah Sakit untuk Simulasi Nampan Dapur
const HOSPITAL_MENU_DATABASE = [
  {
    id: 'MENU-01',
    nama: 'Paket Lunak A (Aman): Nasi Tim Ayam + Tahu Semur + Sop Wortel',
    tekstur: 'Lunak',
    bahan: ['Beras', 'Daging Ayam', 'Tahu Kedelai', 'Wortel', 'Bawang', 'Kecap'],
    waktuMakan: 'Siang'
  },
  {
    id: 'MENU-02',
    nama: 'Paket Lunak B (Mengandung Telur): Nasi Tim + Orak-Arik Telur + Sayur Bayam',
    tekstur: 'Lunak',
    bahan: ['Beras', 'Telur Ayam', 'Bayam', 'Bawang', 'Garam Sedikit'],
    waktuMakan: 'Siang'
  },
  {
    id: 'MENU-03',
    nama: 'Paket Biasa (Tekstur Keras): Nasi Putih Pulen + Ayam Goreng Lengkuas + Sambal Goreng Udang',
    tekstur: 'Biasa',
    bahan: ['Beras', 'Daging Ayam', 'Udang', 'Minyak Goreng', 'Cabai', 'Bawang'],
    waktuMakan: 'Siang'
  },
  {
    id: 'MENU-04',
    nama: 'Paket Cair / Saring: Bubur Saring Halus + Ekstrak Putih Telur + Kaldu Ayam',
    tekstur: 'Saring',
    bahan: ['Beras Saring', 'Telur (Putih Telur)', 'Kaldu Ayam'],
    waktuMakan: 'Siang'
  }
];

// Inisialisasi Saat Dokumen Siap
document.addEventListener('DOMContentLoaded', () => {
  loadStoredOrders();
  loadStoredAuditLogs();
  initFormListeners();
  renderOrdersList();
  renderAuditLogs();

  // Jika belum ada pesanan sama sekali, isi dengan data awal
  if (activeOrders.length === 0) {
    seedInitialOrders();
  } else {
    selectOrderForPreview(activeOrders[0].id);
  }

  // Aktifkan ikon Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * Muat pesanan dari LocalStorage
 */
function loadStoredOrders() {
  try {
    const raw = localStorage.getItem('nutrilabel_orders');
    activeOrders = raw ? JSON.parse(raw) : [];
  } catch (e) {
    activeOrders = [];
  }
}

/**
 * Muat log audit dari LocalStorage
 */
function loadStoredAuditLogs() {
  try {
    const raw = localStorage.getItem('nutrilabel_audit_log');
    auditLogs = raw ? JSON.parse(raw) : [];
  } catch (e) {
    auditLogs = [];
  }
}

/**
 * Seed pesanan awal berdasarkan contoh dokumen spesifikasi
 */
function seedInitialOrders() {
  const seed = [
    {
      id: 'ORD-001234',
      noRm: '001234',
      nama: 'Tn. Andi Prasetyo',
      ruangan: 'Bangsal Mawar - Bed 03',
      waktuMakan: 'Siang',
      tanggal: new Date().toISOString().split('T')[0],
      jenisDiet: 'Diet Diabetes Mellitus (DM)',
      tekstur: 'Lunak',
      alergi: 'Telur',
      pantangan: 'Makanan tinggi gula murni',
      catatan: 'Nafsu makan membaik, porsi sedang'
    },
    {
      id: 'ORD-2026-8841',
      noRm: 'RM-2026-8841',
      nama: 'Ny. Siti Aminah',
      ruangan: 'Penyakit Dalam (Melati 04)',
      waktuMakan: 'Siang',
      tanggal: new Date().toISOString().split('T')[0],
      jenisDiet: 'Diet DM + Rendah Garam II',
      tekstur: 'Lunak',
      alergi: 'Udang, Seafood',
      pantangan: 'Makanan asin/diawetkan',
      catatan: 'Batasi konsumsi garam dan kuah asin'
    },
    {
      id: 'ORD-2026-7102',
      noRm: 'RM-2026-7102',
      nama: 'Tn. Bambang Sutrisno',
      ruangan: 'Bangsal Cempaka - Bed 02',
      waktuMakan: 'Siang',
      tanggal: new Date().toISOString().split('T')[0],
      jenisDiet: 'Diet Rendah Protein 40g (CKD St. 4)',
      tekstur: 'Lunak',
      alergi: 'Tidak ada alergi',
      pantangan: 'Makanan tinggi kalium dan natrium',
      catatan: 'Monitor asupan cairan ketat'
    },
    {
      id: 'ORD-2026-4091',
      noRm: 'RM-2026-4091',
      nama: 'Tn. M. Rizky Pratama',
      ruangan: 'Rawat Inap Isolasi Paru - Bed 01',
      waktuMakan: 'Siang',
      tanggal: new Date().toISOString().split('T')[0],
      jenisDiet: 'Diet Tinggi Kalori Tinggi Protein (TKTP)',
      tekstur: 'Saring',
      alergi: 'Susu sapi (Laktosa)',
      pantangan: 'Makanan padat keras',
      catatan: 'Ekstra putih telur non-laktosa'
    }
  ];

  activeOrders = seed;
  saveOrdersToStorage();
  renderOrdersList();
  selectOrderForPreview(seed[0].id);
}

function saveOrdersToStorage() {
  localStorage.setItem('nutrilabel_orders', JSON.stringify(activeOrders));
}

function saveAuditLogsToStorage() {
  localStorage.setItem('nutrilabel_audit_log', JSON.stringify(auditLogs));
}

/**
 * Sinkronisasi cepat dari pasien Asuhan Gizi NutriKlinis yang tersimpan
 */
function importFromNutriKlinis() {
  try {
    const raw = localStorage.getItem('nutriklinis_patients');
    const patients = raw ? JSON.parse(raw) : [];
    if (patients.length === 0) {
      alert('Belum ada pasien tersimpan di modul Asuhan Gizi. Silakan input pasien di NutriKlinis terlebih dahulu.');
      return;
    }

    let addedCount = 0;
    patients.forEach(p => {
      const orderId = `ORD-${p.noRm ? p.noRm.replace(/[^a-zA-Z0-9]/g, '') : Date.now()}`;
      if (!activeOrders.some(o => o.id === orderId)) {
        activeOrders.unshift({
          id: orderId,
          noRm: p.noRm || 'RM-BARU',
          nama: p.nama || 'Pasien Gizi',
          ruangan: p.ruangan || 'Bangsal Rawat Inap',
          waktuMakan: 'Siang',
          tanggal: new Date().toISOString().split('T')[0],
          jenisDiet: p.preskripsi?.jenisDiet || 'Diet Standar RS',
          tekstur: p.preskripsi?.bentukMakanan?.includes('Lunak') ? 'Lunak' :
                   p.preskripsi?.bentukMakanan?.includes('Saring') ? 'Saring' :
                   p.preskripsi?.bentukMakanan?.includes('Cair') ? 'Cair' : 'Biasa',
          alergi: p.riwayatMakan?.pantanganAlergi || 'Tidak ada',
          pantangan: p.riwayatMakan?.polaMakan?.length > 0 ? p.riwayatMakan.polaMakan.join(', ') : 'Sesuai diet medis',
          catatan: p.preskripsi?.catatanKhusus || 'Asuhan Gizi Terstandar'
        });
        addedCount++;
      }
    });

    saveOrdersToStorage();
    renderOrdersList();
    if (activeOrders.length > 0) selectOrderForPreview(activeOrders[0].id);
    showToast(`Berhasil menarik ${addedCount} data pasien dari Asuhan Gizi NutriKlinis!`);
  } catch (e) {
    console.error(e);
    alert('Terjadi kesalahan saat menarik data pasien.');
  }
}

/**
 * Inisialisasi event listener form pembuat etiket
 */
function initFormListeners() {
  const form = document.getElementById('formOrderEtiket');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveOrderFromForm();
    });
  }

  // Input listener untuk live preview
  const liveInputs = ['orderNama', 'orderNoRm', 'orderRuang', 'orderWaktu', 'orderDiet', 'orderTekstur', 'orderAlergi', 'orderPantangan'];
  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLivePreviewFromForm);
      el.addEventListener('change', updateLivePreviewFromForm);
    }
  });

  // Scanner manual input enter key
  const scannerInput = document.getElementById('scannerManualInput');
  if (scannerInput) {
    scannerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runScannerWithCode(scannerInput.value.trim());
      }
    });
  }
}

/**
 * Simpan pesanan baru dari formulir
 */
function saveOrderFromForm() {
  const getVal = id => document.getElementById(id)?.value.trim() || '';

  const id = document.getElementById('orderIdHidden')?.value || `ORD-${Date.now().toString().slice(-6)}`;
  const orderData = {
    id,
    nama: getVal('orderNama'),
    noRm: getVal('orderNoRm'),
    ruangan: getVal('orderRuang'),
    waktuMakan: getVal('orderWaktu'),
    tanggal: getVal('orderTanggal') || new Date().toISOString().split('T')[0],
    jenisDiet: getVal('orderDiet'),
    tekstur: getVal('orderTekstur'),
    alergi: getVal('orderAlergi'),
    pantangan: getVal('orderPantangan'),
    catatan: getVal('orderCatatan')
  };

  const existingIdx = activeOrders.findIndex(o => o.id === id);
  if (existingIdx >= 0) {
    activeOrders[existingIdx] = orderData;
    showToast('Instruksi etiket berhasil diperbarui!');
  } else {
    activeOrders.unshift(orderData);
    showToast('Etiket makan baru berhasil dibuat!');
  }

  saveOrdersToStorage();
  renderOrdersList();
  selectOrderForPreview(id);
  resetOrderForm();
}

function resetOrderForm() {
  document.getElementById('formOrderEtiket')?.reset();
  const hiddenId = document.getElementById('orderIdHidden');
  if (hiddenId) hiddenId.value = '';
  document.getElementById('orderTanggal').value = new Date().toISOString().split('T')[0];
  document.getElementById('formTitle').textContent = 'Buat Etiket Nampan Baru';
}

/**
 * Render daftar antrean etiket di sidebar / tabel
 */
function renderOrdersList() {
  const container = document.getElementById('ordersListContainer');
  const countBadge = document.getElementById('ordersCountBadge');
  if (countBadge) countBadge.textContent = `${activeOrders.length} Pasien`;
  if (!container) return;

  if (activeOrders.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-400">
        Belum ada etiket aktif. Silakan buat etiket baru melalui formulir di atas.
      </div>
    `;
    return;
  }

  container.innerHTML = activeOrders.map(o => {
    const isSelected = o.id === currentSelectedOrderId;
    const hasAllergy = o.alergi && !o.alergi.toLowerCase().includes('tidak') && !o.alergi.includes('-');

    return `
      <div onclick="selectOrderForPreview('${o.id}')" class="p-3 rounded-xl border cursor-pointer transition ${isSelected ? 'bg-white border-[#1B5E4B] shadow-sm ring-1 ring-[#1B5E4B]/20' : 'bg-slate-50/70 border-slate-200 hover:bg-white'}">
        <div class="flex items-start justify-between gap-2 mb-1">
          <div>
            <h4 class="text-xs font-bold text-slate-900 leading-tight">${o.nama}</h4>
            <span class="text-[10px] font-mono text-slate-500">${o.noRm} • ${o.ruangan}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
            ${o.waktuMakan}
          </span>
        </div>

        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600">
          <span class="font-medium truncate max-w-[170px] text-[#1B5E4B]">${o.jenisDiet} (${o.tekstur})</span>
          ${hasAllergy ? `<span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">Alergi: ${o.alergi}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Pilih satu pesanan untuk ditampilkan di kartu pratinjau etiket stiker 80x50mm
 */
function selectOrderForPreview(id) {
  currentSelectedOrderId = id;
  const order = activeOrders.find(o => o.id === id);
  if (!order) return;

  renderOrdersList();

  // Update pratinjau etiket
  document.getElementById('lblNama').textContent = order.nama;
  document.getElementById('lblNoRm').textContent = order.noRm;
  document.getElementById('lblRuang').textContent = order.ruangan;
  document.getElementById('lblWaktu').textContent = `${order.waktuMakan} (${order.tanggal || ''})`;
  document.getElementById('lblDiet').textContent = order.jenisDiet;
  document.getElementById('lblTekstur').textContent = order.tekstur;
  document.getElementById('lblAlergi').textContent = order.alergi || 'Tidak ada catatan alergi';
  document.getElementById('lblPantangan').textContent = order.pantangan || '-';
  document.getElementById('lblOrderId').textContent = order.id;

  // Generate QR Code SVG Vektor Bersih
  const qrContainer = document.getElementById('lblQrCodeContainer');
  if (qrContainer && window.QRCodeUtil) {
    qrContainer.innerHTML = window.QRCodeUtil.generateSVG(order.id, { size: 110, padding: 2, color: '#10392E' });
  }

  // Isi juga ke form edit jika ingin diubah
  document.getElementById('orderIdHidden').value = order.id;
  document.getElementById('orderNama').value = order.nama;
  document.getElementById('orderNoRm').value = order.noRm;
  document.getElementById('orderRuang').value = order.ruangan;
  document.getElementById('orderWaktu').value = order.waktuMakan;
  document.getElementById('orderTanggal').value = order.tanggal;
  document.getElementById('orderDiet').value = order.jenisDiet;
  document.getElementById('orderTekstur').value = order.tekstur;
  document.getElementById('orderAlergi').value = order.alergi;
  document.getElementById('orderPantangan').value = order.pantangan;
  document.getElementById('orderCatatan').value = order.catatan || '';
  document.getElementById('formTitle').textContent = `Ubah Etiket: ${order.nama}`;
}

/**
 * Live preview saat mengetik di form
 */
function updateLivePreviewFromForm() {
  const getVal = (id, fallback) => document.getElementById(id)?.value.trim() || fallback;
  document.getElementById('lblNama').textContent = getVal('orderNama', 'Nama Pasien');
  document.getElementById('lblNoRm').textContent = getVal('orderNoRm', '000000');
  document.getElementById('lblRuang').textContent = getVal('orderRuang', 'Ruangan Bed');
  document.getElementById('lblWaktu').textContent = getVal('orderWaktu', 'Siang');
  document.getElementById('lblDiet').textContent = getVal('orderDiet', 'Diet Standar RS');
  document.getElementById('lblTekstur').textContent = getVal('orderTekstur', 'Biasa');
  document.getElementById('lblAlergi').textContent = getVal('orderAlergi', 'Tidak ada');
  document.getElementById('lblPantangan').textContent = getVal('orderPantangan', 'Tidak ada');
}

/**
 * Hapus pesanan terpilih
 */
function deleteCurrentSelectedOrder() {
  if (!currentSelectedOrderId) return;
  if (confirm('Yakin ingin menghapus etiket pasien ini?')) {
    activeOrders = activeOrders.filter(o => o.id !== currentSelectedOrderId);
    saveOrdersToStorage();
    renderOrdersList();
    if (activeOrders.length > 0) {
      selectOrderForPreview(activeOrders[0].id);
    } else {
      resetOrderForm();
    }
    showToast('Etiket berhasil dihapus.');
  }
}

/**
 * Cetak Stiker Nampan Tunggal (Thermal Printer 80x50mm)
 */
function printSingleSticker() {
  if (!currentSelectedOrderId) {
    alert('Pilih etiket pasien terlebih dahulu untuk dicetak.');
    return;
  }
  document.body.setAttribute('data-print-mode', 'single');
  window.print();
}

/**
 * Cetak Lembar Massal A4 (12 Stiker per Halaman)
 */
function printBatchA4() {
  if (activeOrders.length === 0) {
    alert('Tidak ada etiket untuk dicetak.');
    return;
  }

  const container = document.getElementById('batchPrintA4Grid');
  if (!container) return;

  container.innerHTML = activeOrders.map(o => {
    const qrSvg = window.QRCodeUtil.generateSVG(o.id, { size: 70, padding: 1, color: '#16201B' });
    const hasAllergy = o.alergi && !o.alergi.toLowerCase().includes('tidak') && !o.alergi.includes('-');

    return `
      <div class="border border-black p-2.5 rounded text-[10px] leading-tight flex justify-between gap-2 h-[45mm] max-h-[45mm] overflow-hidden page-break-inside-avoid">
        <div class="flex flex-col justify-between flex-grow">
          <div>
            <div class="flex items-center justify-between border-b border-black pb-0.5 mb-1 font-bold">
              <span>RSUP ETIKET GIZI</span>
              <span class="font-mono text-[9px]">${o.waktuMakan}</span>
            </div>
            <p class="text-xs font-extrabold uppercase truncate">${o.nama}</p>
            <p class="font-mono text-[9px]">RM: ${o.noRm} | ${o.ruangan}</p>
            <p class="font-bold text-[9px] mt-0.5 text-[#1B5E4B]">Diet: ${o.jenisDiet}</p>
            <p class="font-semibold text-[9px]">Tekstur: ${o.tekstur}</p>
          </div>
          <div>
            ${hasAllergy ? `<p class="font-extrabold bg-gray-200 px-1 py-0.2 rounded text-[8px] text-red-700">⚠️ ALERGI: ${o.alergi}</p>` : ''}
            <p class="text-[8px] text-gray-500 font-mono">${o.id}</p>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center shrink-0 w-[24mm]">
          ${qrSvg}
          <span class="font-mono text-[8px] mt-0.5">${o.noRm}</span>
        </div>
      </div>
    `;
  }).join('');

  document.body.setAttribute('data-print-mode', 'batch');
  window.print();
}

/**
 * ==================== MODUL PEMINDAI VERIFIKASI QR (SCANNER) ====================
 */

/**
 * Jalankan pencocokan dengan kode order (dari scanner kamera, barcode reader, atau simulasi)
 */
function runScannerWithCode(orderId, chosenMenuIndex = 0) {
  const order = activeOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase() || o.noRm.toLowerCase() === orderId.toLowerCase());
  
  const menu = HOSPITAL_MENU_DATABASE[chosenMenuIndex] || HOSPITAL_MENU_DATABASE[0];
  const trayData = {
    menuNama: menu.nama,
    tekstur: menu.tekstur,
    bahan: menu.bahan,
    waktuMakan: menu.waktuMakan,
    ruangan: order ? order.ruangan : 'Bangsal Mawar'
  };

  const result = window.DietSafetyMatcher.verify(order, trayData);
  currentVerificationResult = {
    order,
    trayData,
    result,
    verifiedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    verifiedDate: new Date().toLocaleDateString('id-ID')
  };

  renderVerificationModal(currentVerificationResult);
}

/**
 * Render modal hasil pemeriksaan sistem
 */
function renderVerificationModal(v) {
  const modal = document.getElementById('verificationResultModal');
  const card = document.getElementById('verificationCard');
  if (!modal || !card) return;

  const isApproved = v.result.allowDistribution;
  const isDanger = v.result.status === 'HOLD_DANGER';

  card.className = `max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border-2 transition-all transform duration-200 ${
    isApproved ? 'border-emerald-500' : isDanger ? 'border-rose-600' : 'border-amber-500'
  }`;

  card.innerHTML = `
    <!-- Header Status -->
    <div class="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        isApproved ? 'bg-emerald-100 text-emerald-700' : isDanger ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-amber-100 text-amber-700'
      }">
        <i data-lucide="${isApproved ? 'check-circle-2' : isDanger ? 'shield-alert' : 'alert-triangle'}" class="w-7 h-7"></i>
      </div>
      <div>
        <span class="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${v.result.badgeClass}">
          ${v.result.summary}
        </span>
        <h3 class="text-base font-bold text-slate-900 mt-1">
          ${isApproved ? 'Makanan Sesuai & Aman Diserahkan' : 'DISTRIBUSI MAKANAN DITAHAN!'}
        </h3>
      </div>
    </div>

    <!-- Data Pasien vs Nampan -->
    <div class="space-y-3 text-xs">
      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
        <div class="flex justify-between text-slate-500">
          <span>Pasien:</span>
          <span class="font-bold text-slate-800">${v.order ? v.order.nama : 'Tidak Terdaftar'}</span>
        </div>
        <div class="flex justify-between text-slate-500">
          <span>No. RM / Ruangan:</span>
          <span class="font-mono font-bold text-slate-800">${v.order ? `${v.order.noRm} • ${v.order.ruangan}` : '-'}</span>
        </div>
        <div class="flex justify-between text-slate-500">
          <span>Instruksi Diet:</span>
          <span class="font-bold text-[#1B5E4B]">${v.order ? `${v.order.jenisDiet} (${v.order.tekstur})` : '-'}</span>
        </div>
        <div class="flex justify-between text-slate-500">
          <span>Catatan Alergi:</span>
          <span class="font-bold text-rose-700">${v.order?.alergi || 'Tidak ada'}</span>
        </div>
      </div>

      <!-- Menu Nampan yang Diperiksa -->
      <div class="p-3.5 bg-[#F6F7F4] rounded-2xl border border-[#E2E7E1] space-y-1">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Menu Makanan di Nampan:</span>
        <p class="font-extrabold text-slate-800 text-xs">${v.trayData.menuNama}</p>
        <p class="text-[11px] text-slate-500">Bahan/Komposisi: ${v.trayData.bahan.join(', ')}</p>
      </div>

      <!-- Daftar Isu / Peringatan Sistem -->
      ${v.result.issues.length > 0 ? `
        <div class="space-y-1.5">
          ${v.result.issues.map(iss => `
            <div class="p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              iss.severity === 'critical' ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
            }">
              <i data-lucide="alert-circle" class="w-4 h-4 shrink-0 mt-0.5"></i>
              <span>${iss.message}</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
          <span>Seluruh indikator identitas, diet, tekstur, dan bebas alergen terverifikasi aman.</span>
        </div>
      `}
    </div>

    <!-- Tombol Tindakan -->
    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
      <button onclick="closeVerificationModal()" class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
        Tutup
      </button>

      ${isApproved ? `
        <button onclick="confirmDistributionDelivery()" class="px-5 py-2.5 text-xs font-bold text-white bg-[#1B5E4B] hover:bg-[#144839] rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5">
          <i data-lucide="check" class="w-4 h-4"></i> Konfirmasi Serahkan ke Pasien
        </button>
      ` : `
        <button onclick="recordHoldIncident()" class="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5">
          <i data-lucide="lock" class="w-4 h-4"></i> Tahan & Catat Insiden Gizi
        </button>
      `}
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
}

function closeVerificationModal() {
  const modal = document.getElementById('verificationResultModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * Konfirmasi makanan lolos dan diserahkan ke pasien
 */
function confirmDistributionDelivery() {
  if (!currentVerificationResult) return;
  const v = currentVerificationResult;
  const staff = document.getElementById('staffNameInput')?.value.trim() || 'Petugas Distribusi Bangsal';

  const logEntry = {
    id: `LOG-${Date.now()}`,
    orderId: v.order ? v.order.id : '-',
    namaPasien: v.order ? v.order.nama : 'Pasien',
    ruangan: v.order ? v.order.ruangan : '-',
    waktuMakan: v.trayData.waktuMakan,
    status: 'LOLOS & DISERAHKAN',
    severity: 'success',
    menu: v.trayData.menuNama,
    petugas: staff,
    timestamp: `${v.verifiedDate} ${v.verifiedAt}`,
    catatan: 'Pemeriksaan fisik dan sistem sesuai 100%'
  };

  auditLogs.unshift(logEntry);
  saveAuditLogsToStorage();
  renderAuditLogs();
  closeVerificationModal();
  showToast('Distribusi makanan berhasil diverifikasi dan dicatat ke audit trail!');
}

/**
 * Catat insiden makanan ditahan (karena alergi atau salah tekstur)
 */
function recordHoldIncident() {
  if (!currentVerificationResult) return;
  const v = currentVerificationResult;
  const staff = document.getElementById('staffNameInput')?.value.trim() || 'Petugas Distribusi Bangsal';

  const logEntry = {
    id: `LOG-${Date.now()}`,
    orderId: v.order ? v.order.id : '-',
    namaPasien: v.order ? v.order.nama : 'Pasien',
    ruangan: v.order ? v.order.ruangan : '-',
    waktuMakan: v.trayData.waktuMakan,
    status: 'DITAHAN (BAHAYA ALERGI / TEKSTUR)',
    severity: 'danger',
    menu: v.trayData.menuNama,
    petugas: staff,
    timestamp: `${v.verifiedDate} ${v.verifiedAt}`,
    catatan: v.result.issues.map(i => i.message).join(' | ')
  };

  auditLogs.unshift(logEntry);
  saveAuditLogsToStorage();
  renderAuditLogs();
  closeVerificationModal();
  showToast('Makanan ditahan! Insiden tercatat di audit trail instalasi gizi.');
}

/**
 * Render Tabel Log Audit Distribusi
 */
function renderAuditLogs() {
  const container = document.getElementById('auditLogsTableBody');
  const countBadge = document.getElementById('auditCountBadge');
  if (countBadge) countBadge.textContent = `${auditLogs.length} Aktivitas`;
  if (!container) return;

  if (auditLogs.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-xs text-slate-400">
          Belum ada riwayat pemindaian makanan. Pindai QR Code untuk mencatat log audit.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = auditLogs.map(l => {
    const isSuccess = l.severity === 'success';
    return `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition text-xs">
        <td class="px-3.5 py-3 font-mono font-bold text-slate-700">${l.timestamp}</td>
        <td class="px-3.5 py-3 font-bold text-slate-900">${l.namaPasien}</td>
        <td class="px-3.5 py-3 text-slate-600">${l.ruangan}</td>
        <td class="px-3.5 py-3 text-slate-600 max-w-[200px] truncate">${l.menu}</td>
        <td class="px-3.5 py-3">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
            ${l.status}
          </span>
        </td>
        <td class="px-3.5 py-3 text-slate-500 font-medium">${l.petugas}</td>
        <td class="px-3.5 py-3 text-[11px] text-slate-500 italic max-w-[220px] truncate" title="${l.catatan}">${l.catatan}</td>
      </tr>
    `;
  }).join('');
}

function clearAuditLogs() {
  if (confirm('Yakin ingin mengosongkan riwayat audit distribusi?')) {
    auditLogs = [];
    saveAuditLogsToStorage();
    renderAuditLogs();
    showToast('Log audit berhasil dibersihkan.');
  }
}

/**
 * Tab Switching Navigasi
 */
function switchAppTab(tab) {
  activeTab = tab;
  ['create', 'scanner', 'audit'].forEach(t => {
    const section = document.getElementById(`tab-section-${t}`);
    const btn = document.getElementById(`nav-btn-${t}`);
    if (section) {
      if (t === tab) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    }
    if (btn) {
      if (t === tab) {
        btn.className = 'tab-btn active px-4 py-2.5 text-xs font-bold border-b-2 border-[#1B5E4B] text-[#1B5E4B] flex items-center gap-2 transition';
      } else {
        btn.className = 'tab-btn px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition';
      }
    }
  });
}

/**
 * Toast Notifikasi
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
