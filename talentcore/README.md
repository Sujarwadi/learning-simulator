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

## Setup Deploy (sekali di awal)

1. Buat Google Sheet baru, kosong, beri nama "TalentCore DB".
2. Dari Sheet itu: Extensions > Apps Script. Hapus isi default, tempel seluruh isi `backend/Code.gs`.
3. Project Settings (ikon gear) > Script Properties > tambah properti `CLAUDE_API_KEY` dengan API key Anthropic yang valid.
4. Di dropdown fungsi (atas editor), pilih `setupTabTalentCore`, klik Run. Izinkan otorisasi saat diminta (ikuti Incognito + satu akun saja kalau pernah gagal berulang, lihat catatan di README root).
5. Pilih fungsi `seedTrainingModuleContoh`, klik Run — ini isi starter data status modul training dari 5 jabatan sample yang sudah divalidasi.
6. Isi sheet `Users` manual (atau salin dari Learning Simulator DB): kolom NIK, Nama, PIN, Role (`admin`/`ld` untuk akses generate, lainnya untuk atasan), Cabang, Jabatan, AtasanNIK.
7. Deploy > New deployment > pilih tipe Web app > Execute as: Me > Who has access: Anyone. Deploy, salin URL yang diberikan.
8. Tempel URL itu ke `window.BACKEND_URL` di baris atas `talentcore/index.html`, commit & push.
9. **Setiap kali ubah Code.gs**, ulangi Deploy > Manage deployments > pensil > Version: New version > Deploy, atau Web App tetap pakai kode versi lama (jebakan paling sering di proyek ini, lihat README root).

## Yang Masih Perlu Diputuskan / Dikerjakan Lanjutan

- IDP per karyawan (gabungan behavioral + technical + managerial) belum dibangun sebagai satu layar — saat ini gap hanya muncul per-sesi-asesmen di layar Atasan.
- Import hasil asesmen Behavioral dari sistem Kamus 2022 belum dijembatani ke tabel `Assessment` yang sama.
- Login masih NIK/PIN sederhana cocok Users sheet sendiri — belum SSO dengan Learning Simulator/LMS.
- Scale ke lebih dari 5 jabatan sample: tinggal generate dari JD lain lewat Tab 1, metodologinya sudah sama.
