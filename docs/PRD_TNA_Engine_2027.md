# PRD — BBLC TNA Engine 2027

**Produk:** perluasan *BBLC Competency Development Studio* (`/kompetensi`) + backend Apps Script yang sudah ada
**Pemilik:** Sujarwadi, Learning & Development Dept. Head, PT Bosowa Berlian Motor
**Versi dokumen:** 1.2, 24 Okt 2026
**Status:** Disetujui untuk dibangun

---

## 1. Latar Belakang & Tujuan

L&D BBM butuh **Training Needs Analysis (TNA) 2027 untuk seluruh karyawan** (807 orang, 94 kombinasi jabatan × departemen, 32 lokasi) yang menghasilkan dokumen perencanaan L&D tahunan. Prosesnya end-to-end, otomatis, dan bisa dipertanggungjawabkan.

Saat ini Studio baru menangani: JD → matriks kompetensi → kamus → form asesmen → IDP sederhana. Belum ada gap engine, rekomendasi 70/20/10, katalog training, ITP, proyeksi jam belajar, maupun kalender.

**Tujuan (terukur):**
| # | Tujuan | Ukuran berhasil |
|---|---|---|
| G1 | Semua jabatan punya matriks kompetensi tervalidasi | 100% jabatan aktif berstatus `APPROVED` sebelum window asesmen ditutup |
| G2 | Semua karyawan ter-asesmen | ≥95% karyawan punya rating atasan per 3 Nov 2026, 23:59 WITA |
| G3 | Output keluar otomatis & valid | 5 dokumen terbit 4 Nov 2026 pagi, 0 error validasi (lihat §9) |
| G4 | Perencanaan jam belajar | Proyeksi jam per orang/bulan dibandingkan target **3 jam/orang/bulan (36 jam/tahun)** |

**Non-goal (v1):** integrasi SSO BBM-LMS, sertifikat otomatis, LNA berbasis kinerja (KPI), penganggaran biaya training per rupiah.

## 2. Timeline (WITA)

| Tanggal | Milestone |
|---|---|
| Sab–Min 24–25 Okt | Build modul TNA (M1–M4, M9). Import master karyawan. Generate matriks semua jabatan. |
| **Sen 26 Okt** | **Pilot** (1 cabang + 1 departemen HO) |
| Sel 27 Okt | Sosialisasi ke Dept Head. **Window asesmen dibuka.** |
| s.d. Kam 29 Okt | Mesin output (M5–M8) selesai & diuji dengan data pilot |
| **Sel 3 Nov 23:59** | Window asesmen ditutup (lock otomatis) |
| **Rab 4 Nov pagi** | Generate otomatis 5 dokumen output |

## 3. Pengguna & Peran

| Peran | Siapa | Bisa apa |
|---|---|---|
| **Admin L&D** | Tim Training HO | Semua: kelola master, generate/approve matriks, buka/tutup window, generate output, override |
| **Penilai** | Atasan langsung, ditentukan kolom `AtasanNIK` di tab `Users` | Menilai anggota timnya; melihat progres timnya |
| **Dept Head / Branch Head** | Pemimpin unit | Seperti Penilai, plus review/approve matriks jabatan di unitnya dan dashboard unit |
| **Karyawan** | Semua | Self-rating diri sendiri; melihat ITP sendiri setelah terbit |

Login tetap memakai NIK + PIN yang sudah ada (mekanisme `login` backend v3.5).

## 4. Alur End-to-End

```
[M1] Master Data ──► [M2] JD → Task → Kompetensi ──► [M3] Kamus (definisi, 5 level, BI)
                                                          │
                              [M4] Matriks Jabatan & Departemen (required level + bobot)
                                                          │
                      [M9] Window Asesmen ◄── Dept Head approve matriks
                                                          │
                       [M5] Asesmen atasan + self ──► Gap Engine
                                                          │
          ┌───────────────────────────┬───────────────────┴──────────┐
     70% Experiential           20% Social                 10% Formal ◄── [M6] Katalog G-Drive
                                                          │
                       [M7] ITP 2027 ──► Training Matrix ──► Proyeksi Jam
                                                          │
                                 [M8] Training Calendar + Ekspor 5 dokumen
```

## 5. Kebutuhan Fungsional

### M1 — Master Data Karyawan & Jabatan
- **FR1.1** Import massal karyawan dari file bersih (`Users_Clean`) ke tab `Users`. Upsert by NIK; tidak menghapus user lama, tapi menandai `Aktif=N` bila NIK tidak ada di file.
- **FR1.2** Generate PIN awal untuk user baru (pakai pola PIN default backend yang sudah ada, `wajibGantiPin=Y`).
- **FR1.3** Tab `MasterJabatan`: `KodeJabatan`, `JobTitle`, `Dept`, `Lokasi`, `JmlIncumbent`, `FileJD` (ID Drive), `StatusMatriks`.
- **FR1.4** Validasi import: NIK unik, `AtasanNIK` ada di `Users`, tidak ada siklus atasan, tidak ada self-assessor. Gagal = baris ditolak + laporan.

### M2 — JD → Task → Kompetensi
- **FR2.1** Baca file JD per jabatan dari folder Drive `JOB PROFILE` (PDF/DOCX/Google Doc). Pencocokan file ↔ jabatan otomatis (by nama), dikonfirmasi Admin.
- **FR2.2** AI memecah setiap tanggung jawab JD menjadi **unit tugas terkecil** (kata kerja + objek + standar), disimpan di `TaskBreakdown` dengan referensi baris JD sumber.
- **FR2.2a** **Jangkar JD:** daftar kompetensi Behavioral/Teknikal yang sudah tertulis di bagian "KOMPETENSI" pada JD menjadi kandidat awal. AI memvalidasi silang dengan task: kompetensi di JD yang tidak didukung task mana pun diberi flag `TIDAK DIDUKUNG TASK` (contoh: Mekanik mencantumkan "Leading and Motivation"), dan task tanpa kompetensi di JD memunculkan usulan kompetensi baru. Keputusan akhir ada di Admin/Dept Head.
- **FR2.2b** Bagian "PERSYARATAN JABATAN → pelatihan" pada JD (contoh: M-Step 1 & 2, House Keeping) otomatis diusulkan masuk `TrainingMandatory` jabatan tsb.
- **FR2.3** AI mengelompokkan task ke kompetensi. Setiap task wajib terpetakan ke ≥1 kompetensi; kompetensi tanpa task ditolak (kecuali Behavioral/Leadership inti perusahaan).
- **FR2.4** Kompetensi diklasifikasikan **Behavioral (B) / Technical (T) / Leadership (L)**. L hanya untuk jabatan dengan bawahan (dideteksi dari `AtasanNIK`).
- **FR2.5** **Reuse kamus:** sebelum membuat kompetensi baru, AI wajib mencocokkan ke `KamusKompetensi` yang ada (semantic match). Kompetensi B & L memakai kamus korporat bersama agar konsisten lintas jabatan.

### M3 — Kamus Kompetensi
- **FR3.1** Setiap kompetensi: `Kode`, `Nama`, `Kategori`, `Definisi`, 5 level proficiency (1 Basic … 5 Expert), masing-masing **3–5 behavior indicator** yang observable (kata kerja tindakan, bukan sifat).
- **FR3.2** Indikator antar level harus kumulatif dan tidak tumpang tindih (dicek AI-reviewer kedua; hasil "flag" bila gagal).

### M4 — Matriks Jabatan & Departemen
- **FR4.1** Per jabatan: daftar kompetensi B/T/L + `RequiredLevel` (1–5) + `Bobot` kritikalitas (1 = pendukung, 2 = penting, 3 = kritikal).
- **FR4.2** Varian Junior/Senior/Trainee berbagi kompetensi yang sama, berbeda `RequiredLevel`.
- **FR4.3** Matriks departemen = rollup otomatis semua jabatan di dept (kompetensi × jabatan → required level).
- **FR4.4** Status matriks: `DRAFT_AI` → `REVIEW` → `APPROVED`. Asesmen hanya bisa dibuka untuk jabatan `APPROVED`. Approve oleh Dept Head/Admin; perubahan setelah approve tercatat versi.
- **FR4.5** "Competency List per Jabatan" bisa dibagikan ke Dept Head sebagai link + PDF/Excel.

### M5 — Asesmen & Gap Engine
- **FR5.1** Penilai melihat daftar timnya (dari `AtasanNIK`) dan progres (belum/sebagian/selesai).
- **FR5.1a** **Mode asesmen per KELOMPOK** untuk Sales Force & Sales Consultant (157 orang, 61 kelompok = cabang × level Junior/Senior/Counter). Kepala Cabang menilai satu form per kelompok; hasilnya diwariskan ke setiap anggota sebagai skor Atasan. Self-rating tidak dipakai untuk mode kelompok. Training Wajib tetap individual.
- **FR5.1b** **Delegasi penilai:** penilai utama (contoh: ASS Head) boleh mendelegasikan pengisian ke Leader Mekanik di cabangnya. Hasil delegasi berstatus `MENUNGGU APPROVAL` sampai penilai utama menyetujui. Yang dihitung hanya rating yang sudah disetujui.
- **FR5.1c** **Penilai ganda:** Kepala Cabang dinilai dua NOH (MMKSI & KTB). Skor Atasan = rata-rata kedua rater. Bila hanya satu yang mengisi, dipakai satu nilai itu dengan flag `RATER TUNGGAL`.
- **FR5.2** Form asesmen: satu layar per orang, skala 1–5 dengan BI level yang tampil saat dipilih; opsi "Tidak dapat dinilai (N/A)" wajib disertai alasan.
- **FR5.3** Self-rating oleh karyawan dengan form yang sama.
- **FR5.4** **Skor aktual** per kompetensi:
  `Actual = 0,7 × Atasan + 0,3 × Self` (bila self kosong → `Actual = Atasan`). Self-rating saja tidak pernah cukup; tanpa rating atasan = status `BELUM DINILAI`.
- **FR5.5** **Gap** = `max(0, Required − Actual)`. **Prioritas** = `Gap × Bobot`. Kategori gap: 0 = Kompeten, >0–<1 = Minor, 1–<2 = Moderate, ≥2 = Major.
- **FR5.6** **Kontrol validitas** (ditampilkan, tidak memblokir):
  - Selisih |Atasan − Self| ≥ 2 → flag `KALIBRASI`.
  - Penilai yang memberi nilai identik untuk ≥90% item timnya → flag `STRAIGHT-LINING`.
  - Rata-rata rating penilai > rata-rata unit + 1 SD → flag `LENIENCY`.
- **FR5.7** Data asesmen terkunci saat window ditutup; perubahan setelahnya hanya oleh Admin, tercatat audit log.

### M6 — Katalog Training (G-Drive)
- **FR6.1** Scan folder modul training L&D di Drive (rekursif). Per file: nama, path, tipe, tanggal update.
- **FR6.2** AI membaca isi modul (judul, tujuan, outline) lalu mengisi: `KodeTraining`, `Judul`, `Kompetensi` (map ke kamus), `LevelTarget` (1–5), `Metode` (Classroom/E-learning/Simulator/OJT-terstruktur), `DurasiJam`, `Penyelenggara`.
- **FR6.3** Admin mereview & mengoreksi hasil tagging sebelum dipakai (status `TAGGED_AI` → `VERIFIED`).
- **FR6.4** **Klasifikasi** per jabatan:
  - **Wajib (Mandatory)**: harus diikuti, tidak bisa ditawar, tanpa melihat gap. Sumbernya: (a) **Training wajib korporat untuk SEMUA karyawan: _Anti Fraud Awareness_ dan _AI for Daily Work_**; (b) syarat pelatihan di JD; (c) regulasi, sertifikasi prinsipal, K3. Dikelola di tabel `TrainingMandatory`.
  - **Dianjurkan (Recommended)**: sangat disarankan untuk menutup gap pada kompetensi jabatan (semua besaran gap). Prioritasnya mengikuti `Gap × Bobot`. Boleh ditunda ke periode berikutnya, alasannya dicatat.
  - **Pengayaan (Enrichment)**: *nice to have*, untuk menambah wawasan. Tidak terkait langsung dengan kompetensi jabatan (contoh: Financial Literacy). Tidak ditentukan dari gap. Ditawarkan sebagai pilihan dan dipakai sistem untuk mengisi kekurangan jam bila ITP seseorang di bawah target 3 jam/bulan.

### M7 — Rekomendasi 70/20/10 & ITP 2027
- **FR7.1** Per gap > 0, sistem membuat 3 rekomendasi:
  - **70 Experiential**: penugasan/stretch assignment diturunkan dari task di `TaskBreakdown` yang terkait kompetensi tsb.
  - **20 Social**: coaching oleh atasan, mentoring/shadowing oleh incumbent lain dengan `Actual ≥ Required + 1` pada kompetensi yang sama (lintas cabang boleh).
  - **10 Formal**: training dari katalog dengan kompetensi sama dan `LevelTarget ≥ Actual + 1`. Bila tidak ada → tandai `GAP KATALOG` (masukan untuk pengembangan modul baru).
- **FR7.2** **ITP** per orang: daftar training (Wajib + Dianjurkan + Pengayaan), kategori, kompetensi yang ditutup, bulan rencana (Jan–Des 2027), durasi, status (`PLANNED` → `SCHEDULED` → `DONE` / `CANCELLED`).
- **FR7.2a** Training Wajib yang sudah lulus (tab `Riwayat`: NIK, KodeTraining, Tanggal, Sumber) tidak dijadwalkan ulang.
- **FR7.3** Prioritas penjadwalan: Wajib → Dianjurkan (urut Prioritas tertinggi) → Pengayaan (pengisi target jam, status `OPSIONAL`).

### M8 — Proyeksi Jam, Training Matrix, Kalender & Ekspor
- **FR8.1** **Proyeksi jam belajar** per orang, per bulan & tahun = Σ durasi training ITP + jam coaching terstruktur yang direncanakan. Ditampilkan vs target 3 jam/orang/bulan, agregat per cabang/dept/BBM. Flag: `UNDER` (<80% target), `ON TARGET`, `OVER` (>150%).
- **FR8.2** **Fungsi prediktif/proyektif:**
  - *Projected proficiency* akhir 2027 per orang per kompetensi: `Actual + Σ kontribusi intervensi` (default: training Dianjurkan +0,5 level, coaching terstruktur +0,5, penugasan +0,5, maks = Required + 1). Koefisien bisa diubah Admin di tab `Parameter`.
  - *Projected readiness* % = proporsi kompetensi wajib yang diproyeksikan ≥ Required pada Des 2027.
  - *Proyeksi pencapaian jam* L&D per bulan vs target, termasuk kapasitas kelas (lihat FR8.3).
- **FR8.3** **Training Calendar 2027**: sistem membentuk *batch* per training (kapasitas default 20 peserta/kelas, bisa per training), mengelompokkan peserta per wilayah, dan menyebar batch per bulan agar beban jam per bulan merata (±20% dari rata-rata), Wajib di Q1 (Anti Fraud Awareness & AI for Daily Work: Q1 untuk semua karyawan). Kelas tatap muka dikonsolidasi: peserta satu training di satu wilayah dikumpulkan ke `ceil(n/kapasitas)` bulan di dalam jendela kategorinya. Wilayah = provinsi cabang. Admin bisa geser manual; ITP ikut ter-update.
- **FR8.4** **Ekspor 5 dokumen** (Excel format BBM, disimpan ke Drive, link di dashboard):
  1. **Gap Competency Report**: per orang × kompetensi (Required, Atasan, Self, Actual, Gap, Prioritas, Flag), plus ringkasan per jabatan/dept.
  2. **Training Matrix**: jabatan × training (W/D/P) dan orang × training.
  3. **Training Plan 2027**: daftar training, jumlah peserta, batch, jam total, bulan.
  4. **Training Calendar 2027**: tampilan bulanan per batch (tanggal, lokasi, peserta).
  5. **ITP**: satu sheet ringkas per orang + sheet gabungan.

### M9 — Window & Dashboard Progres
- **FR9.1** Admin set `WindowBuka`/`WindowTutup` di tab `Parameter`; backend menolak submit di luar window.
- **FR9.2** Dashboard progres per cabang/dept/penilai: % selesai, jumlah belum dinilai, flag validitas.
- **FR9.3** Reminder WhatsApp ke penilai yang belum selesai (pakai kode Fonnte yang sudah ada, bila diaktifkan).
- **FR9.4** Tombol "Generate Output" (Admin) + trigger otomatis setelah `WindowTutup`.

## 6. Data Model (Google Sheets "Learning Simulator DB")

Tab yang sudah ada dipakai ulang; tambahan bertanda ✚.

| Tab | Kunci | Kolom utama |
|---|---|---|
| `Users` | NIK | Nama, Cabang, Dept, KodeJabatan✚, JobTitle✚, Jabatan, Varian✚, AtasanNIK, Role, PIN, NoHP, Aktif✚ |
| ✚`MasterJabatan` | KodeJabatan | JobTitle, Dept, Lokasi, FileJD, StatusMatriks, Versi |
| `TaskBreakdown` | KodeJabatan+No | Tanggung jawab JD, Task, KodeKompetensi |
| `KamusKompetensi` | KodeKompetensi | Nama, Kategori(B/T/L), Definisi, L1..L5 (BI) |
| `MatriksKompetensi` | KodeJabatan+KodeKompetensi | RequiredLevel, Bobot, Varian |
| `ChecklistAsesmen` | — | (sudah ada) |
| ✚`Asesmen` | Periode+NIK+KodeKompetensi+Rater | Rating, Rater(ATASAN/SELF), RaterNIK, Alasan N/A, Timestamp |
| ✚`Gap` | Periode+NIK+KodeKompetensi | Required, Atasan, Self, Actual, Gap, Prioritas, Flag |
| `KatalogTraining` | KodeTraining | Judul, FileDrive, Kompetensi, LevelTarget, Metode, DurasiJam, Status |
| ✚`TrainingMandatory` | KodeJabatan+KodeTraining | Dasar (korporat/JD/regulasi/prinsipal) |
| ✚`Riwayat` | NIK+KodeTraining | Tanggal, Sumber (training yang sudah lulus) |
| ✚`Rekomendasi` | NIK+KodeKompetensi+Tipe | Tipe(70/20/10), Deskripsi, KodeTraining/MentorNIK |
| ✚`ITP` | NIK+KodeTraining | Kategori(W/D/P), Bulan, BatchID, Jam, Status |
| ✚`Batch` | BatchID | KodeTraining, Bulan, Tanggal, Wilayah, Kapasitas, Peserta |
| ✚`Parameter` | Key | WindowBuka/Tutup, BobotAtasan, Target jam, Kapasitas, Koefisien proyeksi |
| ✚`AuditLog` | Timestamp | User, Aksi, Sebelum, Sesudah |

## 7. Arsitektur & Kebutuhan Non-Fungsional

- **Frontend:** single-file HTML (`/kompetensi/index.html`), vanilla JS, tanpa build step, mobile-first, GitHub Pages.
- **Backend:** satu Web App Apps Script yang sama (`doPost` → router `action`). Kode backend disimpan di repo `/backend` via `clasp` (tanpa secret).
- **AI:** dipanggil dari backend (API key di Script Properties, tidak pernah di frontend/repo). Semua output AI disimpan dengan status `*_AI` sampai di-review manusia.
- **Batas Apps Script:** eksekusi maks 6 menit → semua proses massal (generate 94 matriks, tagging katalog, gap 807 orang, output) dipecah per batch dengan checkpoint di `Parameter` dan dilanjutkan oleh time-driven trigger. Tulis ke Sheets dengan `setValues` per blok, bukan per sel. `LockService` untuk submit asesmen.
- **Kinerja:** submit asesmen < 3 detik; load daftar tim < 3 detik untuk 50 anggota.
- **Keamanan & privasi:** data karyawan tidak pernah masuk repo git (repo publik). Penilai hanya bisa membaca/menulis data anggota timnya (dicek di backend, bukan hanya di UI).
- **Auditability:** setiap angka di output bisa ditelusuri: ITP → Rekomendasi → Gap → Asesmen → Matriks → Task → baris JD.

## 8. Asumsi
1. 807 karyawan di sheet MPS per 15 Okt 2026 = populasi TNA. Sales di daftar BAMS yang tidak ada di MPS **tidak** diikutkan.
2. Penilai = atasan langsung (`AtasanNIK`) sesuai file `Master_Karyawan_TNA_2027_CLEAN.xlsx` yang sudah dikonfirmasi user (24 Okt). Sales diases per kelompok oleh Kepala Cabang.
3. Target 3 jam/orang/bulan menghitung training formal + coaching terstruktur. Penugasan (70) tidak dihitung jam.
4. Periode ITP: Jan–Des 2027.

## 9. Kriteria Penerimaan (Definition of Done)
- [ ] 100% karyawan aktif punya `KodeJabatan` dan `AtasanNIK` valid (kecuali CEO).
- [ ] 100% jabatan aktif punya matriks `APPROVED`; setiap kompetensi punya definisi + 5 level + 3–5 BI per level.
- [ ] Setiap task di `TaskBreakdown` terpetakan ke ≥1 kompetensi.
- [ ] Gap dihitung untuk setiap pasangan (karyawan × kompetensi wajib) yang punya rating atasan; sisanya berlabel `BELUM DINILAI`, tidak dihitung 0.
- [ ] Setiap training di ITP punya kode katalog `VERIFIED` atau label `GAP KATALOG`.
- [ ] Total jam di Training Plan = Σ jam di ITP = Σ jam di Calendar (rekonsiliasi otomatis, selisih 0).
- [ ] 5 dokumen terunduh tanpa error; spot-check 20 orang acak lolos penelusuran §7 Auditability.
- [ ] Uji end-to-end pilot (Senin 26 Okt) lulus tanpa bug blocker.

## 10. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Penilai tidak selesai menilai sebelum window tutup | Gap/ITP kosong untuk sebagian orang | Dashboard progres harian, reminder WA, eskalasi ke Branch Head/Dept Head |
| Rating bias (leniency/straight-lining) | Gap tidak valid | Flag validitas FR5.6 + laporan kalibrasi per penilai |
| Matriks AI kurang tepat | Kompetensi salah | Status `DRAFT_AI` wajib di-review & approve sebelum asesmen |
| Batas 6 menit Apps Script | Proses massal gagal di tengah | Batch + checkpoint + trigger lanjutan |
| Struktur atasan di data tidak akurat | Orang salah dinilai / tidak muncul | Validasi import + sheet `Perlu_Konfirmasi` diselesaikan sebelum pilot |

## 11. Keputusan yang Masih Terbuka
1. JD belum ada untuk: IT (3 jabatan, 8 orang), Training Supervisor, Personal Assistant. Jalan keluar sementara: matriks disusun dari JD jabatan serupa + input user, ditandai `TANPA JD`.
2. Training **Wajib** tambahan per jabatan di luar syarat JD & 2 training korporat (regulasi/prinsipal), bila ada.
3. Nama folder modul training di Google Drive.
4. Durasi standar (jam) Anti Fraud Awareness & AI for Daily Work.
