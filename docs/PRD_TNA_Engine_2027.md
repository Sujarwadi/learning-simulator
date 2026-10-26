# PRD — BBLC TNA Engine 2027

**Produk:** perluasan *BBLC Competency Development Studio* (`/kompetensi`) + backend Apps Script yang sudah ada
**Pemilik:** Sujarwadi, Learning & Development Dept. Head, PT Bosowa Berlian Motor
**Versi dokumen:** 1.8, 26 Okt 2026 (M14 Program Pengembangan 2027: jalur sales, aftersales SA/CS, enablers academy; M13: proyeksi peserta BST dari batch terakhir; sebelumnya 1.6: slot BST awal bulan, IHT Sabtu, batas porsi IHT 20%, nilai lulus BST 70)
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

### M10 — Keputusan 24 Okt 2026 (v1.3)
- **FR10.1 Garis lapor:** penilai mengikuti atasan langsung di JD bila jabatan atasan itu ada (tunggal) di cabang yang sama; bila tidak, pakai aturan lama. Konfirmasi spesifik user sebelumnya (Bone, Jayapura, daftar terlampir) tetap berlaku.
- **FR10.2 C-level dikecualikan:** CEO, COO, CFO berstatus `ModeAsesmen = DIKECUALIKAN`. Mereka tidak dinilai, tidak masuk Gap/ITP (pengembangan by request ke institusi luar), tetapi tetap menilai timnya.
- **FR10.3 Fokus 2027 = Technical & Leadership:** parameter `KategoriDianjurkan = Technical,Leadership`. Gap Behavioral tetap dilaporkan dan mendapat rekomendasi 70/20, tetapi tidak dijadwalkan training Dianjurkan.
- **FR10.4 Behavioral catch-up:** modul Behavioral 2026 (CBxx-Ly) menjadi **Wajib 2027 hanya bagi yang belum hadir**. Sumbernya master data training 2026 (STATUS KEHADIRAN). Karyawan yang tidak terplot di 2026 mendapat modul default jabatannya (modul yang diplot ke >= 50% incumbent). Wajib per orang disimpan sebagai `Mandatory.KodeJabatan = "NIK:<nik>"`.
- **FR10.5 Riwayat:** training yang sudah lulus (master data 2025 COMPLETE + 2026 HADIR) tidak dijadwalkan ulang, baik Wajib maupun Dianjurkan. Sertifikasi APM (Step/FSA/MSA) hanya dihitung dari pelatihan resmi, bukan IHT. Sesi behavioral yang masih terjadwal Nov–Des 2026 dicatat `TERJADWAL_2026`; pada Januari 2027 baris peserta yang ternyata tidak hadir dihapus, lalu output di-generate ulang.
- **FR10.6 Lokasi kelas:** kelas tatap muka dibentuk **per cabang**; kelas online digabung lintas cabang.
- **FR10.7 Durasi:** AFA 2 jam, AIDW 3 jam, BST/IST/AST masing-masing 12 jam (2 hari).
- **FR10.8 Sales Leadership Framework & Kacab Academy:** 11 kompetensi SL-01..SL-11 + LD-03/LD-04 dengan required level per tahap jalur Sales Operation (Trainee, Junior, Senior, Supervisor, Branch Head, NOH), menggantikan LD-01/LD-02 generik di jabatan jalur tersebut. Baseline TNA 2027 dipakai untuk Kacab Academy (Track A Kacab existing, Track B SPV future talent). Readiness SPV = proporsi kompetensi dengan Actual >= Required Branch Head.

### M11 — Hasil Live & Validasi Head Unit (v1.4)
- **FR11.1 Hasil langsung:** begitu penilai (atasan) submit, sistem menghitung gap dan rekomendasi 70/20/10 orang itu saat itu juga (`tnaHasil`) dan menampilkannya ke penilai. Rumus dan mesin rekomendasinya sama dengan generate output, jadi hasil live = output akhir (kecuali saran mentor, yang ikut bertambah seiring data masuk).
- **FR11.2 Validator = Head unit** (`Karyawan.ValidatorNIK`): cabang → Kepala Cabang, HO → Dept Head (tier Manager ke atas). Dihitung naik dari penilai ke Head pertama; bila penilainya sendiri Head, validasi naik ke atasan penilai. Bila rantai habis (mis. bawahan langsung CEO) → Admin L&D. Pengecualian (keputusan 25 Okt): ASS Head & Spare Part Head cabang divalidasi ASS Div Head; SPV, ADH, CSO, dan kelompok sales (bawahan Kacab) dieskalasi ke NOH. Kedua NOH (Edgar & Asri) setara: `ValidatorNIK` berisi dua NIK dipisah koma; siapa pun boleh memvalidasi dan sekali divalidasi selesai untuk keduanya.
- **FR11.3 Aksi validator** (`tnaValidasi`): **Setujui** (boleh sekaligus mengedit 70/20 dan memilih/menghapus training 10 per kompetensi; editan dipakai di output dan ditandai `DiubahValidator`), atau **Kembalikan** ke penilai dengan catatan wajib (rating atasan berstatus `DIKEMBALIKAN`, tidak dihitung sampai penilai mengirim ulang; hanya saat window dibuka). **Setujui massal** (`tnaValidasiMassal`) untuk hasil tanpa flag validitas dan tanpa gap Major.
- **FR11.4 Status** per target di `TNA_Validasi`: `MENUNGGU_VALIDASI` → `DISETUJUI` / `DIKEMBALIKAN`. Rating atasan baru/revisi atau penilai kedua → kembali `MENUNGGU_VALIDASI`. Self-rating yang masuk setelah disetujui → `MENUNGGU_VALIDASI` dengan catatan tinjau ulang. Karyawan yang dinilai **tidak** melihat gap/rekomendasi; yang ia lihat hanya ITP & kalender training miliknya (bulan, tanggal mulai batch, lokasi/online, jam) setelah output terbit.
- **FR11.6 Kepraktisan (P0 audit 25 Okt):** kartu To-do + hitung mundur di beranda; tombol "Nilai berikutnya" setelah submit; peringatan sebelum kirim (semua level sama, >= 60% Level 5, centang melompat); validator melihat centangan perilaku tiap penilai; nama level seragam di semua layar & dokumen: 1 Awareness, 2 Basic, 3 Intermediate, 4 Advanced, 5 Expert (istilah yang sudah familiar di BBM); tombol Studio lama hanya untuk admin selama window.
- **FR11.7 P1 (25 Okt):** (a) mode **Nilai per Kompetensi**: penilai menilai satu kompetensi untuk seluruh anggota satu jabatan sekaligus (tombol level L2..L5 + N/A), hanya orang lengkap & belum terkirim/diubah yang dikirim; (b) **Dashboard Tim**: ringkasan, gap terbesar tim, prioritas pengembangan (Σ gap × bobot), heatmap orang × kompetensi per jabatan, filter cabang; lingkup = rantai penilai/validator; atasan berjenjang dapat membuka hasil anggota (baca saja); (c) **Training Tim**: rencana & kalender training tim per bulan setelah output terbit; (d) **draft di server** (`TNA_Draft`) supaya bisa lanjut dari perangkat lain; (e) **Panel Admin**: pemilih tanggal window (WITA), pemantauan penilai & validator, pratinjau/kirim pengingat WhatsApp (Fonnte via `kirimWA` Kode.gs, nomor dari Users kolom H), aktivasi jadwal otomatis (output + pengingat harian H-5/H-3/H-1/H0, H+1 khusus validator); (f) cache data statis (CacheService 6 jam, dibatalkan saat tab ditulis ulang).
- **FR11.5 Batas waktu:** hasil yang belum divalidasi per 3 Nov 23:59 tetap masuk output dengan `StatusValidasi = BELUM VALIDASI` (kolom di Gap, Rekomendasi, ITP). Validasi tetap bisa dilakukan sesudahnya lalu output di-generate ulang.

### M12 — Katalog, Silabus, Riwayat Training & Landasan (v1.5, keputusan 26 Okt)
- **FR12.1 Silabus:** ringkasan silabus setiap program di folder materi L&D ("Kurikulum & Modul", "01. MATERI IHT", "Materi Training", "MATERI TRAINING SALES") disimpan di `TNA_Silabus`: tujuan, sasaran, kompetensi, materi per sesi, metode, durasi, evaluasi, sumber file. Ringkasan disusun AI dari isi materi, berstatus `DRAF_AI` dan tetap ditampilkan dengan label "Draf AI, belum direview L&D". Admin L&D menandai `FINAL` per training (`tnaSilabusStatus`). Program yang materinya tidak terbaca atau tidak ada berstatus `BELUM_ADA_SILABUS`; isinya tidak dikarang. Silabus perilaku berlaku per rumpun (W-CB03 dipakai untuk W-CB03-L1/L2/L3).
- **FR12.2 Katalog Training** (`tnaKatalog`, semua pengguna): daftar training katalog TNA + program internal BBLC (IHT dll.) yang punya silabus, bisa dicari (judul, kode, kompetensi, isi materi) dan difilter (kategori, sudah bersilabus, internal). Setiap nama training di ITP, rekomendasi 10, training wajib, opsi training validator, kalender Training Tim, dan riwayat training bisa diklik untuk membuka detail silabus.
- **FR12.3 Riwayat Training** (`tnaRekam`): seluruh training 2025 (master data, selesai) dan 2026 (status kehadiran HADIR / TIDAK HADIR / PLAN) per karyawan, termasuk jam, penyelenggara, dan nilai post-test, plus ringkasan per tahun. Tombol tersedia di form asesmen, mode Nilai per Kompetensi, dan layar hasil/validasi. Akses dicek di backend: karyawan itu sendiri, penilai (atasan, penilai kedua, delegasi), validator, atasan berjenjang, dan admin. Rekan setim dan orang di luar lingkup ditolak. Data di `TNA_RekamTraining` diurutkan per NIK saat import supaya cukup membaca satu blok baris.
- **FR12.4 Landasan Metodologi:** layar statis yang menjelaskan dasar ilmiah setiap komponen TNA, daftar hal yang masih berupa asumsi, rencana validasi, dan daftar pustaka (lihat §12). Bisa dibuka dari beranda, form asesmen, dan layar hasil.

### M13 — Kalender Default BST & IHT (v1.6, keputusan 26 Okt)
- **FR13.1 Slot BST tiap awal bulan:** kalender 2027 selalu memuat satu kelas BST (`KodeBST`, default `D-BST`, 12 jam) per bulan, terpusat, walau belum ada peserta. Hari pelatihan = dua hari pertama mulai tanggal 1 yang bukan Minggu, ditambah satu hari remedial berikutnya (Minggu dilewati, Sabtu tetap jalan). Contoh 2027: Mei (1 = Sabtu, 2 = Minggu) → 1 & 3 Mei, remedial 4 Mei; Agustus (1 = Minggu) → 2 & 3 Agustus, remedial 4 Agustus. BST diselenggarakan online (Zoom, sesuai realisasi 2026), satu kelas gabungan per bulan. Karena peserta BST mayoritas calon sales baru yang belum ada di data karyawan, setiap batch diisi sampai `ProyeksiPesertaBST` (default 63 = peserta terdaftar BST 1–2 Sep 2026, batch terakhir di master data) dengan kursi proyeksi (kolom Batch `PesertaProyeksi`); karyawan yang ITP-nya memuat BST tetap tercatat namanya. Rekonsiliasi menjadi: jam ITP + jam kursi proyeksi = jam Calendar = jam Training Plan. Kelas reguler lain dijadwalkan pada Selasa **setelah** hari remedial BST.
- **FR13.2 IHT tiap Sabtu per cabang:** setiap Sabtu 2027 di setiap cabang yang punya jabatan sasaran IHT diisi slot IHT 2 jam (`JamSesiIHT`). Rumpun berotasi mengikuti pola folder IHT: Sabtu ke-1 Selling Technique (`IHT-SELL`), ke-2 Product Knowledge (`IHT-PK`), ke-3 After Sales Service (`IHT-ASV`), ke-4 Self Management (`IHT-SELF`), ke-5 cadangan susulan/remedial. Topik spesifik per bulan ditetapkan L&D dari materi folder 01. MATERI IHT (silabus per rumpun di Katalog).
- **FR13.3 Jam IHT per orang:** kebutuhan sesi per orang per rumpun = rata-rata jam rencana IHT 2026 jabatannya (tab `TNA_IHT`, hanya jabatan yang ≥50% pemangkunya ikut IHT 2026) ÷ durasi sesi, maks 12 sesi per rumpun. Sesi disebar merata sepanjang tahun dan diseimbangkan jumlah pesertanya per Sabtu di cabang. Peserta BST tidak dijadwalkan IHT pada Sabtu yang bertepatan dengan hari BST-nya. IHT masuk ITP (kategori `IHT`), Proyeksi, Calendar, dan rekonsiliasi.
- **FR13.4 Batas porsi IHT:** jam IHT ≤ `MaksPersenIHT` (default 20%) dari total jam L&D, dihitung terhadap jam non-IHT berstatus `PLANNED` (Wajib + Dianjurkan, termasuk BST dan kursi proyeksi calon BST; Pengayaan `OPSIONAL` tidak dihitung supaya batas tetap terpenuhi walau Pengayaan tidak diambil). Bila kebutuhan pola 2026 melebihi batas, sesi tiap orang dipangkas proporsional (sisa pecahan terbesar didahulukan). Rekonsiliasi dan Panel Admin menampilkan porsi IHT, jam IHT vs non-IHT, dan sesi terjadwal vs kebutuhan. Konsekuensinya: menaikkan jam IHT hanya bisa dengan menambah jam training non-IHT terencana.
- **FR13.5 Baseline 2026** (master data BBLC): IHT = 33% jam rencana (18.061 dari 54.163 jam) dan 38,8% jam yang dihadiri. Simulasi skala penuh 2027 (804 orang, penilaian sintetis, BST 63 peserta/bulan): non-IHT terencana 30.001 jam (21.469 jam karyawan + 8.532 jam kursi proyeksi BST), IHT 7.500 jam (20,0%), yaitu 60% dari kebutuhan pola 2026 (12.400 jam). Untuk mempertahankan volume IHT 2026 di batas 20%, jam non-IHT terencana perlu ±49.600 jam.

### M14 — Program Pengembangan 2027 (v1.8, keputusan 26 Okt: opsi A, tema peningkatan technical skill)
- **FR14.1 Target dua lapis:** Lapis 1 = jam & komposisi (IHT ≤ 20%, non-IHT ±37 jam/karyawan). Lapis 2 = dampak (kenaikan pre/post test, kelulusan sertifikasi per jalur, perbaikan gap TNA 2028).
- **FR14.2 Jalur sales** Trainee → Junior → Senior → Supervisor → Branch Head dengan peran dan kompetensi pembeda per level (lihat file Development Framework 2027): Junior = konversi & kredit (D-IST, D-LEAS), Senior = akun/fleet & value selling TCO + buddy (D-AST, D-FLEET, D-MENTOR), Supervisor = coaching + exposure workshop management (D-SPV, D-ASX + shadowing bengkel), Kacab = P&L cabang termasuk profit aftersales (BMDP-01..09 + BMDP-10). Semua sales dan CS Sales wajib PK online per model (W-PK27, 16 jam = 8 model berjalan: Destinator, Xforce/Xforce HEV, Xpander/Xpander Cross, Pajero Sport, Triton, L300, Fuso Canter, Fuso Fighter; model baru 2027 ditambahkan saat diumumkan APM).
- **FR14.3 Jalur aftersales:** SA/CS wajib SA & CS Master Class (D-SACS); lulusan otomatis mendapat modul lanjutan sesuai peran (SA → D-SAADV, CS → D-CSVOC; Mandatory per NIK dari riwayat). D-SALEAD dan D-CSPS untuk level 5 (Dianjurkan, berbasis gap).
- **FR14.4 Enablers academy:** HR for Non-HR (W-HRNH) wajib untuk semua Head/Supervisor/Coordinator; Wawancara Terstruktur & BEI (W-BEI) wajib untuk hiring manager cabang dan tim rekrutmen HC. 20 usulan kompetensi teknis enablers (pajak, akuntansi, piutang, inventory, gudang, Excel/data, K3, dll.) diberi judul, durasi, dan penyelenggara konkret; dijadwalkan otomatis bila asesmen menunjukkan gap.
- **FR14.5 Jendela bulan per program** (`JendelaKhusus`, JSON): Kacab Academy mengikuti kuartal, program 2027 lain tersebar Feb–Nov supaya tidak menumpuk di jendela Wajib Jan–Jun.
- **FR14.6** Semua modul baru berstatus `USULAN_PENGADAAN` sampai materi/vendor siap. Simulasi skala penuh: non-IHT 41,2 jam/karyawan, IHT 13,0 jam/karyawan (20%, 84% kebutuhan pola 2026).

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
| ✚`Silabus` | KodeTraining | Judul, Rumpun, Kompetensi, Sasaran, Tujuan, Outline, Metode, Durasi, Evaluasi, Sumber, Status (DRAF_AI/FINAL/BELUM_ADA_SILABUS) |
| ✚`RekamTraining` | NIK (urut) | Tahun, Tanggal, KodeProgram, Judul, Kategori, Metode, Penyelenggara, Status, Jam, PreTest, PostTest, KodeTNA |
| ✚`Validasi` | Periode+Target | Target (NIK / K:KelompokID), PenilaiNIK, ValidatorNIK, Status, Catatan, Edit (JSON), Ringkasan |
| ✚`Rekomendasi` | NIK+KodeKompetensi+Tipe | Tipe(70/20/10), Deskripsi, KodeTraining/MentorNIK |
| ✚`ITP` | NIK+KodeTraining | Kategori(W/D/P), Bulan, BatchID, Jam, Status |
| ✚`IHT` | KodeJabatan | JobTitle, Orang2026, Peserta2026, JamSelling, JamPK, JamASS, JamSelf, JamTotal, Sumber (agregat per jabatan, tanpa data perorangan) |
| ✚`Batch` | BatchID | KodeTraining, Judul, Kategori, Metode, Bulan, Minggu, TanggalMulai, TanggalSelesai, Lokasi (cabang/ONLINE/TERPUSAT), JmlPeserta, DurasiJam, TotalJam, Catatan |
| ✚`Parameter` | Key | WindowBuka/Tutup, BobotAtasan, Target jam, Kapasitas, Koefisien proyeksi, KodeBST, MaksPersenIHT, JamSesiIHT |
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
- [ ] Kalender memuat 12 slot BST (tanggal 1–3 sesuai FR13.1) dan slot IHT di setiap Sabtu untuk setiap cabang sasaran; porsi IHT ≤ `MaksPersenIHT`.
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
3. ~~Nama folder modul training~~ → "Kurikulum & Modul" (dipakai di Katalog).
4. ~~Durasi AFA & AIDW~~ → 2 jam & 3 jam (FR10.7).
5. Durasi modul internal lain (CB-xx dari median 2026, SA & CS Master Class, dll) perlu dicek L&D di tab Katalog.
6. Review silabus `DRAF_AI` oleh L&D (43 program). Temuan dari materi yang perlu diputuskan: ~~nilai lulus BST 70 vs 75~~ → 70/100 (dikonfirmasi 26 Okt); modul IST M1-01, M1-03, M1-06 tidak ada di folder; template Modul Monitoring masih kosong; 7 Step Service baru terbaca langkah 1; materi "Sales Jago Jualan" 2024 memakai contoh Mercedes-Benz Trucks.

7. ~~Cara menaikkan jam non-IHT 2027 (FR13.5)~~ → diputuskan 26 Okt: opsi A, lihat M14. Pengayaan `OPSIONAL` tetap tidak dihitung dalam batas IHT.
8. Program 2027 (M14): ~~daftar model W-PK27~~ → model berjalan (8 model), model baru ditambah saat diumumkan; vendor final setelah RFQ; kriteria masa kerja Sales Junior sebelum IST (saat ini semua Junior wajib, urutan diatur L&D).

## 12. Landasan Metodologi & Rencana Validasi

Prinsip: hasil TNA 2027 dipakai untuk **pengembangan**. Hasil belum boleh dipakai untuk keputusan gaji, promosi, atau seleksi (termasuk seleksi Kacab Academy) sampai lolos uji keandalan antar-penilai dan validitas isi di bawah. Alasannya, keputusan yang berdampak pada karier menuntut bukti validitas yang jauh lebih tinggi (SIOP Principles, 2018; AERA/APA/NCME Standards, 2014).

### 12.1 Landasan per komponen
| Komponen | Landasan | Kekuatan bukti | Status |
|---|---|---|---|
| Kompetensi diturunkan dari JD/tugas | McClelland (1973); Spencer & Spencer (1993); Shippmann dkk. (2000); Campion dkk. (2011); Lievens dkk. (2004) | Kuat | Sesuai. 4 jabatan tanpa JD memakai draf AI; required level belum diuji SME |
| Skala 5 level | Dreyfus & Dreyfus (1980) | Kuat sebagai kerangka | Sesuai |
| Checklist perilaku L2–L5 | BARS (Smith & Kendall, 1963); BOS (Latham & Wexley, 1977) | Kuat | Kalimat perilaku 107 kompetensi teknis dari template, belum ditulis SME per kompetensi |
| Skor kumulatif | Guttman (1944), syarat koefisien reproducibilitas ≥ 0,90 | Kuat sebagai metode | Flag INKONSISTEN sudah ada; sifat kumulatif checklist belum diuji |
| Bobot atasan 70% / self 30% | Harris & Schaubroeck (1988); Heidemeier & Moser (2009) | Arah kuat, angka tidak | **Asumsi** kebijakan |
| Dua penilai Kacab, flag leniency/straight-lining | Viswesvaran, Ones & Schmidt (1996); Saal, Downey & Lahey (1980); Krosnick (1991) | Kuat | Sesuai; rater training belum ada |
| TNA tiga lapis | McGehee & Thayer (1961); Goldstein & Ford (2002); Salas dkk. (2012) | Kuat | Sesuai |
| Prioritas = gap × bobot | Borich (1980) | Kuat | Bobot ditetapkan L&D, belum diuji SME |
| 70/20/10 | McCall, Lombardo & Morrison (1988); DeRue & Wellman (2009); Jones, Woods & Guillaume (2016); Allen dkk. (2004); kritik rasio: Clardy (2018) | Komponen kuat, rasio lemah | Dipakai sebagai tiga jalur, bukan proporsi wajib |
| Desain Kacab Academy / BMDP | Charan, Drotter & Noel (2011); Lacerenza dkk. (2017) | Kuat | Jangkar perilaku SL perlu diuji SME sales |
| Transfer & evaluasi | Baldwin & Ford (1988); Blume dkk. (2010); Kirkpatrick & Kirkpatrick (2016) | Kuat | Belum di sistem (kandidat P2) |
| Koefisien proyeksi (+0,5 level) | — | Tidak ada | **Asumsi**, dikalibrasi dari asesmen tengah tahun |

### 12.2 Rencana validasi
| Uji | Metode | Waktu |
|---|---|---|
| Validitas isi | Panel SME 2–3 orang per rumpun, Content Validity Ratio (Lawshe, 1975), mulai dari jabatan berpopulasi terbesar | Paralel window asesmen |
| Konsistensi skala | Koefisien reproducibilitas Guttman per kompetensi (target ≥ 0,90) | Setelah 3 Nov |
| Keandalan antar-penilai | ICC (Shrout & Fleiss, 1979) dari dua NOH atas 28 Kacab | 4 Nov |
| Validitas kriteria | Korelasi gap dengan KPI (comeback rate, konversi SPK, laba cabang) | Q1 2027 |
| Stabilitas & kalibrasi proyeksi | Asesmen ulang tengah tahun | Jun 2027 |
| Peningkatan akurasi penilai | Briefing Frame-of-Reference 30 menit (Woehr & Huffcutt, 1994; Roch dkk., 2012) | Sosialisasi 27 Okt |

### 12.3 Daftar pustaka
Allen dkk. (2004) *JAP 89*(1); AERA/APA/NCME (2014) *Standards*; Baldwin & Ford (1988) *Pers. Psych. 41*(1); Blume dkk. (2010) *J. of Management 36*(4); Borich (1980) *J. Teacher Ed. 31*(3); Campion dkk. (2011) *Pers. Psych. 64*(1); Charan, Drotter & Noel (2011) *The Leadership Pipeline*; Clardy (2018) *HRDR 17*(2); DeRue & Wellman (2009) *JAP 94*(4); Dreyfus & Dreyfus (1980) UC Berkeley ORC; Goldstein & Ford (2002) *Training in Organizations*; Guttman (1944) *ASR 9*(2); Harris & Schaubroeck (1988) *Pers. Psych. 41*(1); Heidemeier & Moser (2009) *JAP 94*(2); Jones, Woods & Guillaume (2016) *JOOP 89*(2); Kirkpatrick & Kirkpatrick (2016) ATD Press; Krosnick (1991) *Applied Cog. Psych. 5*(3); Lacerenza dkk. (2017) *JAP 102*(12); Latham & Wexley (1977) *Pers. Psych. 30*(2); Lawshe (1975) *Pers. Psych. 28*(4); Lievens, Sanchez & De Corte (2004) *Pers. Psych. 57*(4); McCall, Lombardo & Morrison (1988) *The Lessons of Experience*; McClelland (1973) *Am. Psych. 28*(1); McGehee & Thayer (1961) *Training in Business and Industry*; Roch dkk. (2012) *JOOP 85*(2); Saal, Downey & Lahey (1980) *Psych. Bull. 88*(2); Salas dkk. (2012) *PSPI 13*(2); Shippmann dkk. (2000) *Pers. Psych. 53*(3); Shrout & Fleiss (1979) *Psych. Bull. 86*(2); SIOP (2018) *Principles*, 5th ed.; Smith & Kendall (1963) *JAP 47*(2); Spencer & Spencer (1993) *Competence at Work*; Viswesvaran, Ones & Schmidt (1996) *JAP 81*(5); Woehr & Huffcutt (1994) *JOOP 67*(3).

Sitasi ditulis dari ingatan penyusun dan perlu dicocokkan dengan sumber aslinya (volume, halaman, DOI) sebelum dipakai di dokumen resmi.
