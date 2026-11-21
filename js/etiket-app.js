/**
 * NutriLabel RS Pro - Aplikasi Utama Etiket Makan & Pemindai Verifikasi QR
 * Versi Revisi: WebRTC Live Camera Scanner, Audio Beep, Nordic Slate Aesthetics, Ekspor PDF & CSV
 */

// State Aplikasi
let activeOrders = [];
let currentSelectedOrderId = null;
let auditLogs = [];
let currentVerificationResult = null;
let activeTab = 'create'; // 'create' | 'scanner' | 'audit'

// State Pemindai Kamera Nyata (WebRTC)
let activeVideoStream = null;
let isScanningActive = false;
let currentFacingMode = 'environment'; // 'environment' (belakang) atau 'user' (depan)
let barcodeDetector = null;

// Database Menu Rumah Sakit untuk Verifikasi Nampan
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
    nama: 'Paket Biasa (Tekstur Keras): Nasi Putih Pulen + Ayam Goreng Lengkuas + Sambal Udang',
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
  initBarcodeDetector();
  renderOrdersList();
  renderPatientsTable();
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
 * Inisialisasi API BarcodeDetector jika didukung peramban
 */
function initBarcodeDetector() {
  if ('BarcodeDetector' in window) {
    try {
      barcodeDetector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
    } catch (e) {
      barcodeDetector = null;
    }
  }
}

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
 * Data awal etiket pasien
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
  renderPatientsTable();
  selectOrderForPreview(seed[0].id);
  showToast('Data demo pasien berhasil dimuat ulang!');
}

function saveOrdersToStorage() {
  localStorage.setItem('nutrilabel_orders', JSON.stringify(activeOrders));
}

function saveAuditLogsToStorage() {
  localStorage.setItem('nutrilabel_audit_log', JSON.stringify(auditLogs));
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
  const liveInputs = ['orderNama', 'orderNoRm', 'orderRuang', 'orderWaktu', 'orderDiet', 'orderTekstur'];
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
    // Alergi dan Pantangan disimpan sebagai catatan klinis internal, BUKAN untuk QR atau stiker fisik
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
    showToast('Etiket makan baru berhasil disimpan!');
  }

  saveOrdersToStorage();
  renderOrdersList();
  renderPatientsTable();
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
 * Render daftar antrean etiket di sidebar
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

    return `
      <div onclick="selectOrderForPreview('${o.id}')" class="p-3 rounded-xl border cursor-pointer transition ${
        isSelected 
          ? 'bg-white border-[#0F172A] shadow-xs ring-1 ring-[#0F172A]/15' 
          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
      }">
        <div class="flex items-start justify-between gap-2 mb-1">
          <div>
            <h4 class="text-xs font-bold text-slate-900 leading-tight">${o.nama}</h4>
            <span class="text-[10px] font-mono text-slate-500">${o.noRm} • ${o.ruangan}</span>
          </div>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
            ${o.waktuMakan}
          </span>
        </div>

        <div class="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-600">
          <span class="font-semibold truncate max-w-[200px] text-[#0F172A]">${o.jenisDiet}</span>
          <span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">${o.tekstur}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render Tabel Pasien pada Tab Tersendiri ("Daftar Pasien Terdata")
 */
function renderPatientsTable() {
  const container = document.getElementById('patientsTableBody');
  const countBadge = document.getElementById('patientsCountBadge');
  if (countBadge) countBadge.textContent = `${activeOrders.length} Pasien`;
  if (!container) return;

  const searchQuery = (document.getElementById('searchPatientInput')?.value || '').toLowerCase().trim();
  const filterWaktu = document.getElementById('filterWaktuSelect')?.value || 'all';

  let filtered = activeOrders;
  if (searchQuery) {
    filtered = filtered.filter(o => 
      o.nama.toLowerCase().includes(searchQuery) || 
      o.noRm.toLowerCase().includes(searchQuery) || 
      o.ruangan.toLowerCase().includes(searchQuery) ||
      o.jenisDiet.toLowerCase().includes(searchQuery)
    );
  }
  if (filterWaktu !== 'all') {
    filtered = filtered.filter(o => o.waktuMakan.toLowerCase() === filterWaktu.toLowerCase());
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-12 text-center text-xs text-slate-400">
          <div class="max-w-xs mx-auto space-y-2">
            <i data-lucide="user-x" class="w-8 h-8 text-slate-300 mx-auto"></i>
            <p class="font-semibold text-slate-600">Tidak ada data pasien yang cocok.</p>
            <p class="text-[11px] text-slate-400">Gunakan kata kunci pencarian lain atau buat etiket baru.</p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(o => {
    const isSelected = o.id === currentSelectedOrderId;
    const qrThumb = window.QRCodeUtil ? window.QRCodeUtil.generateSVG(o.id, { size: 36, padding: 1, color: '#0F172A' }) : '';
    const hasAllergy = o.alergi && !o.alergi.toLowerCase().includes('tidak') && !o.alergi.includes('-');

    return `
      <tr class="hover:bg-slate-50/80 border-b border-slate-100 transition text-xs ${isSelected ? 'bg-slate-50/60' : ''}">
        <td class="px-3.5 py-3 font-mono font-bold text-slate-900">
          ${o.noRm}
          <span class="block text-[10px] text-slate-400 font-normal">${o.id}</span>
        </td>
        <td class="px-3.5 py-3 font-bold text-slate-900">
          ${o.nama}
        </td>
        <td class="px-3.5 py-3 text-slate-700 font-medium">
          ${o.ruangan}
        </td>
        <td class="px-3.5 py-3 font-mono text-slate-700">
          <span class="font-bold text-slate-800">${o.waktuMakan}</span>
          <span class="block text-[10px] text-slate-400">${o.tanggal || '-'}</span>
        </td>
        <td class="px-3.5 py-3 font-bold text-slate-900">
          ${o.jenisDiet}
          <span class="block text-[10px] text-slate-500 font-medium">${o.tekstur}</span>
        </td>
        <td class="px-3.5 py-3 text-[11px] text-slate-600 max-w-[200px]">
          ${hasAllergy ? `<span class="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded mr-1 mb-1">Alergi: ${o.alergi}</span>` : ''}
          ${o.pantangan ? `<span class="block text-[10px] text-slate-500 truncate" title="${o.pantangan}">Pantangan: ${o.pantangan}</span>` : '<span class="text-slate-400">-</span>'}
        </td>
        <td class="px-3.5 py-2 text-center">
          <div class="w-9 h-9 mx-auto flex items-center justify-center bg-white p-0.5 border border-slate-200 rounded">
            ${qrThumb}
          </div>
        </td>
        <td class="px-3.5 py-3 text-right whitespace-nowrap space-x-1.5">
          <button onclick="selectOrderAndSwitchToCreate('${o.id}')" class="px-2.5 py-1 text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition" title="Buka &amp; Pratinjau Stiker">
            Buka &amp; Cetak
          </button>
          <button onclick="deleteOrderById('${o.id}')" class="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition" title="Hapus Etiket">
            Hapus
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function selectOrderAndSwitchToCreate(id) {
  selectOrderForPreview(id);
  switchAppTab('create');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteOrderById(id) {
  if (confirm('Yakin ingin menghapus etiket pasien ini?')) {
    activeOrders = activeOrders.filter(o => o.id !== id);
    saveOrdersToStorage();
    renderOrdersList();
    renderPatientsTable();
    if (activeOrders.length > 0) {
      selectOrderForPreview(activeOrders[0].id);
    } else {
      resetOrderForm();
    }
    showToast('Etiket pasien berhasil dihapus.');
  }
}

/**
 * Pilih satu pesanan untuk ditampilkan di kartu pratinjau etiket stiker 80x50mm
 * (Alergi dan Pantangan TIDAK DITAMPILKAN pada stiker fisik nampan)
 */
function selectOrderForPreview(id) {
  currentSelectedOrderId = id;
  const order = activeOrders.find(o => o.id === id);
  if (!order) return;

  renderOrdersList();

  // Update pratinjau fisik etiket stiker 80x50mm
  document.getElementById('lblNama').textContent = order.nama;
  document.getElementById('lblNoRm').textContent = order.noRm;
  document.getElementById('lblRuang').textContent = order.ruangan;
  document.getElementById('lblWaktu').textContent = `${order.waktuMakan} (${order.tanggal || ''})`;
  document.getElementById('lblDiet').textContent = order.jenisDiet;
  document.getElementById('lblTekstur').textContent = order.tekstur;
  document.getElementById('lblOrderId').textContent = order.id;

  // Generate QR Code: murni berisi kode pesanan unik (tanpa data pribadi/alergi)
  const qrContainer = document.getElementById('lblQrCodeContainer');
  if (qrContainer && window.QRCodeUtil) {
    qrContainer.innerHTML = window.QRCodeUtil.generateSVG(order.id, { size: 110, padding: 2, color: '#0F172A' });
  }

  // Isi juga ke form edit
  document.getElementById('orderIdHidden').value = order.id;
  document.getElementById('orderNama').value = order.nama;
  document.getElementById('orderNoRm').value = order.noRm;
  document.getElementById('orderRuang').value = order.ruangan;
  document.getElementById('orderWaktu').value = order.waktuMakan;
  document.getElementById('orderTanggal').value = order.tanggal;
  document.getElementById('orderDiet').value = order.jenisDiet;
  document.getElementById('orderTekstur').value = order.tekstur;
  document.getElementById('orderAlergi').value = order.alergi || '';
  document.getElementById('orderPantangan').value = order.pantangan || '';
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
 * Cetak Stiker Nampan Tunggal (Thermal 80x50mm)
 */
function printSingleSticker() {
  if (!currentSelectedOrderId) {
    alert('Pilih etiket pasien terlebih dahulu.');
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
    const qrSvg = window.QRCodeUtil.generateSVG(o.id, { size: 70, padding: 1, color: '#0F172A' });

    return `
      <div class="border border-black p-2.5 rounded text-[10px] leading-tight flex justify-between gap-2 h-[45mm] max-h-[45mm] overflow-hidden page-break-inside-avoid">
        <div class="flex flex-col justify-between flex-grow">
          <div>
            <div class="flex items-center justify-between border-b border-black pb-0.5 mb-1 font-bold">
              <span>RSUP ETIKET DIET</span>
              <span class="font-mono text-[9px]">${o.waktuMakan}</span>
            </div>
            <p class="text-xs font-extrabold uppercase truncate">${o.nama}</p>
            <p class="font-mono text-[9px]">RM: ${o.noRm} | ${o.ruangan}</p>
            <p class="font-bold text-[9px] mt-0.5 text-black">Diet: ${o.jenisDiet}</p>
            <p class="font-semibold text-[9px]">Tekstur: ${o.tekstur}</p>
          </div>
          <div>
            <p class="text-[8px] text-gray-500 font-mono">${o.id} • ${o.tanggal}</p>
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
 * ==================== EKSPOR CSV & PDF ====================
 */

/**
 * Ekspor Data Etiket Pasien ke Berkas CSV (Excel-Compatible)
 */
function exportOrdersToCSV() {
  if (activeOrders.length === 0) {
    alert('Belum ada data etiket untuk diekspor.');
    return;
  }

  let csv = '\uFEFFID Pesanan,No Rekam Medis,Nama Pasien,Ruangan,Waktu Makan,Tanggal,Jenis Diet,Tekstur,Catatan Klinis Alergi (Internal),Catatan Pantangan (Internal),Catatan Tambahan\n';
  activeOrders.forEach(o => {
    csv += `"${o.id}","${o.noRm}","${o.nama}","${o.ruangan}","${o.waktuMakan}","${o.tanggal}","${o.jenisDiet}","${o.tekstur}","${o.alergi || '-'}","${o.pantangan || '-'}","${o.catatan || '-'}"\n`;
  });

  downloadCSVFile(csv, `etiket_pasien_${new Date().toISOString().split('T')[0]}.csv`);
  showToast('Berkas CSV etiket pasien berhasil diunduh!');
}

/**
 * Ekspor Data Log Audit Distribusi ke CSV
 */
function exportAuditLogsToCSV() {
  if (auditLogs.length === 0) {
    alert('Belum ada riwayat audit distribusi untuk diekspor.');
    return;
  }

  let csv = '\uFEFFID Log,Waktu Pindai,Nama Pasien,Ruangan,Waktu Makan,Menu Nampan,Status Verifikasi,Petugas Pemeriksa,Catatan Kesesuaian\n';
  auditLogs.forEach(l => {
    csv += `"${l.id}","${l.timestamp}","${l.namaPasien}","${l.ruangan}","${l.waktuMakan}","${l.menu}","${l.status}","${l.petugas}","${l.catatan}"\n`;
  });

  downloadCSVFile(csv, `audit_distribusi_gizi_${new Date().toISOString().split('T')[0]}.csv`);
  showToast('Berkas CSV log audit berhasil diunduh!');
}

/**
 * Ekspor / Cetak Laporan Audit Distribusi ke Format PDF Resmi
 */
function exportAuditLogsToPDF() {
  if (auditLogs.length === 0) {
    alert('Belum ada riwayat audit untuk dicetak.');
    return;
  }

  const container = document.getElementById('auditReportPrintArea');
  if (!container) return;

  container.innerHTML = `
    <div class="border-b-2 border-black pb-3 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-extrabold uppercase">LAPORAN MUTU AUDIT DISTRIBUSI MAKANAN PASIEN</h2>
          <p class="text-xs">INSTALASI GIZI RUMAH SAKIT UMUM PUSAT</p>
          <p class="text-[10px] text-gray-600">Dokumen Rekam Mutu Verifikasi Etiket QR Code &amp; Pencegahan Salah Diet</p>
        </div>
        <div class="text-right text-[10px] font-mono">
          <p>Tgl Cetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
          <p>Total Data: ${auditLogs.length} Pemeriksaan</p>
        </div>
      </div>
    </div>

    <table class="w-full text-[10px] border-collapse border border-black mb-6">
      <thead>
        <tr class="bg-gray-100 border-b border-black text-left">
          <th class="p-1.5 border-r border-black w-24">Waktu</th>
          <th class="p-1.5 border-r border-black">Pasien &amp; Ruangan</th>
          <th class="p-1.5 border-r border-black">Menu Nampan</th>
          <th class="p-1.5 border-r border-black w-28">Status Sistem</th>
          <th class="p-1.5 border-r border-black w-24">Petugas</th>
          <th class="p-1.5">Keterangan</th>
        </tr>
      </thead>
      <tbody>
        ${auditLogs.map(l => `
          <tr class="border-b border-gray-300">
            <td class="p-1.5 border-r border-gray-300 font-mono">${l.timestamp}</td>
            <td class="p-1.5 border-r border-gray-300 font-bold">${l.namaPasien}<br><span class="font-normal text-gray-600">${l.ruangan}</span></td>
            <td class="p-1.5 border-r border-gray-300">${l.menu}</td>
            <td class="p-1.5 border-r border-gray-300 font-bold ${l.severity === 'success' ? 'text-green-800' : 'text-red-800'}">${l.status}</td>
            <td class="p-1.5 border-r border-gray-300">${l.petugas}</td>
            <td class="p-1.5 text-gray-700 italic">${l.catatan}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="flex justify-between items-end pt-8 text-[11px]">
      <div>
        <p class="text-[10px] text-gray-500">Sistem NutriLabel RS Pro - Laporan Mutu Pelayanan Gizi</p>
      </div>
      <div class="text-center w-52">
        <p class="mb-14">Kepala Ruang / Supervisor Distribusi Gizi,</p>
        <p class="font-bold underline">( .................................................... )</p>
      </div>
    </div>
  `;

  document.body.setAttribute('data-print-mode', 'audit');
  window.print();
}

/**
 * Utilitas pengunduh string CSV ke file lokal
 */
function downloadCSVFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * ==================== PEMINDAI KAMERA NYATA (WEBRTC CAMERA SCANNER) ====================
 */

/**
 * Mengaktifkan kamera nyata smartphone/laptop petugas
 */
async function startRealCameraScanner() {
  const video = document.getElementById('scannerVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const statusEl = document.getElementById('cameraStatusText');

  try {
    if (activeVideoStream) {
      stopRealCameraScanner();
    }

    statusEl.textContent = 'Meminta izin kamera peramban...';
    statusEl.className = 'text-xs text-amber-600 font-semibold';

    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    activeVideoStream = stream;
    video.srcObject = stream;
    await video.play();

    placeholder.classList.add('hidden');
    video.classList.remove('hidden');

    document.getElementById('btnStartCamera').classList.add('hidden');
    document.getElementById('btnStopCamera').classList.remove('hidden');
    document.getElementById('btnSwitchCamera').classList.remove('hidden');

    statusEl.textContent = '● Kamera aktif. Arahkan lensa ke QR Code etiket nampan.';
    statusEl.className = 'text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5';

    isScanningActive = true;
    requestAnimationFrame(scanVideoFrameLoop);
  } catch (err) {
    console.error('Camera access error:', err);
    placeholder.classList.remove('hidden');
    video.classList.add('hidden');
    statusEl.textContent = 'Izin kamera belum diberikan atau perangkat tidak memiliki kamera. Silakan izinkan akses kamera di pengaturan peramban Anda, atau gunakan kolom kode manual di bawah.';
    statusEl.className = 'text-xs text-rose-700 font-semibold';
  }
}

/**
 * Menghentikan stream kamera
 */
function stopRealCameraScanner() {
  isScanningActive = false;
  if (activeVideoStream) {
    activeVideoStream.getTracks().forEach(track => track.stop());
    activeVideoStream = null;
  }

  const video = document.getElementById('scannerVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const statusEl = document.getElementById('cameraStatusText');

  if (video) {
    video.pause();
    video.srcObject = null;
    video.classList.add('hidden');
  }
  if (placeholder) placeholder.classList.remove('hidden');

  document.getElementById('btnStartCamera')?.classList.remove('hidden');
  document.getElementById('btnStopCamera')?.classList.add('hidden');
  document.getElementById('btnSwitchCamera')?.classList.add('hidden');

  if (statusEl) {
    statusEl.textContent = 'Kamera tidak aktif. Klik tombol di bawah untuk menyalakan pemindai.';
    statusEl.className = 'text-xs text-slate-500 font-medium';
  }
}

/**
 * Mengganti kamera depan / belakang
 */
function switchCamera() {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  startRealCameraScanner();
}

/**
 * Loop analisis frame video untuk mendeteksi barcode/QR
 */
async function scanVideoFrameLoop() {
  if (!isScanningActive || !activeVideoStream) return;

  const video = document.getElementById('scannerVideo');
  if (video && video.readyState >= video.HAVE_CURRENT_DATA) {
    try {
      if (barcodeDetector) {
        const barcodes = await barcodeDetector.detect(video);
        if (barcodes.length > 0) {
          const detectedCode = barcodes[0].rawValue;
          if (detectedCode) {
            playBeepSound();
            runScannerWithCode(detectedCode);
            // Jeda sejenak agar tidak memicu scan berulang kali dalam 1 detik
            setTimeout(() => {
              if (isScanningActive) requestAnimationFrame(scanVideoFrameLoop);
            }, 1800);
            return;
          }
        }
      }
    } catch (e) {
      // Loop berlanjut bila frame kosong
    }
  }

  if (isScanningActive) {
    requestAnimationFrame(scanVideoFrameLoop);
  }
}

/**
 * Suara bip audio halus via Web Audio API saat barcode terdeteksi
 */
function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz crisp medical tone
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {}
}

/**
 * Jalankan pencocokan dengan kode order (dari kamera, barcode gun, atau tombol simulasi)
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
    isApproved ? 'border-emerald-600' : isDanger ? 'border-rose-600' : 'border-amber-500'
  }`;

  card.innerHTML = `
    <!-- Header Status -->
    <div class="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        isApproved ? 'bg-emerald-50 text-emerald-700' : isDanger ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-amber-50 text-amber-700'
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
          <span class="font-bold text-slate-900">${v.order ? `${v.order.jenisDiet} (${v.order.tekstur})` : '-'}</span>
        </div>
        <div class="flex justify-between text-slate-500">
          <span>Catatan Klinis Alergi (Internal):</span>
          <span class="font-bold text-rose-700">${v.order?.alergi || 'Tidak ada'}</span>
        </div>
      </div>

      <!-- Menu Nampan yang Diperiksa -->
      <div class="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-1">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Menu Makanan di Nampan:</span>
        <p class="font-extrabold text-slate-900 text-xs">${v.trayData.menuNama}</p>
        <p class="text-[11px] text-slate-500">Komposisi Bahan: ${v.trayData.bahan.join(', ')}</p>
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
        <button onclick="confirmDistributionDelivery()" class="px-5 py-2.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5">
          <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Konfirmasi Serahkan ke Pasien
        </button>
      ` : `
        <button onclick="recordHoldIncident()" class="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5">
          <i data-lucide="lock" class="w-4 h-4"></i> Tahan &amp; Catat Insiden Gizi
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
  if (countBadge) countBadge.textContent = `${auditLogs.length} Pemeriksaan`;
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
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
            ${l.status}
          </span>
        </td>
        <td class="px-3.5 py-3 text-slate-600 font-medium">${l.petugas}</td>
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
  // Jika berpindah keluar dari scanner, matikan kamera agar baterai dan privasi terjaga
  if (tab !== 'scanner' && isScanningActive) {
    stopRealCameraScanner();
  }

  ['create', 'patients', 'scanner', 'audit'].forEach(t => {
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
        btn.className = 'tab-btn active px-4 py-2.5 text-xs font-bold border-b-2 border-[#0F172A] text-[#0F172A] flex items-center gap-2 transition';
      } else {
        btn.className = 'tab-btn px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition';
      }
    }
  });

  if (tab === 'patients') {
    renderPatientsTable();
  }
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
