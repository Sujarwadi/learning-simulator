# Mesin Data TNA BBLC

Membangun paket data TNA (kamus, matriks, tugas, katalog, riwayat) dari sumber, menerapkan Standar Kompetensi BBM
(`docs/STANDAR_KOMPETENSI_BBM.md`), menjalankan QA Q1-Q10, dan membuat dokumen jabatan. Hasilnya diimport ke Sheet TNA
lewat `tnaImportPaket` (lihat `backend/README.md`).

## Aturan pembagian (repo ini publik)
| Di repo (folder ini) | TIDAK di repo (paket masukan, simpan di Drive terbatas) |
|---|---|
| Kode: `build_import.py`, `standar_bbm.py`, `ksa_gen.py`, `master_2027.py`, `riwayat.py`, `iht.py`, `durasi_2027.py`, `silabus_rekam.py`, `gen_*.py/js`, `jalankan.sh`, `cek_data_pribadi.py` | Isi perusahaan: `jd_extract.py`, `jd_disusun_ld.py`, `lib_kompetensi.py`, `program2027.py`, `sil_*.py`, folder `std/`, `beh/`, `master/`, `silabus/` |
| `konfigurasi_lokal.contoh.json` (contoh kosong) | Data karyawan: `Master_Karyawan_TNA_2027_CLEAN.xlsx`, `dl/*.pkl`, `konfigurasi_lokal.json` (NIK dan nama) |

Berkas di kolom kanan sudah masuk `.gitignore`. Sebelum commit, jalankan:
`python3 tools/data-engine/cek_data_pribadi.py <path Master_Karyawan_TNA_2027_CLEAN.xlsx>` (harus "BERSIH").

## Cara memperbarui data (urutan kerja)
1. Buka zip **Paket_Masukan_Mesin_Data_vN.zip** dari Drive ke folder kerja, mis. `~/kerja-tna`.
2. Ubah isi sesuai kebutuhan, lalu simpan di folder kerja:
   - JD jabatan berubah atau ada jabatan baru: `jd_extract.py` (satu blok `X["Jxxx"]`) atau `jd_disusun_ld.py`.
   - Kamus atau key behavior kompetensi teknis: `std/kb_a.py`, `kb_b.py`, `kb_c.py` (7 kalimat per kompetensi: definisi L1, KB L1 x2, KB2 L2-L5).
   - Keputusan pemetaan sel matriks tanpa tugas: `std/keputusan.py` (`SEL`), penulisan ulang key behavior (`REWRITE`).
   - Sel master yang dipertahankan karena kebutuhan bisnis walau JD belum menyebut: `std/keputusan.py` (`KEMBALI`: teks tugas usulan); sel baru karena arah bisnis: `TAMBAH_SEL`; modul baru: `MODUL_BARU`; penyelenggara yang diputuskan: `SUMBER_BARU`. Aturan: kompetensi tidak dihapus hanya karena JD diam (Standar Kompetensi BBM, komponen 4 butir 4).
   - Silabus modul baru: tambah blok di `sil_*.py` (paket), jalankan `python3 gen_silabus.py` di folder kerja setelah satu kali `jalankan.sh`, lalu `jalankan.sh` lagi.
   - Karyawan baru atau pindah: ganti `Master_Karyawan_TNA_2027_CLEAN.xlsx` (hasil `clean_karyawan.py` dari data HRIS).
   - Master kompetensi fungsi (Finance, L&D): letakkan xlsx baru di `master/`, lalu `python3 parse_master.py` (menghasilkan `master/finance.json` dan `lnd.json`).
3. Jalankan: `bash tools/data-engine/jalankan.sh ~/kerja-tna` (tambahkan `--dokumen` untuk 101 dokumen jabatan; butuh node dan Playwright).
4. Baca bagian `QA:` di layar. Semua harus 0 kecuali Q2 (17 baris Direksi). Bila tidak 0, perbaiki sumbernya, bukan hasilnya.
5. Upload `TNA2027_Import.xlsx` ke Drive, simpan sebagai Google Spreadsheet, isi ID-nya di `tnaImportPaket`, jalankan, lalu Deploy versi baru.
6. Simpan paket masukan yang sudah diperbarui kembali ke Drive dengan nomor versi baru (v2, v3, ...).

## Pembuktian reproduksi
Dibangun dari folder kosong memakai kode ini dan paket masukan: 25.476 baris pada 14 tab, 0 selisih terhadap paket yang berjalan (31 Okt 2026).
Paket masukan v2 (4 Nov 2026: 41 sel master dipertahankan, 1 sel baru, 3 modul baru beserta silabus): 25.566 baris pada 14 tab, 0 selisih saat dibangun ulang dari folder kosong.
