# Learning Flywheel BBM — Briefing Proyek untuk Claude Code

Dokumen ini adalah pengantar untuk sesi Claude Code mana pun yang dibuka di repo ini. Baca file ini dulu sebelum mengerjakan apa pun. Ditulis oleh Claude (claude.ai) sebagai serah terima dari sesi chat sebelumnya kepada Sujarwadi (L&D Department Head, PT Bosowa Berlian Motor).

## 1. Apa Ini

Ekosistem pembelajaran berbasis AI bernama "Learning Flywheel", terdiri dari beberapa komponen yang saling terhubung lewat satu database Google Sheets ("Learning Simulator DB") dan satu backend Google Apps Script.

**Komponen yang sudah LIVE dan dipakai nyata:**
- **Learning Simulator** (frontend: root repo, `index.html`) — roleplay AI suara + Video Assessment berskor, PWA installable di HP, notifikasi WhatsApp (kode siap, tinggal aktifkan Fonnte).
- **BBLC Competency Development Studio** (frontend: `/kompetensi/index.html`) — generator matriks kompetensi dari JD (plus opsi transkrip wawancara SME), kamus 5 level, checklist asesmen, form asesmen untuk atasan, ekspor Excel format standar BBM.
- **Backend tunggal** (Google Apps Script "Code.gs", terhubung ke spreadsheet Learning Simulator DB) — melayani KEDUA frontend di atas lewat satu Web App URL yang sama.

**Yang BELUM ada / masih simulasi presentasi:**
- Integrasi nyata dengan BBM-LMS (Single Sign-On, embed, API baca data LMS) — baru berupa spesifikasi teknis dan file simulasi visual, BELUM ada kode sungguhan.
- Sertifikat otomatis, QR check-in in-class, SPB otomatis, AI pola mingguan lintas Learning Buddy — semua BELUM dibangun.
- Lihat `docs/Penilaian_Kesiapan_Ekosistem_Flywheel.docx` dan `docs/Pelacak_Pengerjaan_Flywheel.xlsx` untuk peta lengkap dan urutan pengerjaan.

## 2. Struktur Repo (frontend, GitHub `learning-simulator`)

```
/index.html              -> Learning Simulator (root domain GitHub Pages)
/kompetensi/index.html   -> BBLC Competency Development Studio
/docs/                   -> dokumen perencanaan (lihat bagian 5)
```

Domain live: `https://sujarwadi.github.io/learning-simulator/` dan `.../kompetensi/`

## 3. Backend (Google Apps Script, terpisah dari repo git ini)

Backend TIDAK berada di repo GitHub, dia hidup di Google Apps Script terikat ke spreadsheet "Learning Simulator DB". Untuk menariknya jadi file lokal:
```
npm install -g @google/clasp
clasp login
clasp clone <SCRIPT_ID>   # SCRIPT_ID dari URL editor Apps Script
```

Struktur tab penting di spreadsheet: `Users` (NIK, PIN, Nama, Cabang, Jabatan, Role, AtasanNIK, NoHP), `MatriksKompetensi`, `KamusKompetensi`, `ChecklistAsesmen`, `KatalogTraining`, `TaskBreakdown`, `Sesi`, `WALog`.

**Peringatan penting soal deployment Apps Script:** setiap perubahan kode WAJIB diikuti "Deploy > Manage deployments > pensil > Version: New version > Deploy" agar Web App memakai kode terbaru. Lupa langkah ini adalah sumber kebingungan paling sering terjadi sepanjang proyek ini.

## 4. Pelajaran Pahit yang Sudah Dilalui (jangan diulang)

- **Jebakan ekstensi ganda saat upload manual ke GitHub** (`index.html.html`): pastikan Windows Explorer menampilkan ekstensi file (View > Show > File name extensions) sebelum rename apa pun. Dengan Claude Code + `git push`, masalah ini otomatis hilang karena tidak ada lagi upload manual.
- **Otorisasi Google OAuth**: pernah gagal berulang kali karena Chrome menyimpan beberapa sesi akun sekaligus dan lembar izin memakai kotak centang yang harus dicentang SEMUA sebelum "Allow". Kalau suatu saat perlu re-otorisasi (misal setelah ubah `oauthScopes` di `appsscript.json`), lakukan di jendela Incognito dengan satu akun saja.
- **Kelas izin Google Drive**: gunakan scope `drive.file` (bukan `drive` penuh), karena `drive` penuh sempat ditolak berulang oleh akun pribadi Sujarwadi. `drive.file` sudah terbukti cukup untuk seluruh kebutuhan ekspor file.
- **Cross-origin iframe**: isi iframe lintas domain TIDAK BISA dibaca JavaScript (aturan browser, bukan bug). Jangan pernah mencoba mendeteksi sukses/gagalnya sebuah iframe dengan membaca `contentWindow.document`, itu akan selalu gagal atau salah. Kalau butuh fallback, pakai event `load` saja atau sediakan tombol cadangan manual.
- **Race condition animasi/timer saat ada tombol "kembali" atau "reset"**: setiap `setTimeout` yang memutasi state harus dibungkus token generasi yang bisa dibatalkan (lihat pola `gTimeout` di file simulasi presentasi), kalau tidak, animasi lama bisa "menyusul" tampil setelah state sudah direset.

## 5. Dokumen Referensi (taruh di folder `/docs`)

1. **Penilaian_Kesiapan_Ekosistem_Flywheel.docx** — analisis jujur: apa yang sudah lengkap, apa yang kodenya siap tinggal dipasang, apa yang belum ada sama sekali, diurutkan dari paling sederhana sampai paling kompleks, plus alasan urutannya.
2. **Pelacak_Pengerjaan_Flywheel.xlsx** — daftar kerja 15 item terurut, siap dicentang, dengan kolom Status yang harus diupdate manual seiring progres. INI SUMBER KEBENARAN URUTAN KERJA. Cek sheet ini dulu sebelum mengerjakan fitur baru apa pun.
3. **Spesifikasi_Integrasi_LMS_Simulator.docx** — spesifikasi teknis SSO dan API untuk diserahkan ke developer BBM-LMS (nama: Faris, latar belakang IT, internal HR).

## 6. Konteks Manusia (penting untuk nada kerja)

- Pemilik proyek: **Sujarwadi ("Brader")**, L&D Department Head, praktisi tunggal (bukan tim).
- Developer LMS: **Faris**, internal HR berlatar IT, jadwalnya padat dan sering sulit ditemui. Setiap permintaan keterlibatan dia harus ringkas dan sudah dalam bentuk spesifikasi siap eksekusi, jangan minta dia membaca dokumen panjang dulu.
- Arah strategis dari atasan Sujarwadi (Head of HC & GA): sistem ini harus terasa sebagai SATU pintu (BBM-LMS), bukan aplikasi terpisah-pisah. Prinsip kerja yang disepakati: "Satu Pintu, Banyak Mesin", LMS jadi wajah, mesin-mesin (Simulator, Studio, AI) bekerja di baliknya.
- Sujarwadi baru mulai memakai Claude Code; sebelumnya seluruh pekerjaan ini dibangun lewat percakapan biasa di claude.ai. Ekspektasi dia: Claude Code harus terasa LEBIH cepat dan lebih sedikit gesekan dibanding upload manual ke GitHub yang selama ini dilakukan.

## 7. Mulai Dari Mana

Buka `docs/Pelacak_Pengerjaan_Flywheel.xlsx`, kerjakan item nomor 1 ke atas secara berurutan kecuali ada alasan mendesak untuk melompat. Item 1 sampai 4 adalah instalasi (bukan development), estimasi total di bawah 2 jam, dan seharusnya jadi hal pertama yang dituntaskan begitu sesi Claude Code ini dimulai.
