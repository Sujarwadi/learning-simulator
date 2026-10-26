# Backend Apps Script

- `Kode.gs` (backend v3.5) hidup di Apps Script dan belum disalin ke repo, karena masih memuat satu NIK di fungsi diagnostik.
- `TNA.gs` adalah modul TNA Engine 2027. Pasang sebagai file **terpisah** di project Apps Script yang sama.
  Semua tab yang dipakai berawalan `TNA_`, jadi tab lama tidak tersentuh.

## Pemasangan TNA.gs
0. **Wajib: GABUNGKAN scope di `appsscript.json`, jangan timpa seluruh file.** Manifest berlaku untuk SEMUA kode di project (Kode.gs + TNA.gs). Kalau ditimpa begitu saja, scope milik Kode.gs (mis. `drive.file` untuk ekspor & upload video Learning Simulator) dan setelan `webapp` bisa hilang, lalu fitur lama berhenti.
   - Di editor: ⚙️ Setelan project → centang "Tampilkan file manifes appsscript.json" → buka `appsscript.json` yang SEKARANG.
   - Pastikan daftar `oauthScopes` memuat keempat scope ini; tambahkan yang belum ada, JANGAN hapus yang sudah ada: `spreadsheets`, `drive.file`, `script.external_request`, `script.scriptapp` (lihat `backend/appsscript.json` di repo sebagai acuan).
   - Bagian `webapp` (executeAs, access) biarkan seperti yang sekarang berjalan.
   - Jalankan fungsi apa saja sekali dan setujui izin (jendela Incognito, satu akun).
1. Di editor Apps Script, klik **+** (File) → **Skrip**, beri nama `TNA`, lalu tempel isi `TNA.gs`.
2. Di `Kode.gs`, fungsi `doPost`, ganti baris `default:` menjadi:
   ```js
   default: out = String(req.action || "").indexOf("tna") === 0 ? handleTNA(req) : { ok: false, error: "Aksi tidak dikenal." };
   ```
3. Jalankan `tnaSetup` sekali dari editor.
4. Import paket data:
   - Upload `TNA2027_Import.xlsx` ke Google Drive (akun yang sama dengan pemilik Apps Script).
   - Buka filenya, lalu **File → Simpan sebagai Google Spreadsheet**. Salin ID dari URL file baru (`/d/<ID>/edit`).
   - Di `TNA.gs` fungsi `tnaImportPaket`, ganti `ISI_ID_FILE_IMPORT` dengan ID tadi. Pilih `tnaImportPaket` di dropdown, klik **Jalankan**.
   - Cek **Log eksekusi**: harus muncul jumlah baris per tab dan "Users: ... Atasan NIK diisi".
   - Jangan commit ID file tersebut ke repo.
5. Buka Studio sebagai Admin → Panel Admin TNA → centang "Pilih semua" → **Setujui Jabatan Terpilih**.
6. Di Panel Admin TNA, tekan **Aktifkan Jadwal Otomatis** (generate output 5 menit setelah window tutup + pengingat WA harian). Alternatif dari editor: jalankan `tnaJadwalkanOutput` dan `tnaJadwalkanPengingat`.
7. **Deploy → Kelola deployment → ✏️ → Versi: Versi baru → Deploy.**

## Cek terakhir sebelum window buka (27 Okt 00:00 WITA)
1. **Log `tnaImportPaket`**: jumlah baris per tab sesuai (Karyawan 807, Katalog 166, Silabus 61, IHT 26) dan baris "Users: ... user baru".
2. **User baru = PIN acak, nomor HP kosong.** Mereka tidak bisa login dan tidak menerima WA sampai PIN-nya diberikan. Di tab Users, filter kolom Wajib_Ganti_PIN = TRUE dan NoHP kosong, lalu bagikan PIN lewat Kacab/atasan masing-masing (atau isi NoHP supaya ikut pengingat WA).
3. **Panel Admin → Parameter**: Window dibuka 27 Okt 2026 00:00, ditutup 3 Nov 2026 23:59 (WITA). Tab Parameter lama dari uji coba bisa masih menyimpan tanggal tes.
4. **Bersihkan data uji pilot** di `TNA_Asesmen`, `TNA_Validasi`, `TNA_Draft` bila pilot memakai NIK asli dengan jawaban percobaan (hapus barisnya, header jangan).
5. **Jadwal Otomatis aktif** (Panel Admin menampilkan trigger output & pengingat).
6. **Uji asap** setelah Deploy versi baru dan merge ke `main`: login admin, satu penilai, satu karyawan; buka form, Katalog, Riwayat, Landasan. Fitur Learning Simulator lama (roleplay, video) juga dicoba sekali karena manifest berubah.

## Tab TNA_Riwayat (v1.1)
Isi `NIK, KodeTraining, Tanggal, Sumber` untuk training Wajib yang SUDAH lulus (mis. Step 1, MSA 1, Brevet).
Saat generate output, training Wajib tersebut tidak dijadwalkan ulang untuk orang itu. Kosong = semua Wajib dijadwalkan.

## Katalog, Silabus & Riwayat Training (v1.7)
- Paket import kini berisi tab `Silabus` (ringkasan materi, status `DRAF_AI`) dan `RekamTraining` (riwayat training 2025-2026 per karyawan). Keduanya ikut ter-import oleh `tnaImportPaket`; tidak ada langkah tambahan.
- `TNA_RekamTraining` harus tetap **diurutkan per NIK** (sudah begitu dari file import). Baris yang ditambah manual di bawah tetap terbaca, hanya sedikit lebih lambat.
- Silabus yang sudah direview: buka Studio sebagai Admin → Katalog Training & Silabus → pilih training → **Tandai silabus final**. Boleh juga mengedit isi silabus langsung di tab `TNA_Silabus`.

## Kalender BST & IHT (v1.8)
- Paket import kini berisi tab `IHT` (rata-rata jam IHT 2026 per jabatan) dan 4 entri katalog rumpun IHT (`IHT-SELL`, `IHT-PK`, `IHT-ASV`, `IHT-SELF`, kategori `IHT`). Ikut ter-import oleh `tnaImportPaket`.
- Tab `TNA_Batch` mendapat kolom `TanggalSelesai` dan `Catatan`. Header ditulis ulang otomatis saat generate output; tidak perlu langkah manual.
- Parameter baru (default dipakai bila belum ada di tab Parameter): `KodeBST` (D-BST), `MaksPersenIHT` (20), `JamSesiIHT` (2). Dua yang terakhir bisa diubah di Panel Admin.
- v1.9: kolom `PesertaProyeksi` di `TNA_Batch` dan parameter `ProyeksiPesertaBST` (default 63, referensi BST 1-2 Sep 2026; ubah di Panel Admin). Katalog D-BST kini berstatus metode ONLINE (Zoom).
- Setelah generate, Panel Admin menampilkan porsi IHT terhadap total jam L&D dan jumlah sesi IHT terjadwal vs kebutuhan pola 2026.

## Program 2027 (v2.0)
- Paket import menambah 11 modul baru (status `USULAN_PENGADAAN`) dan Mandatory jalur sales, aftersales, HR for Non-HR, dan BEI. Ikut ter-import seperti biasa.
- Parameter `JendelaKhusus` (JSON kode -> bulan 1-12) mengatur bulan program tertentu (Kacab Academy per kuartal, dst). Edit langsung di tab `TNA_Parameter` bila perlu.

## Validasi Head unit (v1.3)
- Kolom `ValidatorNIK` di tab Karyawan menentukan siapa yang memvalidasi (Kacab di cabang, Dept Head di HO). Kosong = Admin L&D.
- Status validasi tersimpan di tab `TNA_Validasi`. Jangan diedit manual kecuali koreksi darurat.
- Hasil yang belum divalidasi tetap masuk output dengan `StatusValidasi = BELUM VALIDASI`.

## Pengingat WhatsApp (v1.6)
- Memakai `kirimWA` di Kode.gs (Fonnte). Script Properties: `WA_TOKEN` (token Fonnte) dan `WA_AKTIF` = `1`.
- Nomor diambil dari tab Users kolom H (NoHP). Panel Admin menampilkan siapa yang nomornya kosong.
- Hari kirim diatur parameter `PengingatHari` (default `5,3,1,0` = H-5, H-3, H-1, hari terakhir) jam `PengingatJam` WITA; H+1 hanya untuk validator yang masih punya antrean.
