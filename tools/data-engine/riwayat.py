"""Riwayat training (2025 + 2026) dan program behavioral wajib 2027 dari master data training BBLC.
Sumber: '2025-MASTER DATA TRAINING BBLC' (semua COMPLETE) dan 'coretan master data' sheet MASTER DATA (2026, STATUS KEHADIRAN).
Dipanggil dari build_import.py: riwayat_dan_cb(karyawan) -> (katalog_cb, mandatory_cb, riwayat_rows, laporan)."""
import pickle, re, datetime, statistics
from collections import Counter, defaultdict

HARI_INI = datetime.datetime(2026, 10, 24)
CB_KOMP = {k: k for k in ("CB01", "CB02", "CB03", "CB04", "CB05", "CB06", "CB07", "CB08", "CB09", "CB10")}  # kode kamus resmi = kode training
CB_NAMA = {"CB01": "Adaptive", "CB02": "Communication", "CB03": "Dedicated", "CB04": "Monitoring", "CB05": "Leading with Integrity",
           "CB06": "Target Orientation", "CB07": "Strategic Thinking", "CB08": "Continuous Learning", "CB09": "Innovative", "CB10": "Self-Openness"}
# Judul program -> KodeTraining katalog. Sertifikasi APM (Step/FSA) hanya dihitung dari pelatihan resmi, bukan IHT internal.
TEKNIS = [
    (r"BASIC SALESMANSHIP|^BST\b", "D-BST", False), (r"INTERMEDIATE SALESMANSHIP|^IST\b", "D-IST", False),
    (r"ADVANCE SALESMANSHIP|^AST\b", "D-AST", False), (r"SA & CS MASTER CLASS", "D-SACS", False),
    (r"CS: PROBLEM SOLVING", "D-CSPS", False), (r"TRAINING FOR TRAINER", "W-TFT", False),
    (r"SUPERVISORY MANAGEMENT PROGRAM", "D-BSMP", False), (r"HOUSE ?KEEPING", "W-HK", False),
    (r"MSTEP ?1|M-STEP ?1|\(M1-", "W-STEP1", True), (r"MSTEP ?2|M-STEP ?2|M2ENGINE|M2CHASSIS|M2ELECTRICAL|M2E-|M2C-", "W-STEP2", True),
    (r"M-STEP ?3|MSTEP ?3", "W-STEP3", True), (r"FSTEP ?1|FSTEP-1|FUSO STEP 1|\(F1-", "W-FSTEP1", True),
    (r"\bFSA ?1\b|FSA1", "W-FSA1", True), (r"\bMSA ?1\b|MSA1", "W-MSA1", True),
]

def nik_str(v):
    if v is None or v == "": return ""
    if isinstance(v, float): return str(int(v))
    return str(v).strip()

def kode_teknis(judul):
    j = str(judul or "").upper().strip()
    internal = j.startswith("(IHT)") or j.startswith("TRAINING INTERNAL")
    for pola, kode, resmi in TEKNIS:
        if re.search(pola, j) and not (resmi and internal): return kode
    return None

def riwayat_dan_cb(karyawan, dikecualikan):
    d25 = pickle.load(open("dl/master2025.pkl", "rb"))
    d26 = pickle.load(open("dl/master2026.pkl", "rb"))
    nik_ok = set(k["NIK"] for k in karyawan)
    riwayat = {}
    def catat(nik, kode, tgl, sumber):
        if nik in nik_ok and (nik, kode) not in riwayat:
            riwayat[(nik, kode)] = {"NIK": nik, "KodeTraining": kode, "Tanggal": tgl.strftime("%Y-%m-%d") if isinstance(tgl, datetime.datetime) else "", "Sumber": sumber}
    for x in d25:
        k = kode_teknis(x.get("JUDUL PROGRAM"))
        if k: catat(nik_str(x.get("NIK")), k, x.get("TANGGAL MULAI"), "MASTER DATA 2025 (COMPLETE)")
    for x in d26:
        if x.get("STATUS KEHADIRAN") != "HADIR": continue
        k = kode_teknis(x.get("JUDUL PROGRAM"))
        if k: catat(nik_str(x.get("NIK")), k, x.get("TANGGAL MULAI"), "MASTER DATA 2026 (HADIR)")

    # ---------- Behavioral 2026 (CBxx-Ly) ----------
    cb = [x for x in d26 if re.match(r"CB\d\d-L\d", str(x.get("KODE PROGRAM") or ""))]
    judul, jam, metode = defaultdict(Counter), defaultdict(list), defaultdict(Counter)
    tugas = defaultdict(set)          # nik -> kode CB yang diplot 2026
    hadir, terjadwal = set(), set()   # (nik, kode)
    for x in cb:
        kode, nik = x["KODE PROGRAM"], nik_str(x.get("NIK"))
        judul[kode][str(x.get("JUDUL PROGRAM") or "").strip()] += 1
        if x.get("MAN HOURS"): jam[kode].append(float(x["MAN HOURS"]))
        metode[kode][str(x.get("METODE") or "")] += 1
        if not nik: continue
        tugas[nik].add(kode)
        tgl = x.get("TANGGAL MULAI")
        if x.get("STATUS KEHADIRAN") == "HADIR": hadir.add((nik, kode))
        elif isinstance(tgl, datetime.datetime) and tgl > HARI_INI: terjadwal.add((nik, kode))
    katalog_cb = []
    for kode in sorted(judul):
        cbk = kode[:4]
        on = metode[kode].get("ONLINE", 0) >= metode[kode].get("OFFLINE", 0)
        katalog_cb.append(("W-" + kode, "Behavioral " + cbk + " " + CB_NAMA[cbk] + " Level " + kode[-1] + ": " + judul[kode].most_common(1)[0][0].split(":")[-1].strip().title(),
                           "Wajib", CB_KOMP[cbk], int(kode[-1]), "ONLINE" if on else "KLASIKAL", statistics.median(jam[kode]) if jam[kode] else 2,
                           "Program Behavioral 2026 (Kurikulum & Modul/COMPETENCY-BEHAVIORAL)", "", "AKTIF"))
    # Default per jabatan untuk karyawan yang tidak terplot di program 2026: modul yang diplot ke >= 50% incumbent jabatan itu.
    kj = {k["NIK"]: k["KodeJabatan"] for k in karyawan}
    per_jab = defaultdict(list)
    for nik, kodes in tugas.items():
        if nik in kj: per_jab[kj[nik]].append(kodes)
    default = {}
    for j, lst in per_jab.items():
        c = Counter(x for s in lst for x in s)
        default[j] = sorted(x for x, n in c.items() if n >= 0.5 * len(lst))
    mandatory, lap = [], Counter()
    for k in karyawan:
        nik = k["NIK"]
        if nik in dikecualikan: continue
        kodes = sorted(tugas.get(nik) or default.get(k["KodeJabatan"], []))
        sumber = "plot 2026" if tugas.get(nik) else "default jabatan"
        for kode in kodes:
            if (nik, kode) in hadir: lap["sudah hadir 2026"] += 1; continue
            mandatory.append({"KodeJabatan": "NIK:" + nik, "KodeTraining": "W-" + kode,
                              "Dasar": "Behavioral 2026 belum diikuti (" + sumber + ")"})
            lap["wajib 2027 (" + sumber + ")"] += 1
            if (nik, kode) in terjadwal:
                catat(nik, "W-" + kode, None, "TERJADWAL_2026 (hapus baris ini bila ternyata tidak hadir)")
                lap["terjadwal Nov-Des 2026 (dilewati via Riwayat)"] += 1
        if not kodes: lap["tanpa modul behavioral (jabatan tak terplot 2026)"] += 1
    lap["riwayat teknikal+behavioral"] = len(riwayat)
    return katalog_cb, mandatory, list(riwayat.values()), lap
