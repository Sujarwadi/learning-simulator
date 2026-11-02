#!/bin/bash
# Bangun ulang seluruh paket data TNA dari folder kerja berisi: kode mesin ini + paket masukan (lihat README.md).
# Pemakaian:  bash jalankan.sh <folder-kerja> [--dokumen]
#   <folder-kerja>  berisi paket masukan (zip dari Drive, sudah dibuka) dan konfigurasi_lokal.json
#   --dokumen       sekaligus membuat 101 dokumen jabatan (Excel) dan dokumen JD (butuh node dan Chromium/Playwright)
set -euo pipefail
AWAL="$(cd "$(dirname "$0")" && pwd)"
KERJA="${1:?Isi folder kerja, mis. bash jalankan.sh ~/kerja-tna}"
cd "$KERJA"
[ -f konfigurasi_lokal.json ] || { echo "konfigurasi_lokal.json tidak ada di $KERJA (lihat konfigurasi_lokal.contoh.json)"; exit 1; }
[ -f Master_Karyawan_TNA_2027_CLEAN.xlsx ] || { echo "Master_Karyawan_TNA_2027_CLEAN.xlsx tidak ada di $KERJA"; exit 1; }
cp "$AWAL"/*.py "$AWAL"/*.js . 2>/dev/null || true       # kode terbaru dari repo menimpa salinan lama
python3 build_import.py > build_import.log
grep -E "^(QA:|Standar:)" build_import.log
python3 bangun_demo.py
python3 gen_log_admin.py
if [ "${2:-}" = "--dokumen" ]; then
  export ADMIN_NIK="$(python3 -c "import json;print(json.load(open('konfigurasi_lokal.json'))['ADMIN_NIK'])")"
  python3 gen_jd_doc.py
  cp "$AWAL/../../backend/TNA.gs" ./TNA.gs
  node gen_all.js ./TNA.gs | tail -1
  rm -rf dokumen_jabatan && mkdir dokumen_jabatan
  node render_all.js | tail -1
fi
echo "SELESAI. Hasil: TNA2027_Import.xlsx (import ke Sheet), Catatan_Perubahan_QA_Admin_v1.xlsx"
