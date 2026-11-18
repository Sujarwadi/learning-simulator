"""Tab Silabus (ringkasan silabus hasil baca materi di Drive, status DRAF_AI) dan RekamTraining
(seluruh riwayat training 2025-2026 per karyawan dari master data BBLC). Dipanggil build_import.py."""
import json, glob, pickle, re, datetime
from riwayat import kode_teknis, nik_str

SILABUS_H = ["KodeTraining", "Judul", "Rumpun", "Kompetensi", "Sasaran", "Tujuan", "Outline", "Metode", "Durasi",
             "Evaluasi", "Sumber", "Status", "DiperbaruiOleh", "Timestamp"]
REKAM_H = ["NIK", "Tahun", "Tanggal", "KodeProgram", "Judul", "Kategori", "Metode", "Penyelenggara", "Status", "Jam",
           "PreTest", "PostTest", "KodeTNA"]

def silabus_rows(kamus):
    nama = {k["KodeKompetensi"]: k["Nama"] for k in kamus}
    def komp(s):
        out = []
        for t in [x.strip() for x in str(s or "").split(",") if x.strip()]:
            out.append(t[3:] if t.startswith("TK-") and t not in nama else nama.get(t, t))
        return ", ".join(dict.fromkeys(out))
    rows, seen = [], set()
    for f in sorted(glob.glob("silabus/*.json")):
        for x in json.load(open(f)):
            if "Kode" not in x: continue
            assert x["Kode"] not in seen, "Kode silabus ganda: " + x["Kode"]
            seen.add(x["Kode"])
            rows.append({"KodeTraining": x["Kode"], "Judul": x["Judul"], "Rumpun": x.get("Rumpun", ""),
                         "Kompetensi": komp(x.get("KodeKompetensi")), "Sasaran": x.get("Sasaran", ""), "Tujuan": x.get("Tujuan", ""),
                         "Outline": x.get("Outline", ""), "Metode": x.get("Metode", ""), "Durasi": x.get("Durasi", ""),
                         "Evaluasi": x.get("Evaluasi", ""), "Sumber": x.get("Sumber", ""),
                         "Status": x.get("Status", "DRAF_AI"), "DiperbaruiOleh": "Claude (ringkasan otomatis dari materi Drive)",
                         "Timestamp": "2026-10-26"})
    return rows

# Judul program (master data) -> kode silabus/katalog. Urutan penting: pola spesifik lebih dulu.
POLA = [
    (r"KNOW YOUR CHARACTERISTIC|\bKYC\b", "IHT-KYC"), (r"NEGOSIASI|NEGOTIATION", "IHT-NEGO"), (r"CLOSING THE DEAL", "IHT-CLOSE"),
    (r"CUSTOMER RETENTION", "IHT-CRM"), (r"MENANGANI KEBERATAN|HANDLING OBJECTION", "IHT-OBJ"),
    (r"PENGENALAN AKTI[FV]ITAS AFTER SALES", "IHT-ASS"), (r"PERSONA MEKANIK", "IHT-SOPMEK"), (r"SERVICE EXCELLENCE", "IHT-SE"),
    (r"\b5S\b|\b5R\b|HOUSE ?KEEPING", "W-HK"), (r"SEL+ING STEP", "IHT-SSS"), (r"BASIC AUTOMOBILE", "IHT-MBA"),
    (r"HIGH INCOME", "IHT-HIWP"), (r"\b7 STEP\b", "IHT-7STEP"), (r"PKT MASTER", "REF-PKT"),
    (r"SA ?& ?CS|SA MASTER|CS MASTER|SERVICE ADVISOR MASTER", "D-SACS"), (r"PROBLEM SOLV|ANALYTICAL THINKING", "D-CSPS"),
    (r"SALES TALK", "D-STS"), (r"CANTER|FIGHTER|FUSO", "D-PKKTB"),
    (r"PRODUCT KNOWLEDGE|TRITON|XPANDER|DESTINATOR|PAJERO|XFORCE|L300", "D-PKMMKSI"),
    (r"PELUANG INOVASI", "IHT-INOV"), (r"LEVEL UP", "IHT-LUYS"), (r"INDUKSI|INDUCTION", "D-BPBBM"),
    (r"\bK3\b|KESELAMATAN DAN KESEHATAN", "REF-K3"), (r"INTERPERSONAL", "REF-ICS"), (r"\bBAMS\b", "REF-BAMS3"),
]

def kode_tna(judul, kode_program, kode_valid):
    k = kode_teknis(judul)
    if k and k in kode_valid: return k
    kp = str(kode_program or "").upper()
    m = re.match(r"(CB\d\d)-L(\d)", kp)
    if m and "W-" + kp[:7] in kode_valid: return "W-" + kp[:7]
    j = str(judul or "").upper()
    for pola, kode in POLA:
        if re.search(pola, j) and kode in kode_valid: return kode
    return ""

def angka(v):
    try: return round(float(v), 2) if v not in (None, "") else ""
    except (TypeError, ValueError): return ""

def rekam_rows(karyawan, kode_valid):
    nik_ok = set(k["NIK"] for k in karyawan)
    rows = []
    for f, th in (("dl/master2025.pkl", 2025), ("dl/master2026.pkl", 2026)):
        for x in pickle.load(open(f, "rb")):
            nik = nik_str(x.get("NIK"))
            if nik not in nik_ok or not x.get("JUDUL PROGRAM"): continue
            tgl = x.get("TANGGAL MULAI")
            if th == 2025: st = "SELESAI"
            else: st = str(x.get("STATUS KEHADIRAN") or "").strip() or "BELUM ADA STATUS"
            rows.append({"NIK": nik, "Tahun": th, "Tanggal": tgl.strftime("%Y-%m-%d") if isinstance(tgl, datetime.datetime) else "",
                         "KodeProgram": str(x.get("KODE PROGRAM") or ""), "Judul": str(x.get("JUDUL PROGRAM")).strip(),
                         "Kategori": str(x.get("KATEGORI TRAINING") or x.get("KATEGORI PENGEMBANGAN") or ""),
                         "Metode": str(x.get("METODE") or ""), "Penyelenggara": str(x.get("PENYELENGGARA") or ""),
                         "Status": st, "Jam": angka(x.get("MAN HOURS")), "PreTest": angka(x.get("PRE-TEST")),
                         "PostTest": angka(x.get("POST-TEST")),
                         "KodeTNA": kode_tna(x.get("JUDUL PROGRAM"), x.get("KODE PROGRAM"), kode_valid)})
    # Diurutkan per NIK supaya backend cukup membaca satu blok baris berurutan.
    rows.sort(key=lambda r: (r["NIK"], r["Tanggal"], r["Judul"]))
    return rows
