# PRD — BBM TalentCore

Status: **retroaktif**. Ditulis setelah Fase 1 sudah dikoding (lihat `README.md` bagian "Status Audit"),
bukan sebelumnya — jadi dokumen ini berfungsi dobel: (1) baseline resmi apa yang sebenarnya dibangun dan
kenapa, (2) gerbang keputusan untuk Fase 2 dan seterusnya, supaya fase-fase berikutnya TIDAK lagi dikerjakan
tanpa PRD di depan seperti Fase 1.

Pemilik: Sujarwadi (L&D Department Head, Bosowa Berlian Motor). Terakhir diperbarui: 2026-10-12.

---

## 1. Problem

L&D BBM punya Competency Matrix Behavioral yang sudah lengkap dan tervalidasi (Kamus Kompetensi Bosowa
2022 / Thriving Competency Model — 10 kompetensi, 5 cluster, dipakai di seluruh JD). Yang BELUM ada:
kompetensi **Technical** (job-specific/craft per jabatan) dan **Managerial** (people-leadership untuk
Spv/Manager/GM). Menyusun ini manual per jabatan dari puluhan JD yang sudah terstandar itu lambat dan
hasilnya rawan tidak konsisten format/kedalamannya.

Begitu kompetensi Technical+Managerial ada, itu jadi fondasi untuk: Training Needs Analysis, pengembangan
modul training, asesmen atasan ke bawahan, dan IDP (Individual Development Plan).

## 2. Goals

- Dari teks JD yang sudah terstandar, hasilkan breakdown aktivitas hierarkis (Tugas Utama → Sub-Aktivitas →
  Sub-Sub-Aktivitas) dan kompetensi Technical + Managerial 5-level, format (5-level + Perilaku Kunci)
  identik dengan Kamus 2022 supaya satu sistem penilaian yang konsisten.
- Asesmen kompetensi oleh atasan langsung dilakukan langsung di app (bukan siklus export/import Excel),
  dan gap terhadap standar jabatan terhitung otomatis.
- Agregasi gap seluruh organisasi jadi Training Needs Matrix (Mandatory vs Development), dicek terhadap
  modul training yang BENAR-BENAR ada (folder Drive "Kurikulum & Modul" — bukan SFID/materi ATPM).
- Career Path Explorer: bandingkan kompetensi dua jabatan, tunjukkan mana yang transferable vs perlu
  dipelajari kalau seseorang mau pindah/naik ke jabatan itu.
- Jangka panjang (lihat §6 Roadmap): naik dari diagnostic ke analytics lintas organisasi, lalu — HANYA
  kalau data historis cukup — ke predictive (risiko performa sales, readiness suksesi).

## 3. Non-Goals (sengaja TIDAK dikerjakan di sini)

- **Kompetensi Behavioral** — sudah ada dan tervalidasi di Kamus 2022, dikelola sistem terpisah. TalentCore
  tidak pernah men-generate ulang behavioral, hanya (di masa depan) mengimpor hasil asesmennya ke profil
  yang sama.
- **SSO / login terpadu dengan Learning Simulator atau BBM-LMS** — backend & Sheet TalentCore sengaja
  dipisah dari Learning Simulator DB (lihat `README.md` § Arsitektur). Login masih NIK/PIN sendiri.
- **Prediksi apa pun sebelum data longitudinal ada** — lihat prinsip desain di §6. Tidak ada model
  "prediktif" yang dijual ke leadership sebelum back-testing terhadap data historis riil.
- **Replikasi fitur HRIS generik** (payroll, leave, dsb) — TalentCore murni untuk sisi kompetensi/talent,
  bukan pengganti HRIS.

## 4. Pengguna & Alur

| Role | Siapa | Ngapain di app |
|---|---|---|
| Admin / L&D | Sujarwadi dkk | Generate kompetensi dari JD, **tinjau & edit sebelum simpan**, lihat Kamus Kompetensi, Training Matrix, Career Path, Profil Karyawan siapa pun |
| Atasan Langsung | Dept Head / Kepala Cabang / Spv | Asesmen kompetensi **hanya untuk bawahan langsungnya sendiri**, lihat riwayat/gap bawahan itu |

Login pakai NIK + PIN (PIN di-hash, session berbasis token — lihat §7 Keamanan).

## 5. Fitur & Status (Fase 1 — sudah dikoding, belum di-deploy)

| Fitur | Deskripsi | Prioritas | Status |
|---|---|---|---|
| Breakdown Aktivitas Hierarkis | JD → Tugas Utama → Sub-Aktivitas → Sub-Sub-Aktivitas (AI, sekali panggil per JD) | P0 | Selesai |
| Generator Kompetensi Technical + Managerial | 5-level + Perilaku Kunci, format selaras Kamus 2022; Managerial hanya kalau ada Bawahan Langsung | P0 | Selesai |
| **Tinjau & Edit sebelum Simpan** | Hasil AI jadi form editable (nama/definisi/level/perilaku kunci) sebelum resmi masuk Kamus — bukan auto-publish | P0 | Selesai (hasil audit 2026-10-08) |
| Assessment live + Gap Engine | Atasan isi skor di app, gap = target − aktual, rekomendasi otomatis | P0 | Selesai |
| **Otorisasi server-side** | Token session; atasan cuma bisa nilai bawahan langsungnya; admin/L&D penuh | P0 | Selesai (hasil audit) |
| **PIN hashing** | SHA-256, upgrade otomatis dari plaintext lama | P0 | Selesai (hasil audit) |
| Training Needs Matrix | Agregat gap → Mandatory/Development, cross-check ke katalog "Kurikulum & Modul" riil | P1 | Selesai |
| Employee lookup + Profil/riwayat individu | Autocomplete NIK, tab riwayat kompetensi lintas siklus asesmen | P1 | Selesai (hasil audit) |
| Career Path Explorer | Diff kompetensi dua jabatan, dibantu AI (fallback keyword), dilengkapi status modul | P2 | Selesai (hasil audit) |
| **Visualisasi di tiap tahap** | Chart.js: radar profil level target (Kamus), bar target-vs-aktual (hasil asesmen), bar urgency/kesiapan modul (Training Matrix) — bukan cuma tabel/narasi | P1 | Selesai (2026-10-12) |
| **Alur generate → asesmen jadi satu rangkaian** | Begitu kompetensi tersimpan, form asesmen untuk jabatan itu langsung tersedia di layar yang sama (admin/L&D tidak perlu pindah layar atau re-pilih jabatan) | P1 | Selesai (2026-10-12) |
| **HAV Map (9-box proxy)** & **Bench Strength / status Ready Now–6-12bln–>1thn** | Tab baru "Suksesi & Bench": scatter 2 sumbu (Kesiapan vs Potensi) dan breakdown kesiapan kandidat per jabatan target — **rule-based dari Gap Engine, bukan ML**, lihat §6 untuk batasan | P1 (future-plan, dimajukan) | Selesai (2026-10-12) |

**Belum dikerjakan sama sekali (bukan bug, keputusan sadar menunda):**
- Deploy ke Google Sheet + Script Properties produksi (butuh aksi manual Sujarwadi — lihat `README.md` § Setup Deploy).
- Logout server-side / revoke token instan.
- IDP yang menyatukan skor Behavioral (Kamus 2022) + Technical/Managerial (TalentCore) dalam satu layar.
- **Persen probabilitas sukses rotasi/promosi** — sengaja TIDAK dibangun (keputusan 2026-10-12): belum ada data historis outcome untuk divalidasi, lihat §6.

## 6. Roadmap Jangka Panjang

Lihat dokumen hidup: [Roadmap BBM TalentCore — Super App Talent Management](https://claude.ai/code/artifact/ebf897bf-fd76-462d-aa7b-34a7f2e69c0e)
untuk breakdown lengkap Fase 2 (Analytics Lintas Organisasi), Fase 3 (integrasi BAMS + Database Sales +
Learning Simulator lewat NIK), dan Fase 4 (model prediktif, dengan syarat back-testing).

**Keputusan sudah diambil (2026-10-08 → 2026-10-09):** Fase 2 (analytics) dikerjakan dulu, koordinasi akses
BAMS untuk Fase 3 ditunda sampai Fase 2 matang/ada kebutuhan jelas.

**Keputusan baru (2026-10-12):** HAV Map, Bench Strength, dan status Ready Now/6-12bln/>1thn dimajukan dari
Fase 2 ke sekarang (Fase 1), tapi HANYA versi **rule-based** dari Gap Engine (gap=0 → Ready Now, gap=1 →
6-12bln, gap≥2 → >1thn; readiness/potential di HAV Map = % kompetensi di/atas target, bukan skor performa
riil). Ini proxy murni dari data kompetensi — BELUM menggabungkan performa/KPI aktual (itu baru masuk saat
BAMS/Database Sales terintegrasi, Fase 3). Persen probabilitas sukses rotasi/promosi TETAP ditunda — itu
butuh data historis outcome (siapa yang dipromosikan/dirotasi, berhasil atau tidak) untuk divalidasi
statistik, dan itu belum ada di mana pun saat ini.

Tiga prinsip yang mengikat semua fase (dari roadmap, tidak diulang di sini secara penuh):
1. Satu Pintu, Banyak Mesin.
2. Jangan prediksi sebelum ada data untuk diprediksi.
3. Diagnostic dulu, dibuktikan dulu, baru prediktif.

## 7. Keamanan & Data

- Session token (12 jam) dikeluarkan saat login; server menentukan identitas dari token, bukan dari field
  yang dikirim klien.
- PIN di-hash SHA-256.
- Sumber kebenaran status modul training: folder Drive "Kurikulum & Modul" — **bukan** SFID/materi ATPM
  (insiden koreksi 2026-10-08, lihat commit history).
- Data sensitif (skor kompetensi individu) baru dipakai internal L&D + atasan langsung; siapa yang boleh
  lihat level mana di luar itu (leadership, HC & GA) belum diputuskan formal — lihat Risiko di roadmap §8.

## 8. Success Metric (belum diukur, baseline untuk nanti)

- % jabatan dengan JD terstandar yang sudah punya kompetensi Technical+Managerial di Kamus (target: naik
  dari 5 jabatan sample ke seluruh jabatan struktural per cabang).
- % asesmen atasan yang selesai tepat waktu per siklus (begitu siklus formal ditetapkan).
- % Mandatory training gap yang punya modul "ada" vs "belum" di katalog (dorongan ke tim Kurikulum &
  Modul untuk isi gap modul yang "belum").
- (Fase 2+) korelasi skor kompetensi vs Indikator Keberhasilan cabang — validasi empiris Spencer & Spencer,
  bukan asumsi.

## 9. Open Questions

- Siapa yang approve kompetensi hasil generate sebelum "resmi" dipakai menilai orang — cukup admin/L&D
  yang generate sendiri, atau perlu sign-off terpisah (misal atasan Sujarwadi)?
- Kapan Fase 2 dianggap "cukup matang" untuk mulai paralel koordinasi akses BAMS (Fase 3)?
- Siapa pemilik akses teknis BAMS di tim IT/Digital — belum dikonfirmasi.
- Field & skema "Database Sales" yang sedang dibangun tim lain — perlu disepakati NIK sebagai join key
  SEBELUM skemanya final, bukan setelah (lihat Risiko di roadmap).
