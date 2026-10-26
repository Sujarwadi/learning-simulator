# CLAUDE.md — Learning Flywheel BBM

Panduan kerja untuk Claude Code di repo ini. Baca `README.md` (konteks proyek & manusia) dan dokumen PRD aktif sebelum mengerjakan apa pun.

## Proyek aktif
**BBLC TNA Engine 2027**, spesifikasinya di `docs/PRD_TNA_Engine_2027.md`. Itu sumber kebenaran untuk scope, rumus, dan kriteria selesai. Kalau ada permintaan yang bertentangan dengan PRD, tanyakan dulu ke user, lalu perbarui PRD-nya.

Deadline keras: pilot Sen 26 Okt 2026, window asesmen 27 Okt sampai 3 Nov 23:59 WITA, output terbit Rab 4 Nov 2026.

## Struktur
```
/index.html              Learning Simulator (roleplay AI + Video Assessment), PWA
/kompetensi/index.html   BBLC Competency Development Studio  ← TNA Engine dibangun di sini
/backend/                Kode Apps Script (Code.gs dkk) via clasp, TANPA secret
/docs/                   PRD, tracker, spesifikasi
```
`/kompetensi/index.html.html` adalah sisa salah upload (ekstensi ganda). Jangan diedit, nanti dihapus.

## Arsitektur (jangan diubah tanpa persetujuan)
- **Frontend:** satu file HTML per aplikasi, vanilla JS, CSS inline, tanpa framework dan tanpa build step. Dilayani GitHub Pages.
- **Backend:** satu Google Apps Script Web App untuk SEMUA frontend. Frontend memanggil `api(action, payload)` dengan POST JSON ke `BACKEND_URL`, lalu backend me-routing berdasarkan `action`.
- **Database:** Google Sheets "Learning Simulator DB". Skema tab ada di PRD §6.
- **Prinsip "Satu Pintu, Banyak Mesin":** jangan bikin aplikasi, login, atau database baru. Perluas yang sudah ada.

## Aturan wajib
1. **Data karyawan TIDAK BOLEH masuk repo.** Repo ini publik (GitHub Pages). Nama, NIK, nomor HP, KTP, dan rating semuanya hanya boleh ada di Sheets/Drive. File olahan data simpan di scratchpad, jangan di repo.
2. **Tidak ada secret di repo maupun di frontend.** API key (AI, Fonnte) disimpan di Apps Script `PropertiesService.getScriptProperties()`.
3. **Otorisasi dicek di backend.** Penilai hanya boleh akses NIK yang `AtasanNIK`-nya dia sendiri. Admin dicek dari Role. Pengecekan di UI saja tidak cukup.
4. **Batas Apps Script 6 menit:** proses massal wajib dipecah per batch dengan checkpoint dan dilanjutkan trigger. Baca/tulis Sheets per blok (`getValues`/`setValues`), jangan per sel di dalam loop.
5. **Output AI selalu berstatus `*_AI`** sampai di-review manusia. Jangan pernah langsung dianggap final.
6. **Jangan tebak data.** Kalau data ambigu (atasan, jabatan, mapping), tanya user dulu. Jangan diisi asumsi diam-diam.
7. Setiap `setTimeout`/animasi yang mengubah state dibungkus token generasi (lihat pola `gTimeout`, README §4).
8. Jangan membaca isi iframe lintas domain (README §4).

## Konvensi
- **Bahasa:** UI dan pesan error dalam Bahasa Indonesia yang ramah. JSON atau error teknis mentah tidak boleh tampil ke user.
- **Versi:** baris komentar paling atas tiap file HTML berformat `<!-- BBLC Studio vX.Y, DD Mmm YYYY. Perubahan: ... -->` (yang terbaru di paling atas). Backend punya konstanta `BACKEND_VERSION`.
- **Commit:** `vX.Y: ringkasan` / `vX.Y.Z HOTFIX: ...` / `vX.Y.Z FIX: ...`, mengikuti histori yang sudah ada.
- **Nama action backend:** camelCase, kata kerja dulu (`getGap`, `submitAsesmen`, `generateITP`).
- **Kode & nama kolom Sheets:** PascalCase tanpa spasi (`AtasanNIK`, `KodeJabatan`).

## Deploy
- **Frontend:** push ke `main`, lalu GitHub Pages update otomatis dalam 1–2 menit.
- **Backend:** `clasp push`, lalu di editor Apps Script buka **Deploy > Manage deployments > ✏️ > Version: New version > Deploy**. Lupa langkah ini = Web App tetap memakai kode lama (sumber kebingungan #1 di proyek ini).
- Re-otorisasi OAuth (setelah ubah `oauthScopes`) dilakukan di jendela Incognito dengan satu akun. Scope Drive pakai `drive.file`, jangan `drive` penuh. Pengecualian: membaca folder JD/modul milik user bisa butuh `drive.readonly`, jadi konfirmasi ke user dulu.

## Dokumen & presentasi
Setiap PPT, proposal, atau dokumen untuk user WAJIB mengikuti `docs/STANDAR_DOKUMEN.md` (judul slide headline 2-6 kata, bukan kalimat; alur ringkasan-situasi-masalah-solusi-keputusan; satu halaman per komponen; tanpa nama perusahaan pembanding; render & periksa sebelum kirim; file diberi akhiran versi).

## Verifikasi sebelum menyatakan selesai
- Buka halaman yang diubah di Chromium (Playwright sudah terpasang). Uji alur login → fitur → ekspor, dan pastikan konsol tidak ada error.
- Untuk logika perhitungan (gap, proyeksi, kalender): jalankan dengan data contoh **sintetis**, lalu cocokkan dengan hitungan manual. Rekonsiliasi jam Plan = ITP = Calendar harus selisih 0.
- Cek ulang kriteria penerimaan di PRD §9 yang relevan.
