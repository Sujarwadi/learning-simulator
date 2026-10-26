# Backend Apps Script

- `Kode.gs` (backend v3.5) hidup di Apps Script dan belum disalin ke repo, karena masih memuat satu NIK di fungsi diagnostik.
- `TNA.gs` adalah modul TNA Engine 2027. Pasang sebagai file **terpisah** di project Apps Script yang sama.
  Semua tab yang dipakai berawalan `TNA_`, jadi tab lama tidak tersentuh.

## Pemasangan TNA.gs
0. **Wajib (sejak v1.6): perbarui `appsscript.json`** dengan isi file `backend/appsscript.json` di repo (menambah scope `script.scriptapp` untuk jadwal otomatis output & pengingat). Di editor: ⚙️ Setelan project → centang "Tampilkan file manifes appsscript.json" → tempel. Lalu jalankan fungsi apa saja sekali dan setujui izin baru (pakai jendela Incognito dengan satu akun).
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
- Setelah generate, Panel Admin menampilkan porsi IHT terhadap total jam L&D dan jumlah sesi IHT terjadwal vs kebutuhan pola 2026.

## Validasi Head unit (v1.3)
- Kolom `ValidatorNIK` di tab Karyawan menentukan siapa yang memvalidasi (Kacab di cabang, Dept Head di HO). Kosong = Admin L&D.
- Status validasi tersimpan di tab `TNA_Validasi`. Jangan diedit manual kecuali koreksi darurat.
- Hasil yang belum divalidasi tetap masuk output dengan `StatusValidasi = BELUM VALIDASI`.

## Pengingat WhatsApp (v1.6)
- Memakai `kirimWA` di Kode.gs (Fonnte). Script Properties: `WA_TOKEN` (token Fonnte) dan `WA_AKTIF` = `1`.
- Nomor diambil dari tab Users kolom H (NoHP). Panel Admin menampilkan siapa yang nomornya kosong.
- Hari kirim diatur parameter `PengingatHari` (default `5,3,1,0` = H-5, H-3, H-1, hari terakhir) jam `PengingatJam` WITA; H+1 hanya untuk validator yang masih punya antrean.
