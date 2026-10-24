# Backend Apps Script

- `Kode.gs` (backend v3.5) hidup di Apps Script dan belum disalin ke repo, karena masih memuat satu NIK di fungsi diagnostik.
- `TNA.gs` adalah modul TNA Engine 2027. Pasang sebagai file **terpisah** di project Apps Script yang sama.
  Semua tab yang dipakai berawalan `TNA_`, jadi tab lama tidak tersentuh.

## Pemasangan TNA.gs
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
6. Jalankan `tnaJadwalkanOutput` sekali (generate otomatis 5 menit setelah window tutup).
7. **Deploy → Kelola deployment → ✏️ → Versi: Versi baru → Deploy.**

## Tab TNA_Riwayat (v1.1)
Isi `NIK, KodeTraining, Tanggal, Sumber` untuk training Wajib yang SUDAH lulus (mis. Step 1, MSA 1, Brevet).
Saat generate output, training Wajib tersebut tidak dijadwalkan ulang untuk orang itu. Kosong = semua Wajib dijadwalkan.
