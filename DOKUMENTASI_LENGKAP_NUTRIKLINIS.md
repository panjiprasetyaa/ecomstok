# Dokumentasi Lengkap Sistem Asuhan Gizi Klinis RS & Auto-PES Generator
## NutriKlinis RS Pro (e-PAGT v3.0)

Aplikasi web terpadu untuk Ahli Gizi / Dietisien Rumah Sakit yang mengotomatisasi penghitungan antropometri, kebutuhan kalori klinis, dan perumusan **Diagnosis Gizi Terstandar (Format PES: Problem - Etiologi - Signs/Symptoms)** sesuai pedoman resmi Proses Asuhan Gizi Terstandar (PAGT / *Nutrition Care Process*).

---

## 1. Ringkasan Eksekutif & Permintaan Pengguna

### Kebutuhan User (User 3):
> *"Web yg isinya identitas pasien, nanti ahli gizi tinggal masukkan nama umur tb bb, terus diagnosa medis, masukan riwayat makan dan hasil lab, terus dibagian diagnosis gizi itu jadi otomatis terisi kak."*

### Solusi yang Diimplementasikan:
1. **Form Asesmen Gizi Komprehensif (ADIME):**
   - **Antropometri (A):** Nama, Usia, No. RM, Gender, Ruang Rawat, TB, BB.
   - **Kalkulasi Otomatis Seketika:** Indeks Massa Tubuh (IMT), Kategori Status Gizi Kemenkes/WHO Asia-Pasifik, Berat Badan Ideal (BBI Broca Klinis).
   - **Diagnosa Medis (C):** Pilihan cepat ICD-10 (DM Tipe 2, Hipertensi, CKD, Post-Op, Stroke, Malnutrisi, dll) + keluhan tanda vital & fisik (Tekanan darah, suhu, mual/muntah, edema, disfagia).
   - **Riwayat Makan / Dietary (D):** Persentase asupan recall harian (slider & number), pola makan berisiko (manis, asin, lemak, rendah serat), riwayat alergi.
   - **Hasil Laboratorium (B):** GDS, GDP, Albumin, Hb, Ureum, Kreatinin, Kolesterol, Trigliserida, Asam Urat, Natrium, Kalium dengan rujukan normal otomatis.
2. **Mesin Inferensi Diagnosis Gizi Otomatis (The PES Engine):**
   - Menggunakan rule matrix multi-domain (*Intake* `NI`, *Klinis* `NC`, *Perilaku* `NB`).
   - Setiap kali ahli gizi mengetik atau mengubah nilai di sebelah kiri, kartu Diagnosis Gizi di sebelah kanan **langsung terisi otomatis**.
   - Setiap kartu memiliki checkbox keaktifan, domain badge, dan teks Problem, Etiologi, Signs yang **tetap dapat diedit secara bebas (*inline editable*)** oleh ahli gizi untuk fleksibilitas klinis.
3. **Kalkulator Kebutuhan Energi & Preskripsi Diet:**
   - Basal Energy Expenditure (BEE) Mifflin-St Jeor & Total Energy Expenditure (TEE) disesuaikan faktor aktivitas dan faktor stres penyakit.
   - Distribusi makronutrien (Protein, Lemak, Karbohidrat).
   - Preskripsi otomatis: Jenis Diet, Bentuk Makanan (Biasa, Lunak/Bubur, Saring, Cair), Rute & Frekuensi makan.
4. **Ekspor & Cetak Standar Rekam Medis (A4 ADIME / CPPT):**
   - Tombol **Cetak ADIME**: Membuka lembar cetak A4 berstandar KARS/Akreditasi RS lengkap dengan kop rumah sakit dan tanda tangan ahli gizi.
   - Tombol **Salin CPPT**: Menyalin teks terformat SOAP/ADIME ke clipboard agar dietisien tinggal melakukan `Ctrl+V` ke SIMRS rumah sakit.
   - Penyimpanan riwayat pasien di browser (LocalStorage) tanpa dependensi server yang rumit.
5. **Navigasi Terpadu:**
   - Terkoneksi silang dengan aplikasi dapur gizi sebelumnya (**NutriStok RS** di `dapur-gizi.html`).

---

## 2. Struktur Proyek & File

```
d:\project6\
├── index.html                  # Aplikasi Utama NutriKlinis e-PAGT (Asuhan Gizi Klinis)
├── dapur-gizi.html             # Aplikasi Manajemen Dapur Gizi & Stok FIFO (NutriStok RS)
├── nutristok-rs.html           # Salinan kompatibilitas aplikasi dapur
├── js/
│   ├── calculator.js           # Modul Kalkulator IMT, BBI Broca, BEE, TEE, & Makronutrien
│   ├── rules-pes.js            # Mesin Inferensi Rule-Based PES Generator (PAGT)
│   └── app.js                  # Reactive State Management, Presets, LocalStorage, Print
├── test-engine.js              # Automated Test Suite (21 Test Cases - 100% Pass)
├── netlify.toml                # Konfigurasi Deployment Netlify & URL Rewrites
├── _headers                    # Security Headers (CSP, X-Frame-Options, HSTS, dll)
└── assets/                     # Koleksi Aset Ilustrasi & Foto Bahan Makanan
```

---

## 3. Rumus & Standar Medis yang Digunakan

### A. Indeks Massa Tubuh (IMT) & Kategori Kemenkes RI / WHO Asia-Pasifik
$$\text{IMT} = \frac{\text{BB (kg)}}{\left(\frac{\text{TB (cm)}}{100}\right)^2}$$

| Rentang IMT ($\text{kg/m}^2$) | Kategori Status Gizi | Rekomendasi Klinis |
| :--- | :--- | :--- |
| $< 17.0$ | Sangat Kurus (KEP Berat) | Diet Tinggi Kalori Tinggi Protein (TKTP) intensif |
| $17.0 - 18.4$ | Kurus Tingkat Ringan | Peningkatan asupan energi bertahap |
| $18.5 - 22.9$ | Normal / Ideal | Pertahankan status gizi seimbang |
| $23.0 - 24.9$ | Overweight (Kelebihan BB) | Waspada faktor risiko kardiometabolik |
| $25.0 - 29.9$ | Obesitas Tingkat I | Restriksi kalori moderat dan aktivitas fisik |
| $\ge 30.0$ | Obesitas Tingkat II (Morbid) | Intervensi penurunan berat badan terstruktur |

### B. Berat Badan Ideal (BBI) - Rumus Broca Modifikasi Kemenkes
- **Pria:**
  - Bila $\text{TB} \ge 160\text{ cm}$: $\text{BBI} = (\text{TB} - 100) - (0.10 \times (\text{TB} - 100))$
  - Bila $\text{TB} < 160\text{ cm}$: $\text{BBI} = \text{TB} - 100$
- **Wanita:**
  - Bila $\text{TB} \ge 150\text{ cm}$: $\text{BBI} = (\text{TB} - 100) - (0.15 \times (\text{TB} - 100))$
  - Bila $\text{TB} < 150\text{ cm}$: $\text{BBI} = \text{TB} - 100$

### C. Basal Energy Expenditure (BEE) - Formula Mifflin-St Jeor
- **Pria:** $\text{BEE} = 10 \times \text{BB} + 6.25 \times \text{TB} - 5 \times \text{Umur} + 5$
- **Wanita:** $\text{BEE} = 10 \times \text{BB} + 6.25 \times \text{TB} - 5 \times \text{Umur} - 161$

### D. Total Energy Expenditure (TEE)
$$\text{TEE} = \text{BEE} \times \text{Faktor Aktivitas} \times \text{Faktor Stres}$$

- **Faktor Aktivitas:**
  - Bed Rest: $1.2$
  - Ambulatori Ringan: $1.3$
  - Rawat Jalan / Aktif: $1.4$
- **Faktor Stres Penyakit:**
  - Tanpa Komplikasi: $1.0 - 1.1$
  - Infeksi Ringan / Post-Op: $1.2$
  - Infeksi Berat / Kanker / Trauma: $1.3$
  - Sepsis / Luka Bakar Luas: $1.5 - 1.8$

---

## 4. Matriks Aturan Otomatis PES (Problem - Etiologi - Signs)

| Kode PES | Domain | Kondisi Pemicu (Trigger) | Kalimat Problem (P) | Contoh Etiologi (E) & Signs (S) |
| :--- | :--- | :--- | :--- | :--- |
| **NI-2.1** | Intake | Asupan recall $< 65\%$ kebutuhan | Asupan oral tidak adekuat | **E:** Penurunan nafsu makan / mual berkaitan dengan kondisi sakit.<br>**S:** Asupan hanya $X\%$ dari kebutuhan total. |
| **NI-5.8.2** | Intake | Diagnosa DM atau GDS $> 180\text{ mg/dL}$ | Asupan karbohidrat tidak konsisten / perubahan utilisasi karbohidrat | **E:** Gangguan regulasi insulin metabolik.<br>**S:** Kadar GDS $X\text{ mg/dL}$ dan riwayat konsumsi manis. |
| **NI-5.4** | Intake | Diagnosa HT atau TD $\ge 140/90\text{ mmHg}$ | Penurunan kebutuhan natrium / kelebihan asupan natrium | **E:** Disfungsi regulasi hemodinamik vaskular.<br>**S:** Tekanan darah $X/Y\text{ mmHg}$ dan adanya edema. |
| **NI-5.6.1** | Intake | Albumin $< 3.5\text{ g/dL}$ | Peningkatan kebutuhan zat gizi khusus protein | **E:** Peningkatan katabolisme protein sistemik.<br>**S:** Kadar serum Albumin $X\text{ g/dL}$ (hipoalbuminemia). |
| **NI-5.7.1** | Intake | Kolesterol $> 200$ atau TG $> 150$ | Kelebihan asupan lemak / Dislipidemia | **E:** Pola makan tinggi lemak jenuh.<br>**S:** Profil lipid melebihi batas rujukan. |
| **NC-3.1** | Klinis | IMT $< 18.5\text{ kg/m}^2$ | Berat badan kurang (Underweight) | **E:** Defisit asupan energi kronik.<br>**S:** IMT $X\text{ kg/m}^2$ dan BB di bawah BBI. |
| **NC-3.3** | Klinis | IMT $\ge 25.0\text{ kg/m}^2$ | Kelebihan berat badan / Obesitas | **E:** Ketidakseimbangan asupan melebihi kebutuhan.<br>**S:** IMT $X\text{ kg/m}^2$. |
| **NC-2.2** | Klinis | Kreatinin $> 1.3$ atau Ureum $> 50$ atau CKD | Perubahan nilai lab terkait fungsi ginjal | **E:** Penurunan laju filtrasi glomerulus ginjal.<br>**S:** Kreatinin $X\text{ mg/dL}$ dan Ureum $Y\text{ mg/dL}$. |
| **NC-2.2-Hb**| Klinis | $\text{Hb} < 13$ (Pria) / $< 12$ (Wanita) | Perubahan nilai lab terkait zat gizi (Anemia) | **E:** Penurunan sintesis eritrosit / kehilangan mikronutrien.<br>**S:** Kadar Hemoglobin $X\text{ g/dL}$. |
| **NC-1.1** | Klinis | Gangguan menelan atau pasca stroke | Kesulitan menelan (Disfagia) | **E:** Penurunan fungsi neuromuskular orofaringeal.<br>**S:** Pasien tersedak dan butuh modifikasi tekstur makanan. |
| **NB-1.1** | Perilaku | Belum pernah edukasi atau ada pola makan salah | Kurang pengetahuan terkait makanan dan zat gizi | **E:** Kurangnya paparan informasi diet terstandar.<br>**S:** Pola konsumsi makanan belum sesuai anjuran diet RS. |

---

## 5. Cara Menjalankan & Menguji Aplikasi

### A. Menjalankan di Komputer Lokal
Server lokal saat ini aktif pada port `8080`.
Buka tautan berikut di browser:
- **Aplikasi Asuhan Gizi (NutriKlinis):** [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
- **Aplikasi Dapur & Gudang Gizi (NutriStok):** [http://127.0.0.1:8080/dapur-gizi.html](http://127.0.0.1:8080/dapur-gizi.html)

### B. Menjalankan Uji Otomatis
Jalankan perintah berikut di PowerShell:
```powershell
node d:\project6\test-engine.js
```
Output:
```
========================================
HASIL PENGUJIAN: 21 LULUS, 0 GAGAL
========================================
🎉 SELURUH ATURAN LOGIKA GIZI & PES TERBUKTI 100% VALID!
```

### C. Alur Pengujian Manual oleh Ahli Gizi:
1. Klik tombol preset di bar atas, misalnya **"Ny. Siti (DM Tipe 2 + HT)"**.
2. Perhatikan bagian kanan:
   - IMT terhitung otomatis ($27.9\text{ kg/m}^2$, Obesitas I).
   - TEE terhitung otomatis.
   - Tiga kartu PES terisi otomatis:
     * `NI-2.1` (Asupan Inadekuat)
     * `NI-5.8.2` (Asupan Karbohidrat Tidak Konsisten)
     * `NI-5.4` (Penurunan Kebutuhan Natrium)
     * `NC-3.3` (Obesitas I)
3. Coba ubah nilai GDS dari `268` menjadi `95`.
   - Kartu `NI-5.8.2` otomatis menyesuaikan atau hilang jika tidak ada diagnosa DM.
4. Klik tombol **"Salin CPPT"** untuk menyalin catatan format rekam medis ke clipboard.
5. Klik tombol **"Cetak ADIME"** untuk melihat pratinjau lembar rekam medis resmi A4 siap cetak/PDF.

---

## 6. Panduan Deployment ke Netlify

Proyek ini telah dikonfigurasi penuh dengan `netlify.toml` dan `_headers`.

Untuk mendeploy ke Netlify:
1. Hubungkan repositori Git ke Netlify, atau gunakan Netlify CLI:
   ```bash
   npx netlify-cli deploy --prod --dir=.
   ```
2. Aplikasi akan langsung aktif secara global dengan proteksi keamanan security headers aktif.
