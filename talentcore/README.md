# BBM TalentCore

Engine kompetensi baru, pengganti BBLC Competency Development Studio (`/kompetensi`, sudah dihapus — belum pernah dipakai nyata). Satu engine, banyak fungsi: JD → breakdown aktivitas hierarkis → kompetensi Technical + Managerial (5 level + Perilaku Kunci) → form asesmen atasan → gap otomatis → training needs matrix (Mandatory/Development) → career path explorer.

Kompetensi **Behavioral** sengaja tidak digenerate di sini — itu sudah ada dan tervalidasi di Kamus Kompetensi BBM 2022 (BBM Thriving Competency Model), dikelola terpisah.

## Struktur

```
/talentcore/index.html        -> Frontend (GitHub Pages: .../talentcore/)
/talentcore/backend/Code.gs   -> Backend Apps Script (ditempel manual, lihat di bawah)
```

## Arsitektur & Alasan Desain

- **Backend baru, Sheet baru ("TalentCore DB"), terpisah dari Learning Simulator DB.** Keputusan sadar: BBLC Studio lama belum pernah dipakai jadi aman didrop, tapi membangun di atas Sheet yang sama dengan Learning Simulator (yang sudah live dipakai nyata) berisiko kalau ada kesalahan skema. Begitu TalentCore stabil, pertimbangkan migrasi Users ke satu sumber, sejalan prinsip "Satu Pintu, Banyak Mesin".
- **AI generate dipanggil langsung dari Apps Script** (`callClaude_` di Code.gs) ke Anthropic API, bukan dari frontend — supaya API key tidak pernah terekspos di browser.
- **Assessment langsung di dalam app** (bukan export Excel lalu re-upload) — atasan isi skor, backend langsung hitung gap dan rekomendasi. Ini beda dari BBLC Studio lama yang pakai siklus Excel.

## Status Audit (2026-10-08) — Sudah Diperbaiki

Audit dual-lens (Chief of OD + Product Designer HR-Tech) menemukan beberapa gap sebelum layak pegang
data karyawan sungguhan. Semua rekomendasi di bawah sudah dikerjakan di versi ini:

- **P0 — Keamanan & validitas data:**
  - PIN di-hash SHA-256 (upgrade otomatis dari plaintext lama saat user login pertama kali, lihat `actionLogin_`).
  - Session token: login mengeluarkan `token`, setiap action lain WAJIB membawanya. Server menentukan NIK/role dari token tersimpan di sheet `Sessions`, bukan dari field yang dikirim klien — jadi klien tidak bisa mengaku-aku jadi admin atau menilai NIK siapa pun.
  - Atasan hanya bisa submit asesmen untuk NIK yang `AtasanNIK`-nya memang dia (dicek server-side di `actionSubmitAssessment_`), admin/L&D tetap bisa menilai siapa pun.
  - Step tinjau & edit sebelum simpan: hasil AI generate sekarang jadi form yang bisa diedit (nama/definisi/level target/perilaku kunci) sebelum ditekan "Simpan ke Kamus Kompetensi" — bukan lagi auto-publish.
- **P1 — Kegunaan nyata:**
  - Employee lookup: input NIK di layar Atasan & Admin sekarang autocomplete (datalist) dari sheet Users, bukan ketik bebas. Atasan cuma lihat bawahan langsungnya sendiri; admin/L&D lihat semua (`actionGetUsersList_`).
  - Profil & riwayat individu: tab baru "Profil Karyawan" (admin) dan tombol "Lihat Riwayat" di layar Atasan — menampilkan tren level per kompetensi lintas siklus asesmen. Datanya sebenarnya sudah ada sejak awal (`Assessment` sheet menyimpan baris baru bertimestamp tiap submit, tidak menimpa), cuma belum pernah divisualisasikan.
- **P2 — Kualitas:**
  - Career Path Explorer sekarang coba mencocokkan transferable/perlu-dipelajari lewat AI (kesamaan substansi skill dari nama+definisi), fallback ke keyword matching lama kalau API tidak tersedia/gagal — hasil ditandai `method: 'ai'|'keyword'` di UI biar jelas mana yang final mana yang perkiraan.
  - Hasil "Perlu Dipelajari" sekarang dilengkapi status modul training (ada/sebagian/belum) dari katalog, jadi actionable bukan cuma daftar nama.

## Setup Deploy (sekali di awal)

1. Buat Google Sheet baru, kosong, beri nama "TalentCore DB".
2. Dari Sheet itu: Extensions > Apps Script. Hapus isi default, tempel seluruh isi `backend/Code.gs`.
3. Project Settings (ikon gear) > Script Properties > tambah properti `CLAUDE_API_KEY` dengan API key Anthropic yang valid.
4. Di dropdown fungsi (atas editor), pilih `setupTabTalentCore`, klik Run. Izinkan otorisasi saat diminta (ikuti Incognito + satu akun saja kalau pernah gagal berulang, lihat catatan di README root). Aman dijalankan ulang kalau sheet sudah ada dari versi sebelumnya — cuma menambah sheet baru yang belum ada (`Sessions`, `Performance`, `IDP`), data lama tidak terhapus.
5. Pilih fungsi `seedTrainingModuleContoh`, klik Run — ini isi starter data status modul training dari 5 jabatan sample yang sudah divalidasi. Lalu pilih `seedKompetensiWajib`, klik Run — ini isi 2 kompetensi wajib perusahaan (AI Generatif, Anti-Fraud) yang otomatis muncul di SEMUA jabatan.
6. Isi sheet `Users` manual (atau salin dari Learning Simulator DB): kolom NIK, Nama, PIN, Role (`admin`/`ld` untuk akses generate, lainnya untuk atasan), Cabang, Jabatan, AtasanNIK.
7. Deploy > New deployment > pilih tipe Web app > Execute as: Me > Who has access: Anyone. Deploy, salin URL yang diberikan.
8. Tempel URL itu ke `window.BACKEND_URL` di baris atas `talentcore/index.html`, commit & push.
9. **Setiap kali ubah Code.gs**, ulangi Deploy > Manage deployments > pensil > Version: New version > Deploy, atau Web App tetap pakai kode versi lama (jebakan paling sering di proyek ini, lihat README root).

## Yang Masih Perlu Diputuskan / Dikerjakan Lanjutan

- IDP per karyawan SEKARANG sudah ada tapi baru technical+managerial (tab "Profil Karyawan" / "Lihat Riwayat") — belum digabung dengan skor Behavioral dari Kamus 2022, karena itu masih sistem terpisah.
- Import hasil asesmen Behavioral dari sistem Kamus 2022 belum dijembatani ke tabel `Assessment` yang sama.
- Login masih NIK/PIN sendiri (sekarang sudah session-token + PIN hash, lihat bagian Status Audit) — belum SSO dengan Learning Simulator/LMS.
- Scale ke lebih dari 5 jabatan sample: tinggal generate dari JD lain lewat Tab 1, metodologinya sudah sama. Setiap hasil generate tetap wajib ditinjau/diedit admin sebelum disimpan (lihat Status Audit).
- Career Path AI-matching menambah 1x panggilan Claude API setiap kali explore — biayanya kecil (dipanggil manual, bukan terus-menerus) tapi tetap perlu dipantau kalau dipakai sangat sering.
- Session token belum punya mekanisme logout server-side (token tetap valid sampai 12 jam meski user klik "Keluar" — itu cuma menghapus token di browser). Cukup untuk risiko saat ini (internal, role terbatas), tapi kalau nanti butuh revoke-instan, perlu tambah endpoint `logout` yang menghapus baris token di sheet `Sessions`.
