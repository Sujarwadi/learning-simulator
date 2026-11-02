"""Masukkan master kompetensi teknis karya user (Finance Division, L&D Section Head) ke data import TNA, dan rapikan data lama.
Dipanggil dari build_import.py setelah katalog dibentuk. Data master hanya di scratchpad/Sheets, tidak masuk repo.
 1. Buang TK-022 Communication Skill (duplikat CB02 Communication; dipetakan otomatis dari kata 'koordinasi/komunikasi').
 2. Buang teks coaching 20 yang seragam ('Sharing session/diskusi kasus X bersama rekan yang sudah level 4+').
 3. Untuk jabatan yang punya master: ganti kompetensi teknis lama (TK-xxx) dengan TC-FIN-xx / TC-LND-xx dari master,
    ganti baris Task dengan breakdown JD + KSA master, simpan indikator per level.
 4. Petakan kompetensi master ke modul katalog yang sudah ada supaya gap-nya tertutup training."""
import json, re

# Jabatan master -> KodeJabatan di MasterJabatan. Hanya yang namanya jelas sama; sisanya menunggu konfirmasi user.
PETA_FIN = {"Chief Finance Officer": "J036", "Finance Department Head": "J038", "Accounting Department Head": "J033",
            "Tax Department Head": "J039", "Cash Management Officer": "J035", "AMU & Admin BPKB": "J034", "Tax Staff": "J040",
            # jabatan di folder JD yang padanannya jelas satu-satu di data BBM (keputusan 29 Okt: ikuti folder JD)
            "Treasury Officer": "J041", "Budget & Verification Officer": "J042", "Accounting Officer": "J032"}
# Jabatan folder JD yang belum ada di data karyawan: dibuat sebagai jabatan baru tanpa incumbent, perilaku disalin dari jabatan setara (perlu review L&D)
JAB_BARU = {"Finance Division Head": ("J101", "J038"), "Reporting & Control": ("J102", "J035"), "Accounting Staff": ("J103", "J032"),
            "Tax Officer": ("J104", "J040"), "Budgeting & KPI Controller": ("J105", "J035")}
LINK_FOLDER_FIN = "https://drive.google.com/drive/folders/1YoY8WSiT_041V9V7OlxPYgq1g2ed40O0"
KOLOM_FIN = {"Chief Finance Officer": "CFO", "Finance Division Head": "Finance Div. Head", "Finance Department Head": "Finance Dept. Head", "Accounting Department Head": "Acc. Dept. Head",
             "Tax Department Head": "Tax Dept. Head", "Reporting & Control": "Reporting & Control", "Cash Management Officer": "Cash Mgmt. Officer", "Treasury Officer": "Treasury Officer",
             "Budget & Verification Officer": "Budget & Verif. Officer", "AMU & Admin BPKB": "AMU & Admin BPKB", "Accounting Officer": "Accounting Officer", "Accounting Staff": "Accounting Staff",
             "Tax Officer": "Tax Officer", "Tax Staff": "Tax Staff", "Budgeting & KPI Controller": "Budget & KPI Ctrl."}
PETA_LND = {"Learning & Development Section Head": "J015"}
# Nama kompetensi di sheet 1 master Finance yang berbeda dari Kamus (sheet 2/4): hanya perubahan nama yang jelas.
ALIAS_FIN = {"Finance Process Improvement": "Continuous Improvement", "ERP & System Operation": "Business System & Application",
             # keputusan 29 Okt: dipetakan ke kompetensi teknis terdekat; dua nama kepemimpinan sengaja dikosongkan karena sudah tercakup kompetensi Behavioral dan Leadership
             "Risk Management": "Finance Compliance & SOP", "Finance Operations Control": "Finance Compliance & SOP", "Stakeholder & Investor Relations": "Corporate Financial Strategy"}
BOBOT = {"Core": 3, "Tools": 1}  # Inti untuk kelompok inti, Pendukung untuk Tools & Technology (aturan L&D, dapat diubah di Sheets)

MODUL_FIN = {
 "Corporate Financial Strategy": ["U-TK-089"], "Strategic & Business Planning": ["U-TK-089"], "Financial Budgeting & Planning": ["U-TK-011"],
 "Cash Flow Management": ["U-TK-018"], "Cash & Transaction Processing": ["U-TK-007"], "Treasury & Payment Instrument": ["U-TK-100", "U-TK-007"],
 "Debt & Liability Management": ["U-TK-100"], "Receivables Management": ["U-TK-080"], "Finance Compliance & SOP": ["U-TK-039", "U-TK-082"],
 "Asset Administration Management": ["U-TK-004"], "Financial Accounting & PSAK Compliance": ["U-TK-038", "U-TK-001"],
 "Financial Reporting & Analysis": ["U-TK-038", "U-TK-041"], "Tax Compliance & Management": ["U-TK-093", "U-TK-034"],
 "Tax Planning & Analysis": ["U-TK-093"], "Tax Reporting & Administration": ["U-TK-034"], "Microsoft Excel": ["U-TK-066"],
 "Microsoft PowerPoint": ["U-TK-077"], "Business System & Application": ["U-TK-006", "U-TK-045"],
 "AI-Assisted Productivity": ["W-AIDW"], "Continuous Improvement": ["U-TK-071"],
}
MODUL_LND = {
 "Training Needs Analysis (TNA) & Diagnosis Gap Kompetensi": ["U-TK-098"], "Training Design & Curriculum Development (ADDIE)": ["U-TK-055", "U-TK-095"],
 "Training Delivery & Facilitation Management": ["U-TK-095", "U-TK-097"], "Matrix Training & Perencanaan Pengembangan Tahunan": ["U-TK-098", "U-TK-097"],
 "Training Evaluation & Analisis ROI": ["U-TK-096"], "Administrasi Learning & Pelaporan Realisasi": ["U-TK-097"],
 "Manajemen Fasilitas & Sumber Daya Learning": ["U-TK-097"], "Microsoft Excel": ["U-TK-066"],
 "Microsoft PowerPoint": ["U-TK-077"], "Business System & Application": ["U-TK-059", "U-TK-049"], "AI-Assisted Productivity": ["W-AIDW"],
}
TEMPLATE_20 = re.compile(r"^Sharing session/diskusi kasus .+ bersama rekan yang sudah level 4\+\.$")

def _bersih(s): return re.sub(r"\s*;\s*", ", ", str(s or "").strip())

def _kelompok(kat):
    return "Tools" if "tool" in kat.lower() else "Core"

def terapkan(kamus, cek, matriks, task_rows, interv, katalog, master_jab, dir_master="master"):
    lap = {}
    # ---- 1. buang TK-022
    lap["TK-022 dibuang dari matriks"] = sum(1 for m in matriks if m["KodeKompetensi"] == "TK-022")
    matriks[:] = [m for m in matriks if m["KodeKompetensi"] != "TK-022"]
    for t in task_rows:
        if t["KodeKompetensi"] == "TK-022": t["KodeKompetensi"] = ""
    kamus[:] = [k for k in kamus if k["KodeKompetensi"] != "TK-022"]
    cek[:] = [c for c in cek if c["KodeKompetensi"] != "TK-022"]
    interv[:] = [i for i in interv if i["KodeKompetensi"] != "TK-022"]
    katalog[:] = [c for c in katalog if c["KodeTraining"] != "U-TK-022"]
    # ---- 2. template coaching seragam
    n20 = len(interv); interv[:] = [i for i in interv if not (str(i["Tipe"]) == "20" and TEMPLATE_20.match(str(i["Deskripsi"])))]
    lap["Intervensi 20 seragam dibuang"] = n20 - len(interv)
    # ---- 3. master
    indikator, kat_by = [], {c["KodeTraining"]: c for c in katalog}
    for berkas, awalan, peta, modul, alias in (("finance.json", "TC-FIN", PETA_FIN, MODUL_FIN, ALIAS_FIN), ("lnd.json", "TC-LND", PETA_LND, MODUL_LND, {})):
        m = json.load(open(dir_master + "/" + berkas))
        kode_by_nama, nama_by_kode = {}, {}
        for k in m["kompetensi"]:
            kode = "%s-%02d" % (awalan, int(re.sub(r"\D", "", k["kode"])))
            kode_by_nama[k["nama"]] = kode; nama_by_kode[k["kode"]] = kode
            kel = _kelompok(k["kategori"])
            lv = {l["level"]: l for l in k["levels"]}
            def teks_level(n):
                l = lv[n]
                return (l["definisi"] or "; ".join(_bersih(x) for x in l["indikator"])).strip()
            kamus.append({"KodeKompetensi": kode, "Nama": k["nama"], "Kategori": "Technical", "Definisi": k["definisi"],
                          "L1": teks_level(1), "L2": teks_level(2), "L3": teks_level(3), "L4": teks_level(4), "L5": teks_level(5),
                          "Status": "MASTER", "Kelompok": k["kategori"].title() if k["kategori"].isupper() else k["kategori"]})
            cek.append({"KodeKompetensi": kode, **{"C%d" % n: "; ".join(_bersih(x) for x in lv[n]["indikator"]) for n in (2, 3, 4, 5)}})
            for n in range(1, 6):
                indikator.append({"KodeKompetensi": kode, "Level": n, "Label": lv[n]["label"], "DefinisiLevel": lv[n]["definisi"],
                                  "Indikator": "\n".join(lv[n]["indikator"])})
            for mod in modul.get(k["nama"], []):
                c = kat_by.get(mod)
                if c and kode not in str(c["KodeKompetensi"]).split(","):
                    c["KodeKompetensi"] = (str(c["KodeKompetensi"]) + "," + kode).strip(",")
        if berkas == "finance.json":
            for nama_jab, (kj, tj) in JAB_BARU.items():
                tmpl = next(x for x in master_jab if x["KodeJabatan"] == tj)
                master_jab.append({"KodeJabatan": kj, "JobTitle": nama_jab.upper(), "Dept": tmpl["Dept"], "Lokasi": tmpl["Lokasi"], "JmlIncumbent": 0, "ModeAsesmen": "INDIVIDU",
                                   "FileJD": "", "LinkJD": LINK_FOLDER_FIN, "StatusJD": "DARI_FOLDER_JD", "StatusMatriks": "DRAFT_AI", "Versi": "1.0", "DisetujuiOleh": "", "DisetujuiPada": "",
                                   "Catatan": "Jabatan dari folder JD Finance, belum ada karyawan terpetakan. Perilaku disalin dari jabatan " + tj + "."})
                for x in [x for x in matriks if x["KodeJabatan"] == tj and not str(x["KodeKompetensi"]).startswith(("TK-", "TC-"))]:
                    matriks.append(dict(x, KodeJabatan=kj, Sumber="SALIN " + tj))
            peta = dict(peta); peta.update({n: v[0] for n, v in JAB_BARU.items()})
        for nama_jab, kj in peta.items():
            kolom = KOLOM_FIN.get(nama_jab, nama_jab)
            levels = m["matriks"][kolom]
            matriks[:] = [x for x in matriks if not (x["KodeJabatan"] == kj and str(x["KodeKompetensi"]).startswith("TK-"))]
            kat_komp = {k["kode"]: _kelompok(k["kategori"]) for k in m["kompetensi"]}
            for kd, lvl in levels.items():
                matriks.append({"KodeJabatan": kj, "KodeKompetensi": nama_by_kode[kd], "RequiredLevel": lvl, "Bobot": BOBOT[kat_komp[kd]], "Sumber": "MASTER", "Flag": ""})
            task_rows[:] = [t for t in task_rows if t["KodeJabatan"] != kj]
            no, lastu = 0, None
            for t in [x for x in m["tugas"] if x["jabatan"] == nama_jab]:
                if t["tugasUtama"] != lastu: no += 1; lastu = t["tugasUtama"]
                nm = alias.get(t["komp"], t["komp"])
                task_rows.append({"KodeJabatan": kj, "NoTugas": no, "TugasUtama": t["tugasUtama"], "Task": t["proses"], "KodeKompetensi": kode_by_nama.get(nm, ""),
                                  "SubProses": t.get("sub", ""), "SubSubProses": t.get("subsub", ""), "Pengetahuan": t.get("pengetahuan", ""),
                                  "StandarKinerja": t.get("standar", ""), "SubStandar": t.get("substandar", ""), "KSA": t.get("ksa", ""),
                                  "LevelAktivitas": t.get("level", ""), "KompetensiAsli": t["komp"] if nm not in kode_by_nama else "",
                                  "KompetensiAlias": t["komp"] if nm != t["komp"] and nm in kode_by_nama else ""})
            for mj in master_jab:
                if mj["KodeJabatan"] == kj:
                    mj["Versi"] = "MASTER"; mj["Catatan"] = (str(mj.get("Catatan") or "") + " Kompetensi teknis dari master L&D (28 Okt 2026).").strip()
            lap["master " + nama_jab] = "%s: %d kompetensi, %d baris tugas" % (kj, len(levels), no)
    # modul yang kompetensi lamanya tidak dipakai lagi tetap ada; yang tak terpetakan dilaporkan
    return indikator, lap
