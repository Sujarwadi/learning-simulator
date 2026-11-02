"""Bangun workbook TNA2027_Import.xlsx + Competency_List_per_Jabatan.xlsx dari jd_extract + lib_kompetensi.
Data karyawan dibaca dari Master_Karyawan_TNA_2027_CLEAN.xlsx (scratchpad, tidak masuk repo)."""
import datetime, re
from collections import defaultdict, Counter
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

exec(open("jd_extract.py").read())
exec(open("jd_disusun_ld.py").read())  # 4 jabatan tanpa JD resmi: JD disusun L&D 31 Okt 2026
exec(open("lib_kompetensi.py").read())

KODE_T = kode_tek()
BLMAP = {b[1]: b for b in BL}
KODE_B = [b[0] for b in BL if b[2] == "Behavioral"]
NAMA = {v: k for k, v in KODE_T.items()}
NAMA.update({b[0]: b[1] for b in BL + SL})
exec(open("riwayat.py").read())
CLEVEL = {"J093", "J049", "J036"}  # CEO, COO, CFO: dikecualikan dari TNA (keputusan user 24 Okt), tetap jadi penilai
# Jalur Sales Operation -> indeks tahap di JALUR (lib_kompetensi). Leadership jalur ini memakai SL-xx, bukan LD-01/LD-02 generik.
SALES_PATH = {"J073J": 1, "J074J": 1, "J073S": 2, "J074S": 2, "J070": 3, "J063": 4, "J056": 5, "J057": 5}

def norm(nama):
    return NORM.get(nama, [nama])

for v in X.values():
    for t in v.get("tek", []) + v.get("tek_tambah", []):
        for n in norm(t):
            assert n in TEK, "Kompetensi belum ada di library: " + n

# ---------------- Required level per tier ----------------
# (B, PDMC/LM, DMPS, Vision, Tcore, Ttambah)
TIER = {
    "Staff": (2, 3, None, None, 3, 2),
    "Officer": (3, 3, None, None, 3, 3),
    "Supervisor": (3, 3, 3, None, 3, 3),
    "Manager": (4, 4, 4, 3, 4, 3),
    "Division Head": (4, 4, 4, 4, 4, 4),
    "Director": (4, 5, 5, 5, 4, 4),
}
VARIAN = {"J": ("Junior", (2, None, None, None, 2, 2)), "S": ("Senior", (3, None, None, None, 3, 3))}

# Behavioral: Tabel 5 Matriks Standar Kompetensi Behavioral, Kamus Kompetensi Bosowa 2022 (keputusan user 27 Okt).
JENJANG = ["Direksi", "Div Head", "Dept Head", "Branch Head", "Section Head", "SPV", "Officers/Specialist", "Staff HO", "Staff Cab"]
STD_CB = {  # urutan kolom = JENJANG
 "CB09": [5, 4, 3, 3, 2, 2, 2, 1, 1], "CB01": [5, 4, 4, 3, 3, 3, 2, 1, 1], "CB03": [5, 5, 4, 4, 3, 3, 2, 1, 1],
 "CB08": [5, 5, 4, 3, 3, 2, 2, 2, 1], "CB10": [5, 4, 3, 3, 3, 2, 2, 1, 1], "CB02": [5, 4, 3, 3, 2, 2, 2, 1, 1],
 "CB05": [5, 4, 3, 3, 2, 2, 1, 1, 1], "CB04": [5, 5, 4, 3, 2, 2, 1, 1, 1], "CB07": [5, 4, 3, 3, 2, 2, 2, 1, 1],
 "CB06": [5, 4, 3, 3, 2, 2, 2, 1, 1]}
def jenjang(kjd, title, lokasi, tier):
    """Jenjang Matriks Standar dari nama jabatan; bila nama tidak memuat kata kunci, pakai tier JD."""
    T = title.upper()
    if T.startswith("CHIEF") or tier == "Director": return "Direksi"
    if "DIVISION HEAD" in T or "DIV. HEAD" in T or ("NATIONAL OPERATION" in T and "HEAD" in T): return "Div Head"
    if "DEPARTMENT HEAD" in T or "DEPT. HEAD" in T: return "Dept Head"
    if kjd == "J063": return "Branch Head"
    if "SECTION HEAD" in T or (lokasi == "CABANG" and T.endswith("HEAD")): return "Section Head"
    if "SUPERVISOR" in T or "LEADER" in T or "COORDINATOR" in T: return "SPV"
    if "STAFF" in T: return "Staff HO" if lokasi == "HO" else "Staff Cab"
    if any(x in T for x in ("OFFICER", "SPECIALIST", "ANALYST", "PLANNER", "INSTRUCTOR", "SERVICE ADVISOR")) or tier == "Officer": return "Officers/Specialist"
    return "Staff HO" if lokasi == "HO" else "Staff Cab"

# ---------------- Kata kunci pemetaan task -> kompetensi ----------------
HINT = {
    "Handling Complaint": ["keluhan", "komplain", "complain"], "Product Knowledge": ["produk", "product", "spesifikasi", "new product"],
    "Selling Skill": ["prospek", "closing", "spk", "menjual", "penjualan unit", "penawaran"], "BAMS Operation": ["bams"],
    "Service Excellence": ["pelanggan", "customer", "layanan", "pelayanan"], "Communication Skill": ["koordinasi", "berkoordinasi", "komunikasi", "menginformasikan", "mensosialisasikan"],
    "Microsoft Office": ["rekap", "rekapitulasi", "laporan"], "Inventory Management": ["stok", "stock", "persediaan", "opname"],
    "Budget & Cost Control": ["anggaran", "budget", "biaya", "rab"], "Coaching & Counseling": ["bawahan", "coaching", "membina", "pembinaan", "mentoring"],
    "Strategic Planning Management": ["rencana kerja", "strategi", "program kerja", "kpi"], "Negotiation Skill": ["negosiasi"],
    "Workshop Management": ["bengkel", "workshop", "produktivitas", "unit entry"], "Gasoline & Diesel Engine": ["mesin", "engine", "servis berkala"],
    "Electrical System": ["kelistrikan", "electrical"], "Part Catalogue": ["nomor part", "katalog", "part number"],
    "Spare Part Management": ["spare part", "suku cadang", "part "], "Market & Data Analysis": ["analisa data", "mengolah data", "data penjualan", "menganalisa"],
    "Financial Accounting": ["jurnal", "akuntansi", "laporan keuangan", "psak"], "Taxation Regulation": ["pajak", "pph", "spt", "ppn"],
    "E-Faktur & DJP Online": ["faktur pajak", "e-faktur", "djp"], "D'Net Operation": ["d'net", "dnet", "d-net"],
    "Receivable Control": ["piutang", "tagih", "penagihan"], "Cash Management": ["kas ", "kas,", "dana", "opname kas"],
    "Human Capital Management": ["karyawan", "sdm", "manpower"], "Training Management": ["pelatihan", "training", "learning process"],
    "Training Design & Delivery": ["materi", "menyampaikan materi", "memberikan materi"], "Training Need Analysis": ["tna", "kebutuhan pelatihan", "analisa kebutuhan"],
    "Vendor Management": ["vendor", "mitra", "kontraktor"], "Health, Safety & Environment (K3)": ["k3", "keselamatan", "limbah", "kecelakaan"],
    "Asset Management": ["aset", "barcode"], "Marketing Management": ["promosi", "pemasaran", "marketing"], "Event Management": ["event", "pameran", "ceremonial"],
    "Digital Marketing": ["sosial media", "media sosial", "konten", "digital", "iklan"], "Graphic Design": ["desain grafis", "desain"],
    "Office Administration": ["administrasi", "surat", "dokumen", "agenda"], "Records & Archive Management": ["arsip", "mengarsipkan"],
    "Vehicle Registration Administration": ["stnk", "bpkb", "samsat", "faktur kendaraan"], "Insurance Claim Administration": ["asuransi", "klaim asuransi"],
    "Demand Planning": ["kebutuhan part", "forecast", "perkiraan", "demand"], "Supply Chain Management": ["pemesanan", "purchase order", "order", "pengadaan"],
    "Warehouse Management": ["gudang", "warehouse"], "Logistic Management": ["pengiriman", "distribusi", "ekspedisi"],
    "Human Resources Information System": ["hris"], "Compensation & Benefit": ["gaji", "penggajian", "payroll", "insentif", "tunjangan"],
    "Employee Welfare Management": ["bpjs", "klaim", "cuti", "medical"], "Industrial Relation Management": ["surat keputusan", "phk", "hubungan industrial", "surat peringatan"],
    "Contract Drafting": ["kontrak", "perjanjian", "addendum"], "Performance Management": ["penilaian kinerja", "performance", "evaluasi kinerja", "kpi"],
    "Organization Development Design": ["struktur organisasi", "job analysis", "beban kerja", "organisasi"], "Sales Management & Strategy": ["target penjualan", "strategi penjualan", "price list"],
    "Construction & Project Management": ["pembangunan", "renovasi", "konstruksi"], "Building Design (AutoCAD 2D/3D)": ["gambar 2d", "2d", "3d", "ded"],
    "Dealer Standard APM": ["standarisasi apm", "standar apm"], "Security & Facility Management": ["keamanan", "kebersihan", "security"],
    "Permit & Licensing Administration": ["perizinan", "izin"], "Body Painting": ["cat", "pengecatan"], "Body Repair": ["bodi", "body"],
    "Banking Operation": ["bank", "transfer"], "Treasury & Funding Management": ["pendanaan", "deposito", "pinjaman bank"],
    "Troubleshooting": ["diagnosa", "troubleshoot", "kerusakan"], "Workshop Tools": ["tools", "peralatan", "special tool"],
    "Risk Management": ["risiko"], "Change Management": ["perubahan", "transformasi", "budaya"], "Legal Analysis & Problem Solving": ["hukum", "persidangan", "pidana", "perdata"],
    "Account Reconciliation": ["rekonsiliasi", "cleansing", "rk "], "Financial Management": ["keuangan"], "Business Development Management": ["pengembangan bisnis", "ekspansi"],
}

HINT.update({
    "Product Knowledge": ["produk", "product", "spesifikasi", "unit kendaraan", "test drive", "pameran", "fitur"],
    "Communication Skill": ["koordinasi", "komunikasi", "menginformasikan", "mensosialisasikan", "melaporkan", "menyampaikan", "konfirmasi", "presentasi"],
    "Negotiation Skill": ["negosiasi", "harga", "kesepakatan", "penawaran", "vendor", "kontrak"],
    "Part Catalogue": ["nomor part", "katalog", "part", "suku cadang"],
    "Chassis": ["chassis", "rem", "suspensi", "kemudi", "perbaikan kendaraan", "servis"],
    "Electrical System": ["kelistrikan", "electrical", "listrik", "perbaikan kendaraan", "servis"],
    "Transmission": ["transmisi", "kopling", "perbaikan kendaraan", "servis"],
    "Gasoline & Diesel Engine": ["mesin", "engine", "servis", "perbaikan kendaraan"],
    "Workshop Management": ["bengkel", "workshop", "produktivitas", "unit entry", "mekanik", "work order", "servis"],
    "Cash Management": ["kas ", "kas harian", "uang muka", "dana", "pembayaran"],
    "Handling Complaint": ["keluhan", "komplain", "complain", "masalah pelanggan", "kepuasan"],
    "Presentation Skill": ["presentasi", "menyampaikan materi", "memberikan materi", "induksi", "sosialisasi"],
    "General Affair Management": ["sarana", "prasarana", "fasilitas", "pengadaan", "kantin", "pemeliharaan"],
    "Financial Management": ["keuangan", "dana", "anggaran"],
    "Office Administration": ["administrasi", "surat", "dokumen", "agenda", "sop administrasi"],
    "Supply Chain Management": ["pemesanan", "purchase order", "order", "pengadaan", "supplier"],
    "BAMS Operation": ["bams", "input", "menginput", "sistem"],
    "Marketing Management": ["promosi", "pemasaran", "marketing", "strategi"],
    "LD-01": ["bawahan", "tim ", "arahan", "mengontrol", "memantau", "mengawasi", "pembagian tugas"],
    "LD-02": ["mengembangkan", "motivasi", "kinerja tim", "kinerja bawahan", "membina"],
    "LD-03": ["keputusan", "menyetujui", "persetujuan", "solusi", "memvalidasi"],
    "LD-04": ["strategi", "jangka panjang", "rencana bisnis", "visi"],
})

def task_comps(teks, kandidat):
    t = " " + teks.lower() + " "
    skor = []
    for kode in kandidat:
        nama = NAMA[kode]
        kws = HINT.get(kode, []) if not kode.startswith("TK-") else HINT.get(nama, [])
        s = sum(2 for k in kws if k in t)
        if kode.startswith("TK-"): s += sum(1 for w in kata_kunci(nama) if len(w) >= 6 and w[:6] in t)
        if s: skor.append((s, kode))
    skor.sort(reverse=True)
    tk = [k for _, k in skor if k.startswith("TK-")][:3]
    return tk or [k for _, k in skor][:1]

# ---------------- Data karyawan ----------------
WIL = {}
for c in ["KANTOR PUSAT", "URIP", "KIMA", "PETTARANI", "TANJUNG BUNGA", "MAROS", "BONE", "BULUKUMBA", "PARE-PARE", "PALOPO", "SOPPENG", "FLEET & GSO"]: WIL[c] = "SULSEL"
WIL.update({"MAMUJU": "SULBAR", "KENDARI": "SULTRA", "KOLAKA": "SULTRA", "BAU-BAU": "SULTRA",
            "PALU": "SULTENG", "PARIGI": "SULTENG", "LUWUK BANGGAI": "SULTENG", "MOROWALI": "SULTENG",
            "MANADO KAIRAGI": "SULUT", "MANADO RINGROAD": "SULUT", "KOTAMOBAGU": "SULUT",
            "AMBON": "MALUKU", "TERNATE": "MALUT", "JAYAPURA": "PAPUA", "MERAUKE": "PAPUA",
            "SORONG": "PAPUA BARAT", "MANOKWARI": "PAPUA BARAT", "KUPANG": "NTT", "JAKARTA": "JAKARTA", "SURABAYA": "JATIM"})

wb = openpyxl.load_workbook("Master_Karyawan_TNA_2027_CLEAN.xlsx", read_only=True)
rows = list(wb["Users_Clean"].iter_rows(values_only=True)); H = rows[0]
emp = [dict(zip(H, r)) for r in rows[1:]]
mj_rows = list(wb["Master_Jabatan"].iter_rows(values_only=True)); MH = mj_rows[0]
mj = {r[0]: dict(zip(MH, r)) for r in mj_rows[1:]}

def kode_karyawan(e):
    k = e["KODE_JABATAN"]
    if e["MODE_ASESMEN"] == "KELOMPOK":
        jb = str(e["JABATAN_BERSIH"])
        if "JUNIOR" in jb: return k + "J"
        if "SENIOR" in jb: return k + "S"
        raise ValueError("Varian sales tidak dikenali: " + jb)
    return k

def s(v):
    if v is None: return ""
    if isinstance(v, datetime.datetime): return v.strftime("%Y-%m-%d")
    return str(v).strip()

karyawan = []
for e in emp:
    cab = s(e["CABANG"])
    assert cab in WIL, "Cabang tanpa wilayah: " + cab
    karyawan.append({
        "NIK": s(e["NIK"]), "Nama": s(e["NAMA"]), "Cabang": cab, "Wilayah": WIL[cab], "Lokasi": s(e["LOKASI"]), "Dept": s(e["DEPT"]),
        "KodeJabatan": kode_karyawan(e), "JobTitle": s(e["JOB TITLE"]), "Jabatan": s(e["JABATAN_BERSIH"]), "Varian": s(e["VARIAN_LEVEL"]),
        "PJS": s(e["PJS"]), "TglMasuk": s(e["TGL_MASUK"]), "PenilaiNIK": s(e["PENILAI_NIK"]), "Penilai2NIK": s(e["PENILAI2_NIK"]),
        "ModeAsesmen": "DIKECUALIKAN" if e["KODE_JABATAN"] in CLEVEL else s(e["MODE_ASESMEN"]), "KelompokID": s(e["KELOMPOK_ID"]), "DelegasiBoleh": "TRUE" if s(e["DELEGASI_BOLEH"]).upper() in ("Y", "YA", "TRUE", "1") else "",
        "Aktif": "TRUE"})
jml = Counter(k["KodeJabatan"] for k in karyawan)

# ---------------- Validator (Head unit) ----------------
# Cabang: Kepala Cabang (J063). HO: tier Manager ke atas (Dept Head, Div Head, Direktur).
# Naik dari penilai ke Head pertama; bila penilai sendiri Head, validasi naik ke atasan penilai. Kosong = Admin L&D.
KM = {k["NIK"]: k for k in karyawan}
def is_head(nik):
    k = KM.get(nik)
    if not k: return False
    if k["Lokasi"] == "CABANG": return k["KodeJabatan"] == "J063"
    return X[k["KodeJabatan"][:4]]["tier"] in ("Manager", "Division Head", "Director")
def validator(k):
    pen = k["PenilaiNIK"]
    if not pen: return ""
    x, n = pen, 0
    while x and not is_head(x) and n < 10: x = KM[x]["PenilaiNIK"] if x in KM else ""; n += 1
    if not x: return ""
    if x == pen: return KM[pen]["PenilaiNIK"] if pen in KM else ""
    return x
for k in karyawan: k["ValidatorNIK"] = validator(k)
# Keputusan user 25 Okt: ASS Head & Spare Part Head cabang divalidasi ASS Div Head (J024), bukan NOH.
ASS_DIV = [k["NIK"] for k in karyawan if k["KodeJabatan"] == "J024"]
assert len(ASS_DIV) == 1
for k in karyawan:
    if k["KodeJabatan"] in ("J075", "J089"): k["ValidatorNIK"] = ASS_DIV[0]
# Keputusan user 26 Okt: Body & Paint Head cabang divalidasi Body & Paint Dept Head HO (J027), bukan Kacab.
BP_DEPT = [k["NIK"] for k in karyawan if k["KodeJabatan"] == "J027"]
assert len(BP_DEPT) == 1
for k in karyawan:
    if k["KodeJabatan"] == "J077": k["ValidatorNIK"] = BP_DEPT[0]
# Keputusan user 25 Okt: dua NOH setara, keduanya menilai semua Kacab -> validasi yang naik ke NOH dimiliki berdua.
# NIK keduanya dibaca dari konfigurasi_lokal.json (data karyawan tidak boleh ada di repo).
import json as _jk
KONFIG = _jk.load(open("konfigurasi_lokal.json"))
NOH = KONFIG["NOH_NIK"]
assert all(n in KM for n in NOH)
for k in karyawan:
    if k["ValidatorNIK"] in NOH: k["ValidatorNIK"] = ",".join(NOH)
VAL_STAT = Counter((" / ".join(KM[x]["Nama"] if KM[x]["KodeJabatan"] in ("J056", "J057") else KM[x]["JobTitle"] for x in k["ValidatorNIK"].split(",")) if k["ValidatorNIK"] else "(ADMIN L&D)") for k in karyawan if k["ModeAsesmen"] != "DIKECUALIKAN")

# ---------------- Jabatan aktif (kode + varian) ----------------
jabatan = []  # (kode, kodeJD, varian|None)
for kode in sorted(mj):
    if kode in ("J073", "J074"):
        for suf in "JS": jabatan.append((kode + suf, kode, suf))
    else:
        jabatan.append((kode, kode, None))

# ---------------- Matriks ----------------
matriks, flag_jab, JENJANG_JAB = [], {}, {}
for kode, kjd, suf in jabatan:
    if kjd in CLEVEL: continue
    v = X[kjd]
    B, L, DM, VI, TC, TT = VARIAN[suf][1] if suf else TIER[v["tier"]]
    tier = v["tier"]
    punya_bawahan = bool(str(v.get("bawahan", "")).strip()) and not suf
    catat = v.get("catatan", "") or ""
    fj = []
    if v.get("tanpa_jd"): fj.append("DRAFT_AI_TANPA_JD")
    elif "PERLU KONFIRMASI" in catat: fj.append("JD_ACUAN_TERDEKAT")
    flag_jab[kode] = fj
    def tambah(kk, req, bobot, sumber, flags=()):
        matriks.append({"KodeJabatan": kode, "KodeKompetensi": kk, "RequiredLevel": req, "Bobot": bobot, "Sumber": sumber, "Flag": "; ".join(list(fj) + list(flags))})
    jj = jenjang(kjd, mj[kjd]["JOB TITLE"], mj[kjd]["LOKASI"], tier)
    JENJANG_JAB[kode] = jj
    for kb in KODE_B: tambah(kb, STD_CB[kb][JENJANG.index(jj)], 2, "KAMUS_BBM_2022")
    if kode in SALES_PATH:
        tahap = SALES_PATH[kode]
        for kk in [x[0] for x in SL if x[0] in SL_REQ] + ["LD-03", "LD-04"]:
            req = SL_REQ[kk][tahap]
            if req: tambah(kk, req, 3, "SALES_LEADERSHIP_FRAMEWORK")
        punya_bawahan, DM, VI = False, None, None
    if punya_bawahan:
        tambah("LD-01", L, 3, "STANDAR_KORPORAT"); tambah("LD-02", L, 3, "STANDAR_KORPORAT")
    if DM and not suf: tambah("LD-03", DM, 3, "STANDAR_KORPORAT")
    if VI and not suf: tambah("LD-04", VI, 3, "STANDAR_KORPORAT")
    seen = set()
    for src, lst in (("JD", v.get("tek", [])), ("JD_PERSYARATAN", v.get("tek_tambah", []))):
        for t in lst:
            for n in norm(t):
                kk = KODE_T[n]
                if kk in seen: continue
                seen.add(kk)
                if n == "Microsoft Office": tambah(kk, min(3, TT), 1, src)
                else: tambah(kk, LEVEL_OVERRIDE.get((kjd, n), TC if src == "JD" else TT), 3 if src == "JD" else 2, src)

# ---------------- Bersihkan tumpang tindih & lengkapi Leadership (keputusan user 26 Okt) ----------------
# 1) Behavioral = 10 kompetensi resmi untuk semua jabatan; Leadership hanya untuk atasan (keputusan user 27 Okt, LD-05 dihapus).
# 2) Kompetensi technical yang perilakunya sudah dinilai di Leadership/SL dihapus supaya tidak dinilai dua kali.
KJD = dict((j[0], j[1]) for j in jabatan)
per_kj = defaultdict(set)
for m in matriks: per_kj[m["KodeJabatan"]].add(m["KodeKompetensi"])
HAPUS = []
for kode, kks in per_kj.items():
    if kks & {"LD-02", "SL-02"}: HAPUS.append((kode, KODE_T["Coaching & Counseling"]))
    if kks & {"SL-03", "SL-09"}: HAPUS += [(kode, KODE_T["Sales Management & Strategy"]), (kode, KODE_T["Strategic Planning Management"])]
    if kode in ("J073J", "J073S", "J074J", "J074S"): HAPUS.append((kode, KODE_T["Marketing Management"]))
HAPUS = set(HAPUS)
LAP_TUMPANG = Counter(NAMA[k] for (j, k) in HAPUS if k in per_kj[j])
matriks = [m for m in matriks if (m["KodeJabatan"], m["KodeKompetensi"]) not in HAPUS]

# ---------------- Task ----------------
task_rows = []
for kode, kjd, suf in jabatan:
    v = X[kjd]
    kand = [m["KodeKompetensi"] for m in matriks if m["KodeJabatan"] == kode and not m["KodeKompetensi"].startswith("CB")]
    for i, (tu, proses) in enumerate(v.get("tugas", []), 1):
        for p in (proses or [tu]):
            cs = task_comps(tu + " " + p, kand)
            if not cs: task_rows.append({"KodeJabatan": kode, "NoTugas": i, "TugasUtama": tu, "Task": p, "KodeKompetensi": ""})
            for c in cs: task_rows.append({"KodeJabatan": kode, "NoTugas": i, "TugasUtama": tu, "Task": p, "KodeKompetensi": c})
for t in task_rows:  # JD disusun L&D: standar kinerja dan bukti spesifik per aktivitas
    if t["KodeJabatan"] in JD_LD and t["Task"] in STANDAR_LD: t["StandarKinerja"], t["BuktiPenilaian"] = STANDAR_LD[t["Task"]]
didukung = set((t["KodeJabatan"], t["KodeKompetensi"]) for t in task_rows)
for m in matriks:
    if m["KodeKompetensi"].startswith("TK-") and X[dict((j[0], j[1]) for j in jabatan)[m["KodeJabatan"]]].get("tugas") \
            and (m["KodeJabatan"], m["KodeKompetensi"]) not in didukung:
        m["Flag"] = "; ".join([f for f in [m["Flag"], "TIDAK DIDUKUNG TASK"] if f])

# ---------------- Kamus & Checklist ----------------
kamus, cek = [], []
for b in BL + SL:
    kode, nama, kat, d, lv, ck = b
    kamus.append(dict(KodeKompetensi=kode, Nama=nama, Kategori=kat, Definisi=d, L1=lv[0], L2=lv[1], L3=lv[2], L4=lv[3], L5=lv[4], Status="FINAL" if kode.startswith("CB") else "DRAFT_AI"))
    cek.append(dict(KodeKompetensi=kode, C2=ck[0], C3=ck[1], C4=ck[2], C5=ck[3]))
for nama in sorted(TEK):
    d, lv, ck = level_tek(nama)
    kamus.append(dict(KodeKompetensi=KODE_T[nama], Nama=nama, Kategori="Technical", Definisi=d, L1=lv[0], L2=lv[1], L3=lv[2], L4=lv[3], L5=lv[4], Status="DRAFT_AI"))
    cek.append(dict(KodeKompetensi=KODE_T[nama], C2=ck[0], C3=ck[1], C4=ck[2], C5=ck[3]))
dipakai = set(m["KodeKompetensi"] for m in matriks)
kamus = [k for k in kamus if k["KodeKompetensi"] in dipakai]
cek = [c for c in cek if c["KodeKompetensi"] in dipakai]

# ---------------- Intervensi (70 & 20) ----------------
I70B = {
 "LD-01": "Memimpin rapat review target mingguan tim dan menindaklanjuti penyimpangan.",
 "LD-02": "Menyusun rencana pengembangan satu anggota tim dan menjalankannya selama 3 bulan.",
 "LD-03": "Mengambil alih keputusan operasional tertentu (didelegasikan atasan) dan mencatat dasar keputusannya.",
 "LD-04": "Menyusun analisa tren bisnis/kompetitor kuartalan dan implikasinya bagi unit.",
 "SL-02": "Menjadi buddy/coach bagi 1-2 sales baru selama 3 bulan dengan catatan joint visit.",
 "SL-03": "Memimpin morning briefing dan weekly review target tim selama 3 bulan, dipantau Kacab.",
 "SL-04": "Melakukan funnel review mingguan (hot/warm/cold) dan menindaklanjuti prospek yang macet.",
 "SL-05": "Menyusun analisa P&L cabang bulanan beserta usulan tindakan, dipresentasikan ke atasan.",
 "SL-06": "Menyusun peta pasar lokal (segmen, fleet, kompetitor) dan menjalankan satu program penetrasi.",
 "SL-07": "Memimpin forum 3S bulanan (sales-service-part-admin) dengan target dan tindak lanjut bersama.",
 "SL-08": "Ikut menyeleksi dan meng-onboard sales baru, serta menyusun rencana penerus untuk posisinya.",
 "SL-09": "Menyusun rencana bisnis cabang/wilayah 12 bulan berbasis analisa pasar dan kapasitas.",
 "SL-10": "Menjadi PIC kepatuhan dokumen & kredit cabang selama 3 bulan, termasuk tindak lanjut temuan audit.",
 "SL-11": "Menggerakkan adopsi BAMS/SFID tim hingga target pemakaian tercapai, dilaporkan bulanan.",
}
import json as _json
_PT = _json.load(open("beh/post_training.json"))
for _k, _v in _PT.items():  # penugasan 70: Post-Training Activities BBLC Training Matrix 2026 (Level 1 & 2)
    I70B[_k] = "Level 1: " + " ".join(_v.get("1", [])) + " Level 2: " + " ".join(_v.get("2", []))
interv = []
for k in kamus:
    kk, nama = k["KodeKompetensi"], k["Nama"]
    if kk in I70B: interv.append({"KodeKompetensi": kk, "Tipe": "70", "Deskripsi": I70B[kk]})
    else: interv.append({"KodeKompetensi": kk, "Tipe": "70", "Deskripsi": "Penugasan terstruktur 3 bulan: " + TEK[nama][2] + ", didampingi atasan."})
    interv.append({"KodeKompetensi": kk, "Tipe": "20", "Deskripsi": "Sharing session/diskusi kasus " + nama + " bersama rekan yang sudah level 4+."})

# ---------------- Katalog ----------------
DRV = "https://drive.google.com/drive/folders/"
KT = lambda n: KODE_T[n]
katalog = [
 ("W-AFA", "Anti Fraud Awareness", "Wajib", "", "", "ONLINE", 2, "Kebijakan korporat", "", "AKTIF"),
 ("W-AIDW", "AI for Daily Work", "Wajib", "", "", "ONLINE", 3, "Kebijakan korporat", "", "AKTIF"),
 ("W-STEP1", "Mitsubishi Step 1 (Mekanik)", "Wajib", ",".join([KT("Gasoline & Diesel Engine"), KT("Electrical System")]), 3, "KLASIKAL", "", "COMPETENCY - MECHANIC / Materi M1", DRV + "1O8W6mFSvDvxODYv46cSt1ieUAzuEhPp6", "AKTIF"),
 ("W-STEP2", "Mitsubishi Step 2 (Engine, Electrical, Chassis)", "Wajib", ",".join([KT("Gasoline & Diesel Engine"), KT("Electrical System"), KT("Chassis")]), 4, "KLASIKAL", "", "COMPETENCY - MECHANIC / Materi MStep 2", DRV + "1hD2b-2eun_gY0cpG3pxFDaWYyb1YvZ0D", "AKTIF"),
 ("W-STEP3", "Mitsubishi Step 3", "Wajib", ",".join([KT("Troubleshooting"), KT("Transmission")]), 5, "KLASIKAL", "", "APM", "", "AKTIF"),
 ("W-FSTEP1", "Fuso Step 1", "Wajib", ",".join([KT("Gasoline & Diesel Engine"), KT("Chassis")]), 3, "KLASIKAL", "", "COMPETENCY - MECHANIC / Materi Fstep 1", DRV + "153-7iye0c3bv9rDSh0e2-BDpL9IlAcwO", "AKTIF"),
 ("W-MSA1", "Mitsubishi Service Advisor (MSA) 1", "Wajib", ",".join([KT("Service Excellence"), KT("Handling Complaint")]), 3, "KLASIKAL", "", "APM (MMKSI)", "", "AKTIF"),
 ("W-FSA1", "Fuso Service Advisor (FSA) 1", "Wajib", ",".join([KT("Service Excellence"), KT("Handling Complaint")]), 3, "KLASIKAL", "", "APM (KTB)", "", "AKTIF"),
 ("W-EST1", "Estimator 1 (Body & Paint)", "Wajib", ",".join([KT("Body Repair"), KT("Insurance Claim Administration")]), 3, "KLASIKAL", "", "APM", "", "AKTIF"),
 ("W-EST2", "Estimator 2 (Body & Paint)", "Wajib", ",".join([KT("Body Repair"), KT("Insurance Claim Administration")]), 4, "KLASIKAL", "", "APM", "", "AKTIF"),
 ("W-EST3", "Estimator 3 (Body & Paint)", "Wajib", ",".join([KT("Body Repair"), KT("Insurance Claim Administration")]), 5, "KLASIKAL", "", "APM", "", "AKTIF"),
 ("W-HK", "House Keeping (5R Bengkel)", "Wajib", KT("Workshop Tools"), 3, "KLASIKAL", "", "APM", "", "AKTIF"),
 ("W-BREVET", "Brevet Pajak A & B", "Wajib", KT("Taxation Regulation"), 4, "KLASIKAL", "", "Lembaga eksternal", "", "AKTIF"),
 ("W-INSTR", "Instructor Course (KTB/MMKSI)", "Wajib", KT("Training Design & Delivery"), 4, "KLASIKAL", "", "APM", "", "AKTIF"),
 ("W-TFT", "Training for Trainer", "Wajib", ",".join([KT("Training Design & Delivery"), KT("Presentation Skill")]), 4, "KLASIKAL", "", "Internal/eksternal", "", "AKTIF"),
 ("W-GADA", "Pelatihan Dasar Gada Pratama", "Wajib", KT("Security & Facility Management"), 3, "KLASIKAL", "", "Kepolisian/BUJP", "", "AKTIF"),
 ("W-SERTGA", "Sertifikasi General Affair", "Wajib", KT("General Affair Management"), 4, "KLASIKAL", "", "Lembaga sertifikasi", "", "AKTIF"),
 # Modul internal yang sudah ada di Drive (Kurikulum & Modul)
 ("D-BST", "Basic Salesmanship Training (BST)", "Dianjurkan", KT("Selling Skill"), 3, "ONLINE", 12, "COMPETENCY-OPERATION SALES/SALES/BST", DRV + "1Z9vQQlGBOe-YEqgyf0ZZXXrKHqYCVW-x", "AKTIF"),
 ("D-IST", "Intermediate Salesmanship Training (IST)", "Dianjurkan", KT("Selling Skill") + "," + KT("Negotiation Skill"), 4, "KLASIKAL", 12, "COMPETENCY-OPERATION SALES/SALES/IST", DRV + "1Aa07YL56i8sPRxvd1Fm-5W6YA2PI81a_", "AKTIF"),
 ("D-AST", "Advance Salesmanship Training (AST)", "Dianjurkan", KT("Selling Skill") + "," + KT("Negotiation Skill"), 5, "KLASIKAL", 12, "COMPETENCY-OPERATION SALES/SALES/AST", DRV + "1Ls4RQr-IhtM-M4Sym8rnVPa9xyxg3CVP", "AKTIF"),
 ("D-SPV", "Sales Supervisor Development Program (SSDP)", "Dianjurkan", KT("Sales Management & Strategy") + ",SL-03", 4, "KLASIKAL", 24, "COMPETENCY-OPERATION SALES/SALES/SPV", DRV + "1rEAXwFg0Lhi363ZvLGJBp8xq08X8yxNv", "AKTIF"),
 ("D-PKMMKSI", "Product Knowledge MMKSI", "Dianjurkan", KT("Product Knowledge"), 3, "ONLINE", "", "COMPETENCY-OPERATION SALES/PRODUCT KNOWLEDGE MMKSI", DRV + "1l335hcrNVJHBz-guBPJHWnHcrKBYkRq-", "AKTIF"),
 ("D-PKKTB", "Product Knowledge KTB (Fuso)", "Dianjurkan", KT("Product Knowledge"), 3, "ONLINE", "", "COMPETENCY-OPERATION SALES/PRODUCT KNOWLEDGE KTB", DRV + "1DhEAcWFw2e5gTWWfZwX73JeYLoFRxyd6", "AKTIF"),
 ("D-STS", "Sales Talk Series (produk baru)", "Dianjurkan", KT("Product Knowledge"), 4, "ONLINE", "", "COMPETENCY-OPERATION SALES/SALES TALK SERIES", DRV + "1ZrjBlpdrJyRyB9_C6e5zWnld6kcFI1BY", "AKTIF"),
 ("D-SACS", "SA & CS Master Class", "Dianjurkan", KT("Service Excellence") + "," + KT("Handling Complaint"), 4, "KLASIKAL", "", "COMPETENCY-OPERATION SALES/AFTER SALES SERVICE/SA & CS MASTER CLASS", DRV + "1l2KOnQewSZT2WHqjvXd6KwHJWkomtfbO", "AKTIF"),
 ("D-CSPS", "CS Problem Solver", "Dianjurkan", KT("Handling Complaint") + "," + KT("PDCA Problem Solving"), 5, "KLASIKAL", "", "COMPETENCY-OPERATION SALES/AFTER SALES SERVICE/CS PROBLEM SOLVER", DRV + "1iLSZ42mjUkBnrWlIUrMKjNjzMnqafeKF", "AKTIF"),
 ("D-BPBBM", "Business Process Bosowa Berlian Motor", "Dianjurkan", KT("Business Management & Process"), 3, "ONLINE", "", "[2026] INDUKSI KARYAWAN BBM", DRV + "1J3Hm90wXVB53XLS7gVq8cPQNyxGfECK9", "AKTIF"),
]
KATALOG_CB, MANDATORY_CB, RIWAYAT, LAP_RIWAYAT = riwayat_dan_cb(karyawan, set(k["NIK"] for k in karyawan if k["ModeAsesmen"] == "DIKECUALIKAN"))
katalog += KATALOG_CB
# Modul behavioral level yang belum diselenggarakan 2026: desainnya sudah ada di Training Matrix Behavioral 2026 (sheet MATRIX)
def _modul_cb_matrix():
    wbm = openpyxl.load_workbook("beh/matrix2026.xlsx", read_only=True)
    nama_ke_kode = {v["nama"].lower(): k for k, v in _json.load(open("beh/kamus_beh.json")).items()}
    out, komp = [], None
    for r in wbm["MATRIX"].iter_rows(values_only=True):
        r = list(r) + [None] * 12
        if r[2] and str(r[2]).strip().lower() in nama_ke_kode: komp = nama_ke_kode[str(r[2]).strip().lower()]
        lv = str(r[3] or "").strip()
        if not (komp and lv in ("1", "2", "3", "4", "5") and r[5]): continue
        angka = [float(x.replace(",", ".")) for x in re.findall(r"\d+(?:[.,]\d+)?", str(r[9] or "").split("jam")[0])]
        jam = round(sum(angka) / len(angka), 1) if angka else 2
        online = "micro" in str(r[10] or "").lower() or "online" in str(r[10] or "").lower()
        judul = str(r[5]).strip().strip("\u201c\u201d\"").title()
        out.append(("W-%s-L%s" % (komp, lv), "Behavioral %s %s Level %s: %s" % (komp, CB_NAMA_B[komp], lv, judul), "Wajib", komp, int(lv),
                    "ONLINE" if online else "KLASIKAL", jam, "Training Matrix Behavioral 2026 (desain modul, belum diselenggarakan)", "", "USULAN_PENGADAAN"))
    return out
import json as _json
CB_NAMA_B = {k: v["nama"] for k, v in _json.load(open("beh/kamus_beh.json")).items()}
_ada_cb = set(r[0] for r in KATALOG_CB)
_cb_baru = [r for r in _modul_cb_matrix() if r[0] not in _ada_cb]
assert len(_ada_cb) + len(_cb_baru) == 50, (len(_ada_cb), len(_cb_baru))
katalog += _cb_baru
from iht import KATALOG_IHT, iht_rows, IHT_H
katalog += [tuple(x) for x in KATALOG_IHT]  # IHT Sabtu per cabang, dijadwalkan mesin terpisah (bukan dari gap)
katalog += [
 ("D-BSMP", "Bosowa Supervisory Management Program (BMA)", "Dianjurkan", "SL-03,SL-02", 3, "KLASIKAL", 16, "Bosowa Management Academy", "", "AKTIF"),
 # Branch Manager Development Program (BMDP) (usulan L&D 2027)
 ("BMDP-01", "BMDP: Branch P&L & Business Acumen", "Dianjurkan", "SL-05,LD-04", 4, "KLASIKAL", 12, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-02", "BMDP: Coaching for Sales Leaders", "Dianjurkan", "SL-02", 4, "KLASIKAL", 12, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-03", "BMDP: Performance Dialogue & Funnel Review", "Dianjurkan", "SL-03,SL-04", 4, "KLASIKAL", 8, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-04", "BMDP: Talent Acquisition & Retention", "Dianjurkan", "SL-08", 4, "ONLINE", 6, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-05", "BMDP: 3S Integration Leadership", "Dianjurkan", "SL-07", 4, "KLASIKAL", 8, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-06", "BMDP: Local Market Strategy & Fleet Development", "Dianjurkan", "SL-06", 4, "KLASIKAL", 8, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-07", "BMDP: Risk, Compliance & Credit Governance", "Dianjurkan", "SL-10", 4, "ONLINE", 6, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-08", "BMDP: Leading Digital Sales (BAMS, SFID, AI)", "Dianjurkan", "SL-11", 4, "ONLINE", 6, "BMDP 2027", "", "USULAN_PENGADAAN"),
 ("BMDP-09", "BMDP: Strategic & Network Planning", "Dianjurkan", "SL-09,LD-03", 5, "KLASIKAL", 12, "BMDP 2027", "", "USULAN_PENGADAAN"),
]
SYARAT = {"Step 1": ["W-STEP1"], "Step 2": ["W-STEP2"], "Step 3": ["W-STEP3"], "Step 1 & 2 (KTB/MMKSI)": ["W-STEP1", "W-STEP2"],
          "M-Step 1": ["W-STEP1"], "M-Step 2": ["W-STEP2"], "MSA 1": ["W-MSA1"], "FSA 1": ["W-FSA1"],
          "Estimator 1": ["W-EST1"], "Estimator 2": ["W-EST2"], "Estimator 3": ["W-EST3"], "House Keeping": ["W-HK"],
          "Brevet A & B": ["W-BREVET"], "Instructor Course (KTB/MMKSI)": ["W-INSTR"], "Training for Trainer": ["W-TFT"],
          "Pelatihan dasar Gada (Kepolisian)": ["W-GADA"], "Sertifikasi bidang General Affair": ["W-SERTGA"],
          "Lisensi Advokat (UPA, PKPA, sumpah)": []}
# Sasaran jabatan modul program/peran (keputusan user 27 Okt): modul program (BMDP, SSDP, jalur sales/aftersales, dst) dan
# sertifikasi peran hanya ditawarkan sebagai penutup gap untuk jabatan sasarannya. Kosong = terbuka untuk semua jabatan.
from program2027 import PER_JABATAN
SASARAN = defaultdict(set)
for _kjs, _kt, _d in PER_JABATAN: SASARAN[_kt].update(_kjs)
for kode, kjd, suf in jabatan:
    if kjd in CLEVEL: continue
    for sy in X[kjd].get("syarat", []):
        for kt in SYARAT.get(sy, []):
            SASARAN[kt].add(kode)  # sertifikasi APM/peran hanya untuk jabatan yang JD-nya mensyaratkan (audit 27 Okt)
SASARAN["W-TFT"].update(["J014", "J015", "J023"])  # Training for Trainer juga relevan untuk tim L&D
SASARAN["D-BST"].update(["J073J", "J074J"])
for _kt in ("D-SAADV", "D-SALEAD"): SASARAN[_kt].update(["J082", "J083"])
for _kt in ("D-CSVOC", "D-CSPS"): SASARAN[_kt].update(["J066", "J078"])
SASARAN["D-SACS"].update(["J082", "J083", "J066", "J078"])
ada_modul = set()
for r in katalog:
    if r[0] in SASARAN: continue  # modul terbatas tidak menutup kebutuhan modul umum
    for kk in str(r[3]).split(","):
        if kk: ada_modul.add(kk)
# Level tertinggi yang sudah tercakup modul umum per kompetensi: gap sampai Level 5 harus tetap punya modul penutup
lv_maks = defaultdict(int)
for r in katalog:
    if r[0] in SASARAN or r[2] in ("Pengayaan", "IHT"): continue
    for kk in str(r[3]).split(","):
        if kk: lv_maks[kk] = max(lv_maks[kk], int(r[4] or 5))
nusul = 0
for k in kamus:
    kk = k["KodeKompetensi"]
    if kk in ada_modul and lv_maks[kk] >= 5: continue
    nusul += 1
    katalog.append(("U-" + kk, "Pelatihan " + k["Nama"] + ("" if kk not in ada_modul else " (Lanjutan)"), "Dianjurkan", kk, 5, "KLASIKAL", "", "Usulan AI - modul belum tersedia", "", "USULAN_PENGADAAN"))
katalog += [
 ("P-FINLIT", "Financial Literacy: Mengelola Keuangan Pribadi", "Pengayaan", "", "", "ONLINE", 2, "Usulan AI", "", "USULAN_PENGADAAN"),
 ("P-WELL", "Healthy Lifestyle & Wellbeing", "Pengayaan", "", "", "ONLINE", 2, "Usulan AI", "", "USULAN_PENGADAAN"),
 ("P-PROD", "Produktivitas Digital (Microsoft 365 dan Copilot)", "Pengayaan", "", "", "ONLINE", 3, "Usulan AI", "", "USULAN_PENGADAAN"),
 ("P-ENG", "Basic English Conversation", "Pengayaan", "", "", "ONLINE", 4, "Usulan AI", "", "USULAN_PENGADAAN"),
 ("P-PB", "Personal Branding & Business Etiquette", "Pengayaan", "", "", "ONLINE", 2, "Usulan AI", "", "USULAN_PENGADAAN"),
 ("P-SETARA", "Seminar oleh SETARA", "Pengayaan", "", "", "KLASIKAL", 4, "Program tahunan tim HC", "", "AKTIF"),
]
from program2027 import katalog_baru, terapkan_override, mandatory_2027
katalog = terapkan_override(katalog, {k["KodeKompetensi"]: k["Nama"] for k in kamus}) + katalog_baru(KT)
KH = ["KodeTraining", "Judul", "Kategori", "KodeKompetensi", "LevelTarget", "Metode", "DurasiJam", "SumberFile", "Link", "Status", "SasaranJabatan"]
katalog = [dict(zip(KH, tuple(r[:10]) + (",".join(sorted(SASARAN.get(r[0], ()))),))) for r in katalog]
import durasi_2027
UBAH_DUR = durasi_2027.terapkan(katalog)
print("Durasi diatur:", len(UBAH_DUR), "modul;", {j: sum(1 for v in UBAH_DUR.values() if v == j) for j in sorted(set(UBAH_DUR.values()))})

# ---------------- Mandatory ----------------
mandatory = [{"KodeJabatan": "*", "KodeTraining": "W-AFA", "Dasar": "Kebijakan korporat: wajib seluruh karyawan"},
             {"KodeJabatan": "*", "KodeTraining": "W-AIDW", "Dasar": "Kebijakan korporat: wajib seluruh karyawan"}]
mandatory += MANDATORY_CB
for kode, kjd, suf in jabatan:
    if kjd in CLEVEL: continue
    for sy in X[kjd].get("syarat", []):
        assert sy in SYARAT, sy
        for kt in SYARAT[sy]:
            mandatory.append({"KodeJabatan": kode, "KodeTraining": kt, "Dasar": "Persyaratan JD: " + sy})
mandatory += mandatory_2027(karyawan, RIWAYAT, set(k["NIK"] for k in karyawan if k["ModeAsesmen"] == "DIKECUALIKAN"))

# ---------------- MasterJabatan ----------------
master = []
for kode, kjd, suf in jabatan:
    m = mj[kjd]; v = X[kjd]
    jt = m["JOB TITLE"] + (" " + VARIAN[suf][0].upper() if suf else "")
    catat = "; ".join([c for c in [v.get("catatan", ""), m.get("CATATAN_JD") or ""] if c])
    if kjd in JD_LD: catat = v["catatan"]
    master.append({"KodeJabatan": kode, "JobTitle": jt, "Dept": m["DEPT"], "Lokasi": m["LOKASI"], "JmlIncumbent": jml.get(kode, 0),
                   "ModeAsesmen": m["MODE_ASESMEN"], "FileJD": "JD disusun L&D (31 Okt 2026)" if kjd in JD_LD else m["FILE_JD"], "LinkJD": m["LINK_JD"] or "", "StatusJD": "DISUSUN_LD" if kjd in JD_LD else m["STATUS_JD"],
                   "StatusMatriks": "DIKECUALIKAN" if kjd in CLEVEL else "DRAFT_AI", "Versi": "1.0", "DisetujuiOleh": "", "DisetujuiPada": "", "Catatan": catat})
assert sum(r["JmlIncumbent"] for r in master) == len(karyawan), "Incumbent tidak rekonsiliasi"
kodes = set(r["KodeJabatan"] for r in master)
assert all(k["KodeJabatan"] in kodes for k in karyawan)

# ---------------- QA ----------------
nik = set(k["NIK"] for k in karyawan)
assert len(nik) == len(karyawan), "NIK duplikat"
for k in karyawan:
    for f in ("PenilaiNIK", "Penilai2NIK"):
        if k[f]: assert k[f] in nik, "Penilai tidak ada di karyawan: " + k[f]
tanpa_penilai = [k["NIK"] for k in karyawan if not k["PenilaiNIK"]]
import master_2027
INDIKATOR, LAP_MASTER = master_2027.terapkan(kamus, cek, matriks, task_rows, interv, katalog, master)
import ksa_gen
LAP_KSA = ksa_gen.lengkapi(task_rows, matriks, kamus, master)
print('KSA: ' + str(LAP_KSA))
import standar_bbm, json as _json
LAP_STD, QA_STD, TEMUAN_STD = standar_bbm.terapkan(kamus, cek, INDIKATOR, matriks, task_rows, interv, katalog, master)
for _k, _v in LAP_STD.items(): print("Standar:", _k, "->", _v)
for _k, _v in QA_STD.items(): print("QA:", _k, "=", _v)
_json.dump({"lap": LAP_STD, "qa": QA_STD, "temuan": TEMUAN_STD}, open("qa_standar.json", "w"), ensure_ascii=False, indent=1)
for _k, _v in LAP_MASTER.items(): print("Master:", _k, "->", _v)
kamus_kode = set(k["KodeKompetensi"] for k in kamus)
assert all(m["KodeKompetensi"] in kamus_kode for m in matriks)
kat_kode = set(c["KodeTraining"] for c in katalog)
assert all(m["KodeTraining"] in kat_kode for m in mandatory)
assert len(set(c["KodeTraining"] for c in katalog)) == len(katalog)
per_jab = Counter(m["KodeJabatan"] for m in matriks)

# ---------------- Tulis workbook import ----------------
TAB = {
 "Karyawan": (["NIK", "Nama", "Cabang", "Wilayah", "Lokasi", "Dept", "KodeJabatan", "JobTitle", "Jabatan", "Varian", "PJS", "TglMasuk", "PenilaiNIK", "Penilai2NIK", "ModeAsesmen", "KelompokID", "DelegasiBoleh", "Aktif", "ValidatorNIK"], karyawan),
 "MasterJabatan": (["KodeJabatan", "JobTitle", "Dept", "Lokasi", "JmlIncumbent", "ModeAsesmen", "FileJD", "LinkJD", "StatusJD", "StatusMatriks", "Versi", "DisetujuiOleh", "DisetujuiPada", "Catatan"], master),
 "Kamus": (["KodeKompetensi", "Nama", "Kategori", "Definisi", "L1", "L2", "L3", "L4", "L5", "Status", "Kelompok"], kamus),
 "Indikator": (["KodeKompetensi", "Level", "Label", "DefinisiLevel", "Indikator", "Sumber"], INDIKATOR),
 "Checklist": (["KodeKompetensi", "C2", "C3", "C4", "C5"], cek),
 "Matriks": (["KodeJabatan", "KodeKompetensi", "RequiredLevel", "Bobot", "Sumber", "Flag"], matriks),
 "Task": (["KodeJabatan", "NoTugas", "TugasUtama", "Task", "KodeKompetensi", "SubProses", "SubSubProses", "Pengetahuan", "StandarKinerja", "SubStandar", "KSA", "LevelAktivitas", "Sumber", "BuktiPenilaian"], task_rows),
 "Intervensi": (["KodeKompetensi", "Tipe", "Deskripsi"], interv),
 "Katalog": (KH, katalog),
 "Mandatory": (["KodeJabatan", "KodeTraining", "Dasar"], mandatory),
 "Riwayat": (["NIK", "KodeTraining", "Tanggal", "Sumber"], RIWAYAT),
}
from silabus_rekam import silabus_rows, rekam_rows, SILABUS_H, REKAM_H
SILABUS = silabus_rows(kamus)
KODE_VALID = kat_kode | set(s["KodeTraining"] for s in SILABUS)
REKAM = rekam_rows(karyawan, KODE_VALID)
TAB["Silabus"] = (SILABUS_H, SILABUS)
TAB["RekamTraining"] = (REKAM_H, REKAM)
IHT = iht_rows(karyawan)
TAB["IHT"] = (IHT_H, IHT)
out = openpyxl.Workbook(); out.remove(out.active)
for nama, (h, data) in TAB.items():
    ws = out.create_sheet(nama); ws.append(h)
    for r in data: ws.append([r.get(c, "") for c in h])
    for c in ws[1]: c.font = Font(bold=True)
    if nama in ("Karyawan", "RekamTraining"):
        for row in ws.iter_rows(min_row=2):
            for c in row: c.number_format = "@"
out.save("TNA2027_Import.xlsx")

# ---------------- Competency List per Jabatan (untuk Dept Head) ----------------
kamusD = {k["KodeKompetensi"]: k for k in kamus}
cl = openpyxl.Workbook(); ws = cl.active; ws.title = "Ringkasan"
ws.append(["KodeJabatan", "Jabatan", "Dept", "Jml Incumbent", "Jml Kompetensi", "Behavioral", "Leadership", "Technical", "Status JD", "Catatan"])
for r in master:
    if r["StatusMatriks"] == "DIKECUALIKAN": continue
    ms = [m for m in matriks if m["KodeJabatan"] == r["KodeJabatan"]]
    c = Counter(kamusD[m["KodeKompetensi"]]["Kategori"] for m in ms)
    ws.append([r["KodeJabatan"], r["JobTitle"], r["Dept"], r["JmlIncumbent"], len(ms), c["Behavioral"], c["Leadership"], c["Technical"], r["StatusJD"], r["Catatan"]])
ws2 = cl.create_sheet("Matriks per Jabatan")
ws2.append(["KodeJabatan", "Jabatan", "Dept", "Kategori", "KodeKompetensi", "Kompetensi", "Required Level", "Bobot", "Definisi", "Deskripsi Level yang Dipersyaratkan", "Sumber", "Flag"])
for r in master:
    for m in matriks:
        if m["KodeJabatan"] != r["KodeJabatan"]: continue
        k = kamusD[m["KodeKompetensi"]]
        ws2.append([r["KodeJabatan"], r["JobTitle"], r["Dept"], k["Kategori"], k["KodeKompetensi"], k["Nama"], m["RequiredLevel"], m["Bobot"], k["Definisi"], k["L%d" % m["RequiredLevel"]], m["Sumber"], "; ".join(f for f in m["Flag"].split("; ") if f and f != "TIDAK DIDUKUNG TASK")])
ws3 = cl.create_sheet("Kamus Kompetensi")
ws3.append(["KodeKompetensi", "Kompetensi", "Kategori", "Definisi", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Checklist L2", "Checklist L3", "Checklist L4", "Checklist L5"])
cekD = {c["KodeKompetensi"]: c for c in cek}
for k in kamus:
    c = cekD[k["KodeKompetensi"]]
    ws3.append([k["KodeKompetensi"], k["Nama"], k["Kategori"], k["Definisi"], k["L1"], k["L2"], k["L3"], k["L4"], k["L5"], c["C2"], c["C3"], c["C4"], c["C5"]])
ws4 = cl.create_sheet("Cara Membaca")
for line in ["CARA MEMBACA DAFTAR KOMPETENSI JABATAN - TNA 2027",
             "1. Tab 'Matriks per Jabatan' berisi kompetensi yang dinilai untuk setiap jabatan beserta level yang dipersyaratkan (1-5).",
             "2. Skala: 1 Awareness (paham konsep, perlu bimbingan penuh), 2 Basic (bisa dengan panduan), 3 Intermediate (mandiri & konsisten), 4 Advanced (menangani kasus kompleks & membimbing orang lain), 5 Expert (rujukan tingkat perusahaan).",
             "3. Saat asesmen, penilai mencentang perilaku yang BENAR-BENAR terlihat (Checklist L2-L5). Level dihitung otomatis dari centang berurutan.",
             "4. Behavioral = 10 kompetensi Kamus Kompetensi Bosowa 2022 (CB01-CB10), level per jenjang sesuai Matriks Standar Kompetensi Behavioral. Leadership hanya untuk jabatan atasan. Technical diturunkan dari Job Description masing-masing jabatan.",
             "5. Flag 'JD_ACUAN_TERDEKAT' / 'DRAFT_AI_TANPA_JD' artinya jabatan belum punya JD khusus; mohon masukan bila tidak sesuai.",
             "6. Masukan perbaikan kirim ke L&D paling lambat Senin 26 Okt 2026 pukul 15.00 WITA."]:
    ws4.append([line])
for w in cl.worksheets:
    for c in w[1]: c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="1F3A5F")
    w.freeze_panes = "A2"
cl.move_sheet("Cara Membaca", offset=-3)
cl.save("Competency_List_per_Jabatan_TNA2027.xlsx")

print("Karyawan", len(karyawan), "| Jabatan", len(master), "| Kamus", len(kamus), "| Matriks", len(matriks),
      "| Task", len(task_rows), "| Katalog", len(katalog), "(usulan", nusul, ") | Mandatory", len(mandatory))
print("Kompetensi/jabatan min-max-avg:", min(per_jab.values()), max(per_jab.values()), round(sum(per_jab.values()) / len(per_jab), 1))
print("Tanpa penilai:", tanpa_penilai)
print("Flag TIDAK DIDUKUNG TASK:", sum(1 for m in matriks if "TIDAK DIDUKUNG TASK" in m["Flag"]), "dari", sum(1 for m in matriks if m["KodeKompetensi"].startswith("TK-")))
print("Task tanpa kompetensi:", sum(1 for t in task_rows if not t["KodeKompetensi"]), "dari", len(set((t["KodeJabatan"], t["Task"]) for t in task_rows)))
print("Riwayat/CB:", dict(LAP_RIWAYAT))
print("Validator per jabatan:", VAL_STAT.most_common())
print("Validator == penilai:", sum(1 for k in karyawan if k["ValidatorNIK"] and k["ValidatorNIK"] == k["PenilaiNIK"]))
print("Tanpa validator (Admin):", [(k["Nama"], k["JobTitle"], (KM.get(k["PenilaiNIK"]) or {}).get("JobTitle")) for k in karyawan if not k["ValidatorNIK"] and k["ModeAsesmen"] != "DIKECUALIKAN"])
print("Riwayat per kode:", Counter(r["KodeTraining"] for r in RIWAYAT if not r["KodeTraining"].startswith("W-CB")).most_common())
print("Dikecualikan:", [(k["Nama"], k["JobTitle"]) for k in karyawan if k["ModeAsesmen"] == "DIKECUALIKAN"])
print("Jabatan kosong incumbent:", [r["KodeJabatan"] for r in master if not r["JmlIncumbent"]])
print("Matriks jalur sales:", {j: sum(1 for m in matriks if m["KodeJabatan"] == j) for j in SALES_PATH})
print("Silabus:", len(SILABUS), Counter(s["Status"] for s in SILABUS), "| katalog bersilabus:",
      sum(1 for c in katalog if c["KodeTraining"] in KODE_VALID - kat_kode or c["KodeTraining"] in set(s["KodeTraining"] for s in SILABUS)
          or c["KodeTraining"][:6] in set(s["KodeTraining"] for s in SILABUS)), "dari", len(katalog))
print("RekamTraining:", len(REKAM), "baris,", len(set(r["NIK"] for r in REKAM)), "orang | status", Counter(r["Status"] for r in REKAM).most_common(),
      "| terpetakan ke TNA:", sum(1 for r in REKAM if r["KodeTNA"]))
print("IHT:", len(IHT), "jabatan sasaran | demand jam/tahun:", round(sum(r["JamTotal"] * r["Orang2026"] for r in IHT)))
print("Program 2027:", Counter(m["KodeTraining"] for m in mandatory if m["Dasar"].startswith(("Program 2027", "Jalur", "BMDP", "SSDP", "Lulus SA"))).most_common())
print("Tumpang tindih dihapus:", dict(LAP_TUMPANG))
_kat = {k["KodeKompetensi"]: k["Kategori"] for k in kamus}
_lengkap = defaultdict(set)
for m in matriks: _lengkap[m["KodeJabatan"]].add(_kat[m["KodeKompetensi"]])
print("Jabatan tanpa 10 Behavioral / Technical:", [j for j, s in _lengkap.items() if not {"Behavioral", "Technical"} <= s],
      "| Behavioral per jabatan:", Counter(sum(1 for m in matriks if m["KodeJabatan"] == j and m["KodeKompetensi"].startswith("CB")) for j in _lengkap))
print("Jenjang:", Counter(JENJANG_JAB.values()))
