"""Dari TNA2027_Import.xlsx -> import_real.json (dipakai uji dan generator dokumen) -> demo/demo-komp.json (data demo tanpa karyawan).
Pemetaan akun demo (nama asli -> kode demo) dibaca dari konfigurasi_lokal.json (PETA_DEMO); tidak disimpan di repo."""
import json, datetime, os, openpyxl

KONFIG = json.load(open("konfigurasi_lokal.json"))
wb = openpyxl.load_workbook("TNA2027_Import.xlsx", read_only=True)
def v(x): return x.isoformat() if isinstance(x, (datetime.date, datetime.datetime)) else ("" if x is None else x)
new = {}
for ws in wb:
    rows = [[v(c) for c in r] for r in ws.iter_rows(values_only=True)]
    while rows and all(c == "" for c in rows[-1]): rows.pop()
    new[ws.title] = rows
json.dump(new, open("import_real.json", "w"), default=str)
T = lambda t: [dict(zip(new[t][0], r)) for r in new[t][1:]]
jobs = KONFIG["JABATAN_DEMO"]
d = {}
d["Matriks"] = [r for r in T("Matriks") if r["KodeJabatan"] in jobs]
used = set(r["KodeKompetensi"] for r in d["Matriks"])
d["Kamus"] = [r for r in T("Kamus") if r["KodeKompetensi"] in used]
d["Indikator"] = [r for r in T("Indikator") if r["KodeKompetensi"] in used]
d["Checklist"] = [r for r in T("Checklist") if r["KodeKompetensi"] in used]
d["Task"] = [r for r in T("Task") if r["KodeJabatan"] in jobs]
d["Intervensi"] = [r for r in T("Intervensi") if r["KodeKompetensi"] in used]
d["Katalog"] = T("Katalog")
d["Mandatory"] = [r for r in T("Mandatory") if r["KodeJabatan"] in jobs]
d["IHT"] = [r for r in T("IHT") if r.get("KodeJabatan") in jobs]
d["MasterJabatan"] = {r["KodeJabatan"]: [r["JobTitle"], r["Dept"]] for r in T("MasterJabatan") if r["KodeJabatan"] in jobs}
peta = KONFIG["PETA_DEMO"]
nik = {str(k["NIK"]): peta[k["Nama"]] for k in T("Karyawan") if k["Nama"] in peta}
d["TimLD"] = {"RekamTraining": [dict(r, NIK=nik[str(r["NIK"])], PreTest="", PostTest="") for r in T("RekamTraining") if str(r["NIK"]) in nik],
              "Riwayat": [dict(r, NIK=nik[str(r["NIK"])]) for r in T("Riwayat") if str(r["NIK"]) in nik],
              "MandatoryNIK": [dict(r, KodeJabatan="NIK:" + nik[r["KodeJabatan"][4:]]) for r in T("Mandatory") if str(r["KodeJabatan"]).startswith("NIK:") and r["KodeJabatan"][4:] in nik]}
os.makedirs("demo", exist_ok=True)
json.dump(d, open("demo/demo-komp.json", "w"), ensure_ascii=False)
print("bangun_demo OK", {k: len(x) for k, x in d.items()})
