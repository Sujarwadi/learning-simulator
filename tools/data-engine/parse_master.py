"""Parse dua master kompetensi teknis (karya user) menjadi JSON ternormalisasi. Data tidak masuk repo."""
import openpyxl, json, re, glob
def S(v): return "" if v is None else str(v).strip()
def isi_maju(rows, kolom):
    last = {k: "" for k in kolom}
    for r in rows:
        for k in kolom:
            if r.get(k): last[k] = r[k]
            else: r[k] = last[k]
    return rows

# ---------- FINANCE ----------
wb = openpyxl.load_workbook(glob.glob("master/*Finance*")[0])
ws = wb["1. JD Task Breakdown & KSA"]
tasks = []
for row in ws.iter_rows(min_row=4, values_only=True):
    if not any(row[:8]): continue
    tasks.append(dict(jabatan=S(row[0]), tugasUtama=S(row[1]), proses=S(row[2]), sub=S(row[3]), subsub=S(row[4]), ksa=S(row[5]), komp=S(row[6]), level=S(row[7])))
# jabatan & tugas utama diisi maju (sel digabung), tetapi tugas utama direset saat jabatan berganti
last_j, last_t = "", ""
for t in tasks:
    if t["jabatan"]: last_j = t["jabatan"]; last_t = ""
    else: t["jabatan"] = last_j
    if t["tugasUtama"]: last_t = t["tugasUtama"]
    else: t["tugasUtama"] = last_t
ws = wb["2. Kamus Kompetensi"]
rows = []
for row in ws.iter_rows(min_row=4, values_only=True):
    if not any(row[:8]): continue
    rows.append(dict(no=S(row[0]), kat=S(row[1]), nama=S(row[2]), defk=S(row[3]), level=S(row[4]), label=S(row[5]), deflv=S(row[6]), kb=S(row[7])))
last = {}
for r in rows:
    if r["no"]: last = dict(no=r["no"], kat=r["kat"], nama=r["nama"], defk=r["defk"]); last_lv = {}
    for k in ("no","kat","nama","defk"): r[k] = last.get(k, "")
    if r["level"]: last_lv = dict(level=r["level"], label=r["label"], deflv=r["deflv"])
    for k in ("level","label","deflv"): r[k] = last_lv.get(k, "")
komp = {}
for r in rows:
    k = komp.setdefault(r["no"], dict(kode=r["no"], kategori=r["kat"], nama=r["nama"], definisi=r["defk"], levels={}))
    lv = k["levels"].setdefault(int(r["level"]), dict(level=int(r["level"]), label=r["label"], definisi=r["deflv"], indikator=[]))
    if r["kb"]: lv["indikator"].append(r["kb"])
ws = wb["4. Competency Matrix"]
hdr = [S(c.value) for c in ws[4]]; dept = [S(c.value) for c in ws[3]]
jab = [(i, hdr[i], dept[i]) for i in range(3, len(hdr)) if hdr[i]]
mat = {h: {} for _, h, _ in jab}
for row in ws.iter_rows(min_row=5, max_row=26, values_only=True):
    if not row[0]: continue
    for i, h, d in jab:
        v = S(row[i])
        if v.isdigit(): mat[h][S(row[0])] = int(v)
skala = []
ws = wb["3. Proficiency Level Scale"]
for row in ws.iter_rows(min_row=4, max_row=8, values_only=True):
    skala.append(dict(level=int(row[0]), label=S(row[1]), definisi=S(row[2]), panduan=S(row[3])))
fin = dict(divisi="Finance", judul="Finance Division", jabatanMatriks=[dict(kolom=h, dept=d) for _, h, d in jab], matriks=mat,
           kompetensi=[dict(k, levels=[k["levels"][n] for n in sorted(k["levels"])]) for k in komp.values()], tugas=tasks, skala=skala)
json.dump(fin, open("master/finance.json", "w"), ensure_ascii=False, indent=1)
print("FINANCE jabatan di tugas:", sorted({t["jabatan"] for t in tasks}))
print(" jabatan di matriks:", [h for _, h, _ in jab]); print(" kompetensi", len(fin["kompetensi"]), "baris tugas", len(tasks))
print(" tanpa kompetensi:", [t["proses"][:40] for t in tasks if not t["komp"]][:5])

# ---------- L&D ----------
wb = openpyxl.load_workbook(glob.glob("master/*LnD*")[0])
ws = wb["1. JD Task Breakdown & KSA"]
tugas, cur = [], ""
for row in ws.iter_rows(min_row=7, values_only=True):
    b = S(row[1])
    if not b: continue
    if b.startswith("TUGAS UTAMA"): cur = re.sub(r"^TUGAS UTAMA \d+,\s*", "", b); continue
    tugas.append(dict(jabatan="Learning & Development Section Head", tugasUtama=cur, proses=b, pengetahuan=S(row[2]), standar=S(row[3]), substandar=S(row[4]), ksa=S(row[5]), komp=S(row[6]), level=S(row[7])))
ws = wb["2. Kamus Kompetensi"]
komp = {}; kat = ""; k = None; lv = None
for row in ws.iter_rows(min_row=6, values_only=True):
    b, c, d, e, f, g = [S(x) for x in row[1:7]]
    if b and not c and not d and not e:  # judul kategori
        kat = b.title(); continue
    if b.startswith("TC-"):
        k = komp.setdefault(b, dict(kode=b, kategori=kat, nama=c, definisi=d, levels={}))
    if e:
        lv = k["levels"].setdefault(int(e), dict(level=int(e), label=f, definisi="", indikator=[]))
    if g and k and lv is not None: lv["indikator"].append(g)
ws = wb["4. Competency Matrix"]
matr = {}
for row in ws.iter_rows(min_row=8, values_only=True):
    if S(row[1]).startswith("TC-") and S(row[3]).isdigit(): matr[S(row[1])] = int(S(row[3]))
lnd = dict(divisi="HC & GA", judul="Learning & Development Section Head", matriks={"Learning & Development Section Head": matr},
           kompetensi=[dict(k, levels=[k["levels"][n] for n in sorted(k["levels"])]) for k in komp.values()], tugas=tugas)
json.dump(lnd, open("master/lnd.json", "w"), ensure_ascii=False, indent=1)
print("L&D kompetensi", len(lnd["kompetensi"]), "matriks", len(matr), "tugas", len(tugas), "kategori", sorted({k["kategori"] for k in lnd["kompetensi"]}))
