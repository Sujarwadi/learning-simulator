"""Tab IHT: rata-rata jam rencana IHT 2026 per KodeJabatan per rumpun (dasar alokasi IHT Sabtu 2027).
Hanya angka agregat per jabatan, tanpa data perorangan. Dipanggil build_import.py."""
import pickle
from collections import defaultdict
from riwayat import nik_str

IHT_H = ["KodeJabatan", "JobTitle", "Orang2026", "Peserta2026", "JamSelling", "JamPK", "JamASS", "JamSelf", "JamTotal", "Sumber"]
RUMPUN = {"CIHT-01": "JamSelling", "CIHT-02": "JamPK", "CIHT-03": "JamASS", "CIHT-04": "JamSelf"}
MIN_PARTISIPASI = 0.5  # jabatan dianggap sasaran IHT bila >= 50% pemangkunya ikut IHT 2026

def iht_rows(karyawan):
    kar = {k["NIK"]: k for k in karyawan}
    jam = defaultdict(lambda: defaultdict(float))  # NIK -> kolom -> jam
    for x in pickle.load(open("dl/master2026.pkl", "rb")):
        if str(x.get("AREA PENGEMBANGAN") or "").strip().upper() != "IHT": continue
        nik = nik_str(x.get("NIK")); kol = RUMPUN.get(str(x.get("KODE PROGRAM") or "").strip())
        if nik not in kar or not kol: continue
        jam[nik][kol] += float(x.get("JAM BELAJAR/HARI") or 0) * float(x.get("DURASI HARI") or 1)
    per_jab = defaultdict(list)
    for k in karyawan: per_jab[k["KodeJabatan"]].append(k)
    rows = []
    for kj, ks in sorted(per_jab.items()):
        ikut = [k for k in ks if k["NIK"] in jam]
        if not ikut or len(ikut) / len(ks) < MIN_PARTISIPASI: continue
        r = {"KodeJabatan": kj, "JobTitle": ks[0]["JobTitle"], "Orang2026": len(ks), "Peserta2026": len(ikut)}
        for kol in RUMPUN.values(): r[kol] = round(sum(jam[k["NIK"]][kol] for k in ikut) / len(ikut), 1)
        r["JamTotal"] = round(sum(r[c] for c in RUMPUN.values()), 1)
        r["Sumber"] = "Rata-rata jam rencana IHT 2026 per peserta (master data BBLC)"
        rows.append(r)
    return rows

KATALOG_IHT = [  # urutan = Sabtu ke-1..4 tiap bulan (pola folder IHT: WEEK 1..4)
    ["IHT-SELL", "IHT Selling Technique (Sabtu minggu ke-1)", "IHT", "", "", "KLASIKAL", 2, "Folder 01. MATERI IHT / WEEK 1", "", "AKTIF"],
    ["IHT-PK", "IHT Product Knowledge (Sabtu minggu ke-2)", "IHT", "", "", "KLASIKAL", 2, "Folder 01. MATERI IHT / WEEK 2", "", "AKTIF"],
    ["IHT-ASV", "IHT After Sales Service (Sabtu minggu ke-3)", "IHT", "", "", "KLASIKAL", 2, "Folder 01. MATERI IHT / WEEK 3", "", "AKTIF"],
    ["IHT-SELF", "IHT Self Management (Sabtu minggu ke-4)", "IHT", "", "", "KLASIKAL", 2, "Folder 01. MATERI IHT / WEEK 4", "", "AKTIF"],
]
