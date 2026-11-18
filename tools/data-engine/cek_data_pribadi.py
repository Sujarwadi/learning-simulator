"""Pemeriksa kebocoran data pribadi: jalankan SEBELUM commit/push.
Memindai semua berkas yang dilacak git dan mencari (1) nama lengkap karyawan, (2) NIK karyawan, (3) pola NIK 10 digit.
Daftar nama dan NIK dibaca dari master karyawan di komputer lokal (tidak pernah dicetak penuh, hanya jumlah dan lokasi).
Pemakaian:  python3 tools/data-engine/cek_data_pribadi.py <path Master_Karyawan_TNA_2027_CLEAN.xlsx>
Keluar kode 1 bila ada temuan, sehingga bisa dipasang sebagai pre-commit hook."""
import sys, re, subprocess, openpyxl

if len(sys.argv) < 2:
    sys.exit("Isi path Master_Karyawan_TNA_2027_CLEAN.xlsx")
ws = openpyxl.load_workbook(sys.argv[1], read_only=True).worksheets[0]
rows = list(ws.iter_rows(values_only=True))
h = [str(x).upper() for x in rows[0]]
inama, inik = h.index("NAMA"), h.index("NIK")
# Hanya nama lengkap (minimal 2 kata): nama satu kata terlalu umum dan menimbulkan salah deteksi (mis. nama persona fiktif di Learning Simulator).
nama = {str(r[inama]).strip().upper() for r in rows[1:] if r[inama] and len(str(r[inama]).split()) >= 2 and len(str(r[inama]).strip()) > 5}
nik = {str(r[inik]).strip() for r in rows[1:] if r[inik] and len(str(r[inik]).strip()) >= 8}
# Nama pemilik repo dan tokoh fiktif persona Learning Simulator dikecualikan secara eksplisit
BOLEH = {"SUJARWADI"}
nama -= BOLEH
# Semua berkas yang akan ikut ter-commit: yang sudah dilacak DITAMBAH yang baru dan belum diabaikan .gitignore, dari akar repo.
akar = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
berkas = [akar + "/" + f for f in subprocess.run(["git", "-C", akar, "ls-files", "--cached", "--others", "--exclude-standard"], capture_output=True, text=True, check=True).stdout.split("\n") if f]
temuan = []
for f in berkas:
    if not f or not __import__("os").path.isfile(f) or f.lower().endswith((".png", ".jpg", ".jpeg", ".ico", ".zip", ".pdf", ".woff", ".woff2", ".xlsx", ".docx")):
        continue
    try: t = open(f, encoding="utf8", errors="ignore").read()
    except OSError: continue
    tu = t.upper()
    n = sorted(x for x in nama if x in tu)
    k = sorted(x for x in nik if x in t)
    p = len(re.findall(r"(?<!\d)(?:19|20)\d{8}(?!\d)", t))  # NIK BBM: 10 digit berawalan 19 atau 20
    if n or k or p:
        temuan.append((f, len(n), len(k), p))
for f, n, k, p in temuan:
    print("TEMUAN %s: nama=%d nik=%d pola_nik=%d" % (f.replace(akar + "/", ""), n, k, p))
print("BERSIH: tidak ada data pribadi di berkas yang dilacak git" if not temuan else "%d berkas bermasalah. Jangan commit." % len(temuan))
sys.exit(1 if temuan else 0)
