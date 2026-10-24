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
4. Jalankan `tnaImport("<ID file TNA2027_Import>")` sekali.
5. **Deploy → Kelola deployment → ✏️ → Versi: Versi baru → Deploy.**
