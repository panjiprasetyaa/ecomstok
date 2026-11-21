# Dokumentasi Sistem E-COMSTOCK: Electronic Food Waste Monitoring Rumah Sakit

**Sistem Pemantauan Taksiran Visual Sisa Makanan Pasien Rawat Inap (Metode Visual Comstock 6 Skala Standar Kemenkes RI)**

---

## 1. Transformasi Desain Baru (Berbeda Total dari Proyek Mba Lilis)

Aplikasi **E-COMSTOCK** pada `index.html` telah dirancang ulang sepenuhnya dengan **Clean Light Minimalist Medical Aesthetic**, meninggalkan tema gelap lama proyek Mba Lilis. Tampilan sekarang 100% presisi mengacu pada prototipe visual:

- **Canvas & Kartu**: Latar belakang abu-abu terang lembut (`#f8fafc`) dengan kartu putih bersih (`#ffffff`), border halus, dan bayangan lembut.
- **Header**: Judul tebal warna biru medis `E-COMSTOCK` (`text-blue-700`), badge pill biru muda `Prototype demo` (`bg-blue-50 text-blue-700`), dan subtitle `Electronic Food Waste Monitoring`.
- **Kontrol Input**: Menggunakan bentuk pill halus (`rounded-full`) dengan border warna slate muda (`#e2e8f0`) serta aksen fokus biru (`#2563eb`).
- **Kotak Perhitungan (C)**: Kotak bernuansa soft ice-blue (`#f0f7ff`) dengan angka sisa tebal biru `74.0%` (`text-blue-700`), bar progress biru pekat (`bg-blue-600`), dan angka dikonsumsi `26.0%`.
- **Tombol Utama**: Solid black pill button (`bg-black text-white rounded-full`) bertuliskan `Simpan simulasi pengamatan` serta tombol biru `Simpan & Lanjut Pasien Berikutnya (+1)`.
- **Grafik Komponen**: Menggunakan chart batang warna biru langit lembut (`#60a5fa`) sesuai Gambar 6 prototipe.

---

## 2. Fitur Utama Sesuai Catatan Pengguna

1. **Kapasitas 200 Pasien & Tombol `+`**:
   - Mendukung pencatatan hingga 200 pasien (`P001` s.d `P200`).
   - Tombol hijau `+ Pasien` otomatis mencari dan mengalokasikan kode pasien berikutnya yang belum terisi serta menyiapkan formulir baru.
   - Tombol `Simpan & Lanjut Pasien Berikutnya (+1)` untuk mempermudah pencatatan massal secara beruntun.
   - Fitur `Generate Otomatis Slot Pasien Lengkap (s.d P200)` untuk simulasi data penuh.

2. **Komponen "Makanan Pokok" & Kolom Nama Menu Bisa Diketik**:
   - Tulisan "Nasi" diganti dengan **Makanan Pokok**.
   - Setiap 5 komponen (**Makanan Pokok, Lauk Hewani, Lauk Nabati, Sayur, Buah**) dilengkapi kolom teks input nama menu agar petugas gizi dapat mengetik nama masakan spesifik yang disajikan.

3. **Standar Ilmiah Visual Comstock 6 Skala**:
   - 0% (Habis / Skala 0)
   - 25% (Sisa 1/4 porsi / Skala 1)
   - 50% (Sisa 1/2 porsi / Skala 2)
   - 75% (Sisa 3/4 porsi / Skala 3)
   - 95% (Hampir utuh &plusmn; 1 sdm / Skala 4)
   - 100% (Utuh / Skala 5)
   - Dilengkapi progress bar visual hijau real-time pada setiap komponen.

4. **Laporan Rata-rata Semua Pasien dalam Setiap Ruangan**:
   - Menghitung rata-rata sisa makanan tertimbang per ruangan (*Melati, Mawar, Anggrek, Dahlia, Teratai, Flamboyan, ICU, VIP*).
   - Menampilkan status kepatuhan terhadap indikator Standar Pelayanan Minimal (SPM) Gizi Rumah Sakit (&le; 20%).
   - Dilengkapi tabel rekapitulasi 5 komponen dan grafik perbandingan antar ruangan.

5. **Ekspor & Cetak Laporan**:
   - **Ekspor MS Word (`.doc`)**: Format resmi ber-Kop Surat RSUD Sehat Sentosa dengan tabel rekapitulasi ruangan, rincian pasien, dan lembar tanda tangan Kepala Instalasi Gizi.
   - **Cetak / PDF**: Mode cetak kertas A4 terformat bersih sesuai formulir baku Kemenkes RI.
   - **Unduh CSV**: Berkas spreadsheet untuk Microsoft Excel.

---

## 3. Cara Penggunaan Singkat

1. Buka file `index.html` di Google Chrome atau Microsoft Edge.
2. Untuk mencatat pasien baru, klik tombol `+ Pasien`.
3. Pilih Ruangan dan Waktu Makan, lalu ketik nama menu jika diperlukan.
4. Pilih skala sisa makanan Comstock pada masing-masing komponen.
5. Klik `Simpan simulasi pengamatan` atau `Simpan & Lanjut Pasien Berikutnya (+1)`.
6. Untuk melihat laporan dan grafik, klik tab `Rekapitulasi Rata-rata Ruangan`.
7. Untuk mencetak atau mengekspor dokumen, gunakan tombol `Ekspor Word`, `Cetak / PDF`, atau `Unduh CSV` di bagian header atas.
